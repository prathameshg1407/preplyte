// src/modules/interview/interview.service.ts

import {
  AiInterviewSession,
  AiInterviewResponse,
  AiInterviewSessionStatus,
  AiInterviewQuestionCategory,
  Prisma,
} from '@prisma/client';

import { CONSTANTS } from '../../../config/constants';
import { GroqApiManager } from '../../../utils/groq-manager';
import { TTSManager } from '../../../utils/tts-manager';
import { JsonParser } from '../../../utils/json-parser';
import { PrismaJsonHelper } from '../../../utils/prisma-helper';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileService } from '../../profile/profile.service';
import { logger } from '../../../utils/logger';

import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  InternalError,
  ValidationError,
} from '../../../lib/errors';

import {
  StartInterviewSessionRequest,
  SubmitAnswerRequest,
  InterviewSessionResponse,
  InterviewFeedbackResponse,
  QuestionItem,
  Questions,
  SessionContext,
  AnswerScore,
  UserSessionSummaryDto,
  UserSessionStatsResponse,
  SessionStateResponse,
  NextQuestionResponse,
  QuestionCompletionResponse,
  SubmitAnswerResponse,
  QuestionItemDto,
  ResponseScoreDto,
} from './interview.types';

export class InterviewService {
  private readonly groqManager: GroqApiManager;
  private readonly ttsManager: TTSManager;
  private readonly jsonParser: JsonParser;
  private readonly requestDedup: Map<string, NodeJS.Timeout>;
  private readonly activeLocks: Set<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService
  ) {
    const apiKeys = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
    ].filter(Boolean) as string[];

    this.groqManager = new GroqApiManager(apiKeys);
    this.ttsManager = new TTSManager();
    this.jsonParser = new JsonParser();
    this.requestDedup = new Map();
    this.activeLocks = new Set();

    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      const ttsConnected = await this.ttsManager.testConnection();
      if (!ttsConnected) {
        logger.warn('[InterviewService] TTS connection test failed on startup');
      }
    } catch (error) {
      logger.error('[InterviewService] Service initialization error', error);
    }
  }

  // ============= Public Methods =============

  async startInterviewSession(
    userId: string,
    dto: StartInterviewSessionRequest
  ): Promise<InterviewSessionResponse> {
    logger.info('[InterviewService] Starting session', {
      userId,
      jobTitle: dto.jobTitle,
      companyName: dto.companyName,
      resumeId: dto.resumeId,
    });

    const dedupKey = `start:${userId}:${dto.jobTitle || ''}:${dto.resumeId || 'none'}`;
    if (this.isDuplicateRequest(dedupKey)) {
      throw new ConflictError('Duplicate request detected. Please wait.');
    }

    try {
      const context = await this.buildSessionContext(userId, dto);
      const questions = await this.generateInitialQuestions(context);
      const session = await this.createSession(userId, context, questions, dto.resumeId);

      let audioUrl: string | undefined;
      try {
        audioUrl = await this.ttsManager.generateAudio(questions[0].text, session.id);
      } catch (error) {
        logger.warn('[InterviewService] Failed to generate initial audio', {
          sessionId: session.id,
          error: (error as Error).message,
        });
      }

      logger.info('[InterviewService] Session created', {
        sessionId: session.id,
        userId,
        questionCount: questions.length,
      });

      return this.formatSessionResponse(session, questions, audioUrl);
    } catch (error) {
      logger.error('[InterviewService] Failed to start session', {
        userId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async submitAnswer(
    sessionId: string,
    userId: string,
    dto: SubmitAnswerRequest
  ): Promise<SubmitAnswerResponse> {
    logger.info('[InterviewService] Submitting answer', {
      sessionId,
      userId,
      category: dto.category,
    });

    const lockKey = `submit:${sessionId}`;
    if (!this.acquireLock(lockKey)) {
      throw new ConflictError('Another answer submission is in progress');
    }

    try {
      const session = await this.validateSession(sessionId, userId);

      if (dto.questionIndex !== undefined && dto.questionIndex !== session.currentQuestionIndex) {
        throw new BadRequestError(
          `Expected question index ${session.currentQuestionIndex}, got ${dto.questionIndex}`
        );
      }

      const scores = await this.scoreAnswer(dto, session);
      await this.saveResponse(sessionId, dto, scores, session);

      return this.processNextStep(session, dto.answer);
    } finally {
      this.releaseLock(lockKey);
    }
  }

  async getInterviewFeedback(
    sessionId: string,
    userId: string
  ): Promise<InterviewFeedbackResponse> {
    logger.info('[InterviewService] Getting feedback', { sessionId });

    const session = await this.getCompletedSession(sessionId, userId);

    if (session.feedback) {
      logger.debug('[InterviewService] Returning cached feedback', { sessionId });
      return this.formatExistingFeedback(session.feedback);
    }

    return this.generateAndSaveFeedback(session);
  }

  async getInterviewSession(
    sessionId: string,
    userId: string
  ): Promise<SessionStateResponse> {
    const session = await this.validateSessionForRead(sessionId, userId);
    const questions = this.parseQuestions(session.questions);
    const currentQuestion = questions[session.currentQuestionIndex];

    let audioUrl: string | undefined;
    try {
      audioUrl = await this.ttsManager.generateAudio(currentQuestion.text, sessionId);
    } catch (error) {
      logger.warn('[InterviewService] Failed to generate audio for session state', {
        sessionId,
        error: (error as Error).message,
      });
    }

    return {
      id: session.id,
      userId: session.userId,
      status: session.status,
      questions: questions.map((q) => ({
        category: q.category,
        text: q.text,
      })),
      currentQuestion: {
        category: currentQuestion.category,
        text: currentQuestion.text,
      },
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.totalQuestions,
      audioUrl,
    };
  }

  async getNextQuestion(
    sessionId: string,
    userId: string
  ): Promise<NextQuestionResponse | QuestionCompletionResponse> {
    const dedupKey = `next:${sessionId}`;
    if (this.isDuplicateRequest(dedupKey)) {
      throw new ConflictError('Duplicate request detected');
    }

    const session = await this.validateSession(sessionId, userId);
    const nextIndex = session.currentQuestionIndex + 1;

    if (nextIndex >= session.totalQuestions) {
      await this.completeSession(sessionId);
      return {
        isComplete: true,
        message: 'Interview complete. You can now view your feedback.',
      };
    }

    const questions = this.parseQuestions(session.questions);
    const nextQuestion = questions[nextIndex];

    let audioUrl: string | undefined;
    try {
      audioUrl = await this.ttsManager.generateAudio(nextQuestion.text, sessionId);
    } catch (error) {
      logger.warn('[InterviewService] Failed to generate audio', {
        sessionId,
        error: (error as Error).message,
      });
    }

    return {
      question: nextQuestion.text,
      category: nextQuestion.category,
      index: nextIndex,
      audioUrl,
      totalQuestions: session.totalQuestions,
      isComplete: false,
    };
  }

  async getUserSessions(userId: string): Promise<UserSessionSummaryDto[]> {
    logger.debug('[InterviewService] Fetching sessions', { userId });

    try {
      const sessions = await this.prisma.aiInterviewSession.findMany({
        where: { userId },
        include: {
          responses: { select: { id: true } },
          feedback: { select: { overallScore: true } },
          resume: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sessions.map((session) => ({
        id: session.id,
        jobTitle: session.jobTitle || CONSTANTS.DEFAULT_JOB_TITLE,
        companyName: session.companyName,
        resumeId: session.resume?.id || null,
        status: session.status,
        totalQuestions: session.totalQuestions,
        answeredQuestions: session.responses.length,
        currentQuestionIndex: session.currentQuestionIndex,
        overallScore: session.feedback?.overallScore
          ? Number(session.feedback.overallScore)
          : null,
        createdAt: session.createdAt,
        completedAt: session.completedAt,
        hasFeedback: !!session.feedback,
      }));
    } catch (error) {
      logger.error('[InterviewService] Failed to fetch sessions', {
        userId,
        error: (error as Error).message,
      });
      throw new InternalError('Failed to fetch user sessions');
    }
  }

  async getUserSessionStats(userId: string): Promise<UserSessionStatsResponse> {
    logger.debug('[InterviewService] Fetching stats', { userId });

    try {
      const [sessions, feedbacks] = await Promise.all([
        this.prisma.aiInterviewSession.findMany({
          where: { userId },
          select: {
            id: true,
            status: true,
            _count: { select: { responses: true } },
          },
        }),
        this.prisma.aiInterviewFeedback.findMany({
          where: { userId },
          select: { overallScore: true },
        }),
      ]);

      const completedSessions = sessions.filter(
        (s) => s.status === AiInterviewSessionStatus.COMPLETED
      );

      const inProgressSessions = sessions.filter(
        (s) =>
          s.status === AiInterviewSessionStatus.IN_PROGRESS ||
          s.status === AiInterviewSessionStatus.STARTED
      );

      const scores = feedbacks
        .map((f) => f.overallScore)
        .filter((score): score is NonNullable<typeof score> => score !== null)
        .map(Number);

      const averageScore =
        scores.length > 0
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          : 0;

      const totalQuestionsAnswered = sessions.reduce(
        (sum, s) => sum + s._count.responses,
        0
      );

      return {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        inProgressSessions: inProgressSessions.length,
        averageScore,
        totalQuestionsAnswered,
        highestScore: scores.length > 0 ? Math.max(...scores) : null,
        lowestScore: scores.length > 0 ? Math.min(...scores) : null,
      };
    } catch (error) {
      logger.error('[InterviewService] Failed to fetch stats', {
        userId,
        error: (error as Error).message,
      });
      throw new InternalError('Failed to fetch session statistics');
    }
  }

  async cancelSession(sessionId: string, userId: string): Promise<void> {
    logger.info('[InterviewService] Cancelling session', { sessionId });

    const session = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.status === AiInterviewSessionStatus.COMPLETED) {
      throw new BadRequestError('Cannot cancel a completed session');
    }

    await this.prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: AiInterviewSessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    logger.info('[InterviewService] Session cancelled', { sessionId });
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    logger.info('[InterviewService] Deleting session', { sessionId });

    const session = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    await this.prisma.$transaction([
      this.prisma.aiInterviewResponse.deleteMany({ where: { sessionId } }),
      this.prisma.aiInterviewFeedback.deleteMany({ where: { sessionId } }),
      this.prisma.aiInterviewSession.delete({ where: { id: sessionId } }),
    ]);

    logger.info('[InterviewService] Session deleted', { sessionId });
  }

  async testTTS(): Promise<object> {
    const fs = await import('fs');
    const path = await import('path');
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    const connectionTest = await this.ttsManager.testConnection();

    return {
      credentialsPath: credPath,
      fileExists: credPath ? fs.existsSync(credPath) : false,
      absolutePath: credPath ? path.resolve(credPath) : null,
      connectionTest,
      cacheSize: this.ttsManager.cacheSize,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasCredentials: !!credPath,
      },
    };
  }

  // ============= Private Helper Methods =============

  private isDuplicateRequest(key: string): boolean {
    if (this.requestDedup.has(key)) {
      return true;
    }

    const timeout = setTimeout(() => {
      this.requestDedup.delete(key);
    }, CONSTANTS.DEDUP_TIMEOUT_MS);

    timeout.unref();
    this.requestDedup.set(key, timeout);
    return false;
  }

  private acquireLock(key: string): boolean {
    if (this.activeLocks.has(key)) {
      return false;
    }
    this.activeLocks.add(key);
    return true;
  }

  private releaseLock(key: string): void {
    this.activeLocks.delete(key);
  }

  private async buildSessionContext(
    userId: string,
    dto: StartInterviewSessionRequest
  ): Promise<SessionContext> {
    let resumeText: string | undefined;

    if (dto.resumeId) {
      try {
        resumeText = await this.profileService.extractResumeText(userId, dto.resumeId);
      } catch (error) {
        logger.warn('[InterviewService] Failed to extract resume text', {
          userId,
          resumeId: dto.resumeId,
          error: (error as Error).message,
        });
      }
    }

    return {
      jobTitle: dto.jobTitle?.trim() || CONSTANTS.DEFAULT_JOB_TITLE,
      companyName: dto.companyName?.trim(),
      resumeText,
    };
  }

  private async generateInitialQuestions(context: SessionContext): Promise<QuestionItem[]> {
    const prompt = this.buildQuestionsPrompt(context);

    try {
      const result = await this.groqManager.callApi(prompt);
      const content = result.choices?.[0]?.message?.content || '';
      const parsed = this.jsonParser.parse<Questions>(content, 'questions');

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid questions format');
      }

      return this.normalizeQuestions(parsed.questions);
    } catch (error) {
      logger.error('[InterviewService] Question generation failed', {
        error: (error as Error).message,
      });
      return this.getFallbackQuestions(context.jobTitle);
    }
  }

  private buildQuestionsPrompt(context: SessionContext): string {
    const { jobTitle, companyName, resumeText } = context;
    const roleContext = `${jobTitle}${companyName ? ` at ${companyName}` : ''}`;
    const resumeContext = resumeText
      ? resumeText.slice(0, CONSTANTS.MAX_PROMPT_LENGTH)
      : 'No resume provided';

    return `
You are an expert technical interviewer. Generate exactly ${CONSTANTS.MAX_QUESTIONS} interview questions for a ${roleContext} position.

Structure the questions as follows:
- 1 INTRODUCTORY question (warm-up, about background)
- ${CONSTANTS.MAX_QUESTIONS - 2} TECHNICAL questions (specific to the role, varying difficulty)
- 1 CLOSING question (candidate's questions, next steps)

${resumeText ? `Candidate's resume summary:\n"${resumeContext}"` : ''}

Tailor questions to the candidate's experience level if resume is provided.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {"category": "INTRODUCTORY", "text": "question text here"},
    {"category": "TECHNICAL", "text": "question text here"},
    ...
    {"category": "CLOSING", "text": "question text here"}
  ]
}
`.trim();
  }

  private normalizeQuestions(questions: QuestionItem[]): QuestionItem[] {
    const validCategories = Object.values(AiInterviewQuestionCategory);

    const validQuestions = questions
      .filter((q) => q.text && q.category)
      .map((q) => ({
        ...q,
        category: validCategories.includes(q.category as AiInterviewQuestionCategory)
          ? q.category
          : AiInterviewQuestionCategory.TECHNICAL,
      }));

    const intro = validQuestions.find(
      (q) => q.category === AiInterviewQuestionCategory.INTRODUCTORY
    ) || {
      category: AiInterviewQuestionCategory.INTRODUCTORY,
      text: 'Tell me about yourself and your background.',
    };

    const tech = validQuestions
      .filter((q) => q.category === AiInterviewQuestionCategory.TECHNICAL)
      .slice(0, CONSTANTS.MAX_QUESTIONS - 2);

    const defaultTechQuestions = this.getDefaultTechnicalQuestions();
    while (tech.length < CONSTANTS.MAX_QUESTIONS - 2) {
      tech.push(defaultTechQuestions[tech.length] || {
        category: AiInterviewQuestionCategory.TECHNICAL,
        text: 'Describe a challenging technical problem you solved recently.',
      });
    }

    const closing = validQuestions.find(
      (q) => q.category === AiInterviewQuestionCategory.CLOSING
    ) || {
      category: AiInterviewQuestionCategory.CLOSING,
      text: 'Do you have any questions for us about the role or company?',
    };

    return [intro, ...tech, closing];
  }

  private getDefaultTechnicalQuestions(): QuestionItem[] {
    return [
      { category: AiInterviewQuestionCategory.TECHNICAL, text: 'What programming languages are you most proficient in and why?' },
      { category: AiInterviewQuestionCategory.TECHNICAL, text: 'Describe your experience with data structures and algorithms.' },
      { category: AiInterviewQuestionCategory.TECHNICAL, text: 'How do you approach debugging complex issues in production?' },
      { category: AiInterviewQuestionCategory.TECHNICAL, text: 'Tell me about a challenging project you\'ve worked on.' },
      { category: AiInterviewQuestionCategory.TECHNICAL, text: 'How do you ensure code quality in your projects?' },
      { category: AiInterviewQuestionCategory.TECHNICAL, text: 'Describe your experience with version control and CI/CD pipelines.' },
      { category: AiInterviewQuestionCategory.TECHNICAL, text: 'How do you stay updated with new technologies and best practices?' },
      { category: AiInterviewQuestionCategory.TECHNICAL, text: 'What\'s your approach to system design and architecture?' },
    ];
  }

  private getFallbackQuestions(jobTitle: string): QuestionItem[] {
    return [
      {
        category: AiInterviewQuestionCategory.INTRODUCTORY,
        text: `Tell me about yourself and your interest in the ${jobTitle} role.`,
      },
      ...this.getDefaultTechnicalQuestions().slice(0, CONSTANTS.MAX_QUESTIONS - 2),
      {
        category: AiInterviewQuestionCategory.CLOSING,
        text: 'What questions do you have about our team or company?',
      },
    ];
  }

  private async createSession(
    userId: string,
    context: SessionContext,
    questions: QuestionItem[],
    resumeId?: number
  ): Promise<AiInterviewSession> {
    const sessionData: Prisma.AiInterviewSessionCreateInput = {
      user: { connect: { id: userId } },
      resume: resumeId ? { connect: { id: resumeId } } : undefined,
      jobTitle: context.jobTitle,
      companyName: context.companyName,
      questions: PrismaJsonHelper.toJson({ questions }),
      totalQuestions: CONSTANTS.MAX_QUESTIONS,
      currentQuestionIndex: 0,
      status: AiInterviewSessionStatus.STARTED,
    };

    return this.prisma.aiInterviewSession.create({ data: sessionData });
  }

  private formatSessionResponse(
    session: AiInterviewSession,
    questions: QuestionItem[],
    audioUrl?: string
  ): InterviewSessionResponse {
    return {
      id: session.id,
      userId: session.userId,
      status: session.status,
      questions: questions.map((q) => ({
        category: q.category,
        text: q.text,
      })),
      currentQuestion: {
        category: questions[0].category,
        text: questions[0].text,
      },
      currentQuestionIndex: 0,
      totalQuestions: session.totalQuestions,
      audioUrl,
      createdAt: session.createdAt,
    };
  }

  private async validateSession(
    sessionId: string,
    userId: string
  ): Promise<AiInterviewSession & { responses: AiInterviewResponse[]; resume: any }> {
    const session = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { responses: true, resume: true },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.status === AiInterviewSessionStatus.COMPLETED) {
      throw new ConflictError('Session has already been completed');
    }

    return session;
  }

  private async validateSessionForRead(
    sessionId: string,
    userId: string
  ): Promise<AiInterviewSession & { responses: AiInterviewResponse[]; resume: any }> {
    const session = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { responses: true, resume: true },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    return session;
  }

  private async scoreAnswer(
    dto: SubmitAnswerRequest,
    session: AiInterviewSession & { resume?: any }
  ): Promise<AnswerScore> {
    const resumeContent = session.resume?.content || 'Not provided';
    const context = `Job: ${session.jobTitle}, Company: ${session.companyName || 'Not specified'}`;
    const prompt = this.buildScoringPrompt(dto, context, resumeContent);

    try {
      const result = await this.groqManager.callApi(prompt);
      const content = result.choices?.[0]?.message?.content || '';
      const parsed = this.jsonParser.parse<AnswerScore>(content, 'score');

      return {
        contentScore: this.normalizeScore(parsed.contentScore),
        fluencyScore: this.normalizeScore(parsed.fluencyScore),
        relevanceScore: this.normalizeScore(parsed.relevanceScore),
        feedback: parsed.feedback || 'Good response.',
        weakSection: parsed.weakSection || '',
      };
    } catch (error) {
      logger.error('[InterviewService] Scoring failed', {
        sessionId: session.id,
        error: (error as Error).message,
      });
      return this.getDefaultScore();
    }
  }

  private normalizeScore(score: number | undefined): number {
    if (score === undefined || score === null || isNaN(score)) {
      return 5;
    }
    return Math.min(10, Math.max(0, Math.round(score)));
  }

  private buildScoringPrompt(
    dto: SubmitAnswerRequest,
    context: string,
    resumeContent: string
  ): string {
    const transcribedNote = dto.isTranscribed
      ? '(Note: This answer was transcribed from speech)'
      : '';

    return `
You are an expert interview evaluator. Score the following interview answer.

Context: ${context}
Resume Summary: ${resumeContent.slice(0, 1000)}

Question: "${dto.question}"
Category: ${dto.category}
Answer: "${dto.answer}" ${transcribedNote}

Evaluate the answer on these criteria (0-10 scale):
1. Content Score: Quality, depth, and accuracy
2. Fluency Score: Clarity and structure
3. Relevance Score: How well it addresses the question

Return ONLY valid JSON:
{
  "contentScore": 0-10,
  "fluencyScore": 0-10,
  "relevanceScore": 0-10,
  "feedback": "constructive feedback",
  "weakSection": "area needing improvement or empty string"
}
`.trim();
  }

  private getDefaultScore(): AnswerScore {
    return {
      contentScore: 5,
      fluencyScore: 5,
      relevanceScore: 5,
      feedback: 'Thank you for your response.',
      weakSection: '',
    };
  }

  private async saveResponse(
    sessionId: string,
    dto: SubmitAnswerRequest,
    scores: AnswerScore,
    session: AiInterviewSession
  ): Promise<AiInterviewResponse> {
    return this.prisma.aiInterviewResponse.create({
      data: {
        sessionId,
        category: dto.category,
        question: dto.question,
        answer: dto.answer,
        isFollowup: session.currentQuestionIndex > 0,
        scoresJson: PrismaJsonHelper.toJson(scores),
        feedbackText: scores.feedback,
        timeTakenSeconds: dto.timeTakenSeconds,
      },
    });
  }

  private async processNextStep(
    session: AiInterviewSession & { responses?: AiInterviewResponse[] },
    lastAnswer: string
  ): Promise<SubmitAnswerResponse> {
    const nextIndex = session.currentQuestionIndex + 1;

    if (nextIndex >= session.totalQuestions) {
      await this.completeSession(session.id);

      let audioUrl: string | undefined;
      try {
        audioUrl = await this.ttsManager.generateAudio(
          'Thank you for completing the interview. Your feedback is now available.',
          session.id
        );
      } catch {
        // Audio is optional
      }

      return {
        isComplete: true,
        message: 'Interview completed successfully!',
        audioUrl,
      };
    }

    const questions = this.parseQuestions(session.questions);
    const nextQuestion = await this.generateFollowupQuestion(
      questions[session.currentQuestionIndex],
      lastAnswer,
      session
    );

    questions[nextIndex] = nextQuestion;

    await this.prisma.aiInterviewSession.update({
      where: { id: session.id },
      data: {
        questions: PrismaJsonHelper.toJson({ questions }),
        currentQuestionIndex: nextIndex,
        status: AiInterviewSessionStatus.IN_PROGRESS,
      },
    });

    let audioUrl: string | undefined;
    try {
      audioUrl = await this.ttsManager.generateAudio(nextQuestion.text, session.id);
    } catch (error) {
      logger.warn('[InterviewService] Failed to generate audio', {
        sessionId: session.id,
        error: (error as Error).message,
      });
    }

    return {
      nextQuestion: {
        category: nextQuestion.category,
        text: nextQuestion.text,
      },
      questionIndex: nextIndex,
      totalQuestions: session.totalQuestions,
      isComplete: false,
      audioUrl,
    };
  }

  private async generateFollowupQuestion(
    currentQuestion: QuestionItem,
    answer: string,
    session: AiInterviewSession
  ): Promise<QuestionItem> {
    const prompt = `
You are an expert interviewer conducting a ${session.jobTitle} interview.

Previous Question: "${currentQuestion.text}"
Candidate's Answer: "${answer}"

Generate a relevant follow-up question that:
1. Builds on the candidate's response
2. Explores a related technical area
3. Is appropriate for the role

Return ONLY valid JSON:
{"question": "your follow-up question here"}
`.trim();

    try {
      const result = await this.groqManager.callApi(prompt);
      const content = result.choices?.[0]?.message?.content || '';
      const parsed = this.jsonParser.parse<{ question: string }>(content, 'followup');

      if (!parsed.question) {
        throw new Error('No question in response');
      }

      return {
        category: AiInterviewQuestionCategory.TECHNICAL,
        text: parsed.question,
      };
    } catch (error) {
      logger.warn('[InterviewService] Follow-up generation failed', {
        sessionId: session.id,
        error: (error as Error).message,
      });

      return {
        category: AiInterviewQuestionCategory.TECHNICAL,
        text: `Can you tell me more about your experience with ${session.jobTitle} responsibilities?`,
      };
    }
  }

  private async completeSession(sessionId: string): Promise<void> {
    await this.prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: AiInterviewSessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    logger.info('[InterviewService] Session completed', { sessionId });
  }

  private parseQuestions(questionsData: any): QuestionItem[] {
    try {
      if (questionsData?.questions && Array.isArray(questionsData.questions)) {
        return questionsData.questions;
      }

      const parsed = PrismaJsonHelper.fromJson<Questions>(questionsData);
      if (parsed?.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
    } catch (error) {
      logger.error('[InterviewService] Failed to parse questions', {
        error: (error as Error).message,
      });
    }

    return this.getFallbackQuestions(CONSTANTS.DEFAULT_JOB_TITLE);
  }

  private async getCompletedSession(
    sessionId: string,
    userId: string
  ): Promise<AiInterviewSession & { responses: AiInterviewResponse[]; feedback: any }> {
    const session = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { responses: true, feedback: true },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.status !== AiInterviewSessionStatus.COMPLETED) {
      throw new BadRequestError(
        'Feedback is only available after the interview is completed'
      );
    }

    return session;
  }

  private formatExistingFeedback(feedback: any): InterviewFeedbackResponse {
    const json = PrismaJsonHelper.fromJson<any>(feedback.feedbackJson, {});

    return {
      overallScore: Number(feedback.overallScore) || 0,
      overallSummary: feedback.overallSummary || '',
      keyStrengths: feedback.keyStrengths || [],
      areasForImprovement: feedback.areasForImprovement || [],
      weakSections: json.weakSections || [],
      perResponseScores: json.perResponseScores || [],
    };
  }

  private async generateAndSaveFeedback(
    session: AiInterviewSession & { responses: AiInterviewResponse[] }
  ): Promise<InterviewFeedbackResponse> {
    logger.info('[InterviewService] Generating feedback', { sessionId: session.id });

    const feedbackData = await this.generateFeedback(session);

    const saved = await this.prisma.aiInterviewFeedback.create({
      data: {
        sessionId: session.id,
        userId: session.userId,
        overallScore: feedbackData.overallScore,
        overallSummary: feedbackData.overallSummary,
        keyStrengths: feedbackData.keyStrengths,
        areasForImprovement: feedbackData.areasForImprovement,
        feedbackJson: PrismaJsonHelper.toJson({
          weakSections: feedbackData.weakSections,
          perResponseScores: feedbackData.perResponseScores,
        }),
      },
    });

    logger.info('[InterviewService] Feedback saved', { sessionId: session.id });

    return this.formatExistingFeedback(saved);
  }

  private async generateFeedback(
    session: AiInterviewSession & { responses: AiInterviewResponse[] }
  ): Promise<InterviewFeedbackResponse> {
    const prompt = this.buildFeedbackPrompt(session);

    try {
      const result = await this.groqManager.callApi(prompt);
      const content = result.choices?.[0]?.message?.content || '';
      const parsed = this.jsonParser.parse<any>(content, 'feedback');

      return this.normalizeFeedback(parsed, session.responses);
    } catch (error) {
      logger.error('[InterviewService] Feedback generation failed', {
        sessionId: session.id,
        error: (error as Error).message,
      });
      return this.getDefaultFeedback(session.responses);
    }
  }

  private buildFeedbackPrompt(
    session: AiInterviewSession & { responses: AiInterviewResponse[] }
  ): string {
    const answers = session.responses
      .map((r, i) => `Q${i + 1} [${r.category}]: ${r.question}\nA: ${r.answer}`)
      .join('\n\n');

    return `
You are an expert interview coach. Analyze this complete interview for a ${session.jobTitle} position${session.companyName ? ` at ${session.companyName}` : ''}.

Interview Transcript:
${answers}

Provide a comprehensive evaluation including:
1. Overall score (0-100)
2. Summary of performance
3. Key strengths demonstrated
4. Areas needing improvement
5. Specific weak sections to focus on

Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "overallSummary": "comprehensive summary",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["area1", "area2", "area3"],
  "weakSections": ["topic or skill to improve"]
}
`.trim();
  }

  private normalizeFeedback(
    raw: any,
    responses: AiInterviewResponse[]
  ): InterviewFeedbackResponse {
    const perResponseScores: ResponseScoreDto[] = responses.map((r, index) => {
      const scores = PrismaJsonHelper.fromJson<AnswerScore>(r.scoresJson, this.getDefaultScore());
      return {
        questionIndex: index,
        contentScore: scores.contentScore,
        fluencyScore: scores.fluencyScore,
        relevanceScore: scores.relevanceScore,
        feedback: scores.feedback,
      };
    });

    const avgScore = perResponseScores.length > 0
      ? perResponseScores.reduce(
          (sum, s) => sum + (s.contentScore + s.fluencyScore + s.relevanceScore) / 3,
          0
        ) / perResponseScores.length
      : 50;

    const overallScore = raw.overallScore >= 0 && raw.overallScore <= 100
      ? Math.round(raw.overallScore)
      : Math.round(avgScore * 10);

    return {
      overallScore,
      overallSummary: raw.overallSummary || 'Interview completed.',
      keyStrengths: Array.isArray(raw.keyStrengths) ? raw.keyStrengths.slice(0, 5) : [],
      areasForImprovement: Array.isArray(raw.areasForImprovement)
        ? raw.areasForImprovement.slice(0, 5)
        : [],
      weakSections: Array.isArray(raw.weakSections) ? raw.weakSections.slice(0, 5) : [],
      perResponseScores,
    };
  }

  private getDefaultFeedback(responses: AiInterviewResponse[]): InterviewFeedbackResponse {
    const perResponseScores: ResponseScoreDto[] = responses.map((_, i) => ({
      questionIndex: i,
      contentScore: 7,
      fluencyScore: 7,
      relevanceScore: 7,
      feedback: 'Response recorded.',
    }));

    return {
      overallScore: 70,
      overallSummary: 'Thank you for completing the interview.',
      keyStrengths: ['Communication', 'Engagement'],
      areasForImprovement: ['Technical depth', 'Specific examples'],
      weakSections: [],
      perResponseScores,
    };
  }

  // ============= Cleanup =============

  destroy(): void {
    for (const timeout of this.requestDedup.values()) {
      clearTimeout(timeout);
    }
    this.requestDedup.clear();
    this.activeLocks.clear();
    this.ttsManager.destroy();
    logger.info('[InterviewService] Service destroyed');
  }
}
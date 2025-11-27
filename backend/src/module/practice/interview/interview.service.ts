// interview.service.ts

import {
  AiInterviewSession,
  AiInterviewResponse,
  AiInterviewFeedback,
  AiInterviewSessionStatus,
  AiInterviewQuestionCategory,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { GroqApiManager } from '../../../utils/groq-manager';
import { getTTSManager, TTSManager } from '../../../utils/tts-manager';
import { STTManager } from '../../../utils/stt-manager';
import { PrismaJsonHelper } from '../../../utils/prisma-helper';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileService } from '../../profile/profile.service';
import { logger } from '../../../utils/logger';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  InternalError,
} from '../../../utils/errors';
import {
  StartSessionDto,
  SubmitResponseDto,
  SessionResponse,
  SubmitResponseResult,
  FeedbackResponse,
  SessionSummary,
  SessionStats,
  ConversationTurn,
  LiveSessionState,
  SessionContext,
  QuestionItem,
  AnswerScore,
  INTERVIEW_CONFIG,
} from './interview.types';
import { InterviewAnalyzer, CategoryScore } from './interview.analyzer';
import { InterviewGenerator } from './interview.generator';
import {
  MAX_AUDIO_SIZE_BYTES,
  MAX_TRANSCRIPT_LENGTH,
  MAX_SESSIONS_PER_PAGE,
  sanitizeInput,
  sanitizeStringArray,
  formatConversation,
  createLiveState,
  createCandidateTurn,
  calculateProgress,
  shouldEndInterview,
  categoryToTopic,
  extractErrorMessage,
} from './interview.utils';

// =====================================================
// INTERNAL TYPES
// =====================================================

interface DbSessionWithRelations extends AiInterviewSession {
  responses: AiInterviewResponse[];
  feedback: AiInterviewFeedback | null;
  resume?: { id: number } | null;
}

interface PersistedQuestion {
  text: string;
  category: AiInterviewQuestionCategory;
  isFollowUp: boolean;
}

interface FeedbackJson {
  categoryScores?: CategoryScore[];
  recommendations?: string[];
}

// =====================================================
// SERVICE
// =====================================================

export class InterviewService {
  private readonly groqManager: GroqApiManager;
  private readonly ttsManager: TTSManager;
  private readonly sttManager: STTManager;
  private readonly analyzer: InterviewAnalyzer;
  private readonly generator: InterviewGenerator;

  // In-memory state for active sessions
  private readonly activeSessions = new Map<string, LiveSessionState>();

  // Request deduplication & locking
  private readonly pendingRequests = new Map<string, NodeJS.Timeout>();
  private readonly activeLocks = new Set<string>();

  private isDestroyed = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService
  ) {
    this.groqManager = new GroqApiManager(this.getApiKeys());
    this.ttsManager = getTTSManager();
    this.sttManager = new STTManager();
    this.analyzer = new InterviewAnalyzer(this.groqManager);
    this.generator = new InterviewGenerator(this.groqManager);
    this.initialize();
  }

  // ===================================================
  // PUBLIC API
  // ===================================================

  /**
   * Start a new interview session
   */
  async startSession(
    userId: string,
    dto: StartSessionDto
  ): Promise<SessionResponse> {
    this.ensureActive();
    this.preventDuplicateRequest(`start:${userId}`);

    logger.info('[InterviewService] Starting session', { userId, dto });

    try {
      const context = await this.buildContext(userId, dto);
      const openingQuestion = await this.generator.generateOpeningQuestion(context);

      const dbSession = await this.prisma.aiInterviewSession.create({
        data: {
          user: { connect: { id: userId } },
          resume: dto.resumeId ? { connect: { id: dto.resumeId } } : undefined,
          jobTitle: context.jobTitle,
          companyName: context.companyName,
          questions: PrismaJsonHelper.toJson([]),
          totalQuestions: INTERVIEW_CONFIG.TARGET_QUESTIONS,
          currentQuestionIndex: 0,
          status: AiInterviewSessionStatus.STARTED,
        },
      });

      const liveState = createLiveState(
        dbSession.id,
        userId,
        context,
        openingQuestion
      );
      this.activeSessions.set(dbSession.id, liveState);

      await this.persistQuestions(dbSession.id, liveState);

      const audioUrl = await this.safeGenerateAudio(
        openingQuestion.text,
        dbSession.id
      );

      logger.info('[InterviewService] Session started', {
        sessionId: dbSession.id,
      });

      return this.formatSessionResponse(liveState, audioUrl);
    } catch (error) {
      logger.error('[InterviewService] Failed to start session', {
        userId,
        error: extractErrorMessage(error),
      });
      throw error;
    }
  }

  /**
   * Submit a response to the current question
   */
  async submitResponse(
    sessionId: string,
    userId: string,
    dto: SubmitResponseDto
  ): Promise<SubmitResponseResult> {
    this.ensureActive();

    const lockKey = `response:${sessionId}`;
    if (!this.acquireLock(lockKey)) {
      throw new ConflictError('Response already being processed');
    }

    try {
      logger.info('[InterviewService] Processing response', { sessionId });

      const dbSession = await this.getActiveSession(sessionId, userId);

      let liveState = this.activeSessions.get(sessionId);
      if (!liveState) {
        liveState = await this.restoreLiveState(dbSession);
        this.activeSessions.set(sessionId, liveState);
      }

      const transcript = await this.getTranscript(dto);
      if (!transcript || transcript.trim().length < 3) {
        throw new BadRequestError(
          'Could not understand response. Please try again.'
        );
      }

      const candidateTurn = this.addCandidateTurn(liveState, transcript);

      const analysis = await this.analyzer.analyzeResponse(liveState, transcript);
      liveState.lastAnalysis = analysis;

      const scores = this.analyzer.calculateScores(analysis);

      await this.saveResponse(
        sessionId,
        liveState.currentQuestion,
        transcript,
        scores,
        liveState.currentIsFollowUp
      );

      analysis.topics.forEach((t) => liveState!.coveredTopics.add(t));

      if (shouldEndInterview(liveState)) {
        return this.completeInterview(sessionId, liveState, candidateTurn, scores);
      }

      const shouldFollowUp = this.analyzer.shouldFollowUp(liveState, analysis);
      const { question, isFollowUp, transition } = await this.generator.generateNextQuestion(
        liveState,
        analysis,
        shouldFollowUp
      );

      this.addInterviewerTurn(liveState, question, isFollowUp);

      await this.persistQuestions(sessionId, liveState);

      await this.prisma.aiInterviewSession.update({
        where: { id: sessionId },
        data: {
          currentQuestionIndex: liveState.questionCount - 1,
          status: AiInterviewSessionStatus.IN_PROGRESS,
        },
      });

      const audioUrl = await this.safeGenerateAudio(question.text, sessionId);

      return {
        responseReceived: {
          id: candidateTurn.id,
          transcript,
          scores,
        },
        nextQuestion: {
          id: liveState.conversationHistory[liveState.conversationHistory.length - 1].id,
          text: question.text,
          category: question.category,
          audioUrl,
          isFollowUp,
          transition,
        },
        isComplete: false,
        progress: calculateProgress(liveState),
      };
    } finally {
      this.releaseLock(lockKey);
    }
  }

  /**
   * Get feedback for a completed session
   */
  async getFeedback(
    sessionId: string,
    userId: string
  ): Promise<FeedbackResponse> {
    this.ensureActive();

    const dbSession = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { responses: true, feedback: true },
    });

    if (!dbSession) {
      throw new NotFoundError('Session');
    }

    if (dbSession.status !== AiInterviewSessionStatus.COMPLETED) {
      throw new BadRequestError('Interview must be completed to get feedback');
    }

    if (dbSession.feedback) {
      return this.formatFeedback(dbSession.feedback);
    }

    const liveState = this.activeSessions.get(sessionId);
    return this.generateAndSaveFeedback(
      dbSession as DbSessionWithRelations,
      liveState
    );
  }

  /**
   * End session early
   */
  async endSession(
    sessionId: string,
    userId: string
  ): Promise<FeedbackResponse> {
    this.ensureActive();

    const dbSession = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { responses: true, feedback: true },
    });

    if (!dbSession) {
      throw new NotFoundError('Session');
    }

    if (dbSession.status === AiInterviewSessionStatus.COMPLETED) {
      return this.getFeedback(sessionId, userId);
    }

    await this.prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: AiInterviewSessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    this.activeSessions.delete(sessionId);

    return this.generateAndSaveFeedback(
      dbSession as DbSessionWithRelations,
      undefined
    );
  }

  /**
   * Get current session state
   */
  async getSession(
    sessionId: string,
    userId: string
  ): Promise<SessionResponse> {
    this.ensureActive();

    const dbSession = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { responses: true },
    });

    if (!dbSession) {
      throw new NotFoundError('Session');
    }

    if (dbSession.status === AiInterviewSessionStatus.COMPLETED) {
      throw new BadRequestError('Session is already completed');
    }

    let liveState = this.activeSessions.get(sessionId);
    if (!liveState) {
      liveState = await this.restoreLiveState(
        dbSession as DbSessionWithRelations
      );
      this.activeSessions.set(sessionId, liveState);
    }

    const audioUrl = await this.safeGenerateAudio(
      liveState.currentQuestion.text,
      sessionId
    );

    return this.formatSessionResponse(liveState, audioUrl);
  }

  /**
   * Get user's session history with pagination
   */
  async getUserSessions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ sessions: SessionSummary[]; total: number; page: number; totalPages: number }> {
    this.ensureActive();

    const sanitizedLimit = Math.min(Math.max(1, limit), MAX_SESSIONS_PER_PAGE);
    const sanitizedPage = Math.max(1, page);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const [sessions, total] = await Promise.all([
      this.prisma.aiInterviewSession.findMany({
        where: { userId },
        include: {
          responses: { select: { id: true } },
          feedback: { select: { overallScore: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: sanitizedLimit,
        skip,
      }),
      this.prisma.aiInterviewSession.count({ where: { userId } }),
    ]);

    const sessionSummaries: SessionSummary[] = sessions.map((s) => ({
      id: s.id,
      jobTitle: s.jobTitle || INTERVIEW_CONFIG.DEFAULT_JOB_TITLE,
      companyName: s.companyName || undefined,
      status: s.status,
      questionsAnswered: s.responses.length,
      overallScore: s.feedback?.overallScore
        ? Number(s.feedback.overallScore)
        : undefined,
      createdAt: s.createdAt,
      completedAt: s.completedAt || undefined,
    }));

    return {
      sessions: sessionSummaries,
      total,
      page: sanitizedPage,
      totalPages: Math.ceil(total / sanitizedLimit),
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<SessionStats> {
    this.ensureActive();

    const [sessions, feedbacks, responses] = await Promise.all([
      this.prisma.aiInterviewSession.findMany({
        where: { userId },
        select: { id: true, status: true },
      }),
      this.prisma.aiInterviewFeedback.findMany({
        where: { userId },
        select: { overallScore: true },
      }),
      this.prisma.aiInterviewResponse.findMany({
        where: { session: { userId } },
        select: { category: true },
      }),
    ]);

    const scores = feedbacks
      .map((f) => Number(f.overallScore))
      .filter((s) => !isNaN(s));

    const categoryCounts = responses.reduce(
      (acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(
        (s) => s.status === AiInterviewSessionStatus.COMPLETED
      ).length,
      averageScore:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
      totalQuestionsAnswered: responses.length,
      topCategories: Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    this.ensureActive();

    const session = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    await this.prisma.transaction(async (tx) => {
      const sessionCheck = await tx.aiInterviewSession.findFirst({
        where: { id: sessionId, userId },
      });

      if (!sessionCheck) {
        throw new NotFoundError('Session');
      }

      await tx.aiInterviewResponse.deleteMany({
        where: { sessionId, session: { userId } },
      });
      await tx.aiInterviewFeedback.deleteMany({
        where: { sessionId, userId },
      });
      await tx.aiInterviewSession.delete({
        where: { id: sessionId },
      });
    });

    this.activeSessions.delete(sessionId);
    logger.info('[InterviewService] Session deleted', { sessionId });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.pendingRequests.forEach((timeout) => clearTimeout(timeout));
    this.pendingRequests.clear();

    this.activeLocks.clear();
    this.activeSessions.clear();
    this.ttsManager.destroy();

    logger.info('[InterviewService] Destroyed');
  }

  // ===================================================
  // PRIVATE: CONTEXT BUILDING
  // ===================================================

private async buildContext(
  userId: string,
  dto: StartSessionDto
): Promise<SessionContext> {
  let resumeText: string | undefined;

  if (dto.resumeId) {
    try {
      const extractedData = await this.profileService.extractResumeText(
        userId,
        dto.resumeId
      );
      resumeText = extractedData.text; // Extract the text property
    } catch (error) {
      logger.warn('[InterviewService] Resume extraction failed', {
        resumeId: dto.resumeId,
      });
    }
  }

    return {
      jobTitle: sanitizeInput(dto.jobTitle) || INTERVIEW_CONFIG.DEFAULT_JOB_TITLE,
      companyName: sanitizeInput(dto.companyName),
      resumeText: resumeText ? sanitizeInput(resumeText) : undefined,
      difficulty: dto.difficulty || INTERVIEW_CONFIG.DEFAULT_DIFFICULTY,
    };
  }

  // ===================================================
  // PRIVATE: STATE MANAGEMENT
  // ===================================================

  private async persistQuestions(
    sessionId: string,
    liveState: LiveSessionState
  ): Promise<void> {
    const persistedQuestions: PersistedQuestion[] = liveState.conversationHistory
      .filter((t): t is ConversationTurn & { role: 'interviewer' } => t.role === 'interviewer')
      .map((t) => ({
        text: t.content,
        category: t.category,
        isFollowUp: t.isFollowUp,
      }));

    await this.prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        questions: PrismaJsonHelper.toJson(persistedQuestions),
      },
    });
  }

  private async restoreLiveState(
    dbSession: DbSessionWithRelations
  ): Promise<LiveSessionState> {
    const context: SessionContext = {
      jobTitle: dbSession.jobTitle || INTERVIEW_CONFIG.DEFAULT_JOB_TITLE,
      companyName: dbSession.companyName || undefined,
      difficulty: INTERVIEW_CONFIG.DEFAULT_DIFFICULTY,
    };

    const savedQuestions = PrismaJsonHelper.fromJson<PersistedQuestion[]>(
      dbSession.questions,
      []
    );

    const conversationHistory: ConversationTurn[] = [];
    const coveredTopics = new Set<string>();

    for (const response of dbSession.responses) {
      const interviewerTurn: ConversationTurn = {
        id: uuidv4(),
        role: 'interviewer',
        content: response.question,
        category: response.category,
        timestamp: response.createdAt,
        isFollowUp: response.isFollowup,
      };
      conversationHistory.push(interviewerTurn);

      const candidateTurn: ConversationTurn = {
        id: uuidv4(),
        role: 'candidate',
        content: response.answer,
        category: response.category,
        timestamp: response.createdAt,
        isFollowUp: false,
      };
      conversationHistory.push(candidateTurn);

      coveredTopics.add(categoryToTopic(response.category));
    }

    const responseCount = dbSession.responses.length;
    if (
      dbSession.currentQuestionIndex >= responseCount &&
      responseCount < savedQuestions.length
    ) {
      const pendingQ = savedQuestions[responseCount];
      if (pendingQ) {
        const interviewerTurn: ConversationTurn = {
          id: uuidv4(),
          role: 'interviewer',
          content: pendingQ.text,
          category: pendingQ.category,
          timestamp: new Date(),
          isFollowUp: pendingQ.isFollowUp,
        };
        conversationHistory.push(interviewerTurn);
        coveredTopics.add(categoryToTopic(pendingQ.category));
      }
    }

    let currentQuestion: QuestionItem;
    let currentIsFollowUp = false;
    const lastInterviewerTurn = conversationHistory
      .filter((t) => t.role === 'interviewer')
      .pop();

    if (lastInterviewerTurn) {
      currentQuestion = {
        text: lastInterviewerTurn.content,
        category: lastInterviewerTurn.category,
      };
      currentIsFollowUp = lastInterviewerTurn.isFollowUp;
    } else {
      currentQuestion = await this.generator.generateOpeningQuestion(context);
      currentIsFollowUp = false;
    }

    if (conversationHistory.length === 0) {
      const now = new Date();
      const openingTurn: ConversationTurn = {
        id: uuidv4(),
        role: 'interviewer',
        content: currentQuestion.text,
        category: currentQuestion.category,
        timestamp: now,
        isFollowUp: false,
      };
      conversationHistory.push(openingTurn);
      coveredTopics.add('introduction');
    }

    const interviewerTurns = conversationHistory.filter(
      (t) => t.role === 'interviewer'
    );
    let topicDepth = 0;
    for (let i = interviewerTurns.length - 1; i >= 0; i--) {
      if (interviewerTurns[i].isFollowUp) {
        topicDepth++;
      } else {
        break;
      }
    }

    return {
      sessionId: dbSession.id,
      userId: dbSession.userId,
      context,
      conversationHistory,
      currentQuestion,
      currentIsFollowUp,
      currentTopic: categoryToTopic(currentQuestion.category),
      topicDepth,
      coveredTopics,
      questionCount: interviewerTurns.length,
      startedAt: dbSession.createdAt,
      lastActivityAt: new Date(),
      lastAnalysis: null,
    };
  }

  private addCandidateTurn(
    liveState: LiveSessionState,
    transcript: string
  ): ConversationTurn {
    const turn = createCandidateTurn(transcript, liveState.currentQuestion.category);

    liveState.conversationHistory.push(turn);
    liveState.lastActivityAt = new Date();

    return turn;
  }

  private addInterviewerTurn(
    liveState: LiveSessionState,
    question: QuestionItem,
    isFollowUp: boolean
  ): void {
    const turn: ConversationTurn = {
      id: uuidv4(),
      role: 'interviewer',
      content: question.text,
      category: question.category,
      timestamp: new Date(),
      isFollowUp,
    };

    liveState.conversationHistory.push(turn);
    liveState.currentQuestion = question;
    liveState.currentIsFollowUp = isFollowUp;
    liveState.questionCount++;
    liveState.lastActivityAt = new Date();

    if (isFollowUp) {
      liveState.topicDepth++;
    } else {
      liveState.currentTopic = categoryToTopic(question.category);
      liveState.topicDepth = 0;
    }
  }

  // ===================================================
  // PRIVATE: INTERVIEW FLOW
  // ===================================================

  private async completeInterview(
    sessionId: string,
    liveState: LiveSessionState,
    lastResponse: ConversationTurn,
    scores: AnswerScore
  ): Promise<SubmitResponseResult> {
    await this.prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: AiInterviewSessionStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    this.activeSessions.delete(sessionId);
    logger.info('[InterviewService] Interview completed', { sessionId });

    return {
      responseReceived: {
        id: lastResponse.id,
        transcript: lastResponse.content,
        scores,
      },
      isComplete: true,
      progress: {
        questionNumber: liveState.questionCount,
        estimatedTotal: liveState.questionCount,
        topicsCovered: Array.from(liveState.coveredTopics),
        percentComplete: 100,
      },
    };
  }

  // ===================================================
  // PRIVATE: FEEDBACK
  // ===================================================

  private async generateAndSaveFeedback(
    dbSession: DbSessionWithRelations,
    liveState?: LiveSessionState
  ): Promise<FeedbackResponse> {
    logger.info('[InterviewService] Generating feedback', {
      sessionId: dbSession.id,
    });

    if (dbSession.responses.length === 0) {
      return this.getDefaultFeedback();
    }

    let transcript: string;
    if (liveState?.conversationHistory.length) {
      transcript = formatConversation(liveState.conversationHistory);
    } else {
      transcript = dbSession.responses
        .map((r, i) => `Q${i + 1} [${r.category}]: ${r.question}\nA: ${r.answer}`)
        .join('\n\n');
    }

    const feedback = await this.analyzer.generateFeedback(
      dbSession.jobTitle || 'job',
      transcript
    );

    await this.prisma.aiInterviewFeedback.create({
      data: {
        sessionId: dbSession.id,
        userId: dbSession.userId,
        overallScore: feedback.overallScore,
        overallSummary: feedback.summary,
        keyStrengths: feedback.strengths,
        areasForImprovement: feedback.improvements,
        feedbackJson: PrismaJsonHelper.toJson({
          categoryScores: feedback.categoryScores,
          recommendations: feedback.recommendations,
        }),
      },
    });

    return feedback;
  }

  private formatFeedback(feedback: AiInterviewFeedback): FeedbackResponse {
    const json = PrismaJsonHelper.fromJson<FeedbackJson>(feedback.feedbackJson, {});

    return {
      overallScore: Number(feedback.overallScore) || 0,
      summary: feedback.overallSummary || '',
      strengths: sanitizeStringArray(feedback.keyStrengths as unknown[]),
      improvements: sanitizeStringArray(feedback.areasForImprovement as unknown[]),
      categoryScores: Array.isArray(json.categoryScores) ? json.categoryScores : [],
      recommendations: Array.isArray(json.recommendations) ? json.recommendations : [],
    };
  }

  private getDefaultFeedback(): FeedbackResponse {
    return {
      overallScore: 70,
      summary:
        'Thank you for completing the interview. Your responses have been recorded.',
      strengths: ['Participation', 'Engagement'],
      improvements: [
        'Provide more specific examples',
        'Elaborate on technical details',
      ],
      categoryScores: [],
      recommendations: [
        'Practice answering behavioral questions with the STAR method',
        'Prepare specific examples from your experience',
      ],
    };
  }

  // ===================================================
  // PRIVATE: AUDIO & TRANSCRIPTION
  // ===================================================

  private async getTranscript(dto: SubmitResponseDto): Promise<string> {
    if (dto.transcript && dto.transcript.trim().length > 0) {
      const transcript = dto.transcript.trim();

      if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
        throw new BadRequestError(
          `Transcript too long. Maximum ${MAX_TRANSCRIPT_LENGTH} characters allowed.`
        );
      }

      return transcript;
    }

    if (dto.audioBlob) {
      const audioSize = Buffer.byteLength(dto.audioBlob, 'base64');
      if (audioSize > MAX_AUDIO_SIZE_BYTES) {
        throw new BadRequestError(
          `Audio file too large. Maximum ${MAX_AUDIO_SIZE_BYTES / 1024 / 1024}MB allowed.`
        );
      }

      try {
        const audioBuffer = Buffer.from(dto.audioBlob, 'base64');
        const transcript = await this.sttManager.transcribe(audioBuffer);
        return transcript.trim();
      } catch (error) {
        logger.error('[InterviewService] Transcription failed', {
          error: extractErrorMessage(error),
        });
        throw new BadRequestError(
          'Could not transcribe audio. Please try again or type your response.'
        );
      }
    }

    throw new BadRequestError('No response provided');
  }

  private async safeGenerateAudio(
    text: string,
    sessionId: string
  ): Promise<string | undefined> {
    try {
      return await this.ttsManager.generateAudio(text, sessionId);
    } catch (error) {
      logger.warn('[InterviewService] Audio generation failed', {
        error: extractErrorMessage(error),
      });
      return undefined;
    }
  }

  // ===================================================
  // PRIVATE: DATABASE
  // ===================================================

  private async getActiveSession(
    sessionId: string,
    userId: string
  ): Promise<DbSessionWithRelations> {
    const session = await this.prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { responses: true, feedback: true, resume: true },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.status === AiInterviewSessionStatus.COMPLETED) {
      throw new ConflictError('Session is already completed');
    }

    return session as DbSessionWithRelations;
  }

  private async saveResponse(
    sessionId: string,
    question: QuestionItem,
    answer: string,
    scores: AnswerScore,
    isFollowup: boolean
  ): Promise<void> {
    await this.prisma.aiInterviewResponse.create({
      data: {
        sessionId,
        category: question.category,
        question: question.text,
        answer,
        isFollowup,
        scoresJson: PrismaJsonHelper.toJson(scores),
        feedbackText: scores.feedback,
      },
    });
  }

  // ===================================================
  // PRIVATE: UTILITIES
  // ===================================================

  private getApiKeys(): string[] {
    return [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
    ].filter((k): k is string => Boolean(k));
  }

  private async initialize(): Promise<void> {
    try {
      const connected = await this.ttsManager.testConnection();
      if (!connected) {
        logger.warn('[InterviewService] TTS connection test failed');
      }
    } catch (error) {
      logger.warn('[InterviewService] TTS initialization failed', {
        error: extractErrorMessage(error),
      });
    }
  }

  private ensureActive(): void {
    if (this.isDestroyed) {
      throw new InternalError('Service has been destroyed');
    }
  }

  private formatSessionResponse(
    liveState: LiveSessionState,
    audioUrl?: string
  ): SessionResponse {
    const currentTurn = liveState.conversationHistory.find(
      (t) =>
        t.role === 'interviewer' &&
        t.content === liveState.currentQuestion.text
    );

    return {
      sessionId: liveState.sessionId,
      status: 'active',
      currentQuestion: {
        id: currentTurn?.id || uuidv4(),
        text: liveState.currentQuestion.text,
        category: liveState.currentQuestion.category,
        audioUrl,
      },
      progress: calculateProgress(liveState),
      context: {
        jobTitle: liveState.context.jobTitle,
        companyName: liveState.context.companyName,
      },
    };
  }

  private preventDuplicateRequest(key: string): void {
    if (this.pendingRequests.has(key)) {
      throw new ConflictError('Please wait before making another request');
    }

    const timeout = setTimeout(() => {
      this.pendingRequests.delete(key);
    }, INTERVIEW_CONFIG.REQUEST_DEDUP_MS);

    if (timeout.unref) {
      timeout.unref();
    }

    this.pendingRequests.set(key, timeout);
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
}
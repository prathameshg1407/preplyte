// src/module/practice/interview/interview.service.ts

import { AiInterviewSessionStatus, AiInterviewQuestionCategory, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { prisma } from '../../../lib/db';
import { logger } from '../../../utils/logger';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  InternalError,
} from '../../../utils/errors';
import {
  CreateSessionInput,
  InterviewSessionResponse,
  SessionListResponse,
  SessionDetailResponse,
  InterviewFeedback,
  ConversationContext,
  mapSessionToResponse,
  ParsedResume,
} from './interview.types';
import {
  resumeParserService,
  conversationEngineService,
  feedbackGeneratorService,
} from './services';
import {
  INTERVIEW_SESSION_CONFIG,
  ERROR_MESSAGES,
} from './interview.constants';

// =====================================================
// SERVICE CLASS
// =====================================================

class InterviewService {
  // ===================================================
  // SESSION MANAGEMENT
  // ===================================================

  /**
   * Create a new interview session
   */
  async createSession(
    userId: string,
    input: CreateSessionInput
  ): Promise<InterviewSessionResponse> {
    logger.info('[InterviewService] Creating session', { userId, input });

    // Check for active sessions
    const activeSession = await prisma.aiInterviewSession.findFirst({
      where: {
        userId,
        status: { in: ['CREATED', 'STARTED', 'IN_PROGRESS'] },
      },
    });

    if (activeSession) {
      throw new ConflictError(
        'You have an active interview session. Please complete or cancel it first.'
      );
    }

    // Validate resume if provided
    let resumeId = input.resumeId || null;
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });

      if (!resume) {
        throw new NotFoundError('Resume');
      }
    } else {
      // Try to get default resume
      const defaultResume = await resumeParserService.getDefaultResumeForUser(userId);
      if (defaultResume) {
        resumeId = defaultResume.resumeId;
      }
    }

    // Create session
    const session = await prisma.aiInterviewSession.create({
      data: {
        userId,
        resumeId,
        jobTitle: input.jobTitle || 'Software Engineer',
        companyName: input.companyName || null,
        difficulty: input.difficulty || 'MID',
        focusAreas: input.focusAreas || [],
        totalQuestions: input.targetQuestions || INTERVIEW_SESSION_CONFIG.DEFAULT_QUESTIONS,
        status: 'CREATED',
        questions: [] as unknown as Prisma.JsonArray,
      },
      include: {
        resume: true,
      },
    });

    logger.info('[InterviewService] Session created', {
      sessionId: session.id,
      userId,
    });

    return mapSessionToResponse(session);
  }

  /**
   * Start an interview session
   */
  async startSession(
    userId: string,
    sessionId: string
  ): Promise<{ session: InterviewSessionResponse; openingMessage: string }> {
    logger.info('[InterviewService] Starting session', { sessionId, userId });

    const session = await this.getSessionOrThrow(userId, sessionId);

    if (session.status !== 'CREATED') {
      throw new BadRequestError('Session has already been started or completed');
    }

    // Parse resume if available
    let parsedResume: ParsedResume | null = null;
    if (session.resumeId) {
      parsedResume = await resumeParserService.parseResumeById(userId, session.resumeId);
    }

    // Initialize conversation context
    const context = await conversationEngineService.initializeContext(
      parsedResume || this.createMinimalResume(),
      {
        jobTitle: session.jobTitle || 'Software Engineer',
        companyName: session.companyName,
        difficulty: session.difficulty,
        focusAreas: session.focusAreas,
        targetQuestions: session.totalQuestions,
      }
    );

    // Generate opening
    const opening = await conversationEngineService.generateOpening(context);

    // Update session status
    const updatedSession = await prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'STARTED',
        startedAt: new Date(),
        questions: context.questionsAsked as unknown as Prisma.JsonArray,
      },
      include: {
        resume: true,
      },
    });

    // Store first response (the opening)
    await prisma.aiInterviewResponse.create({
      data: {
        sessionId,
        category: opening.category,
        question: opening.question,
        answer: '', // Will be updated when candidate responds
        questionOrder: 0,
        isFollowup: false,
      },
    });

    logger.info('[InterviewService] Session started', { sessionId });

    return {
      session: mapSessionToResponse(updatedSession),
      openingMessage: opening.question,
    };
  }

  /**
   * Get session by ID
   */
  async getSession(
    userId: string,
    sessionId: string
  ): Promise<InterviewSessionResponse> {
    const session = await this.getSessionOrThrow(userId, sessionId);
    return mapSessionToResponse(session);
  }

  /**
   * Get session details with responses and feedback
   */
  async getSessionDetail(
    userId: string,
    sessionId: string
  ): Promise<SessionDetailResponse> {
    const session = await prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        resume: true,
        responses: {
          orderBy: { questionOrder: 'asc' },
        },
        feedback: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Interview session');
    }

    const feedback = session.feedback
      ? await feedbackGeneratorService.getFeedback(sessionId)
      : null;

    return {
      session: mapSessionToResponse(session),
      responses: session.responses.map((r) => ({
        questionId: r.id,
        category: r.category,
        question: r.question,
        answer: r.answer,
        isFollowUp: r.isFollowup,
        timeTakenSeconds: r.timeTakenSeconds || 0,
        scores: (r.scoresJson as any) || null,
        feedback: r.feedbackText || '',
      })),
      feedback,
      metrics: this.calculateSessionMetrics(session),
    };
  }

  /**
   * List user's sessions
   */
  async listSessions(
    userId: string,
    options: {
      page?: number;
      pageSize?: number;
      status?: AiInterviewSessionStatus;
    }
  ): Promise<SessionListResponse> {
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = { userId };
    if (options.status) {
      where.status = options.status;
    }

    const [sessions, total] = await Promise.all([
      prisma.aiInterviewSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          feedback: {
            select: { overallScore: true },
          },
        },
      }),
      prisma.aiInterviewSession.count({ where }),
    ]);

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        status: s.status,
        jobTitle: s.jobTitle || 'Software Engineer',
        difficulty: s.difficulty,
        questionsAnswered: s.currentQuestionIndex,
        totalQuestions: s.totalQuestions,
        overallScore: s.feedback ? Number(s.feedback.overallScore) : null,
        createdAt: s.createdAt,
        completedAt: s.completedAt,
      })),
      total,
      page,
      pageSize,
      hasMore: skip + sessions.length < total,
    };
  }

  /**
   * Cancel an active session
   */
  async cancelSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.getSessionOrThrow(userId, sessionId);

    if (['COMPLETED', 'CANCELLED'].includes(session.status)) {
      throw new BadRequestError('Session is already completed or cancelled');
    }

    await prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    logger.info('[InterviewService] Session cancelled', { sessionId });
  }

  /**
   * End session and generate feedback
   */
  async endSession(
    userId: string,
    sessionId: string
  ): Promise<InterviewFeedback> {
    logger.info('[InterviewService] Ending session', { sessionId });

    const session = await this.getSessionOrThrow(userId, sessionId);

    if (!['STARTED', 'IN_PROGRESS'].includes(session.status)) {
      throw new BadRequestError('Session is not active');
    }

    // Update session status
    await prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Generate feedback
    const feedback = await feedbackGeneratorService.generateFeedback(sessionId);

    logger.info('[InterviewService] Session ended with feedback', {
      sessionId,
      overallScore: feedback.overallScore,
    });

    return feedback;
  }

  // ===================================================
  // RESPONSE HANDLING
  // ===================================================

  /**
   * Submit a response to the current question
   */
  async submitResponse(
    userId: string,
    sessionId: string,
    answer: string,
    timeTakenSeconds?: number
  ): Promise<{ nextQuestion: string | null; isComplete: boolean; scores: any }> {
    const session = await this.getSessionOrThrow(userId, sessionId);

    if (!['STARTED', 'IN_PROGRESS'].includes(session.status)) {
      throw new BadRequestError('Session is not active');
    }

    // Get current question
    const currentResponse = await prisma.aiInterviewResponse.findFirst({
      where: {
        sessionId,
        answer: '', // Unanswered
      },
      orderBy: { questionOrder: 'asc' },
    });

    if (!currentResponse) {
      throw new BadRequestError('No pending question found');
    }

    // Score the response
    const context = await this.rebuildContext(session);
    const scores = await conversationEngineService.scoreResponse(
      currentResponse.question,
      answer,
      currentResponse.category,
      context
    );

    // Update the response
    await prisma.aiInterviewResponse.update({
      where: { id: currentResponse.id },
      data: {
        answer,
        timeTakenSeconds,
        scoresJson: scores.scores as unknown as Prisma.JsonObject,
        feedbackText: scores.feedback,
      },
    });

    // Check if interview should end
    if (conversationEngineService.shouldEndInterview(context)) {
      await prisma.aiInterviewSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          currentQuestionIndex: session.currentQuestionIndex + 1,
        },
      });

      return {
        nextQuestion: null,
        isComplete: true,
        scores: scores.scores,
      };
    }

    // Generate next question
    const nextQuestion = await conversationEngineService.generateNextQuestion(
      context,
      answer
    );

    // Store next question
    await prisma.aiInterviewResponse.create({
      data: {
        sessionId,
        category: nextQuestion.category,
        question: nextQuestion.question,
        answer: '',
        questionOrder: session.currentQuestionIndex + 1,
        isFollowup: nextQuestion.isFollowUp,
      },
    });

    // Update session progress
    await prisma.aiInterviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'IN_PROGRESS',
        currentQuestionIndex: session.currentQuestionIndex + 1,
        questions: context.questionsAsked as unknown as Prisma.JsonArray,
      },
    });

    return {
      nextQuestion: nextQuestion.question,
      isComplete: false,
      scores: scores.scores,
    };
  }

  // ===================================================
  // FEEDBACK
  // ===================================================

  /**
   * Get feedback for a session
   */
  async getFeedback(
    userId: string,
    sessionId: string
  ): Promise<InterviewFeedback> {
    const session = await this.getSessionOrThrow(userId, sessionId);

    if (session.status !== 'COMPLETED') {
      throw new BadRequestError('Session is not completed');
    }

    let feedback = await feedbackGeneratorService.getFeedback(sessionId);

    if (!feedback) {
      feedback = await feedbackGeneratorService.generateFeedback(sessionId);
    }

    return feedback;
  }

  // ===================================================
  // PRIVATE HELPERS
  // ===================================================

  private async getSessionOrThrow(userId: string, sessionId: string) {
    const session = await prisma.aiInterviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { resume: true },
    });

    if (!session) {
      throw new NotFoundError('Interview session');
    }

    return session;
  }

  private async rebuildContext(session: any): Promise<ConversationContext> {
    let parsedResume: ParsedResume | null = null;

    if (session.resumeId) {
      parsedResume = await resumeParserService.parseResumeById(
        session.userId,
        session.resumeId
      );
    }

    return conversationEngineService.initializeContext(
      parsedResume || this.createMinimalResume(),
      {
        jobTitle: session.jobTitle || 'Software Engineer',
        companyName: session.companyName,
        difficulty: session.difficulty,
        focusAreas: session.focusAreas,
        targetQuestions: session.totalQuestions,
      }
    );
  }

  private createMinimalResume(): ParsedResume {
    return {
      rawText: '',
      structured: {
        name: 'Candidate',
        email: '',
        phone: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
      },
      hash: '',
      parsedAt: new Date(),
    };
  }

  private calculateSessionMetrics(session: any): any {
    if (!session.responses || session.responses.length === 0) {
      return null;
    }

    const responses = session.responses.filter((r: any) => r.answer);
    const times = responses
      .map((r: any) => r.timeTakenSeconds)
      .filter((t: any) => t !== null);

    return {
      totalDuration: session.startedAt && session.completedAt
        ? Math.round(
            (new Date(session.completedAt).getTime() -
              new Date(session.startedAt).getTime()) /
              1000
          )
        : 0,
      questionsAsked: session.responses.length,
      questionsAnswered: responses.length,
      averageResponseTime:
        times.length > 0
          ? Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length)
          : 0,
      longestResponse: times.length > 0 ? Math.max(...times) : 0,
      shortestResponse: times.length > 0 ? Math.min(...times) : 0,
      silencePeriods: 0,
    };
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const interviewService = new InterviewService();
export { InterviewService };

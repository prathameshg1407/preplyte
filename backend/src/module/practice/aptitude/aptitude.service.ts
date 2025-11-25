import { prisma } from '../../../lib/db';
import { DifficultyLevel, Prisma } from '@prisma/client';
import {
  CreateAptitudeSessionDto,
  SaveAnswerDto,
  SessionListFilters,
  SessionQuestion,
  TypeBreakdown,
  PerformanceEvaluation,
} from './aptitude.types';
import {
  NotFoundError,
  SessionExpiredError,
  SessionInProgressError,
  SessionAlreadyCompletedError,
  SessionNotCompletedError,
  InvalidOptionError,
} from '../../../utils/errors';
import {
  calculateTimeRemaining,
  formatTimeRemaining,
  getSessionStatus,
  shuffleArray,
  calculateScore,
  calculateAccuracy,
} from '../../../utils/helpers';
import { logger } from '../../../utils/logger';

export class AptitudeService {
  /**
   * Create a new aptitude practice session
   */
  async createSession(userId: string, dto: CreateAptitudeSessionDto) {
    // Check for active session
    const activeSession = await prisma.aptitudePracticeSession.findFirst({
      where: {
        userId,
        completedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeSession) {
      throw new SessionInProgressError(activeSession.id, activeSession.expiresAt);
    }

    // Fetch questions based on criteria
    const questions = await prisma.aptitudeQuestion.findMany({
      where: {
        isActive: true,
        difficulty: dto.difficulty,
        questionType: { in: dto.questionTypes },
      },
      include: {
        options: true,
      },
    });

    if (questions.length < dto.numberOfQuestions) {
      logger.warn(`Not enough questions available. Found: ${questions.length}, Requested: ${dto.numberOfQuestions}`);
    }

    // Randomly select and shuffle questions
    const shuffledQuestions = shuffleArray(questions).slice(0, dto.numberOfQuestions);

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + dto.timeLimit * 60 * 1000);

    // Create session with questions
    const session = await prisma.aptitudePracticeSession.create({
      data: {
        userId,
        difficulty: dto.difficulty,
        questionTypes: dto.questionTypes,
        numberOfQuestions: shuffledQuestions.length,
        timeLimit: dto.timeLimit,
        expiresAt,
        sessionQuestions: {
          create: shuffledQuestions.map((q, index) => ({
            questionId: q.id,
            order: index + 1,
          })),
        },
      },
      include: {
        sessionQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      id: session.id,
      userId: session.userId,
      difficulty: session.difficulty,
      questionTypes: session.questionTypes,
      numberOfQuestions: session.numberOfQuestions,
      timeLimit: session.timeLimit,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
      totalScore: session.totalScore,
      totalCorrect: session.totalCorrect,
      totalWrong: session.totalWrong,
      totalUnanswered: session.totalUnanswered,
      createdAt: session.createdAt,
    };
  }

  /**
   * Get list of user's sessions with pagination and filters
   */
  async listSessions(userId: string, filters: SessionListFilters) {
    const { page, limit, status, difficulty, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.AptitudePracticeSessionWhereInput = { userId };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (status && status !== 'all') {
      const now = new Date();
      if (status === 'completed') {
        where.completedAt = { not: null };
      } else if (status === 'in_progress') {
        where.completedAt = null;
        where.expiresAt = { gt: now };
      } else if (status === 'expired') {
        where.completedAt = null;
        where.expiresAt = { lte: now };
      }
    }

    // Get total count
    const totalItems = await prisma.aptitudePracticeSession.count({ where });

    // Get sessions
    const sessions = await prisma.aptitudePracticeSession.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        difficulty: true,
        questionTypes: true,
        numberOfQuestions: true,
        timeLimit: true,
        startedAt: true,
        completedAt: true,
        expiresAt: true,
        totalScore: true,
        totalCorrect: true,
        totalWrong: true,
        totalUnanswered: true,
      },
    });

    // Add status to each session
    const sessionsWithStatus = sessions.map((session) => ({
      ...session,
      status: getSessionStatus(session.completedAt, session.expiresAt),
    }));

    return {
      sessions: sessionsWithStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get session details
   */
  async getSessionDetails(userId: string, sessionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          select: {
            selectedOptionId: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const status = getSessionStatus(session.completedAt, session.expiresAt);
    const timeRemaining = calculateTimeRemaining(session.expiresAt);
    const answered = session.sessionQuestions.filter((q) => q.selectedOptionId !== null).length;

    const response: Record<string, unknown> = {
      id: session.id,
      userId: session.userId,
      difficulty: session.difficulty,
      questionTypes: session.questionTypes,
      numberOfQuestions: session.numberOfQuestions,
      timeLimit: session.timeLimit,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
      status,
      timeRemaining,
      progress: {
        answered,
        unanswered: session.numberOfQuestions - answered,
        total: session.numberOfQuestions,
      },
      totalScore: session.totalScore,
      totalCorrect: session.totalCorrect,
      totalWrong: session.totalWrong,
      totalUnanswered: session.totalUnanswered,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    if (status === 'completed' && session.completedAt) {
      const timeTaken = Math.floor(
        (session.completedAt.getTime() - session.startedAt.getTime()) / 60000
      );
      response.timeTaken = timeTaken;
      response.scorePercentage = session.totalScore;
    }

    return response;
  }

  /**
   * Get all questions for a session
   */
  async getSessionQuestions(userId: string, sessionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const status = getSessionStatus(session.completedAt, session.expiresAt);
    const isCompleted = status === 'completed';

    const questions: SessionQuestion[] = session.sessionQuestions.map((sq) => {
      const question: SessionQuestion = {
        id: sq.question.id,
        order: sq.order,
        questionText: sq.question.questionText,
        questionType: sq.question.questionType,
        difficulty: sq.question.difficulty,
        options: sq.question.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          ...(isCompleted && { isCorrect: opt.id === sq.question.correctOptionId }),
        })),
        selectedOptionId: sq.selectedOptionId,
        answeredAt: sq.answeredAt,
      };

      if (isCompleted) {
        question.correctOptionId = sq.question.correctOptionId;
        question.isCorrect = sq.isCorrect;
      }

      return question;
    });

    const answeredCount = session.sessionQuestions.filter((q) => q.selectedOptionId !== null).length;

    return {
      sessionId: session.id,
      status,
      questions,
      totalQuestions: session.numberOfQuestions,
      answeredCount,
    };
  }

  /**
   * Get a specific question in a session
   */
  async getQuestion(userId: string, sessionId: string, questionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const sessionQuestion = session.sessionQuestions.find(
      (sq) => sq.question.id === questionId
    );

    if (!sessionQuestion) {
      throw new NotFoundError('Question');
    }

    const status = getSessionStatus(session.completedAt, session.expiresAt);
    const currentIndex = session.sessionQuestions.findIndex(
      (sq) => sq.question.id === questionId
    );

    const question: SessionQuestion = {
      id: sessionQuestion.question.id,
      order: sessionQuestion.order,
      questionText: sessionQuestion.question.questionText,
      questionType: sessionQuestion.question.questionType,
      difficulty: sessionQuestion.question.difficulty,
      options: sessionQuestion.question.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
      selectedOptionId: sessionQuestion.selectedOptionId,
      answeredAt: sessionQuestion.answeredAt,
    };

    return {
      sessionId: session.id,
      sessionStatus: status,
      question: {
        ...question,
        sessionQuestionId: sessionQuestion.id,
      },
      navigation: {
        previousQuestionId: currentIndex > 0 
          ? session.sessionQuestions[currentIndex - 1].question.id 
          : null,
        nextQuestionId: currentIndex < session.sessionQuestions.length - 1
          ? session.sessionQuestions[currentIndex + 1].question.id
          : null,
        currentPosition: currentIndex + 1,
        totalQuestions: session.numberOfQuestions,
      },
    };
  }

  /**
   * Save answer for a question
   */
  async saveAnswer(userId: string, sessionId: string, dto: SaveAnswerDto) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    // Check if session is already completed
    if (session.completedAt) {
      throw new SessionAlreadyCompletedError(session.completedAt);
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      throw new SessionExpiredError(session.expiresAt);
    }

    // Find the session question
    const sessionQuestion = session.sessionQuestions.find(
      (sq) => sq.question.id === dto.questionId
    );

    if (!sessionQuestion) {
      throw new NotFoundError('Question in this session');
    }

    // Validate option if provided
    if (dto.selectedOptionId !== null) {
      const validOption = sessionQuestion.question.options.find(
        (opt) => opt.id === dto.selectedOptionId
      );

      if (!validOption) {
        throw new InvalidOptionError();
      }
    }

    // Update the answer
    await prisma.aptitudeSessionQuestion.update({
      where: { id: sessionQuestion.id },
      data: {
        selectedOptionId: dto.selectedOptionId,
        answeredAt: dto.selectedOptionId ? new Date() : null,
        isCorrect: dto.selectedOptionId 
          ? dto.selectedOptionId === sessionQuestion.question.correctOptionId
          : null,
      },
    });

    // Get updated progress
    const updatedSession = await prisma.aptitudePracticeSession.findUnique({
      where: { id: sessionId },
      include: {
        sessionQuestions: {
          select: { selectedOptionId: true },
        },
      },
    });

    const answered = updatedSession!.sessionQuestions.filter(
      (q) => q.selectedOptionId !== null
    ).length;

    return {
      sessionId,
      questionId: dto.questionId,
      selectedOptionId: dto.selectedOptionId,
      answeredAt: dto.selectedOptionId ? new Date() : null,
      progress: {
        answered,
        unanswered: session.numberOfQuestions - answered,
        total: session.numberOfQuestions,
      },
    };
  }

  /**
   * Submit test for scoring
   */
  async submitSession(userId: string, sessionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.completedAt) {
      throw new SessionAlreadyCompletedError(session.completedAt);
    }

    // Calculate results
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnanswered = 0;

    const breakdownByType: Record<string, TypeBreakdown> = {};

    for (const sq of session.sessionQuestions) {
      const type = sq.question.questionType;

      if (!breakdownByType[type]) {
        breakdownByType[type] = { correct: 0, wrong: 0, unanswered: 0, total: 0 };
      }

      breakdownByType[type].total++;

      if (sq.selectedOptionId === null) {
        totalUnanswered++;
        breakdownByType[type].unanswered++;
      } else if (sq.selectedOptionId === sq.question.correctOptionId) {
        totalCorrect++;
        breakdownByType[type].correct++;
      } else {
        totalWrong++;
        breakdownByType[type].wrong++;
      }
    }

    const totalScore = calculateScore(totalCorrect, session.numberOfQuestions);
    const completedAt = new Date();
    const timeTaken = Math.floor(
      (completedAt.getTime() - session.startedAt.getTime()) / 60000
    );

    // Update session with results
    await prisma.aptitudePracticeSession.update({
      where: { id: sessionId },
      data: {
        completedAt,
        totalScore,
        totalCorrect,
        totalWrong,
        totalUnanswered,
      },
    });

    return {
      sessionId,
      status: 'completed',
      completedAt,
      timeTaken,
      results: {
        totalScore,
        totalCorrect,
        totalWrong,
        totalUnanswered,
        totalQuestions: session.numberOfQuestions,
        scorePercentage: totalScore,
        breakdown: breakdownByType,
      },
    };
  }

  /**
   * Get session status
   */
  async getSessionStatus(userId: string, sessionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          select: { selectedOptionId: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    const status = getSessionStatus(session.completedAt, session.expiresAt);
    const timeRemaining = calculateTimeRemaining(session.expiresAt);
    
    const allQuestions = await prisma.aptitudeSessionQuestion.count({
      where: { sessionId },
    });
    
    const answeredQuestions = await prisma.aptitudeSessionQuestion.count({
      where: {
        sessionId,
        selectedOptionId: { not: null },
      },
    });

    return {
      sessionId,
      status,
      timeRemaining,
      timeRemainingFormatted: formatTimeRemaining(timeRemaining),
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      progress: {
        answered: answeredQuestions,
        unanswered: allQuestions - answeredQuestions,
        total: allQuestions,
        percentageComplete: Math.round((answeredQuestions / allQuestions) * 100),
      },
      lastActivityAt: session.sessionQuestions[0]?.updatedAt || session.startedAt,
    };
  }

  /**
   * Get session results (after completion)
   */
  async getSessionResults(userId: string, sessionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (!session.completedAt) {
      throw new SessionNotCompletedError();
    }

    // Calculate breakdowns
    const breakdownByType: Record<string, TypeBreakdown> = {};
    const breakdownByDifficulty: Record<string, TypeBreakdown> = {};

    for (const sq of session.sessionQuestions) {
      const type = sq.question.questionType;
      const difficulty = sq.question.difficulty;

      // Initialize if not exists
      if (!breakdownByType[type]) {
        breakdownByType[type] = { correct: 0, wrong: 0, unanswered: 0, total: 0 };
      }
      if (!breakdownByDifficulty[difficulty]) {
        breakdownByDifficulty[difficulty] = { correct: 0, wrong: 0, unanswered: 0, total: 0 };
      }

      breakdownByType[type].total++;
      breakdownByDifficulty[difficulty].total++;

      if (sq.selectedOptionId === null) {
        breakdownByType[type].unanswered++;
        breakdownByDifficulty[difficulty].unanswered++;
      } else if (sq.isCorrect) {
        breakdownByType[type].correct++;
        breakdownByDifficulty[difficulty].correct++;
      } else {
        breakdownByType[type].wrong++;
        breakdownByDifficulty[difficulty].wrong++;
      }
    }

    // Calculate accuracy for each breakdown
    for (const key of Object.keys(breakdownByType)) {
      const b = breakdownByType[key];
      b.accuracy = calculateAccuracy(b.correct, b.correct + b.wrong);
    }

    const timeTaken = Math.floor(
      (session.completedAt.getTime() - session.startedAt.getTime()) / 60000
    );

    const attempted = session.totalCorrect! + session.totalWrong!;
    const accuracy = calculateAccuracy(session.totalCorrect!, attempted);
    const attemptRate = Math.round((attempted / session.numberOfQuestions) * 100);

    // Performance evaluation
    const performance = this.evaluatePerformance(
      session.totalScore!,
      accuracy,
      attemptRate,
      session.difficulty
    );

    return {
      sessionId,
      status: 'completed',
      completedAt: session.completedAt,
      timeTaken,
      timeLimit: session.timeLimit,
      difficulty: session.difficulty,
      summary: {
        totalScore: session.totalScore,
        totalCorrect: session.totalCorrect,
        totalWrong: session.totalWrong,
        totalUnanswered: session.totalUnanswered,
        totalQuestions: session.numberOfQuestions,
        scorePercentage: session.totalScore,
        accuracy,
        attemptRate,
      },
      breakdown: {
        byType: breakdownByType,
        byDifficulty: breakdownByDifficulty,
      },
      performance,
    };
  }

  /**
   * Get solutions after completion
   */
  async getSolutions(userId: string, sessionId: string, filter: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        sessionQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (!session.completedAt) {
      throw new SessionNotCompletedError();
    }

    let filteredQuestions = session.sessionQuestions;

    if (filter !== 'all') {
      filteredQuestions = session.sessionQuestions.filter((sq) => {
        if (filter === 'correct') return sq.isCorrect === true;
        if (filter === 'wrong') return sq.isCorrect === false && sq.selectedOptionId !== null;
        if (filter === 'unanswered') return sq.selectedOptionId === null;
        return true;
      });
    }

    const solutions = filteredQuestions.map((sq) => ({
      order: sq.order,
      questionId: sq.question.id,
      questionText: sq.question.questionText,
      questionType: sq.question.questionType,
      difficulty: sq.question.difficulty,
      options: sq.question.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.id === sq.question.correctOptionId,
      })),
      selectedOptionId: sq.selectedOptionId,
      correctOptionId: sq.question.correctOptionId,
      isCorrect: sq.isCorrect,
      explanation: sq.question.explanation,
    }));

    return {
      sessionId,
      status: 'completed',
      solutions,
      summary: {
        totalCorrect: session.totalCorrect,
        totalWrong: session.totalWrong,
        totalUnanswered: session.totalUnanswered,
      },
    };
  }

  /**
   * Evaluate performance and provide suggestions
   */
  private evaluatePerformance(
    score: number,
    accuracy: number,
    attemptRate: number,
    difficulty: DifficultyLevel
  ): PerformanceEvaluation {
    const suggestions: string[] = [];
    let rank: PerformanceEvaluation['rank'];
    let message: string;

    // Adjust thresholds based on difficulty
    const thresholds = {
      EASY: { excellent: 90, good: 75, average: 60 },
      MEDIUM: { excellent: 85, good: 70, average: 55 },
      HARD: { excellent: 80, good: 65, average: 50 },
    };

    const t = thresholds[difficulty];

    if (score >= t.excellent) {
      rank = 'EXCELLENT';
      message = 'Outstanding performance! You have mastered this difficulty level.';
    } else if (score >= t.good) {
      rank = 'GOOD';
      message = 'Great job! You scored above average.';
    } else if (score >= t.average) {
      rank = 'AVERAGE';
      message = 'Good effort! There is room for improvement.';
    } else {
      rank = 'NEEDS_IMPROVEMENT';
      message = 'Keep practicing! Focus on understanding the concepts better.';
    }

    // Add suggestions based on metrics
    if (attemptRate < 90) {
      suggestions.push('Focus on time management to attempt all questions');
    }

    if (accuracy < 70) {
      suggestions.push('Review incorrect answers and understand the concepts');
    }

    if (score < t.average) {
      suggestions.push('Consider practicing with easier difficulty first');
    }

    if (suggestions.length === 0) {
      suggestions.push('Try challenging yourself with harder difficulty');
    }

    return { rank, message, suggestions };
  }
}

export const aptitudeService = new AptitudeService();
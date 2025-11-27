import { prisma } from '../../../lib/db';
import { DifficultyLevel, Prisma } from '@prisma/client';
import {
  CreateSessionDto,
  SaveAnswerDto,
  SessionListFilters,
  SessionStatus,
  SolutionFilter,
  TypeBreakdown,
  PerformanceEvaluation,
  PERFORMANCE_THRESHOLDS,
} from './aptitude.types';
import {
  NotFoundError,
  SessionExpiredError,
  SessionInProgressError,
  SessionAlreadyCompletedError,
  SessionNotCompletedError,
  InvalidOptionError,
  InsufficientQuestionsError, // Add this new error type
} from '../../../utils/errors';
import { logger } from '../../../utils/logger';

// =====================================================
// CONSTANTS
// =====================================================

const SESSION_SELECT_FIELDS = {
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
} as const;

const QUESTION_SELECT_FIELDS = {
  id: true,
  questionText: true,
  questionType: true,
  difficulty: true,
  correctOptionId: true,
  explanation: true,
  options: {
    select: { id: true, text: true },
  },
} as const;

// =====================================================
// HELPER FUNCTIONS (Pure, no side effects)
// =====================================================

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getSessionStatus = (completedAt: Date | null, expiresAt: Date): SessionStatus => {
  if (completedAt) return 'completed';
  return Date.now() > expiresAt.getTime() ? 'expired' : 'in_progress';
};

const calculateTimeRemaining = (expiresAt: Date): number => 
  Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

const formatTimeRemaining = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const calculatePercentage = (value: number, total: number): number =>
  total > 0 ? Math.round((value / total) * 100) : 0;

const calculateTimeTaken = (startedAt: Date, completedAt: Date): number =>
  Math.floor((completedAt.getTime() - startedAt.getTime()) / 60000);

// =====================================================
// SERVICE CLASS
// =====================================================

class AptitudeService {
  // -------------------------------------------------
  // SESSION CREATION (OPTIMIZED)
  // -------------------------------------------------

  async createSession(userId: string, dto: CreateSessionDto) {
    const { numberOfQuestions, timeLimit, difficulty, questionTypes } = dto;

    // Single transaction for all operations
    return prisma.$transaction(async (tx) => {
      // Check for active session
      const activeSession = await tx.aptitudePracticeSession.findFirst({
        where: {
          userId,
          completedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { id: true, expiresAt: true },
      });

      if (activeSession) {
        throw new SessionInProgressError(activeSession.id, activeSession.expiresAt);
      }

      // Fetch only required fields, limit to what we need
      const questions = await tx.aptitudeQuestion.findMany({
        where: {
          isActive: true,
          difficulty,
          questionType: { in: questionTypes },
        },
        select: { id: true },
        take: numberOfQuestions * 2, // Fetch extra for better randomization
      });

      // FIX: Throw error if insufficient questions
      if (questions.length < numberOfQuestions) {
        logger.warn(
          `Insufficient questions. Found: ${questions.length}, Requested: ${numberOfQuestions}`,
          { difficulty, questionTypes }
        );
        throw new InsufficientQuestionsError(questions.length, numberOfQuestions);
      }

      const selectedQuestions = shuffleArray(questions).slice(0, numberOfQuestions);
      const now = Date.now();
      const expiresAt = new Date(now + timeLimit * 60 * 1000);
      const startedAt = new Date(now);

      // Create session with questions in one operation
      const session = await tx.aptitudePracticeSession.create({
        data: {
          userId,
          difficulty,
          questionTypes,
          numberOfQuestions,
          timeLimit,
          startedAt,
          expiresAt,
          sessionQuestions: {
            createMany: {
              data: selectedQuestions.map((q, index) => ({
                questionId: q.id,
                order: index + 1,
              })),
            },
          },
        },
        select: {
          id: true,
          difficulty: true,
          questionTypes: true,
          numberOfQuestions: true,
          timeLimit: true,
          startedAt: true,
          expiresAt: true,
          createdAt: true,
        },
      });

      return {
        ...session,
        completedAt: null,
        totalScore: null,
        totalCorrect: null,
        totalWrong: null,
        totalUnanswered: null,
      };
    });
  }

  // -------------------------------------------------
  // SESSION LISTING (OPTIMIZED)
  // -------------------------------------------------

  async listSessions(userId: string, filters: SessionListFilters) {
    const { page, limit, sortBy, sortOrder, status, difficulty } = filters;
    const skip = (page - 1) * limit;
    const where = this.buildSessionWhereClause(userId, { status, difficulty });

    // Parallel queries
    const [totalItems, sessions] = await Promise.all([
      prisma.aptitudePracticeSession.count({ where }),
      prisma.aptitudePracticeSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: SESSION_SELECT_FIELDS,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      sessions: sessions.map((s) => ({
        ...s,
        status: getSessionStatus(s.completedAt, s.expiresAt),
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  private buildSessionWhereClause(
    userId: string,
    filters: Pick<SessionListFilters, 'status' | 'difficulty'>
  ): Prisma.AptitudePracticeSessionWhereInput {
    const where: Prisma.AptitudePracticeSessionWhereInput = { userId };
    const now = new Date();

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    switch (filters.status) {
      case 'completed':
        where.completedAt = { not: null };
        break;
      case 'in_progress':
        where.completedAt = null;
        where.expiresAt = { gt: now };
        break;
      case 'expired':
        where.completedAt = null;
        where.expiresAt = { lte: now };
        break;
    }

    return where;
  }

  // -------------------------------------------------
  // SESSION DETAILS (OPTIMIZED)
  // -------------------------------------------------

  async getSessionDetails(userId: string, sessionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: { id: sessionId, userId },
      select: {
        ...SESSION_SELECT_FIELDS,
        updatedAt: true,
        _count: {
          select: {
            sessionQuestions: { where: { selectedOptionId: { not: null } } },
          },
        },
        sessionQuestions: {
          select: { id: true },
          take: 1, // Just to get total count efficiently
        },
      },
    });

    if (!session) throw new NotFoundError('Session');

    const status = getSessionStatus(session.completedAt, session.expiresAt);
    const answered = session._count.sessionQuestions;

    const response: Record<string, unknown> = {
      id: session.id,
      difficulty: session.difficulty,
      questionTypes: session.questionTypes,
      numberOfQuestions: session.numberOfQuestions,
      timeLimit: session.timeLimit,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
      totalScore: session.totalScore,
      status,
      timeRemaining: calculateTimeRemaining(session.expiresAt),
      progress: {
        answered,
        unanswered: session.numberOfQuestions - answered,
        total: session.numberOfQuestions,
      },
      updatedAt: session.updatedAt,
    };

    if (status === 'completed' && session.completedAt) {
      response.timeTaken = calculateTimeTaken(session.startedAt, session.completedAt);
      response.scorePercentage = session.totalScore;
    }

    return response;
  }

  // -------------------------------------------------
  // QUESTIONS (OPTIMIZED)
  // -------------------------------------------------

  async getSessionQuestions(userId: string, sessionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: { id: sessionId, userId },
      select: {
        id: true,
        numberOfQuestions: true,
        completedAt: true,
        expiresAt: true,
        sessionQuestions: {
          select: {
            id: true,
            order: true,
            selectedOptionId: true,
            answeredAt: true,
            isCorrect: true,
            question: { select: QUESTION_SELECT_FIELDS },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) throw new NotFoundError('Session');

    const status = getSessionStatus(session.completedAt, session.expiresAt);
    const isCompleted = status === 'completed';

    let answeredCount = 0;
    const questions = session.sessionQuestions.map((sq) => {
      if (sq.selectedOptionId) answeredCount++;
      
      return {
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
        ...(isCompleted && {
          correctOptionId: sq.question.correctOptionId,
          isCorrect: sq.isCorrect,
        }),
      };
    });

    return {
      sessionId: session.id,
      status,
      questions,
      totalQuestions: session.numberOfQuestions,
      answeredCount,
    };
  }

  async getQuestion(userId: string, sessionId: string, questionId: string) {
    // Optimized: Single query with all needed data
    const sessionQuestion = await prisma.aptitudeSessionQuestion.findFirst({
      where: {
        questionId,
        session: { id: sessionId, userId },
      },
      select: {
        id: true,
        order: true,
        selectedOptionId: true,
        answeredAt: true,
        question: { select: QUESTION_SELECT_FIELDS },
        session: {
          select: {
            id: true,
            numberOfQuestions: true,
            completedAt: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!sessionQuestion) throw new NotFoundError('Question');

    const { session, question } = sessionQuestion;
    const status = getSessionStatus(session.completedAt, session.expiresAt);

    // Get adjacent question IDs efficiently
    const [prevQuestion, nextQuestion] = await Promise.all([
      sessionQuestion.order > 1
        ? prisma.aptitudeSessionQuestion.findFirst({
            where: { sessionId, order: sessionQuestion.order - 1 },
            select: { questionId: true },
          })
        : null,
      sessionQuestion.order < session.numberOfQuestions
        ? prisma.aptitudeSessionQuestion.findFirst({
            where: { sessionId, order: sessionQuestion.order + 1 },
            select: { questionId: true },
          })
        : null,
    ]);

    return {
      sessionId: session.id,
      sessionStatus: status,
      question: {
        id: question.id,
        sessionQuestionId: sessionQuestion.id,
        order: sessionQuestion.order,
        questionText: question.questionText,
        questionType: question.questionType,
        difficulty: question.difficulty,
        options: question.options,
        selectedOptionId: sessionQuestion.selectedOptionId,
        answeredAt: sessionQuestion.answeredAt,
      },
      navigation: {
        previousQuestionId: prevQuestion?.questionId ?? null,
        nextQuestionId: nextQuestion?.questionId ?? null,
        currentPosition: sessionQuestion.order,
        totalQuestions: session.numberOfQuestions,
      },
    };
  }

  // -------------------------------------------------
  // ANSWER HANDLING (OPTIMIZED)
  // -------------------------------------------------

  async saveAnswer(userId: string, sessionId: string, dto: SaveAnswerDto) {
    const { questionId, selectedOptionId } = dto;

    return prisma.$transaction(async (tx) => {
      // Get session question with validation data in one query
      const sessionQuestion = await tx.aptitudeSessionQuestion.findFirst({
        where: {
          questionId,
          session: { id: sessionId, userId },
        },
        select: {
          id: true,
          session: {
            select: {
              id: true,
              numberOfQuestions: true,
              completedAt: true,
              expiresAt: true,
            },
          },
          question: {
            select: {
              correctOptionId: true,
              options: { select: { id: true } },
            },
          },
        },
      });

      if (!sessionQuestion) throw new NotFoundError('Question in this session');

      const { session, question } = sessionQuestion;

      // Validate session state
      if (session.completedAt) {
        throw new SessionAlreadyCompletedError(session.completedAt);
      }
      if (Date.now() > session.expiresAt.getTime()) {
        throw new SessionExpiredError(session.expiresAt);
      }

      // Validate option
      if (selectedOptionId !== null) {
        const validOption = question.options.some((opt) => opt.id === selectedOptionId);
        if (!validOption) throw new InvalidOptionError();
      }

      const now = new Date();
      const isCorrect = selectedOptionId ? selectedOptionId === question.correctOptionId : null;

      // Update answer and get count in parallel
      const [, answeredCount] = await Promise.all([
        tx.aptitudeSessionQuestion.update({
          where: { id: sessionQuestion.id },
          data: {
            selectedOptionId,
            answeredAt: selectedOptionId ? now : null,
            isCorrect,
          },
        }),
        tx.aptitudeSessionQuestion.count({
          where: {
            sessionId,
            selectedOptionId: { not: null },
            // Include current if we're setting an answer
            ...(selectedOptionId && { NOT: { id: sessionQuestion.id } }),
          },
        }),
      ]);

      const totalAnswered = selectedOptionId ? answeredCount + 1 : answeredCount;

      return {
        sessionId,
        questionId,
        selectedOptionId,
        answeredAt: selectedOptionId ? now : null,
        progress: {
          answered: totalAnswered,
          unanswered: session.numberOfQuestions - totalAnswered,
          total: session.numberOfQuestions,
        },
      };
    });
  }

  // -------------------------------------------------
  // SUBMISSION & RESULTS (OPTIMIZED)
  // -------------------------------------------------

  async submitSession(userId: string, sessionId: string) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.aptitudePracticeSession.findFirst({
        where: { id: sessionId, userId },
        select: {
          id: true,
          numberOfQuestions: true,
          startedAt: true,
          completedAt: true,
          sessionQuestions: {
            select: {
              selectedOptionId: true,
              isCorrect: true,
              question: {
                select: { questionType: true },
              },
            },
          },
        },
      });

      if (!session) throw new NotFoundError('Session');
      if (session.completedAt) throw new SessionAlreadyCompletedError(session.completedAt);

      // Calculate results in memory (no additional queries)
      const results = this.calculateResults(session.sessionQuestions);
      const totalScore = calculatePercentage(results.totalCorrect, session.numberOfQuestions);
      const completedAt = new Date();

      await tx.aptitudePracticeSession.update({
        where: { id: sessionId },
        data: {
          completedAt,
          totalScore,
          totalCorrect: results.totalCorrect,
          totalWrong: results.totalWrong,
          totalUnanswered: results.totalUnanswered,
        },
      });

      return {
        sessionId,
        status: 'completed' as const,
        completedAt,
        timeTaken: calculateTimeTaken(session.startedAt, completedAt),
        results: {
          totalScore,
          ...results,
          totalQuestions: session.numberOfQuestions,
          scorePercentage: totalScore,
        },
      };
    });
  }

  async getSessionStatus(userId: string, sessionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: { id: sessionId, userId },
      select: {
        id: true,
        numberOfQuestions: true,
        startedAt: true,
        completedAt: true,
        expiresAt: true,
        _count: {
          select: {
            sessionQuestions: { where: { selectedOptionId: { not: null } } },
          },
        },
        sessionQuestions: {
          where: { selectedOptionId: { not: null } },
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!session) throw new NotFoundError('Session');

    const answered = session._count.sessionQuestions;
    const total = session.numberOfQuestions;
    const timeRemaining = calculateTimeRemaining(session.expiresAt);

    return {
      sessionId: session.id,
      status: getSessionStatus(session.completedAt, session.expiresAt),
      timeRemaining,
      timeRemainingFormatted: formatTimeRemaining(timeRemaining),
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      progress: {
        answered,
        unanswered: total - answered,
        total,
        percentageComplete: calculatePercentage(answered, total),
      },
      lastActivityAt: session.sessionQuestions[0]?.updatedAt ?? session.startedAt,
    };
  }

  async getSessionResults(userId: string, sessionId: string) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: { id: sessionId, userId, completedAt: { not: null } },
      select: {
        id: true,
        difficulty: true,
        numberOfQuestions: true,
        timeLimit: true,
        startedAt: true,
        completedAt: true,
        totalScore: true,
        totalCorrect: true,
        totalWrong: true,
        totalUnanswered: true,
        sessionQuestions: {
          select: {
            selectedOptionId: true,
            isCorrect: true,
            question: {
              select: { questionType: true, difficulty: true },
            },
          },
        },
      },
    });

    if (!session) throw new NotFoundError('Session');
    if (!session.completedAt) throw new SessionNotCompletedError();

    const breakdowns = this.calculateDetailedBreakdown(session.sessionQuestions);
    const attempted = session.totalCorrect! + session.totalWrong!;
    const accuracy = calculatePercentage(session.totalCorrect!, attempted);
    const attemptRate = calculatePercentage(attempted, session.numberOfQuestions);

    return {
      sessionId: session.id,
      status: 'completed' as const,
      completedAt: session.completedAt,
      timeTaken: calculateTimeTaken(session.startedAt, session.completedAt),
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
      breakdown: breakdowns,
      performance: this.evaluatePerformance(
        session.totalScore!,
        accuracy,
        attemptRate,
        session.difficulty
      ),
    };
  }

  async getSolutions(userId: string, sessionId: string, filter: SolutionFilter) {
    const session = await prisma.aptitudePracticeSession.findFirst({
      where: { id: sessionId, userId, completedAt: { not: null } },
      select: {
        id: true,
        totalCorrect: true,
        totalWrong: true,
        totalUnanswered: true,
        sessionQuestions: {
          where: this.buildSolutionFilter(filter),
          select: {
            order: true,
            selectedOptionId: true,
            isCorrect: true,
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                difficulty: true,
                correctOptionId: true,
                explanation: true,
                options: { select: { id: true, text: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) throw new NotFoundError('Session');

    return {
      sessionId: session.id,
      status: 'completed' as const,
      solutions: session.sessionQuestions.map((sq) => ({
        order: sq.order,
        questionId: sq.question.id,
        questionText: sq.question.questionText,
        questionType: sq.question.questionType,
        difficulty: sq.question.difficulty,
        options: sq.question.options.map((opt) => ({
          ...opt,
          isCorrect: opt.id === sq.question.correctOptionId,
        })),
        selectedOptionId: sq.selectedOptionId,
        correctOptionId: sq.question.correctOptionId,
        isCorrect: sq.isCorrect,
        explanation: sq.question.explanation,
      })),
      summary: {
        totalCorrect: session.totalCorrect,
        totalWrong: session.totalWrong,
        totalUnanswered: session.totalUnanswered,
      },
    };
  }

  // Build filter at database level instead of in memory
  private buildSolutionFilter(
    filter: SolutionFilter
  ): Prisma.AptitudeSessionQuestionWhereInput | undefined {
    switch (filter) {
      case 'correct':
        return { isCorrect: true };
      case 'wrong':
        return { isCorrect: false, selectedOptionId: { not: null } };
      case 'unanswered':
        return { selectedOptionId: null };
      default:
        return undefined;
    }
  }

  // -------------------------------------------------
  // CALCULATION HELPERS
  // -------------------------------------------------

  private calculateResults(
    questions: Array<{
      selectedOptionId: string | null;
      isCorrect: boolean | null;
      question: { questionType: string };
    }>
  ) {
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnanswered = 0;
    const breakdownByType: Record<string, TypeBreakdown> = {};

    for (const sq of questions) {
      const type = sq.question.questionType;
      breakdownByType[type] ??= { correct: 0, wrong: 0, unanswered: 0, total: 0 };
      breakdownByType[type].total++;

      if (sq.selectedOptionId === null) {
        totalUnanswered++;
        breakdownByType[type].unanswered++;
      } else if (sq.isCorrect) {
        totalCorrect++;
        breakdownByType[type].correct++;
      } else {
        totalWrong++;
        breakdownByType[type].wrong++;
      }
    }

    return { totalCorrect, totalWrong, totalUnanswered, breakdownByType };
  }

  private calculateDetailedBreakdown(
    questions: Array<{
      selectedOptionId: string | null;
      isCorrect: boolean | null;
      question: { questionType: string; difficulty: DifficultyLevel };
    }>
  ) {
    const byType: Record<string, TypeBreakdown> = {};
    const byDifficulty: Record<string, TypeBreakdown> = {};

    for (const sq of questions) {
      const { questionType, difficulty } = sq.question;

      byType[questionType] ??= { correct: 0, wrong: 0, unanswered: 0, total: 0 };
      byDifficulty[difficulty] ??= { correct: 0, wrong: 0, unanswered: 0, total: 0 };

      byType[questionType].total++;
      byDifficulty[difficulty].total++;

      if (sq.selectedOptionId === null) {
        byType[questionType].unanswered++;
        byDifficulty[difficulty].unanswered++;
      } else if (sq.isCorrect) {
        byType[questionType].correct++;
        byDifficulty[difficulty].correct++;
      } else {
        byType[questionType].wrong++;
        byDifficulty[difficulty].wrong++;
      }
    }

    // Calculate accuracy
    for (const breakdown of Object.values(byType)) {
      const attempted = breakdown.correct + breakdown.wrong;
      breakdown.accuracy = calculatePercentage(breakdown.correct, attempted);
    }

    return { byType, byDifficulty };
  }

  private evaluatePerformance(
    score: number,
    accuracy: number,
    attemptRate: number,
    difficulty: DifficultyLevel
  ): PerformanceEvaluation {
    const thresholds = PERFORMANCE_THRESHOLDS[difficulty];
    const suggestions: string[] = [];

    let rank: PerformanceEvaluation['rank'];
    let message: string;

    if (score >= thresholds.excellent) {
      rank = 'EXCELLENT';
      message = 'Outstanding performance! You have mastered this difficulty level.';
    } else if (score >= thresholds.good) {
      rank = 'GOOD';
      message = 'Great job! You scored above average.';
    } else if (score >= thresholds.average) {
      rank = 'AVERAGE';
      message = 'Good effort! There is room for improvement.';
    } else {
      rank = 'NEEDS_IMPROVEMENT';
      message = 'Keep practicing! Focus on understanding the concepts better.';
    }

    if (attemptRate < 90) {
      suggestions.push('Focus on time management to attempt all questions');
    }
    if (accuracy < 70) {
      suggestions.push('Review incorrect answers and understand the concepts');
    }
    if (score < thresholds.average) {
      suggestions.push('Consider practicing with easier difficulty first');
    }
    if (suggestions.length === 0) {
      suggestions.push('Try challenging yourself with harder difficulty');
    }

    return { rank, message, suggestions };
  }
}

export const aptitudeService = new AptitudeService();
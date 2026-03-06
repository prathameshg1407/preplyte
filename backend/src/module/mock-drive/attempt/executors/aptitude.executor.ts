// src/module/mock-drive/attempt/executors/aptitude.executor.ts

import { PrismaClient } from '@prisma/client';
import {
  BaseModuleExecutor,
  ModuleExecutorContext,
  InitializeResult,
  SubmitResult,
} from './base.executor';
import {
  AptitudeModuleConfig,
  AptitudeModuleData,
  AptitudeQuestionAttempt,
  AptitudeModuleSummary,
  ModuleData,
} from '../../shared';
import { calculateAptitudeScore } from '../../utils/scoring.utils';
import { NotFoundError, BadRequestError, InternalError } from '../../../../utils/errors';

// ============================================
// Payload Types
// ============================================

interface AnswerPayload {
  questionId: string;
  selectedOptionId: string;
  timeSpent?: number;
}

interface ClearPayload {
  questionId: string;
}

interface MarkReviewPayload {
  questionId: string;
  isMarked: boolean;
}

// ============================================
// Constants
// ============================================

const VALID_ACTIONS = ['answer', 'clear', 'mark_review'] as const;
type AptitudeAction = typeof VALID_ACTIONS[number];

// ============================================
// Type Guards
// ============================================

function isAnswerPayload(payload: unknown): payload is AnswerPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return typeof p.questionId === 'string' && typeof p.selectedOptionId === 'string';
}

function isClearPayload(payload: unknown): payload is ClearPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  return typeof (payload as Record<string, unknown>).questionId === 'string';
}

function isMarkReviewPayload(payload: unknown): payload is MarkReviewPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return typeof p.questionId === 'string' && typeof p.isMarked === 'boolean';
}

function isAptitudeAction(action: string): action is AptitudeAction {
  return VALID_ACTIONS.includes(action as AptitudeAction);
}

function isAptitudeModuleData(data: ModuleData | null): data is AptitudeModuleData {
  if (data === null) return false;
  return 'questions' in data && Array.isArray((data as AptitudeModuleData).questions);
}

// ============================================
// Executor Implementation
// ============================================

export class AptitudeModuleExecutor extends BaseModuleExecutor {
  constructor(prisma: PrismaClient) {
    super(prisma, 'APTITUDE');
  }

  async initialize(context: ModuleExecutorContext): Promise<InitializeResult> {
    this.validateContext(context);

    const moduleQuestions = await this.prisma.mockDriveModuleQuestion.findMany({
      where: { moduleId: context.moduleId },
      orderBy: { order: 'asc' },
      include: {
        aptitudeQuestion: {
          include: { options: true },
        },
        module: {
          include: {
            mockDrive: {
              select: { shuffleQuestions: true }
            }
          }
        }
      },
    });

    if (moduleQuestions.length === 0) {
      throw new NotFoundError('Questions for this module');
    }

    const shouldShuffle = moduleQuestions[0].module.mockDrive.shuffleQuestions;
    const finalQuestions = shouldShuffle
      ? this.shuffleWithSeed(moduleQuestions, context.attemptId)
      : moduleQuestions;

    const questions: AptitudeQuestionAttempt[] = finalQuestions.map((mq, index) => {
      if (!mq.aptitudeQuestion) {
        throw new InternalError(`Question data missing for module question ${mq.id}`);
      }

      return {
        questionId: mq.id,
        aptitudeQuestionId: mq.aptitudeQuestionId!,
        content: mq.aptitudeQuestion.questionText,
        options: mq.aptitudeQuestion.options.map((opt) => ({
          id: opt.id,
          content: opt.text,
        })),
        displayOrder: index,
        selectedOptionId: null,
        isCorrect: null,
        isMarkedForReview: false,
        timeSpentSeconds: 0,
        answeredAt: null,
      };
    });

    return { data: { questions } };
  }

  async handleAction(
    context: ModuleExecutorContext,
    action: string,
    payload: unknown
  ): Promise<Partial<AptitudeModuleData>> {
    if (!isAptitudeAction(action)) {
      throw new BadRequestError(`Unknown action: ${action}`);
    }

    if (!isAptitudeModuleData(context.existingData)) {
      throw new InternalError('Module not properly initialized');
    }

    switch (action) {
      case 'answer':
        return this.handleAnswer(context.existingData, payload);
      case 'clear':
        return this.handleClear(context.existingData, payload);
      case 'mark_review':
        return this.handleMarkReview(context.existingData, payload);
    }
  }

  async finalize(context: ModuleExecutorContext): Promise<SubmitResult> {
    const config = context.config as AptitudeModuleConfig;

    if (!isAptitudeModuleData(context.existingData)) {
      throw new InternalError('Module data not found');
    }

    // 1. Fetch correct answers
    const questionIds = context.existingData.questions.map(q => q.questionId);
    const moduleQuestions = await this.prisma.mockDriveModuleQuestion.findMany({
      where: { id: { in: questionIds } },
      include: {
        aptitudeQuestion: {
          select: { correctOptionId: true }
        }
      }
    });

    // 2. Map correct options
    const correctOptionsMap = new Map<string, string>(); // questionId -> correctOptionId
    moduleQuestions.forEach(mq => {
      if (mq.aptitudeQuestion && mq.aptitudeQuestion.correctOptionId) {
        correctOptionsMap.set(mq.id, mq.aptitudeQuestion.correctOptionId);
      }
    });

    // 3. Grade questions
    const gradedQuestions: AptitudeQuestionAttempt[] = context.existingData.questions.map(q => {
      const correctOptionId = correctOptionsMap.get(q.questionId);
      let isCorrect: boolean | null = false;

      if (!q.selectedOptionId) {
        isCorrect = null; // Unanswered
      } else if (correctOptionId && q.selectedOptionId === correctOptionId) {
        isCorrect = true;
      }

      return {
        ...q,
        isCorrect
      };
    });

    const summary = this.calculateSummary(gradedQuestions, config);

    const finalData: AptitudeModuleData = {
      questions: gradedQuestions,
      summary,
    };

    const { score, percentage } = calculateAptitudeScore(finalData, config);

    const threshold = (config as { passingPercentage?: number; passingScore?: number }).passingPercentage ?? (config as { passingScore?: number }).passingScore;
    // Default to passing if no threshold is set, otherwise check percentage
    const isPassed = typeof threshold === 'number'
      ? (config as { passingScore?: number }).passingScore !== undefined
        ? score >= threshold
        : percentage >= threshold
      : true;

    return {
      data: finalData,
      score,
      maxScore: summary.maxScore,
      percentage,
      isPassed,
    };
  }

  // ============================================
  // Action Handlers
  // ============================================

  private async handleAnswer(
    data: AptitudeModuleData,
    payload: unknown
  ): Promise<Partial<AptitudeModuleData>> {
    if (!isAnswerPayload(payload)) {
      throw new BadRequestError('Invalid answer payload: questionId and selectedOptionId required');
    }

    const questionIndex = data.questions.findIndex(
      (q) => q.questionId === payload.questionId
    );

    if (questionIndex === -1) {
      throw new NotFoundError('Question in attempt');
    }

    const moduleQuestion = await this.prisma.mockDriveModuleQuestion.findUnique({
      where: { id: payload.questionId },
      include: {
        aptitudeQuestion: {
          select: { correctOptionId: true },
        },
      },
    });

    if (!moduleQuestion?.aptitudeQuestion) {
      throw new NotFoundError('Question data');
    }

    const { correctOptionId } = moduleQuestion.aptitudeQuestion;

    if (!correctOptionId) {
      throw new InternalError('Question has no correct answer configured');
    }

    const isCorrect = correctOptionId === payload.selectedOptionId;
    const currentQuestion = data.questions[questionIndex];
    const additionalTime = Math.max(0, payload.timeSpent ?? 0);

    const updatedQuestions = [...data.questions];
    updatedQuestions[questionIndex] = {
      ...currentQuestion,
      selectedOptionId: payload.selectedOptionId,
      isCorrect,
      timeSpentSeconds: (currentQuestion.timeSpentSeconds || 0) + additionalTime,
      answeredAt: new Date().toISOString(),
    };

    return { questions: updatedQuestions };
  }

  private handleClear(
    data: AptitudeModuleData,
    payload: unknown
  ): Partial<AptitudeModuleData> {
    if (!isClearPayload(payload)) {
      throw new BadRequestError('Invalid clear payload: questionId required');
    }

    const questionIndex = data.questions.findIndex(
      (q) => q.questionId === payload.questionId
    );

    if (questionIndex === -1) {
      throw new NotFoundError('Question in attempt');
    }

    const updatedQuestions = [...data.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      selectedOptionId: null,
      isCorrect: null,
      answeredAt: null,
    };

    return { questions: updatedQuestions };
  }

  private handleMarkReview(
    data: AptitudeModuleData,
    payload: unknown
  ): Partial<AptitudeModuleData> {
    if (!isMarkReviewPayload(payload)) {
      throw new BadRequestError('Invalid mark review payload: questionId and isMarked required');
    }

    const questionIndex = data.questions.findIndex(
      (q) => q.questionId === payload.questionId
    );

    if (questionIndex === -1) {
      throw new NotFoundError('Question in attempt');
    }

    const updatedQuestions = [...data.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      isMarkedForReview: payload.isMarked,
    };

    return { questions: updatedQuestions };
  }

  // ============================================
  // Summary Calculation
  // ============================================

  private calculateSummary(
    questions: AptitudeQuestionAttempt[],
    config: AptitudeModuleConfig
  ): AptitudeModuleSummary {
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnanswered = 0;

    for (const question of questions) {
      if (question.selectedOptionId === null) {
        totalUnanswered++;
      } else if (question.isCorrect) {
        totalCorrect++;
      } else {
        totalWrong++;
      }
    }

    const marksPerQuestion = config.marksPerQuestion ?? 1;
    const negativeMarkingRate = config.negativeMarking ?? 0;

    const marksObtained = totalCorrect * marksPerQuestion;
    const negativeMarks = totalWrong * negativeMarkingRate;
    const finalScore = Math.max(0, marksObtained - negativeMarks);
    const maxScore = questions.length * marksPerQuestion;

    return {
      totalQuestions: questions.length,
      totalCorrect,
      totalWrong,
      totalUnanswered,
      marksObtained,
      negativeMarks,
      finalScore,
      maxScore,
    };
  }

  // ============================================
  // Utility Methods
  // ============================================

  private shuffleWithSeed<T>(array: T[], seed: string): T[] {
    if (array.length <= 1) {
      return [...array];
    }

    const shuffled = [...array];
    let hash = this.hashString(seed);

    for (let i = shuffled.length - 1; i > 0; i--) {
      hash = this.nextRandom(hash);
      const j = Math.abs(hash) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return hash;
  }

  private nextRandom(current: number): number {
    return ((current * 1103515245 + 12345) & 0x7fffffff) | 0;
  }
}
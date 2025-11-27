import { DifficultyLevel, QuestionType } from '@prisma/client';

// =====================================================
// REQUEST DTOs
// =====================================================

export interface CreateSessionDto {
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  timeLimit: number;
}

export interface SaveAnswerDto {
  questionId: string;
  selectedOptionId: string | null;
}

export interface SessionListFilters {
  page: number;
  limit: number;
  status: SessionFilterStatus;
  difficulty?: DifficultyLevel;
  sortBy: SessionSortField;
  sortOrder: SortOrder;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface SessionResponse {
  id: string;
  userId: string;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  timeLimit: number;
  startedAt: Date;
  expiresAt: Date;
  completedAt: Date | null;
  totalScore: number | null;
  totalCorrect: number | null;
  totalWrong: number | null;
  totalUnanswered: number | null;
  createdAt: Date;
}

export interface SessionListItem extends Omit<SessionResponse, 'userId' | 'createdAt'> {
  status: SessionStatus;
}

export interface SessionDetails extends SessionResponse {
  status: SessionStatus;
  timeRemaining: number;
  progress: SessionProgress;
  timeTaken?: number;
  scorePercentage?: number;
  updatedAt: Date;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface SessionQuestion {
  id: string;
  order: number;
  questionText: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  options: QuestionOption[];
  selectedOptionId: string | null;
  answeredAt: Date | null;
  correctOptionId?: string;
  isCorrect?: boolean | null;
  explanation?: string | null;
}

export interface SessionProgress {
  answered: number;
  unanswered: number;
  total: number;
  percentageComplete?: number;
}

export interface TypeBreakdown {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  accuracy?: number;
}

export interface SessionResultsSummary {
  totalScore: number | null;
  totalCorrect: number | null;
  totalWrong: number | null;
  totalUnanswered: number | null;
  totalQuestions: number;
  scorePercentage: number | null;
  accuracy: number;
  attemptRate: number;
}

export interface SessionBreakdown {
  byType: Record<string, TypeBreakdown>;
  byDifficulty: Record<string, TypeBreakdown>;
}

export interface PerformanceEvaluation {
  rank: PerformanceRank;
  message: string;
  suggestions: string[];
}

export interface QuestionNavigation {
  previousQuestionId: string | null;
  nextQuestionId: string | null;
  currentPosition: number;
  totalQuestions: number;
}

export interface SolutionItem {
  order: number;
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  options: Array<QuestionOption & { isCorrect: boolean }>;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean | null;
  explanation: string | null;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type SessionStatus = 'in_progress' | 'completed' | 'expired';
export type SessionFilterStatus = 'all' | SessionStatus;
export type SessionSortField = 'createdAt' | 'completedAt' | 'totalScore';
export type SortOrder = 'asc' | 'desc';
export type SolutionFilter = 'all' | 'correct' | 'wrong' | 'unanswered';
export type PerformanceRank = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';

export const PERFORMANCE_THRESHOLDS = {
  EASY: { excellent: 90, good: 75, average: 60 },
  MEDIUM: { excellent: 85, good: 70, average: 55 },
  HARD: { excellent: 80, good: 65, average: 50 },
} as const;

export const SESSION_LIMITS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 50,
  MIN_TIME: 10,
  MAX_TIME: 120,
  MAX_QUESTION_TYPES: 3,
  MAX_PAGE_SIZE: 50,
} as const;
// src/types/aptitude.types.ts

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type QuestionType = 'QUANTITATIVE' | 'VERBAL' | 'LOGICAL';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type SessionStatus = 'in_progress' | 'completed' | 'expired';
export type SolutionFilter = 'all' | 'correct' | 'wrong' | 'unanswered';
export type SessionSortBy = 'createdAt' | 'completedAt' | 'totalScore';
export type SortOrder = 'asc' | 'desc';
export type PerformanceRank = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';

// =====================================================
// REQUEST TYPES
// =====================================================

export interface CreateSessionRequest {
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  timeLimit: number; // in minutes (10-120)
}

export interface SaveAnswerRequest {
  questionId: string;
  selectedOptionId: string | null; // null to clear answer
}

export interface ListSessionsParams {
  page?: number;
  limit?: number;
  status?: 'all' | SessionStatus;
  difficulty?: DifficultyLevel;
  sortBy?: SessionSortBy;
  sortOrder?: SortOrder;
}

export interface GetSolutionsParams {
  filter?: SolutionFilter;
}

// =====================================================
// API RESPONSE WRAPPER
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// =====================================================
// SESSION RESPONSES
// =====================================================

export interface CreateSessionResponse {
  id: string;
  userId: string;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  timeLimit: number;
  startedAt: string;
  expiresAt: string;
  completedAt: null;
  totalScore: null;
  totalCorrect: null;
  totalWrong: null;
  totalUnanswered: null;
  createdAt: string;
}

export interface SessionProgress {
  answered: number;
  unanswered: number;
  total: number;
  percentageComplete?: number;
}

export interface SessionListItem {
  id: string;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  timeLimit: number;
  startedAt: string;
  completedAt: string | null;
  expiresAt: string;
  totalScore: number | null;
  totalCorrect: number | null;
  totalWrong: number | null;
  totalUnanswered: number | null;
  status: SessionStatus;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListSessionsResponse {
  sessions: SessionListItem[];
  pagination: PaginationInfo;
}

export interface SessionDetailsResponse {
  id: string;
  userId: string;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  timeLimit: number;
  startedAt: string;
  expiresAt: string;
  completedAt: string | null;
  status: SessionStatus;
  timeRemaining: number; // seconds
  progress: SessionProgress;
  totalScore: number | null;
  totalCorrect: number | null;
  totalWrong: number | null;
  totalUnanswered: number | null;
  createdAt: string;
  updatedAt: string;
  // Only if completed
  timeTaken?: number; // minutes
  scorePercentage?: number;
}

// =====================================================
// QUESTION TYPES
// =====================================================

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean; // Only after completion
}

export interface SessionQuestion {
  id: string;
  order: number;
  questionText: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  options: QuestionOption[];
  selectedOptionId: string | null;
  answeredAt: string | null;
  // Only after completion
  correctOptionId?: string;
  isCorrect?: boolean | null;
}

export interface GetSessionQuestionsResponse {
  sessionId: string;
  status: SessionStatus;
  questions: SessionQuestion[];
  totalQuestions: number;
  answeredCount: number;
}

export interface QuestionNavigation {
  previousQuestionId: string | null;
  nextQuestionId: string | null;
  currentPosition: number;
  totalQuestions: number;
}

export interface GetQuestionResponse {
  sessionId: string;
  sessionStatus: SessionStatus;
  question: SessionQuestion & {
    sessionQuestionId: string;
  };
  navigation: QuestionNavigation;
}

// =====================================================
// ANSWER TYPES
// =====================================================

export interface SaveAnswerResponse {
  sessionId: string;
  questionId: string;
  selectedOptionId: string | null;
  answeredAt: string | null;
  progress: SessionProgress;
}

// =====================================================
// SUBMISSION & RESULTS
// =====================================================

export interface TypeBreakdown {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  accuracy?: number;
}

export interface SubmitSessionResponse {
  sessionId: string;
  status: 'completed';
  completedAt: string;
  timeTaken: number; // minutes
  results: {
    totalScore: number;
    totalCorrect: number;
    totalWrong: number;
    totalUnanswered: number;
    totalQuestions: number;
    scorePercentage: number;
    breakdown: Record<QuestionType, TypeBreakdown>;
  };
}

// =====================================================
// SESSION STATUS
// =====================================================

export interface SessionStatusResponse {
  sessionId: string;
  status: SessionStatus;
  timeRemaining: number; // seconds
  timeRemainingFormatted: string; // "MM:SS"
  startedAt: string;
  expiresAt: string;
  progress: SessionProgress & {
    percentageComplete: number;
  };
  lastActivityAt: string;
}

// =====================================================
// SESSION RESULTS
// =====================================================

export interface PerformanceEvaluation {
  rank: PerformanceRank;
  message: string;
  suggestions: string[];
}

export interface SessionResultsResponse {
  sessionId: string;
  status: 'completed';
  completedAt: string;
  timeTaken: number;
  timeLimit: number;
  difficulty: DifficultyLevel;
  summary: {
    totalScore: number;
    totalCorrect: number;
    totalWrong: number;
    totalUnanswered: number;
    totalQuestions: number;
    scorePercentage: number;
    accuracy: number;
    attemptRate: number;
  };
  breakdown: {
    byType: Record<string, TypeBreakdown>;
    byDifficulty: Record<string, TypeBreakdown>;
  };
  performance: PerformanceEvaluation;
}

// =====================================================
// SOLUTIONS
// =====================================================

export interface SolutionItem {
  order: number;
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean | null;
  explanation: string | null;
}

export interface GetSolutionsResponse {
  sessionId: string;
  status: 'completed';
  solutions: SolutionItem[];
  summary: {
    totalCorrect: number;
    totalWrong: number;
    totalUnanswered: number;
  };
}

// =====================================================
// CONFIG TYPES
// =====================================================

export interface TimeLimitConfig {
  min: number;
  max: number;
  recommended: number;
}

export interface AptitudeTimeLimitsConfig {
  minTimeLimit: number;
  maxTimeLimit: number;
  defaultTimeLimit: number;
  timeLimitUnit: string;
  recommendedTimeLimits: Record<DifficultyLevel, TimeLimitConfig>;
}

export interface QuestionLimitsConfig {
  min: number;
  max: number;
  default: number;
}

export interface TimeLimitsResponse {
  aptitude: AptitudeTimeLimitsConfig;
  machine: {
    minTimeLimit: number;
    maxTimeLimit: number;
    defaultTimeLimit: number;
    timeLimitUnit: string;
    recommendedTimeLimits: Record<DifficultyLevel, TimeLimitConfig>;
  };
  codeExecution: {
    perTestCaseTimeLimit: number;
    perTestCaseMemoryLimit: number;
    timeUnit: string;
    memoryUnit: string;
  };
  questionLimits: {
    aptitude: QuestionLimitsConfig;
    machine: QuestionLimitsConfig;
  };
}

// =====================================================
// ENUM TYPES
// =====================================================

export interface DifficultyLevelInfo {
  value: DifficultyLevel;
  label: string;
  description: string;
  color: string;
  aptitudeTimeMultiplier: number;
  machineTimeMultiplier: number;
}

export interface AptitudeQuestionTypeInfo {
  value: QuestionType;
  label: string;
  description: string;
  icon: string;
  topics: string[];
}

export interface MachineQuestionTag {
  value: string;
  label: string;
  count: number;
}

export interface SubmissionStatusInfo {
  value: string;
  label: string;
  description: string;
  color: string;
}

export interface DifficultyLevelsResponse {
  difficultyLevels: DifficultyLevelInfo[];
}

export interface QuestionTypesResponse {
  aptitudeQuestionTypes: AptitudeQuestionTypeInfo[];
  machineQuestionTags: MachineQuestionTag[];
  submissionStatuses: SubmissionStatusInfo[];
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface SelectedAnswers {
  [questionId: string]: string;
}

export interface TimerState {
  totalSeconds: number;
  isRunning: boolean;
  isExpired: boolean;
}

// =====================================================
// COMPONENT PROP TYPES
// =====================================================

export interface QuestionTypeConfig {
  value: QuestionType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export interface DifficultyConfig {
  value: DifficultyLevel;
  label: string;
  timePerQuestion: number;
  color: string;
  bgColor: string;
}

// =====================================================
// ERROR TYPES
// =====================================================

export interface SessionInProgressErrorDetails {
  sessionId: string;
  expiresAt: string;
}

export interface SessionExpiredErrorDetails {
  expiresAt: string;
}

export interface SessionAlreadyCompletedErrorDetails {
  completedAt: string;
}
import { DifficultyLevel, QuestionType } from '@prisma/client';

export interface CreateAptitudeSessionDto {
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
  status?: 'all' | 'completed' | 'in_progress' | 'expired';
  difficulty?: DifficultyLevel;
  sortBy: 'createdAt' | 'completedAt' | 'totalScore';
  sortOrder: 'asc' | 'desc';
}

export interface SessionQuestion {
  id: string;
  order: number;
  questionText: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  options: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }>;
  selectedOptionId: string | null;
  correctOptionId?: string;
  isCorrect?: boolean | null;
  answeredAt: Date | null;
  explanation?: string | null;
}

export interface SessionProgress {
  answered: number;
  unanswered: number;
  total: number;
  percentageComplete?: number;
}

export interface SessionResults {
  totalScore: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  totalQuestions: number;
  scorePercentage: number;
  accuracy?: number;
  attemptRate?: number;
  breakdown?: {
    byType?: Record<string, TypeBreakdown>;
    byDifficulty?: Record<string, TypeBreakdown>;
  };
}

export interface TypeBreakdown {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  accuracy?: number;
}

export interface PerformanceEvaluation {
  rank: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
  message: string;
  suggestions: string[];
}
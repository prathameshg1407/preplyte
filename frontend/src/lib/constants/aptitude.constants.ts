// src/lib/constants/aptitude.constants.ts

import type {
  QuestionType,
  DifficultyLevel,
  QuestionTypeConfig,
  DifficultyConfig,
  PerformanceRank,
} from '@/types/aptitude.types';

// =====================================================
// QUESTION TYPE CONFIGURATION
// =====================================================

export const QUESTION_TYPE_CONFIG: Record<QuestionType, QuestionTypeConfig> = {
  QUANTITATIVE: {
    value: 'QUANTITATIVE',
    label: 'Quantitative Aptitude',
    icon: 'Calculator',
    description: 'Mathematical and numerical reasoning questions',
    color: 'text-blue-500',
  },
  VERBAL: {
    value: 'VERBAL',
    label: 'Verbal Ability',
    icon: 'BookOpen',
    description: 'English language and comprehension questions',
    color: 'text-purple-500',
  },
  LOGICAL: {
    value: 'LOGICAL',
    label: 'Logical Reasoning',
    icon: 'Puzzle',
    description: 'Pattern recognition and logical thinking questions',
    color: 'text-orange-500',
  },
};

// =====================================================
// DIFFICULTY CONFIGURATION
// =====================================================

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
  EASY: {
    value: 'EASY',
    label: 'Easy',
    timePerQuestion: 60, // seconds
    color: 'text-green-500',
    bgColor: 'bg-green-500',
  },
  MEDIUM: {
    value: 'MEDIUM',
    label: 'Medium',
    timePerQuestion: 90,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
  },
  HARD: {
    value: 'HARD',
    label: 'Hard',
    timePerQuestion: 120,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
  },
};

// =====================================================
// LIMITS (matching backend)
// =====================================================

export const QUESTION_LIMITS = {
  MIN: 5,
  MAX: 50,
  DEFAULT: 20,
  STEP: 5,
  RECOMMENDED: [10, 15, 20, 25, 30],
};

// src/lib/constants/aptitude.constants.ts

export const TIME_LIMITS = {
  MIN: 10, // ✅ Match backend validation (was possibly lower)
  MAX: 120,
  DEFAULT: 30,
};

export const RECOMMENDED_TIME_LIMITS: Record<DifficultyLevel, { min: number; max: number; recommended: number }> = {
  EASY: { min: 10, max: 30, recommended: 15 },    // ✅ min: 10
  MEDIUM: { min: 10, max: 60, recommended: 30 },  // ✅ min: 10 (not 20)
  HARD: { min: 10, max: 90, recommended: 45 },    // ✅ min: 10 (not 30)
};

// =====================================================
// PERFORMANCE THRESHOLDS
// =====================================================

export const PERFORMANCE_THRESHOLDS: Record<DifficultyLevel, { excellent: number; good: number; average: number }> = {
  EASY: { excellent: 90, good: 75, average: 60 },
  MEDIUM: { excellent: 85, good: 70, average: 55 },
  HARD: { excellent: 80, good: 65, average: 50 },
};

// =====================================================
// UI HELPERS
// =====================================================

export const getScoreGrade = (
  score: number,
  difficulty: DifficultyLevel = 'MEDIUM'
): {
  rank: PerformanceRank;
  label: string;
  color: string;
  bgColor: string;
} => {
  const thresholds = PERFORMANCE_THRESHOLDS[difficulty];

  if (score >= thresholds.excellent) {
    return {
      rank: 'EXCELLENT',
      label: 'Excellent!',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    };
  }
  if (score >= thresholds.good) {
    return {
      rank: 'GOOD',
      label: 'Great Job!',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    };
  }
  if (score >= thresholds.average) {
    return {
      rank: 'AVERAGE',
      label: 'Good Effort!',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    };
  }
  return {
    rank: 'NEEDS_IMPROVEMENT',
    label: 'Keep Practicing',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  };
};

export const getPerformanceColor = (rank: PerformanceRank): { text: string; bg: string } => {
  const colors: Record<PerformanceRank, { text: string; bg: string }> = {
    EXCELLENT: { text: 'text-green-500', bg: 'bg-green-500/10' },
    GOOD: { text: 'text-blue-500', bg: 'bg-blue-500/10' },
    AVERAGE: { text: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    NEEDS_IMPROVEMENT: { text: 'text-red-500', bg: 'bg-red-500/10' },
  };
  return colors[rank];
};

// =====================================================
// TIME FORMATTING
// =====================================================

export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

// =====================================================
// STATUS HELPERS
// =====================================================

export const getStatusColor = (status: string): { text: string; bg: string; border: string } => {
  const colors: Record<string, { text: string; bg: string; border: string }> = {
    in_progress: {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    completed: {
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    expired: {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
  };
  return colors[status] || colors.expired;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Completed',
    expired: 'Expired',
  };
  return labels[status] || status;
};

// =====================================================
// CALCULATION HELPERS
// =====================================================

export const calculateRecommendedTime = (
  numberOfQuestions: number,
  difficulty: DifficultyLevel
): number => {
  const timePerQuestion = DIFFICULTY_CONFIG[difficulty].timePerQuestion;
  const totalSeconds = numberOfQuestions * timePerQuestion;
  const bufferSeconds = 60; // 1 minute buffer
  return Math.ceil((totalSeconds + bufferSeconds) / 60); // Return in minutes
};

export const calculateAccuracy = (correct: number, attempted: number): number => {
  if (attempted === 0) return 0;
  return Math.round((correct / attempted) * 100);
};

export const calculateAttemptRate = (attempted: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((attempted / total) * 100);
};
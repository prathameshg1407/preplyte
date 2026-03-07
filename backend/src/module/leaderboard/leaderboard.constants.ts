// src/module/leaderboard/leaderboard.constants.ts

export const LEADERBOARD_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,

  // Cache TTL in seconds (optional for future caching)
  CACHE_TTL: 300, // 5 minutes
} as const;

export const LEADERBOARD_CATEGORIES = [
  'overall',
  'lms',
  'aptitude',
  'coding',
  'ai_interview',
  'mock_drive',
] as const;

export const LEADERBOARD_SCOPES = ['global', 'institute'] as const;

export const ERROR_MESSAGES = {
  INSTITUTE_REQUIRED: 'Institute level leaderboard is only available for institute users',
  INVALID_CATEGORY: 'Invalid leaderboard category',
  INVALID_SCOPE: 'Invalid leaderboard scope',
  USER_NOT_FOUND: 'User not found',
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  overall: 'Overall',
  lms: 'LMS Courses',
  aptitude: 'Aptitude Practice',
  coding: 'Machine Coding',
  ai_interview: 'AI Interview',
  mock_drive: 'Mock Drives',
};

export const SCORE_DESCRIPTIONS: Record<string, string> = {
  overall: 'Total combined score from all activities',
  lms: 'Total points earned from LMS course completions',
  aptitude: 'Total correct answers in aptitude practice sessions',
  coding: 'Total problems solved in coding practice sessions',
  ai_interview: 'Total score from AI interview feedback',
  mock_drive: 'Total score from mock drive attempts',
};

export const SCORE_UNITS: Record<string, string> = {
  overall: 'points',
  lms: 'points',
  aptitude: 'correct answers',
  coding: 'problems solved',
  ai_interview: 'score',
  mock_drive: 'score',
};
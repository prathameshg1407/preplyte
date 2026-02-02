// src/module/lms/lms.constants.ts

export const LMS_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,

  // Progress
  THEORY_READ_TIME_SECONDS: 30, // Minimum time to mark theory as read
  VIDEO_COMPLETE_THRESHOLD: 90, // Percentage to mark video as watched

  // Points
  DEFAULT_POINTS_PER_QUESTION: 10,
  BONUS_POINTS_PERFECT_SCORE: 50,

  // Tests
  DEFAULT_MODULE_TEST_TIME_MINUTES: 30,
  DEFAULT_FINAL_TEST_TIME_MINUTES: 120,
  DEFAULT_PASSING_SCORE: 60,

  // Cache keys
  CACHE_KEYS: {
    CATEGORIES: 'lms:categories',
    STATS: 'lms:stats',
    COURSE: (slug: string) => `lms:course:${slug}`,
    USER_ENROLLMENTS: (userId: string) => `lms:user:${userId}:enrollments`,
  },

  // Cache TTL (in seconds)
  CACHE_TTL: {
    CATEGORIES: 1800, // 30 minutes
    STATS: 300, // 5 minutes
    COURSE: 600, // 10 minutes
    ENROLLMENTS: 300, // 5 minutes
  },
};

export const LMS_ERROR_MESSAGES = {
  COURSE_NOT_FOUND: 'Course not found',
  MODULE_NOT_FOUND: 'Module not found',
  TOPIC_NOT_FOUND: 'Topic not found',
  NOT_ENROLLED: 'You are not enrolled in this course',
  ALREADY_ENROLLED: 'You are already enrolled in this course',
  MODULE_LOCKED: 'This module is locked. Complete previous modules first.',
  TOPIC_LOCKED: 'This topic is locked. Complete previous topics first.',
  TEST_NOT_AVAILABLE: 'Test is not available',
  TEST_ALREADY_PASSED: 'You have already passed this test',
  TEST_MAX_ATTEMPTS: 'You have reached the maximum number of attempts',
  TEST_IN_PROGRESS: 'You already have a test in progress',
  FINAL_TEST_LOCKED: 'Complete all modules before taking the final test',
  FINAL_TEST_ATTEMPTED: 'Final test can only be attempted once',
  MODULES_INCOMPLETE: 'Complete all modules before taking the final test',
  INVALID_ATTEMPT: 'Invalid test attempt',
  ATTEMPT_EXPIRED: 'Test attempt has expired',
};
// src/lib/api/endpoints.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// =====================================================
// AUTH ENDPOINTS
// =====================================================

export const AUTH_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  REFRESH: '/api/auth/refresh',
} as const;

// =====================================================
// USER ENDPOINTS
// =====================================================

export const USER_ENDPOINTS = {
  PROFILE: '/api/user/profile',
  UPDATE: '/api/user/update',
} as const;

// =====================================================
// APTITUDE ENDPOINTS
// =====================================================

export const APTITUDE_ENDPOINTS = {
  // Session Management
  SESSIONS: '/api/aptitude/sessions',
  SESSION: (sessionId: string) => `/api/aptitude/sessions/${sessionId}`,

  // Questions
  SESSION_QUESTIONS: (sessionId: string) =>
    `/api/aptitude/sessions/${sessionId}/questions`,
  SESSION_QUESTION: (sessionId: string, questionId: string) =>
    `/api/aptitude/sessions/${sessionId}/questions/${questionId}`,

  // Test Taking
  SAVE_ANSWER: (sessionId: string) =>
    `/api/aptitude/sessions/${sessionId}/answer`,
  SUBMIT_SESSION: (sessionId: string) =>
    `/api/aptitude/sessions/${sessionId}/submit`,

  // Status & Results
  SESSION_STATUS: (sessionId: string) =>
    `/api/aptitude/sessions/${sessionId}/status`,
  SESSION_RESULTS: (sessionId: string) =>
    `/api/aptitude/sessions/${sessionId}/results`,
  SESSION_SOLUTIONS: (sessionId: string) =>
    `/api/aptitude/sessions/${sessionId}/solutions`,
} as const;

// =====================================================
// MACHINE CODING ENDPOINTS
// Matches: machine.routes.ts
// =====================================================

export const MACHINE_ENDPOINTS = {
  // Session Management
  SESSIONS: '/api/machine/sessions',
  SESSION: (sessionId: string) => `/api/machine/sessions/${sessionId}`,

  // Questions
  SESSION_QUESTIONS: (sessionId: string) =>
    `/api/machine/sessions/${sessionId}/questions`,
  SESSION_QUESTION: (sessionId: string, questionId: string) =>
    `/api/machine/sessions/${sessionId}/questions/${questionId}`,

  // Code Execution
  RUN_CODE: (sessionId: string, questionId: string) =>
    `/api/machine/sessions/${sessionId}/questions/${questionId}/run`,
  SUBMIT_CODE: (sessionId: string, questionId: string) =>
    `/api/machine/sessions/${sessionId}/questions/${questionId}/submit`,

  // Session Control
  SESSION_STATUS: (sessionId: string) =>
    `/api/machine/sessions/${sessionId}/status`,
  COMPLETE_SESSION: (sessionId: string) =>
    `/api/machine/sessions/${sessionId}/complete`,
  SESSION_RESULTS: (sessionId: string) =>
    `/api/machine/sessions/${sessionId}/results`,

  // Submissions
  QUESTION_SUBMISSIONS: (sessionId: string, questionId: string) =>
    `/api/machine/sessions/${sessionId}/questions/${questionId}/submissions`,
  SUBMISSION_DETAIL: (submissionId: string) =>
    `/api/machine/submissions/${submissionId}`,
} as const;

// =====================================================
// AI INTERVIEW ENDPOINTS
// Matches: interview.routes.ts
// =====================================================

export const INTERVIEW_ENDPOINTS = {
  // Session Management
  START: '/api/ai-interview/start',
  SESSIONS: '/api/ai-interview/sessions',
  STATS: '/api/ai-interview/stats',
  
  // Session Operations
  SESSION: (sessionId: string) => 
    `/api/ai-interview/${sessionId}`,
  NEXT_QUESTION: (sessionId: string) => 
    `/api/ai-interview/${sessionId}/next`,
  SUBMIT_ANSWER: (sessionId: string) => 
    `/api/ai-interview/${sessionId}/answer`,
  FEEDBACK: (sessionId: string) => 
    `/api/ai-interview/${sessionId}/feedback`,
  CANCEL: (sessionId: string) => 
    `/api/ai-interview/${sessionId}/cancel`,
  DELETE: (sessionId: string) => 
    `/api/ai-interview/${sessionId}`,

  // Utility/Debug
  TEST_TTS: '/api/ai-interview/test-tts',
} as const;

// =====================================================
// COMMON ENDPOINTS
// Matches: languages.routes.ts, config.routes.ts, enums.routes.ts
// =====================================================

export const LANGUAGES_ENDPOINTS = {
  // GET /api/languages - getAllLanguages
  LIST: '/api/languages',
  // GET /api/languages/:id - getLanguageById
  DETAIL: (id: string) => `/api/languages/${id}`,
} as const;

export const CONFIG_ENDPOINTS = {
  // GET /api/config/time-limits - getTimeLimits
  TIME_LIMITS: '/api/config/time-limits',
} as const;

export const ENUMS_ENDPOINTS = {
  // GET /api/enums/difficulty-levels - getDifficultyLevels
  DIFFICULTY_LEVELS: '/api/enums/difficulty-levels',
  // GET /api/enums/question-types - getQuestionTypes
  QUESTION_TYPES: '/api/enums/question-types',
} as const;

// =====================================================
// AUDIO ENDPOINTS
// =====================================================

export const AUDIO_ENDPOINTS = {
  // Direct audio file serving (no /api prefix)
  AUDIO_FILE: (filename: string) => `/audio/${filename}`,
} as const;

// =====================================================
// MAIN EXPORTS
// =====================================================

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  APTITUDE: APTITUDE_ENDPOINTS,
  MACHINE: MACHINE_ENDPOINTS,
  INTERVIEW: INTERVIEW_ENDPOINTS,
  LANGUAGES: LANGUAGES_ENDPOINTS,
  CONFIG: CONFIG_ENDPOINTS,
  ENUMS: ENUMS_ENDPOINTS,
  AUDIO: AUDIO_ENDPOINTS,
} as const;

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Builds the full URL for an endpoint
 * @param endpoint - The endpoint path
 * @returns The full URL including the base URL
 */
export function buildUrl(endpoint: string): string {
  // Remove double slashes
  return `${API_BASE}${endpoint}`.replace(/([^:]\/)\/+/g, "$1");
}

/**
 * Type-safe endpoint builder
 */
export const endpoints = {
  auth: AUTH_ENDPOINTS,
  user: USER_ENDPOINTS,
  aptitude: APTITUDE_ENDPOINTS,
  machine: MACHINE_ENDPOINTS,
  interview: INTERVIEW_ENDPOINTS,
  languages: LANGUAGES_ENDPOINTS,
  config: CONFIG_ENDPOINTS,
  enums: ENUMS_ENDPOINTS,
  audio: AUDIO_ENDPOINTS,
} as const;

// Export type for intellisense
export type EndpointsType = typeof endpoints;
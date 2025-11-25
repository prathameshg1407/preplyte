// src/config/constants.ts

export const CONSTANTS = {
  // Resume
  MIN_RESUME_LENGTH: 50,
  MAX_RESUME_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Interview Settings
  MAX_QUESTIONS: 10,
  DEFAULT_JOB_TITLE: 'Developer',
  MAX_TIME_SECONDS: 600,
  MAX_PROMPT_LENGTH: 4000,
  
  // API Settings
  DEDUP_TIMEOUT_MS: 1000,
  MAX_RETRIES: 3, // Renamed from API_RETRY_COUNT for consistency
  RETRY_DELAY_MS: 1000,
  API_TIMEOUT_MS: 60000,
  
  // Groq Settings
  GROQ_MODEL: 'llama-3.3-70b-versatile',
  GROQ_TEMPERATURE: 0.7,
  GROQ_MAX_TOKENS: 4096,
  
  // TTS Settings
  TTS_LANGUAGE: 'en-US',
  TTS_VOICE_GENDER: 'NEUTRAL' as const,
  TTS_AUDIO_ENCODING: 'MP3' as const,
  AUDIO_DIR: '../../audio',
  
  // Cache Settings
  AUDIO_CACHE_MAX_SIZE: 100,
  AUDIO_CACHE_TTL_MS: 30 * 60 * 1000, // 30 minutes
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Allowed MIME types for resumes
export const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export type Constants = typeof CONSTANTS;
export type HttpStatus = typeof HTTP_STATUS;
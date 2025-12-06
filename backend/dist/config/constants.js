"use strict";
// src/config/constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.SESSION_STATUS = exports.QUESTION_CATEGORIES = exports.ALLOWED_RESUME_TYPES = exports.HTTP_STATUS = exports.CONSTANTS = void 0;
exports.CONSTANTS = {
    // =====================================================
    // Resume Settings
    // =====================================================
    MIN_RESUME_LENGTH: 50,
    MAX_RESUME_SIZE: 5 * 1024 * 1024, // 5MB
    // =====================================================
    // Interview Settings
    // =====================================================
    MAX_QUESTIONS: 10,
    DEFAULT_JOB_TITLE: 'Software Developer',
    MAX_TIME_SECONDS: 600, // 10 minutes per question
    MAX_PROMPT_LENGTH: 4000,
    // Follow-up Question Settings
    FOLLOWUP_MIN_ANSWER_LENGTH: 20,
    FOLLOWUP_MIN_SCORE: 10, // Don't ask followup for zero/empty answers
    FOLLOWUP_MAX_SCORE: 60, // Only ask followup for weak answers (out of 100)
    // =====================================================
    // API Settings
    // =====================================================
    DEDUP_TIMEOUT_MS: 1000,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    API_TIMEOUT_MS: 60000, // 60 seconds
    MIN_REQUEST_INTERVAL_MS: 100, // Minimum time between API requests
    // =====================================================
    // Groq LLM Settings
    // =====================================================
    GROQ_MODEL: 'llama-3.3-70b-versatile',
    GROQ_TEMPERATURE: 0.7,
    GROQ_MAX_TOKENS: 4096,
    GROQ_SCORING_TEMPERATURE: 0.3, // Lower temperature for consistent scoring
    GROQ_FEEDBACK_TEMPERATURE: 0.5, // Medium temperature for feedback
    // =====================================================
    // TTS (Text-to-Speech) Settings
    // =====================================================
    TTS_LANGUAGE: 'en-US',
    TTS_VOICE_GENDER: 'NEUTRAL',
    TTS_AUDIO_ENCODING: 'MP3',
    AUDIO_DIR: '../../audio',
    // =====================================================
    // Cache Settings
    // =====================================================
    AUDIO_CACHE_MAX_SIZE: 100,
    AUDIO_CACHE_TTL_MS: 30 * 60 * 1000, // 30 minutes
    // =====================================================
    // Scoring Settings
    // =====================================================
    MIN_SCORE: 0,
    MAX_SCORE: 10,
    DEFAULT_SCORE: 5,
    OVERALL_SCORE_MULTIPLIER: 10, // Convert 0-10 to 0-100
};
exports.HTTP_STATUS = {
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
};
// Allowed MIME types for resumes
exports.ALLOWED_RESUME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
// Question categories
exports.QUESTION_CATEGORIES = {
    INTRODUCTORY: 'INTRODUCTORY',
    TECHNICAL: 'TECHNICAL',
    CLOSING: 'CLOSING',
};
// Session statuses
exports.SESSION_STATUS = {
    STARTED: 'STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
// Error codes
exports.ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    CONFLICT: 'CONFLICT',
    RATE_LIMITED: 'RATE_LIMITED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};
//# sourceMappingURL=constants.js.map
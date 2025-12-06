"use strict";
// src/module/practice/interview/interview.constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.CACHE_KEYS = exports.ERROR_MESSAGES = exports.HTTP_STATUS = exports.HEARTBEAT_CONFIG = exports.WS_EVENTS = exports.DIFFICULTY_CONFIG = exports.SCORING_CONFIG = exports.QUESTION_CATEGORIES = exports.TTS_CONFIG = exports.DEEPGRAM_CONFIG = exports.AI_CONFIG = exports.AUDIO_CONFIG = exports.INTERVIEW_SESSION_CONFIG = void 0;
// =====================================================
// SESSION CONFIGURATION
// =====================================================
exports.INTERVIEW_SESSION_CONFIG = {
    MIN_QUESTIONS: 5,
    MAX_QUESTIONS: 15,
    DEFAULT_QUESTIONS: 10,
    MAX_FOLLOWUP_DEPTH: 3,
    SESSION_TIMEOUT_MINUTES: 45,
    IDLE_TIMEOUT_SECONDS: 120,
    MAX_ANSWER_DURATION_SECONDS: 180,
    MIN_ANSWER_DURATION_SECONDS: 3,
};
// =====================================================
// AUDIO CONFIGURATION
// =====================================================
exports.AUDIO_CONFIG = {
    SAMPLE_RATE: 16000,
    CHANNELS: 1,
    BIT_DEPTH: 16,
    CHUNK_SIZE: 4096,
    FORMAT: 'pcm',
    TTS_FORMAT: 'mp3',
    MAX_AUDIO_SIZE_MB: 25,
};
// =====================================================
// AI MODEL CONFIGURATION
// =====================================================
exports.AI_CONFIG = {
    LLM_MODEL: 'llama-3.1-70b-versatile',
    LLM_TEMPERATURE: 0.7,
    LLM_MAX_TOKENS: 500,
    FEEDBACK_TEMPERATURE: 0.3,
    FEEDBACK_MAX_TOKENS: 2000,
};
// =====================================================
// DEEPGRAM CONFIGURATION
// =====================================================
exports.DEEPGRAM_CONFIG = {
    MODEL: 'nova-2',
    LANGUAGE: 'en',
    SMART_FORMAT: true,
    PUNCTUATE: true,
    INTERIM_RESULTS: true,
    UTTERANCE_END_MS: 1500,
    VAD_EVENTS: true,
    ENCODING: 'linear16',
    SAMPLE_RATE: 16000,
};
// =====================================================
// TTS CONFIGURATION
// =====================================================
exports.TTS_CONFIG = {
    DEFAULT_VOICE: 'af_bella',
    DEFAULT_SPEED: 1.0,
    KOKORO_URL: process.env.KOKORO_TTS_URL || 'http://localhost:8880',
    EDGE_TTS_VOICE: 'en-US-JennyNeural',
    USE_KOKORO: process.env.USE_KOKORO_TTS === 'true',
};
// =====================================================
// QUESTION CATEGORIES
// =====================================================
exports.QUESTION_CATEGORIES = {
    INTRODUCTORY: {
        weight: 0.1,
        minCount: 1,
        maxCount: 2,
    },
    TECHNICAL: {
        weight: 0.4,
        minCount: 3,
        maxCount: 6,
    },
    BEHAVIORAL: {
        weight: 0.25,
        minCount: 2,
        maxCount: 4,
    },
    SITUATIONAL: {
        weight: 0.15,
        minCount: 1,
        maxCount: 3,
    },
    CLOSING: {
        weight: 0.1,
        minCount: 1,
        maxCount: 1,
    },
};
// =====================================================
// SCORING CONFIGURATION
// =====================================================
exports.SCORING_CONFIG = {
    MAX_SCORE: 10,
    MIN_SCORE: 1,
    PASSING_SCORE: 6,
    WEIGHTS: {
        relevance: 0.25,
        clarity: 0.20,
        depth: 0.25,
        technicalAccuracy: 0.20,
        communication: 0.10,
    },
};
// =====================================================
// DIFFICULTY CONFIGURATIONS
// =====================================================
exports.DIFFICULTY_CONFIG = {
    ENTRY: {
        technicalDepth: 'basic',
        followUpIntensity: 'low',
        expectedDetailLevel: 'general',
        timePerQuestion: 90,
    },
    MID: {
        technicalDepth: 'intermediate',
        followUpIntensity: 'medium',
        expectedDetailLevel: 'specific',
        timePerQuestion: 120,
    },
    SENIOR: {
        technicalDepth: 'advanced',
        followUpIntensity: 'high',
        expectedDetailLevel: 'comprehensive',
        timePerQuestion: 150,
    },
    LEAD: {
        technicalDepth: 'expert',
        followUpIntensity: 'high',
        expectedDetailLevel: 'strategic',
        timePerQuestion: 180,
    },
};
// =====================================================
// WEBSOCKET EVENTS
// =====================================================
exports.WS_EVENTS = {
    // Client -> Server
    CLIENT: {
        AUDIO_CHUNK: 'audio_chunk',
        START_RECORDING: 'start_recording',
        STOP_RECORDING: 'stop_recording',
        END_INTERVIEW: 'end_interview',
        PAUSE: 'pause',
        RESUME: 'resume',
        SKIP_QUESTION: 'skip_question',
        PING: 'ping',
        PONG: 'pong',
    },
    // Server -> Client
    SERVER: {
        CONNECTED: 'connected',
        SESSION_READY: 'session_ready',
        TRANSCRIPTION: 'transcription',
        TRANSCRIPTION_FINAL: 'transcription_final',
        AI_THINKING: 'ai_thinking',
        AI_SPEAKING: 'ai_speaking',
        AI_AUDIO: 'ai_audio',
        AI_DONE: 'ai_done',
        QUESTION_START: 'question_start',
        INTERVIEW_ENDED: 'interview_ended',
        ERROR: 'error',
        PING: 'ping',
        PONG: 'pong',
        SESSION_STATE: 'session_state',
    },
};
// =====================================================
// HEARTBEAT CONFIGURATION
// =====================================================
exports.HEARTBEAT_CONFIG = {
    INTERVAL_MS: 30000, // Send ping every 30 seconds
    TIMEOUT_MS: 10000, // Wait 10 seconds for pong before considering dead
};
// =====================================================
// HTTP STATUS CODES
// =====================================================
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
    INTERNAL_SERVER_ERROR: 500,
};
// =====================================================
// ERROR MESSAGES
// =====================================================
exports.ERROR_MESSAGES = {
    SESSION_NOT_FOUND: 'Interview session not found',
    SESSION_EXPIRED: 'Interview session has expired',
    SESSION_ALREADY_COMPLETED: 'Interview session is already completed',
    SESSION_NOT_STARTED: 'Interview session has not started yet',
    RESUME_NOT_FOUND: 'Resume not found',
    RESUME_REQUIRED: 'Resume is required to start an interview',
    INVALID_AUDIO_FORMAT: 'Invalid audio format',
    TRANSCRIPTION_FAILED: 'Failed to transcribe audio',
    TTS_FAILED: 'Failed to generate speech',
    AI_RESPONSE_FAILED: 'Failed to generate AI response',
    WEBSOCKET_ERROR: 'WebSocket connection error',
    MAX_SESSIONS_REACHED: 'Maximum concurrent sessions reached',
    FEEDBACK_GENERATION_FAILED: 'Failed to generate feedback',
};
// =====================================================
// CACHE KEYS
// =====================================================
exports.CACHE_KEYS = {
    session: (sessionId) => `interview:session:${sessionId}`,
    userSessions: (userId) => `interview:user:${userId}:sessions`,
    activeSession: (userId) => `interview:user:${userId}:active`,
    feedback: (sessionId) => `interview:feedback:${sessionId}`,
};
// =====================================================
// CACHE TTL (in seconds)
// =====================================================
exports.CACHE_TTL = {
    SESSION: 3600, // 1 hour
    FEEDBACK: 86400, // 24 hours
    ACTIVE_SESSION: 1800, // 30 minutes
};
//# sourceMappingURL=interview.constants.js.map
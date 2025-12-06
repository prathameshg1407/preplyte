export declare const INTERVIEW_SESSION_CONFIG: {
    readonly MIN_QUESTIONS: 5;
    readonly MAX_QUESTIONS: 15;
    readonly DEFAULT_QUESTIONS: 10;
    readonly MAX_FOLLOWUP_DEPTH: 3;
    readonly SESSION_TIMEOUT_MINUTES: 45;
    readonly IDLE_TIMEOUT_SECONDS: 120;
    readonly MAX_ANSWER_DURATION_SECONDS: 180;
    readonly MIN_ANSWER_DURATION_SECONDS: 3;
};
export declare const AUDIO_CONFIG: {
    readonly SAMPLE_RATE: 16000;
    readonly CHANNELS: 1;
    readonly BIT_DEPTH: 16;
    readonly CHUNK_SIZE: 4096;
    readonly FORMAT: "pcm";
    readonly TTS_FORMAT: "mp3";
    readonly MAX_AUDIO_SIZE_MB: 25;
};
export declare const AI_CONFIG: {
    readonly LLM_MODEL: "llama-3.1-70b-versatile";
    readonly LLM_TEMPERATURE: 0.7;
    readonly LLM_MAX_TOKENS: 500;
    readonly FEEDBACK_TEMPERATURE: 0.3;
    readonly FEEDBACK_MAX_TOKENS: 2000;
};
export declare const DEEPGRAM_CONFIG: {
    readonly MODEL: "nova-2";
    readonly LANGUAGE: "en";
    readonly SMART_FORMAT: true;
    readonly PUNCTUATE: true;
    readonly INTERIM_RESULTS: true;
    readonly UTTERANCE_END_MS: 1500;
    readonly VAD_EVENTS: true;
    readonly ENCODING: "linear16";
    readonly SAMPLE_RATE: 16000;
};
export declare const TTS_CONFIG: {
    readonly DEFAULT_VOICE: "af_bella";
    readonly DEFAULT_SPEED: 1;
    readonly KOKORO_URL: string;
    readonly EDGE_TTS_VOICE: "en-US-JennyNeural";
    readonly USE_KOKORO: boolean;
};
export declare const QUESTION_CATEGORIES: {
    readonly INTRODUCTORY: {
        readonly weight: 0.1;
        readonly minCount: 1;
        readonly maxCount: 2;
    };
    readonly TECHNICAL: {
        readonly weight: 0.4;
        readonly minCount: 3;
        readonly maxCount: 6;
    };
    readonly BEHAVIORAL: {
        readonly weight: 0.25;
        readonly minCount: 2;
        readonly maxCount: 4;
    };
    readonly SITUATIONAL: {
        readonly weight: 0.15;
        readonly minCount: 1;
        readonly maxCount: 3;
    };
    readonly CLOSING: {
        readonly weight: 0.1;
        readonly minCount: 1;
        readonly maxCount: 1;
    };
};
export declare const SCORING_CONFIG: {
    readonly MAX_SCORE: 10;
    readonly MIN_SCORE: 1;
    readonly PASSING_SCORE: 6;
    readonly WEIGHTS: {
        readonly relevance: 0.25;
        readonly clarity: 0.2;
        readonly depth: 0.25;
        readonly technicalAccuracy: 0.2;
        readonly communication: 0.1;
    };
};
export declare const DIFFICULTY_CONFIG: {
    readonly ENTRY: {
        readonly technicalDepth: "basic";
        readonly followUpIntensity: "low";
        readonly expectedDetailLevel: "general";
        readonly timePerQuestion: 90;
    };
    readonly MID: {
        readonly technicalDepth: "intermediate";
        readonly followUpIntensity: "medium";
        readonly expectedDetailLevel: "specific";
        readonly timePerQuestion: 120;
    };
    readonly SENIOR: {
        readonly technicalDepth: "advanced";
        readonly followUpIntensity: "high";
        readonly expectedDetailLevel: "comprehensive";
        readonly timePerQuestion: 150;
    };
    readonly LEAD: {
        readonly technicalDepth: "expert";
        readonly followUpIntensity: "high";
        readonly expectedDetailLevel: "strategic";
        readonly timePerQuestion: 180;
    };
};
export declare const WS_EVENTS: {
    readonly CLIENT: {
        readonly AUDIO_CHUNK: "audio_chunk";
        readonly START_RECORDING: "start_recording";
        readonly STOP_RECORDING: "stop_recording";
        readonly END_INTERVIEW: "end_interview";
        readonly PAUSE: "pause";
        readonly RESUME: "resume";
        readonly SKIP_QUESTION: "skip_question";
        readonly PING: "ping";
        readonly PONG: "pong";
    };
    readonly SERVER: {
        readonly CONNECTED: "connected";
        readonly SESSION_READY: "session_ready";
        readonly TRANSCRIPTION: "transcription";
        readonly TRANSCRIPTION_FINAL: "transcription_final";
        readonly AI_THINKING: "ai_thinking";
        readonly AI_SPEAKING: "ai_speaking";
        readonly AI_AUDIO: "ai_audio";
        readonly AI_DONE: "ai_done";
        readonly QUESTION_START: "question_start";
        readonly INTERVIEW_ENDED: "interview_ended";
        readonly ERROR: "error";
        readonly PING: "ping";
        readonly PONG: "pong";
        readonly SESSION_STATE: "session_state";
    };
};
export declare const HEARTBEAT_CONFIG: {
    readonly INTERVAL_MS: 30000;
    readonly TIMEOUT_MS: 10000;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const ERROR_MESSAGES: {
    readonly SESSION_NOT_FOUND: "Interview session not found";
    readonly SESSION_EXPIRED: "Interview session has expired";
    readonly SESSION_ALREADY_COMPLETED: "Interview session is already completed";
    readonly SESSION_NOT_STARTED: "Interview session has not started yet";
    readonly RESUME_NOT_FOUND: "Resume not found";
    readonly RESUME_REQUIRED: "Resume is required to start an interview";
    readonly INVALID_AUDIO_FORMAT: "Invalid audio format";
    readonly TRANSCRIPTION_FAILED: "Failed to transcribe audio";
    readonly TTS_FAILED: "Failed to generate speech";
    readonly AI_RESPONSE_FAILED: "Failed to generate AI response";
    readonly WEBSOCKET_ERROR: "WebSocket connection error";
    readonly MAX_SESSIONS_REACHED: "Maximum concurrent sessions reached";
    readonly FEEDBACK_GENERATION_FAILED: "Failed to generate feedback";
};
export declare const CACHE_KEYS: {
    readonly session: (sessionId: string) => string;
    readonly userSessions: (userId: string) => string;
    readonly activeSession: (userId: string) => string;
    readonly feedback: (sessionId: string) => string;
};
export declare const CACHE_TTL: {
    readonly SESSION: 3600;
    readonly FEEDBACK: 86400;
    readonly ACTIVE_SESSION: 1800;
};
//# sourceMappingURL=interview.constants.d.ts.map
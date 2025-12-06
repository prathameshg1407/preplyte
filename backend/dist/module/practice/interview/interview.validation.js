"use strict";
// src/module/practice/interview/interview.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackQuerySchema = exports.submitResponseSchema = exports.endInterviewSchema = exports.audioChunkSchema = exports.wsMessageSchema = exports.sessionIdParamSchema = exports.sessionListQuerySchema = exports.updateSessionSchema = exports.createSessionSchema = void 0;
exports.parseCreateSession = parseCreateSession;
exports.parseUpdateSession = parseUpdateSession;
exports.parseSessionListQuery = parseSessionListQuery;
exports.parseSessionId = parseSessionId;
exports.parseWSMessage = parseWSMessage;
exports.parseSubmitResponse = parseSubmitResponse;
exports.validateAudioBuffer = validateAudioBuffer;
exports.validateSessionStatus = validateSessionStatus;
const zod_1 = require("zod");
const errors_1 = require("../../../utils/errors");
const interview_constants_1 = require("./interview.constants");
// =====================================================
// ENUMS AS ZOD TYPES
// =====================================================
const difficultyEnum = zod_1.z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD']);
const categoryEnum = zod_1.z.enum(['INTRODUCTORY', 'TECHNICAL', 'BEHAVIORAL', 'SITUATIONAL', 'CLOSING']);
// =====================================================
// SESSION SCHEMAS
// =====================================================
exports.createSessionSchema = zod_1.z.object({
    resumeId: zod_1.z
        .string()
        .min(1, 'Resume ID is required')
        .optional(),
    jobTitle: zod_1.z
        .string()
        .min(2, 'Job title must be at least 2 characters')
        .max(100, 'Job title must not exceed 100 characters')
        .trim()
        .optional()
        .default('Software Engineer'),
    companyName: zod_1.z
        .string()
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name must not exceed 100 characters')
        .trim()
        .optional()
        .nullable(),
    difficulty: difficultyEnum
        .optional()
        .default('MID'),
    focusAreas: zod_1.z
        .array(zod_1.z.string().min(1).max(50).trim())
        .max(5, 'Maximum 5 focus areas allowed')
        .optional()
        .default([]),
    targetQuestions: zod_1.z
        .number()
        .int()
        .min(interview_constants_1.INTERVIEW_SESSION_CONFIG.MIN_QUESTIONS, `Minimum ${interview_constants_1.INTERVIEW_SESSION_CONFIG.MIN_QUESTIONS} questions required`)
        .max(interview_constants_1.INTERVIEW_SESSION_CONFIG.MAX_QUESTIONS, `Maximum ${interview_constants_1.INTERVIEW_SESSION_CONFIG.MAX_QUESTIONS} questions allowed`)
        .optional()
        .default(interview_constants_1.INTERVIEW_SESSION_CONFIG.DEFAULT_QUESTIONS),
});
exports.updateSessionSchema = zod_1.z.object({
    jobTitle: zod_1.z
        .string()
        .min(2)
        .max(100)
        .trim()
        .optional(),
    companyName: zod_1.z
        .string()
        .min(2)
        .max(100)
        .trim()
        .optional()
        .nullable(),
    difficulty: difficultyEnum.optional(),
    focusAreas: zod_1.z
        .array(zod_1.z.string().min(1).max(50).trim())
        .max(5)
        .optional(),
    targetQuestions: zod_1.z
        .number()
        .int()
        .min(interview_constants_1.INTERVIEW_SESSION_CONFIG.MIN_QUESTIONS)
        .max(interview_constants_1.INTERVIEW_SESSION_CONFIG.MAX_QUESTIONS)
        .optional(),
});
// =====================================================
// QUERY SCHEMAS
// =====================================================
exports.sessionListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional().default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(50).optional().default(10),
    status: zod_1.z.enum(['CREATED', 'STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
    difficulty: difficultyEnum.optional(),
    sortBy: zod_1.z.enum(['createdAt', 'completedAt', 'overallScore']).optional().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.sessionIdParamSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1, 'Session ID is required'),
});
// =====================================================
// WEBSOCKET MESSAGE SCHEMAS
// =====================================================
exports.wsMessageSchema = zod_1.z.object({
    type: zod_1.z.string().min(1),
    data: zod_1.z.unknown().optional(),
    timestamp: zod_1.z.number().optional(),
});
exports.audioChunkSchema = zod_1.z.object({
    type: zod_1.z.literal('audio_chunk'),
    data: zod_1.z.instanceof(Buffer).or(zod_1.z.string()), // Buffer or Base64
});
exports.endInterviewSchema = zod_1.z.object({
    type: zod_1.z.literal('end_interview'),
    reason: zod_1.z.enum(['completed', 'cancelled', 'timeout']).optional().default('completed'),
});
// =====================================================
// RESPONSE SCHEMAS
// =====================================================
exports.submitResponseSchema = zod_1.z.object({
    questionId: zod_1.z.string().min(1),
    answer: zod_1.z.string().min(1, 'Answer cannot be empty').max(5000, 'Answer too long'),
    audioUrl: zod_1.z.string().url().optional(),
    timeTakenSeconds: zod_1.z.number().int().min(0).optional(),
});
// =====================================================
// FEEDBACK SCHEMAS
// =====================================================
exports.feedbackQuerySchema = zod_1.z.object({
    includeQuestionDetails: zod_1.z.coerce.boolean().optional().default(true),
    includeRecommendations: zod_1.z.coerce.boolean().optional().default(true),
});
// =====================================================
// PARSER FUNCTIONS
// =====================================================
function parseCreateSession(data) {
    try {
        return exports.createSessionSchema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const message = error.errors.map((e) => e.message).join(', ');
            throw new errors_1.BadRequestError(message);
        }
        throw error;
    }
}
function parseUpdateSession(data) {
    try {
        return exports.updateSessionSchema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const message = error.errors.map((e) => e.message).join(', ');
            throw new errors_1.BadRequestError(message);
        }
        throw error;
    }
}
function parseSessionListQuery(data) {
    try {
        return exports.sessionListQuerySchema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const message = error.errors.map((e) => e.message).join(', ');
            throw new errors_1.BadRequestError(message);
        }
        throw error;
    }
}
function parseSessionId(value) {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
    }
    throw new errors_1.BadRequestError('Invalid session ID');
}
function parseWSMessage(data) {
    try {
        return exports.wsMessageSchema.parse(data);
    }
    catch (error) {
        throw new errors_1.BadRequestError('Invalid WebSocket message format');
    }
}
function parseSubmitResponse(data) {
    try {
        return exports.submitResponseSchema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const message = error.errors.map((e) => e.message).join(', ');
            throw new errors_1.BadRequestError(message);
        }
        throw error;
    }
}
// =====================================================
// VALIDATION HELPERS
// =====================================================
function validateAudioBuffer(buffer) {
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (!Buffer.isBuffer(buffer)) {
        return { valid: false, error: 'Invalid audio data' };
    }
    if (buffer.length === 0) {
        return { valid: false, error: 'Empty audio buffer' };
    }
    if (buffer.length > maxSize) {
        return { valid: false, error: 'Audio file too large (max 25MB)' };
    }
    return { valid: true };
}
function validateSessionStatus(currentStatus, allowedStatuses) {
    if (!allowedStatuses.includes(currentStatus)) {
        return {
            valid: false,
            error: `Invalid session status. Current: ${currentStatus}, Allowed: ${allowedStatuses.join(', ')}`,
        };
    }
    return { valid: true };
}
//# sourceMappingURL=interview.validation.js.map
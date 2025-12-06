"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionIdSchema = exports.submissionsListSchema = exports.submitCodeSchema = exports.runCodeSchema = exports.questionIdSchema = exports.sessionIdSchema = exports.listSessionsSchema = exports.createSessionSchema = void 0;
const zod_1 = require("zod");
const machine_types_1 = require("./machine.types");
// =====================================================
// SCHEMAS
// =====================================================
exports.createSessionSchema = zod_1.z.object({
    body: zod_1.z.object({
        difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD'], {
            required_error: 'Difficulty is required',
        }),
        numberOfQuestions: zod_1.z
            .number({ required_error: 'Number of questions is required' })
            .int('Must be a whole number')
            .min(machine_types_1.SESSION_LIMITS.MIN_QUESTIONS, `Minimum ${machine_types_1.SESSION_LIMITS.MIN_QUESTIONS} question`)
            .max(machine_types_1.SESSION_LIMITS.MAX_QUESTIONS, `Maximum ${machine_types_1.SESSION_LIMITS.MAX_QUESTIONS} questions`),
        timeLimit: zod_1.z
            .number({ required_error: 'Time limit is required' })
            .int('Must be a whole number')
            .min(machine_types_1.SESSION_LIMITS.MIN_TIME, `Minimum ${machine_types_1.SESSION_LIMITS.MIN_TIME} minutes`)
            .max(machine_types_1.SESSION_LIMITS.MAX_TIME, `Maximum ${machine_types_1.SESSION_LIMITS.MAX_TIME} minutes`),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.listSessionsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(machine_types_1.SESSION_LIMITS.MAX_PAGE_SIZE).default(10),
        status: zod_1.z.enum(['all', 'completed', 'in_progress', 'expired']).default('all'),
        difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    }),
});
exports.sessionIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Session ID is required'),
    }),
});
exports.questionIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Session ID is required'),
        questionId: zod_1.z.string().min(1, 'Question ID is required'),
    }),
});
exports.runCodeSchema = zod_1.z.object({
    params: zod_1.z.object({
        sessionId: zod_1.z.string().min(1, 'Session ID is required'),
        questionId: zod_1.z.string().min(1, 'Question ID is required'),
    }),
    body: zod_1.z.object({
        code: zod_1.z
            .string()
            .min(1, 'Code is required')
            .max(machine_types_1.SESSION_LIMITS.MAX_CODE_LENGTH, `Code too long (max ${machine_types_1.SESSION_LIMITS.MAX_CODE_LENGTH} characters)`),
        languageId: zod_1.z.number().int().positive('Language ID must be a positive integer'),
        customInput: zod_1.z.string().optional(),
    }),
});
exports.submitCodeSchema = zod_1.z.object({
    params: zod_1.z.object({
        sessionId: zod_1.z.string().min(1, 'Session ID is required'),
        questionId: zod_1.z.string().min(1, 'Question ID is required'),
    }),
    body: zod_1.z.object({
        code: zod_1.z
            .string()
            .min(1, 'Code is required')
            .max(machine_types_1.SESSION_LIMITS.MAX_CODE_LENGTH, `Code too long (max ${machine_types_1.SESSION_LIMITS.MAX_CODE_LENGTH} characters)`),
        languageId: zod_1.z.number().int().positive('Language ID must be a positive integer'),
    }),
});
exports.submissionsListSchema = zod_1.z.object({
    params: zod_1.z.object({
        sessionId: zod_1.z.string().min(1, 'Session ID is required'),
        questionId: zod_1.z.string().min(1, 'Question ID is required'),
    }),
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(machine_types_1.SESSION_LIMITS.MAX_PAGE_SIZE).default(10),
    }),
});
exports.submissionIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Submission ID is required'),
    }),
});
//# sourceMappingURL=machine.validation.js.map
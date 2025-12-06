"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solutionsFilterSchema = exports.saveAnswerSchema = exports.questionIdSchema = exports.sessionIdSchema = exports.listSessionsSchema = exports.createSessionSchema = void 0;
const zod_1 = require("zod");
const aptitude_types_1 = require("./aptitude.types");
// =====================================================
// SCHEMAS
// =====================================================
exports.createSessionSchema = zod_1.z.object({
    body: zod_1.z.object({
        difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD'], {
            required_error: 'Difficulty is required',
            invalid_type_error: 'Difficulty must be EASY, MEDIUM, or HARD',
        }),
        questionTypes: zod_1.z
            .array(zod_1.z.enum(['QUANTITATIVE', 'VERBAL', 'LOGICAL']))
            .min(1, 'At least one question type is required')
            .max(aptitude_types_1.SESSION_LIMITS.MAX_QUESTION_TYPES, `Maximum ${aptitude_types_1.SESSION_LIMITS.MAX_QUESTION_TYPES} question types allowed`),
        numberOfQuestions: zod_1.z
            .number({ required_error: 'Number of questions is required' })
            .int('Must be a whole number')
            .min(aptitude_types_1.SESSION_LIMITS.MIN_QUESTIONS, `Minimum ${aptitude_types_1.SESSION_LIMITS.MIN_QUESTIONS} questions`)
            .max(aptitude_types_1.SESSION_LIMITS.MAX_QUESTIONS, `Maximum ${aptitude_types_1.SESSION_LIMITS.MAX_QUESTIONS} questions`),
        timeLimit: zod_1.z
            .number({ required_error: 'Time limit is required' })
            .int('Must be a whole number')
            .min(aptitude_types_1.SESSION_LIMITS.MIN_TIME, `Minimum ${aptitude_types_1.SESSION_LIMITS.MIN_TIME} minutes`)
            .max(aptitude_types_1.SESSION_LIMITS.MAX_TIME, `Maximum ${aptitude_types_1.SESSION_LIMITS.MAX_TIME} minutes`),
    }),
});
exports.listSessionsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(aptitude_types_1.SESSION_LIMITS.MAX_PAGE_SIZE).default(10),
        status: zod_1.z.enum(['all', 'completed', 'in_progress', 'expired']).default('all'),
        difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
        sortBy: zod_1.z.enum(['createdAt', 'completedAt', 'totalScore']).default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
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
exports.saveAnswerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Session ID is required'),
    }),
    body: zod_1.z.object({
        questionId: zod_1.z.string().min(1, 'Question ID is required'),
        selectedOptionId: zod_1.z.string().nullable(),
    }),
});
exports.solutionsFilterSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Session ID is required'),
    }),
    query: zod_1.z.object({
        filter: zod_1.z.enum(['all', 'correct', 'wrong', 'unanswered']).default('all'),
    }),
});
//# sourceMappingURL=aptitude.validation.js.map
"use strict";
// src/modules/instituteadmin/mock-drive/modules/modules.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderModulesSchema = exports.updateModuleSchema = exports.createModuleSchema = exports.listModulesQuerySchema = exports.moduleIdParamSchema = exports.mockDriveIdParamSchema = exports.aiInterviewConfigSchema = exports.machineCodingConfigSchema = exports.aptitudeConfigSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// ============================================
// Reusable Schemas
// ============================================
const cuidSchema = zod_1.z.string().cuid('Invalid ID format');
const percentageSchema = zod_1.z
    .number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage cannot exceed 100');
const booleanQuerySchema = zod_1.z
    .union([zod_1.z.boolean(), zod_1.z.string().transform((val) => val === 'true')])
    .default(false);
// ============================================
// Config Schemas
// ============================================
exports.aptitudeConfigSchema = zod_1.z.object({
    difficulty: zod_1.z.nativeEnum(client_1.DifficultyLevel),
    questionTypes: zod_1.z
        .array(zod_1.z.nativeEnum(client_1.QuestionType))
        .min(1, 'At least one question type required')
        .max(3),
    numberOfQuestions: zod_1.z.number().int().min(1).max(100),
    marksPerQuestion: zod_1.z.number().min(0.5).max(10),
    negativeMarking: zod_1.z.number().min(0).max(5),
});
exports.machineCodingConfigSchema = zod_1.z.object({
    difficulty: zod_1.z.nativeEnum(client_1.DifficultyLevel),
    numberOfQuestions: zod_1.z.number().int().min(1).max(10),
    allowedLanguages: zod_1.z
        .array(zod_1.z.string().min(1, 'Language name required').max(50, 'Language name too long'))
        .min(1, 'At least one language required')
        .max(10, 'Maximum 10 languages allowed'),
    partialScoring: zod_1.z.boolean().default(true),
    maxScorePerQuestion: zod_1.z.number().int().min(10).max(1000),
});
exports.aiInterviewConfigSchema = zod_1.z.object({
    difficulty: zod_1.z.nativeEnum(client_1.AiInterviewDifficulty),
    jobTitle: zod_1.z.string().min(2).max(100).trim(),
    companyName: zod_1.z.string().max(100).trim().nullable().optional(),
    focusAreas: zod_1.z.array(zod_1.z.string().min(1).max(50).trim()).min(1).max(10),
    targetQuestions: zod_1.z.number().int().min(5).max(20),
});
const moduleConfigSchema = zod_1.z.union([
    exports.aptitudeConfigSchema,
    exports.machineCodingConfigSchema,
    exports.aiInterviewConfigSchema,
]);
// ============================================
// Param Schemas
// ============================================
exports.mockDriveIdParamSchema = zod_1.z.object({
    id: cuidSchema,
});
exports.moduleIdParamSchema = zod_1.z.object({
    id: cuidSchema,
    moduleId: cuidSchema,
});
// ============================================
// Query Schemas
// ============================================
exports.listModulesQuerySchema = zod_1.z.object({
    includeInactive: booleanQuerySchema,
    checkAvailability: booleanQuerySchema,
});
// ============================================
// Create Module Schema
// ============================================
exports.createModuleSchema = zod_1.z
    .object({
    moduleType: zod_1.z.nativeEnum(client_1.MockDriveModuleType),
    order: zod_1.z.number().int().min(1).max(10),
    name: zod_1.z.string().max(100).trim().nullable().optional(),
    timeLimit: zod_1.z.number().int().min(5).max(300),
    weightage: percentageSchema,
    config: moduleConfigSchema,
    passingScore: percentageSchema.nullable().optional(),
    instructions: zod_1.z.string().max(5000).trim().nullable().optional(),
})
    .superRefine((data, ctx) => {
    const { moduleType, config } = data;
    if (moduleType === client_1.MockDriveModuleType.APTITUDE) {
        if (!('questionTypes' in config) || !('marksPerQuestion' in config)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Aptitude config requires questionTypes and marksPerQuestion',
                path: ['config'],
            });
        }
    }
    if (moduleType === client_1.MockDriveModuleType.MACHINE_CODING) {
        if (!('allowedLanguages' in config) || !('maxScorePerQuestion' in config)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'Machine coding config requires allowedLanguages and maxScorePerQuestion',
                path: ['config'],
            });
        }
    }
    if (moduleType === client_1.MockDriveModuleType.AI_INTERVIEW) {
        if (!('jobTitle' in config) || !('focusAreas' in config)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'AI interview config requires jobTitle and focusAreas',
                path: ['config'],
            });
        }
    }
});
// ============================================
// Update Module Schema
// ============================================
exports.updateModuleSchema = zod_1.z.object({
    order: zod_1.z.number().int().min(1).max(10).optional(),
    name: zod_1.z.string().max(100).trim().nullable().optional(),
    timeLimit: zod_1.z.number().int().min(5).max(300).optional(),
    weightage: percentageSchema.optional(),
    config: moduleConfigSchema.optional(),
    passingScore: percentageSchema.nullable().optional(),
    instructions: zod_1.z.string().max(5000).trim().nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
});
// ============================================
// Reorder Modules Schema
// ============================================
exports.reorderModulesSchema = zod_1.z
    .object({
    modules: zod_1.z
        .array(zod_1.z.object({ moduleId: cuidSchema, order: zod_1.z.number().int().min(1).max(10) }))
        .min(1)
        .max(10),
})
    .refine((data) => new Set(data.modules.map((m) => m.order)).size === data.modules.length, { message: 'Duplicate orders not allowed', path: ['modules'] })
    .refine((data) => new Set(data.modules.map((m) => m.moduleId)).size === data.modules.length, { message: 'Duplicate module IDs not allowed', path: ['modules'] });
//# sourceMappingURL=modules.validation.js.map
"use strict";
// src/modules/instituteadmin/mock-drive/analytics/analytics.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDriveIdParamSchema = exports.exportAnalyticsSchema = exports.completionTrendQuerySchema = exports.demographicAnalysisQuerySchema = exports.questionAnalysisQuerySchema = exports.timeAnalysisQuerySchema = exports.modulePerformanceQuerySchema = exports.scoreDistributionQuerySchema = exports.overviewQuerySchema = exports.analyticsQuerySchema = void 0;
const zod_1 = require("zod");
const validation_utils_1 = require("../common/validation.utils");
// ============================================
// Analytics Query Schema
// ============================================
exports.analyticsQuerySchema = zod_1.z
    .object({
    batchId: validation_utils_1.cuidSchema.optional(),
    startDate: validation_utils_1.coerceDateSchema.optional(),
    endDate: validation_utils_1.coerceDateSchema.optional(),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
    }
    return true;
}, {
    message: 'Start date must be before end date',
    path: ['endDate'],
});
// ============================================
// Overview Query Schema
// ============================================
exports.overviewQuerySchema = zod_1.z.object({
    batchId: validation_utils_1.cuidSchema.optional(),
});
// ============================================
// Score Distribution Query Schema
// ============================================
exports.scoreDistributionQuerySchema = zod_1.z.object({
    batchId: validation_utils_1.cuidSchema.optional(),
    bucketSize: zod_1.z
        .union([zod_1.z.string().transform(Number), zod_1.z.number()])
        .pipe(zod_1.z.number().int().min(5).max(25).default(10))
        .optional(),
});
// ============================================
// Module Performance Query Schema
// ============================================
exports.modulePerformanceQuerySchema = zod_1.z.object({
    batchId: validation_utils_1.cuidSchema.optional(),
    moduleId: validation_utils_1.cuidSchema.optional(),
});
// ============================================
// Time Analysis Query Schema
// ============================================
exports.timeAnalysisQuerySchema = zod_1.z.object({
    batchId: validation_utils_1.cuidSchema.optional(),
    includeModuleBreakdown: validation_utils_1.booleanQuerySchema.default(true),
});
// ============================================
// Question Analysis Query Schema (for Aptitude modules)
// ============================================
exports.questionAnalysisQuerySchema = zod_1.z.object({
    moduleId: validation_utils_1.cuidSchema,
    batchId: validation_utils_1.cuidSchema.optional(),
    sortBy: zod_1.z.enum(['correctRate', 'totalAttempts', 'averageTime']).default('correctRate'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    limit: zod_1.z
        .union([zod_1.z.string().transform(Number), zod_1.z.number()])
        .pipe(zod_1.z.number().int().min(1).max(100).default(50))
        .optional(),
});
// ============================================
// Department/Year Analysis Query Schema
// ============================================
exports.demographicAnalysisQuerySchema = zod_1.z.object({
    batchId: validation_utils_1.cuidSchema.optional(),
    groupBy: zod_1.z.enum(['department', 'courseYear', 'both']).default('both'),
});
// ============================================
// Completion Trend Query Schema
// ============================================
exports.completionTrendQuerySchema = zod_1.z
    .object({
    batchId: validation_utils_1.cuidSchema.optional(),
    startDate: validation_utils_1.coerceDateSchema.optional(),
    endDate: validation_utils_1.coerceDateSchema.optional(),
    granularity: zod_1.z.enum(['hour', 'day', 'week']).default('day'),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
    }
    return true;
}, {
    message: 'Start date must be before end date',
    path: ['endDate'],
});
// ============================================
// Export Analytics Schema
// ============================================
exports.exportAnalyticsSchema = zod_1.z.object({
    format: zod_1.z.enum(['csv', 'xlsx', 'json', 'pdf']).default('pdf'),
    sections: zod_1.z
        .array(zod_1.z.enum([
        'overview',
        'scoreDistribution',
        'modulePerformance',
        'batchComparison',
        'timeAnalysis',
        'questionAnalysis',
        'demographics',
        'completionTrend',
    ]))
        .min(1, 'At least one section is required')
        .default([
        'overview',
        'scoreDistribution',
        'modulePerformance',
        'batchComparison',
    ]),
    batchId: validation_utils_1.cuidSchema.optional(),
});
// ============================================
// Param Schema
// ============================================
exports.mockDriveIdParamSchema = zod_1.z.object({
    id: validation_utils_1.cuidSchema,
});
//# sourceMappingURL=analytics.validation.js.map
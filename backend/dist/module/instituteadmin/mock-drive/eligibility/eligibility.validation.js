"use strict";
// src/modules/instituteadmin/mock-drive/eligibility/eligibility.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEligibilitySchema = exports.eligibleStudentsQuerySchema = exports.updateEligibilitySchema = exports.setEligibilitySchema = void 0;
const zod_1 = require("zod");
const validation_utils_1 = require("../common/validation.utils");
// ============================================
// Custom Rule Schema
// ============================================
const customRuleOperatorSchema = zod_1.z.enum([
    'equals',
    'not_equals',
    'greater_than',
    'less_than',
    'greater_than_or_equals',
    'less_than_or_equals',
    'contains',
    'not_contains',
    'in',
    'not_in',
]);
const customRuleValueSchema = zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number(),
    zod_1.z.boolean(),
    zod_1.z.array(zod_1.z.string()),
    zod_1.z.array(zod_1.z.number()),
]);
const customRuleSchema = zod_1.z.object({
    field: zod_1.z
        .string()
        .min(1, 'Field name is required')
        .max(50, 'Field name cannot exceed 50 characters'),
    operator: customRuleOperatorSchema,
    value: customRuleValueSchema,
});
const customRulesConfigSchema = zod_1.z.object({
    rules: zod_1.z
        .array(customRuleSchema)
        .min(1, 'At least one rule is required when custom rules are defined')
        .max(20, 'Maximum 20 custom rules allowed'),
    matchType: zod_1.z.enum(['all', 'any']).default('all'),
});
// ============================================
// CGPA Validation Helper
// ============================================
const cgpaSchema = zod_1.z
    .number()
    .min(0, 'CGPA cannot be negative')
    .max(10, 'CGPA cannot exceed 10')
    .nullable()
    .optional();
const marksSchema = zod_1.z
    .number()
    .min(0, 'Marks cannot be negative')
    .max(100, 'Marks cannot exceed 100')
    .nullable()
    .optional();
// ============================================
// Base Eligibility Schema (split so we can derive partial/complete variants)
// ============================================
const baseEligibilitySchema = zod_1.z.object({
    minCgpa: cgpaSchema,
    maxCgpa: cgpaSchema,
    minMarks10: marksSchema,
    minMarks12: marksSchema,
    allowedDepartments: zod_1.z
        .array(zod_1.z.string().min(1).max(100).trim())
        .max(50, 'Maximum 50 departments allowed')
        .optional()
        .default([]),
    allowedCourseYears: zod_1.z
        .array(zod_1.z.string().min(1).max(20).trim())
        .max(10, 'Maximum 10 course years allowed')
        .optional()
        .default([]),
    requiredSkills: zod_1.z
        .array(zod_1.z.string().min(1).max(50).trim())
        .max(30, 'Maximum 30 skills allowed')
        .optional()
        .default([]),
    maxBacklogs: zod_1.z
        .number()
        .int('Max backlogs must be a whole number')
        .min(0, 'Max backlogs cannot be negative')
        .max(20, 'Max backlogs cannot exceed 20')
        .nullable()
        .optional(),
    customRules: customRulesConfigSchema.nullable().optional(),
});
// ============================================
// Set Eligibility Schema (complete object)
// ============================================
exports.setEligibilitySchema = baseEligibilitySchema.refine((data) => {
    if (data.minCgpa !== null &&
        data.minCgpa !== undefined &&
        data.maxCgpa !== null &&
        data.maxCgpa !== undefined) {
        return data.minCgpa <= data.maxCgpa;
    }
    return true;
}, {
    message: 'Minimum CGPA cannot be greater than maximum CGPA',
    path: ['minCgpa'],
});
// ============================================
// Update Eligibility Schema (partial object for PATCH semantics)
// ============================================
// NOTE: call .partial() on the plain Zod object (baseEligibilitySchema) and then refine the result.
exports.updateEligibilitySchema = baseEligibilitySchema.partial().refine((data) => {
    // When partial, fields may be undefined — only compare when both provided and not null.
    if (data.minCgpa !== null &&
        data.minCgpa !== undefined &&
        data.maxCgpa !== null &&
        data.maxCgpa !== undefined) {
        return data.minCgpa <= data.maxCgpa;
    }
    return true;
}, {
    message: 'Minimum CGPA cannot be greater than maximum CGPA',
    path: ['minCgpa'],
});
// ============================================
// Query Schema
// ============================================
exports.eligibleStudentsQuerySchema = validation_utils_1.paginationSchema.extend({
    department: zod_1.z.string().max(100).optional(),
    courseYear: zod_1.z.string().max(20).optional(),
    search: validation_utils_1.searchSchema,
});
// ============================================
// Check Eligibility Schema (for testing)
// ============================================
exports.checkEligibilitySchema = zod_1.z.object({
    userId: zod_1.z.string().cuid('Invalid user ID'),
});
//# sourceMappingURL=eligibility.validation.js.map
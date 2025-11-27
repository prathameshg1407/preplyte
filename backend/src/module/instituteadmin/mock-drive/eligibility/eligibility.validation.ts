// src/modules/instituteadmin/mock-drive/eligibility/eligibility.validation.ts

import { z } from 'zod';
import { paginationSchema, searchSchema } from '../common/validation.utils';

// ============================================
// Custom Rule Schema
// ============================================

const customRuleOperatorSchema = z.enum([
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

const customRuleValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
]);

const customRuleSchema = z.object({
  field: z
    .string()
    .min(1, 'Field name is required')
    .max(50, 'Field name cannot exceed 50 characters'),
  operator: customRuleOperatorSchema,
  value: customRuleValueSchema,
});

const customRulesConfigSchema = z.object({
  rules: z
    .array(customRuleSchema)
    .min(1, 'At least one rule is required when custom rules are defined')
    .max(20, 'Maximum 20 custom rules allowed'),
  matchType: z.enum(['all', 'any']).default('all'),
});

// ============================================
// CGPA Validation Helper
// ============================================

const cgpaSchema = z
  .number()
  .min(0, 'CGPA cannot be negative')
  .max(10, 'CGPA cannot exceed 10')
  .nullable()
  .optional();

const marksSchema = z
  .number()
  .min(0, 'Marks cannot be negative')
  .max(100, 'Marks cannot exceed 100')
  .nullable()
  .optional();

// ============================================
// Base Eligibility Schema (split so we can derive partial/complete variants)
// ============================================

const baseEligibilitySchema = z.object({
  minCgpa: cgpaSchema,
  maxCgpa: cgpaSchema,
  minMarks10: marksSchema,
  minMarks12: marksSchema,
  allowedDepartments: z
    .array(z.string().min(1).max(100).trim())
    .max(50, 'Maximum 50 departments allowed')
    .optional()
    .default([]),
  allowedCourseYears: z
    .array(z.string().min(1).max(20).trim())
    .max(10, 'Maximum 10 course years allowed')
    .optional()
    .default([]),
  requiredSkills: z
    .array(z.string().min(1).max(50).trim())
    .max(30, 'Maximum 30 skills allowed')
    .optional()
    .default([]),
  maxBacklogs: z
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

export const setEligibilitySchema = baseEligibilitySchema.refine(
  (data) => {
    if (
      data.minCgpa !== null &&
      data.minCgpa !== undefined &&
      data.maxCgpa !== null &&
      data.maxCgpa !== undefined
    ) {
      return data.minCgpa <= data.maxCgpa;
    }
    return true;
  },
  {
    message: 'Minimum CGPA cannot be greater than maximum CGPA',
    path: ['minCgpa'],
  }
);

// ============================================
// Update Eligibility Schema (partial object for PATCH semantics)
// ============================================

// NOTE: call .partial() on the plain Zod object (baseEligibilitySchema) and then refine the result.
export const updateEligibilitySchema = baseEligibilitySchema.partial().refine(
  (data) => {
    // When partial, fields may be undefined — only compare when both provided and not null.
    if (
      data.minCgpa !== null &&
      data.minCgpa !== undefined &&
      data.maxCgpa !== null &&
      data.maxCgpa !== undefined
    ) {
      return data.minCgpa <= data.maxCgpa;
    }
    return true;
  },
  {
    message: 'Minimum CGPA cannot be greater than maximum CGPA',
    path: ['minCgpa'],
  }
);

// ============================================
// Query Schema
// ============================================

export const eligibleStudentsQuerySchema = paginationSchema.extend({
  department: z.string().max(100).optional(),
  courseYear: z.string().max(20).optional(),
  search: searchSchema,
});

// ============================================
// Check Eligibility Schema (for testing)
// ============================================

export const checkEligibilitySchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
});

// ============================================
// Type Exports
// ============================================

export type SetEligibilityInput = z.infer<typeof setEligibilitySchema>;
export type UpdateEligibilityInput = z.infer<typeof updateEligibilitySchema>;
export type EligibleStudentsQueryInput = z.infer<typeof eligibleStudentsQuerySchema>;
export type CustomRuleInput = z.infer<typeof customRuleSchema>;
export type CustomRulesConfigInput = z.infer<typeof customRulesConfigSchema>;

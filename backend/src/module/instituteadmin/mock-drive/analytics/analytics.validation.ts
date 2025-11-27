// src/modules/instituteadmin/mock-drive/analytics/analytics.validation.ts

import { z } from 'zod';
import { cuidSchema, coerceDateSchema, booleanQuerySchema } from '../common/validation.utils';

// ============================================
// Analytics Query Schema
// ============================================

export const analyticsQuerySchema = z
  .object({
    batchId: cuidSchema.optional(),
    startDate: coerceDateSchema.optional(),
    endDate: coerceDateSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
      }
      return true;
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  );

// ============================================
// Overview Query Schema
// ============================================

export const overviewQuerySchema = z.object({
  batchId: cuidSchema.optional(),
});

// ============================================
// Score Distribution Query Schema
// ============================================

export const scoreDistributionQuerySchema = z.object({
  batchId: cuidSchema.optional(),
  bucketSize: z
    .union([z.string().transform(Number), z.number()])
    .pipe(z.number().int().min(5).max(25).default(10))
    .optional(),
});

// ============================================
// Module Performance Query Schema
// ============================================

export const modulePerformanceQuerySchema = z.object({
  batchId: cuidSchema.optional(),
  moduleId: cuidSchema.optional(),
});

// ============================================
// Time Analysis Query Schema
// ============================================

export const timeAnalysisQuerySchema = z.object({
  batchId: cuidSchema.optional(),
  includeModuleBreakdown: booleanQuerySchema.default(true),
});

// ============================================
// Question Analysis Query Schema (for Aptitude modules)
// ============================================

export const questionAnalysisQuerySchema = z.object({
  moduleId: cuidSchema,
  batchId: cuidSchema.optional(),
  sortBy: z.enum(['correctRate', 'totalAttempts', 'averageTime']).default('correctRate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z
    .union([z.string().transform(Number), z.number()])
    .pipe(z.number().int().min(1).max(100).default(50))
    .optional(),
});

// ============================================
// Department/Year Analysis Query Schema
// ============================================

export const demographicAnalysisQuerySchema = z.object({
  batchId: cuidSchema.optional(),
  groupBy: z.enum(['department', 'courseYear', 'both']).default('both'),
});

// ============================================
// Completion Trend Query Schema
// ============================================

export const completionTrendQuerySchema = z
  .object({
    batchId: cuidSchema.optional(),
    startDate: coerceDateSchema.optional(),
    endDate: coerceDateSchema.optional(),
    granularity: z.enum(['hour', 'day', 'week']).default('day'),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate;
      }
      return true;
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  );

// ============================================
// Export Analytics Schema
// ============================================

export const exportAnalyticsSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'json', 'pdf']).default('pdf'),
  sections: z
    .array(
      z.enum([
        'overview',
        'scoreDistribution',
        'modulePerformance',
        'batchComparison',
        'timeAnalysis',
        'questionAnalysis',
        'demographics',
        'completionTrend',
      ])
    )
    .min(1, 'At least one section is required')
    .default([
      'overview',
      'scoreDistribution',
      'modulePerformance',
      'batchComparison',
    ]),
  batchId: cuidSchema.optional(),
});

// ============================================
// Param Schema
// ============================================

export const mockDriveIdParamSchema = z.object({
  id: cuidSchema,
});

// ============================================
// Type Exports
// ============================================

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type OverviewQueryInput = z.infer<typeof overviewQuerySchema>;
export type ScoreDistributionQueryInput = z.infer<typeof scoreDistributionQuerySchema>;
export type ModulePerformanceQueryInput = z.infer<typeof modulePerformanceQuerySchema>;
export type TimeAnalysisQueryInput = z.infer<typeof timeAnalysisQuerySchema>;
export type QuestionAnalysisQueryInput = z.infer<typeof questionAnalysisQuerySchema>;
export type DemographicAnalysisQueryInput = z.infer<typeof demographicAnalysisQuerySchema>;
export type CompletionTrendQueryInput = z.infer<typeof completionTrendQuerySchema>;
export type ExportAnalyticsInput = z.infer<typeof exportAnalyticsSchema>;
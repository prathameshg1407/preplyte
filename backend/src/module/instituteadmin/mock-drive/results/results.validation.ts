// src/modules/instituteadmin/mock-drive/results/results.validation.ts

import { z } from 'zod';
import { MockDriveAttemptStatus } from '@prisma/client';

// ============================================
// Constants (inline to avoid circular deps)
// ============================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ============================================
// Reusable Schemas
// ============================================

const cuidSchema = z.string().cuid('Invalid ID format');

const booleanQuerySchema = z
  .union([z.boolean(), z.string().transform((val) => val === 'true')])
  .optional();

// ============================================
// Param Schemas
// ============================================

export const mockDriveIdParamSchema = z.object({
  id: cuidSchema,
});

export const attemptIdParamSchema = z.object({
  id: cuidSchema,
  attemptId: cuidSchema,
});

// ============================================
// List Results Query Schema
// ============================================

export const listResultsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  batchId: cuidSchema.optional(),
  status: z.nativeEnum(MockDriveAttemptStatus).optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['rank', 'totalScore', 'completedAt', 'studentName']).default('rank'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================
// Export Results Query Schema
// ============================================

export const exportResultsQuerySchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  batchId: cuidSchema.optional(),
});

// ============================================
// Statistics Query Schema
// ============================================

export const statisticsQuerySchema = z.object({
  batchId: cuidSchema.optional(),
});

// ============================================
// Type Exports
// ============================================

export type ListResultsQuery = z.infer<typeof listResultsQuerySchema>;
export type ExportResultsQuery = z.infer<typeof exportResultsQuerySchema>;
export type StatisticsQuery = z.infer<typeof statisticsQuerySchema>;
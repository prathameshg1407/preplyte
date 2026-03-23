// src/modules/instituteadmin/mock-drive/batch/batch.validation.ts

import { z } from 'zod';
import { MockDriveBatchStatus } from '@prisma/client';

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ============================================
// Reusable Schemas
// ============================================

const cuidSchema = z.string().cuid('Invalid ID format');

const dateSchema = z.coerce.date({
  required_error: 'Date is required',
  invalid_type_error: 'Invalid date format',
});

// ============================================
// Param Schemas
// ============================================

export const mockDriveIdParamSchema = z.object({
  id: cuidSchema,
});

export const batchIdParamSchema = z.object({
  id: cuidSchema,
  batchId: cuidSchema,
});

// ============================================
// Create Batch Schema
// ============================================

export const createBatchSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Batch name is required')
      .max(100, 'Batch name cannot exceed 100 characters')
      .trim(),
    scheduledStartTime: dateSchema,
    scheduledEndTime: dateSchema,
    maxCapacity: z
      .number()
      .int('Capacity must be a whole number')
      .min(1, 'Capacity must be at least 1')
      .max(100, 'Capacity cannot exceed 100 (platform limit)')
      .nullable()
      .optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').nullable().optional(),
  })
  .refine((data) => data.scheduledEndTime > data.scheduledStartTime, {
    message: 'End time must be after start time',
    path: ['scheduledEndTime'],
  })
  .refine(
    (data) => data.scheduledStartTime > new Date(),
    {
      message: 'Scheduled start time must be in the future',
      path: ['scheduledStartTime'],
    }
  );

// ============================================
// Update Batch Schema
// ============================================

export const updateBatchSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Batch name cannot be empty')
      .max(100, 'Batch name cannot exceed 100 characters')
      .trim()
      .optional(),
    scheduledStartTime: dateSchema.optional(),
    scheduledEndTime: dateSchema.optional(),
    maxCapacity: z
      .number()
      .int('Capacity must be a whole number')
      .min(1, 'Capacity must be at least 1')
      .max(100, 'Capacity cannot exceed 100 (platform limit)')
      .nullable()
      .optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').nullable().optional(),
    status: z.nativeEnum(MockDriveBatchStatus).optional(),
  })
  .refine(
    (data) => {
      if (data.scheduledStartTime && data.scheduledEndTime) {
        return data.scheduledEndTime > data.scheduledStartTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['scheduledEndTime'],
    }
  );

// ============================================
// Auto Create Batches Schema
// ============================================

export const autoCreateBatchesSchema = z
  .object({
    batchSize: z
      .number()
      .int('Batch size must be a whole number')
      .min(1, 'Batch size must be at least 1')
      .max(100, 'Batch size cannot exceed 100 (platform limit)'),
    startTime: dateSchema,
    intervalMinutes: z
      .number()
      .int('Interval must be a whole number')
      .min(30, 'Interval must be at least 30 minutes')
      .max(1440, 'Interval cannot exceed 24 hours'),
    prefix: z
      .string()
      .max(50, 'Prefix cannot exceed 50 characters')
      .trim()
      .default('Batch'),
  })
  .refine(
    (data) => data.startTime > new Date(),
    {
      message: 'Start time must be in the future',
      path: ['startTime'],
    }
  );

// ============================================
// Assign/Unassign Students Schema
// ============================================

export const assignStudentsSchema = z.object({
  registrationIds: z
    .array(cuidSchema)
    .min(1, 'At least one registration is required')
    .max(100, 'Cannot process more than 100 students at once (batch limit)'),
});

// ============================================
// List Batches Query Schema
// ============================================

export const listBatchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  status: z.nativeEnum(MockDriveBatchStatus).optional(),
  sortBy: z.enum(['scheduledStartTime', 'batchNumber', 'createdAt']).default('scheduledStartTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================
// Type Exports
// ============================================

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
export type AutoCreateBatchesInput = z.infer<typeof autoCreateBatchesSchema>;
export type AssignStudentsInput = z.infer<typeof assignStudentsSchema>;
export type ListBatchesQueryInput = z.infer<typeof listBatchesQuerySchema>;
// src/modules/instituteadmin/mock-drive/mockdrive.validation.ts

import { z } from 'zod';
import { MockDriveStatus } from '@prisma/client';
import {
  optionalDateSchema,
  cuidSchema,
  paginationSchema,
  sortOrderSchema,
  searchSchema,
} from './common/validation.utils';

// ============================================
// Proctoring Settings Schema
// ============================================

export const proctoringSettingsSchema = z.object({
  detectTabSwitch: z.boolean().default(true),
  maxTabSwitches: z.number().int().min(0).max(100).default(3),
  requireFullscreen: z.boolean().default(false),
  detectCopyPaste: z.boolean().default(true),
  webcamRequired: z.boolean().default(false),
  screenshareRequired: z.boolean().default(false),
});

// ============================================
// Create Mock Drive Schema
// ============================================

export const createMockDriveSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title must not exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(5000, 'Description must not exceed 5000 characters')
      .trim()
      .optional()
      .nullable(),
    instructions: z
      .string()
      .max(10000, 'Instructions must not exceed 10000 characters')
      .trim()
      .optional()
      .nullable(),
    registrationStartDate: optionalDateSchema,
    registrationEndDate: optionalDateSchema,
    maxRegistrations: z
      .number()
      .int()
      .min(1, 'Max registrations must be at least 1')
      .max(100000, 'Max registrations cannot exceed 100000')
      .optional()
      .nullable(),
    driveStartDate: optionalDateSchema,
    driveEndDate: optionalDateSchema,
    allowLateSubmission: z.boolean().default(false),
    showLeaderboard: z.boolean().default(true),
    showResultsImmediately: z.boolean().default(false),
    resultsReleaseDate: optionalDateSchema,
    shuffleQuestions: z.boolean().default(true),
    enableProctoring: z.boolean().default(false),
    proctoringSettings: proctoringSettingsSchema.optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.registrationStartDate && data.registrationEndDate) {
        return new Date(data.registrationStartDate) < new Date(data.registrationEndDate);
      }
      return true;
    },
    {
      message: 'Registration start date must be before end date',
      path: ['registrationEndDate'],
    }
  )
  .refine(
    (data) => {
      if (data.driveStartDate && data.driveEndDate) {
        return new Date(data.driveStartDate) < new Date(data.driveEndDate);
      }
      return true;
    },
    {
      message: 'Drive start date must be before end date',
      path: ['driveEndDate'],
    }
  )
  .refine(
    (data) => {
      if (data.registrationEndDate && data.driveStartDate) {
        return new Date(data.registrationEndDate) <= new Date(data.driveStartDate);
      }
      return true;
    },
    {
      message: 'Registration must end before or when drive starts',
      path: ['driveStartDate'],
    }
  )
  .refine(
    (data) => {
      // If proctoring is disabled, settings should be null or undefined
      if (!data.enableProctoring && data.proctoringSettings) {
        return true; // Allow but will be ignored
      }
      return true;
    },
    {
      message: 'Proctoring settings are only applicable when proctoring is enabled',
      path: ['proctoringSettings'],
    }
  );

// ============================================
// Update Mock Drive Schema
// ============================================

export const updateMockDriveSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title must not exceed 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(5000, 'Description must not exceed 5000 characters')
      .trim()
      .optional()
      .nullable(),
    instructions: z
      .string()
      .max(10000, 'Instructions must not exceed 10000 characters')
      .trim()
      .optional()
      .nullable(),
    registrationStartDate: optionalDateSchema,
    registrationEndDate: optionalDateSchema,
    maxRegistrations: z
      .number()
      .int()
      .min(1, 'Max registrations must be at least 1')
      .max(100000, 'Max registrations cannot exceed 100000')
      .optional()
      .nullable(),
    driveStartDate: optionalDateSchema,
    driveEndDate: optionalDateSchema,
    allowLateSubmission: z.boolean().optional(),
    showLeaderboard: z.boolean().optional(),
    showResultsImmediately: z.boolean().optional(),
    resultsReleaseDate: optionalDateSchema,
    shuffleQuestions: z.boolean().optional(),
    enableProctoring: z.boolean().optional(),
    proctoringSettings: proctoringSettingsSchema.optional().nullable(),
    status: z.nativeEnum(MockDriveStatus).optional(),
  })
  .refine(
    (data) => {
      if (data.registrationStartDate && data.registrationEndDate) {
        return new Date(data.registrationStartDate) < new Date(data.registrationEndDate);
      }
      return true;
    },
    {
      message: 'Registration start date must be before end date',
      path: ['registrationEndDate'],
    }
  )
  .refine(
    (data) => {
      if (data.driveStartDate && data.driveEndDate) {
        return new Date(data.driveStartDate) < new Date(data.driveEndDate);
      }
      return true;
    },
    {
      message: 'Drive start date must be before end date',
      path: ['driveEndDate'],
    }
  );

// ============================================
// Query Parameters Schema
// ============================================

export const listMockDrivesQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(MockDriveStatus).optional(),
  search: searchSchema,
  sortBy: z
    .enum(['createdAt', 'title', 'driveStartDate', 'registrationEndDate'])
    .default('createdAt'),
  sortOrder: sortOrderSchema,
});

// ============================================
// ID Parameter Schema
// ============================================

export const mockDriveIdParamSchema = z.object({
  id: cuidSchema,
});

// ============================================
// Type Exports
// ============================================

export type CreateMockDriveInput = z.infer<typeof createMockDriveSchema>;
export type UpdateMockDriveInput = z.infer<typeof updateMockDriveSchema>;
export type ListMockDrivesQueryInput = z.infer<typeof listMockDrivesQuerySchema>;
export type ProctoringSettingsInput = z.infer<typeof proctoringSettingsSchema>;
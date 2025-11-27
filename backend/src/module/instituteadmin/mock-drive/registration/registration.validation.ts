// src/modules/instituteadmin/mock-drive/registration/registration.validation.ts

import { z } from 'zod';
import { MockDriveRegistrationStatus } from '@prisma/client';
import {
  paginationSchema,
  sortOrderSchema,
  cuidSchema,
  searchSchema,
  notesSchema,
  booleanQuerySchema,
} from '../common/validation.utils';

// ============================================
// Update Registration Schema
// ============================================

export const updateRegistrationSchema = z.object({
  status: z.nativeEnum(MockDriveRegistrationStatus, {
    errorMap: () => ({ message: 'Invalid registration status' }),
  }),
  adminNotes: notesSchema,
});

// ============================================
// Bulk Update Schema
// ============================================

export const bulkUpdateRegistrationSchema = z
  .object({
    registrationIds: z
      .array(cuidSchema)
      .min(1, 'At least one registration is required')
      .max(100, 'Cannot update more than 100 registrations at once'),
    status: z.enum(
      [MockDriveRegistrationStatus.APPROVED, MockDriveRegistrationStatus.REJECTED],
      {
        errorMap: () => ({
          message: 'Bulk update only supports APPROVED or REJECTED status',
        }),
      }
    ),
    adminNotes: notesSchema,
  })
  .refine(
    (data) => {
      // Ensure unique registration IDs
      return new Set(data.registrationIds).size === data.registrationIds.length;
    },
    {
      message: 'Duplicate registration IDs are not allowed',
      path: ['registrationIds'],
    }
  );

// ============================================
// List Query Schema
// ============================================

export const listRegistrationsQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(MockDriveRegistrationStatus).optional(),
  batchId: cuidSchema.optional(),
  hasBatch: booleanQuerySchema,
  search: searchSchema,
  sortBy: z.enum(['registeredAt', 'studentName', 'status']).default('registeredAt'),
  sortOrder: sortOrderSchema,
});

// ============================================
// Param Schemas
// ============================================

export const registrationIdParamSchema = z.object({
  id: cuidSchema,
  regId: cuidSchema,
});

export const mockDriveIdParamSchema = z.object({
  id: cuidSchema,
});

// ============================================
// Type Exports
// ============================================

export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type BulkUpdateRegistrationInput = z.infer<typeof bulkUpdateRegistrationSchema>;
export type ListRegistrationsQueryInput = z.infer<typeof listRegistrationsQuerySchema>;
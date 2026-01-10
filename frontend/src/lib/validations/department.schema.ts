// src/lib/validations/department.schema.ts

import { z } from 'zod';

// =====================================================
// CREATE DEPARTMENT SCHEMA
// =====================================================

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must not exceed 100 characters')
    .trim(),

  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(10, 'Code must not exceed 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers')
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  isActive: z.boolean().optional().default(true),
});

// =====================================================
// UPDATE DEPARTMENT SCHEMA
// =====================================================

export const updateDepartmentSchema = createDepartmentSchema.partial();

// =====================================================
// BULK CREATE SCHEMA
// =====================================================

export const bulkCreateDepartmentSchema = z.object({
  departments: z
    .array(
      z.object({
        name: z.string().min(2).max(100).trim(),
        code: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/).optional().or(z.literal('')),
        description: z.string().max(500).trim().optional().or(z.literal('')),
      })
    )
    .min(1, 'At least one department is required')
    .max(50, 'Maximum 50 departments at once'),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>;
export type BulkCreateDepartmentFormData = z.infer<typeof bulkCreateDepartmentSchema>;
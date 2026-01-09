// src/module/instituteadmin/department/department.validation.ts

import { z } from 'zod';
import { BadRequestError } from '../../../utils/errors';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must not exceed 100 characters')
    .trim(),

  code: z
    .string()
    .min(2, 'Department code must be at least 2 characters')
    .max(10, 'Department code must not exceed 10 characters')
    .regex(
      /^[A-Z0-9]+$/,
      'Department code must contain only uppercase letters and numbers'
    )
    .optional()
    .transform((val) => val?.toUpperCase()),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),

  isActive: z.boolean().optional().default(true),
});

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name must not exceed 100 characters')
    .trim()
    .optional(),

  code: z
    .string()
    .min(2, 'Department code must be at least 2 characters')
    .max(10, 'Department code must not exceed 10 characters')
    .regex(
      /^[A-Z0-9]+$/,
      'Department code must contain only uppercase letters and numbers'
    )
    .optional()
    .transform((val) => val?.toUpperCase()),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export const departmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  sortBy: z
    .enum(['name', 'code', 'createdAt', 'studentCount'])
    .optional()
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const departmentIdSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
});

export const bulkCreateDepartmentSchema = z.object({
  departments: z
    .array(createDepartmentSchema)
    .min(1, 'At least one department is required')
    .max(50, 'Maximum 50 departments can be created at once'),
});

export const toggleStatusSchema = z.object({
  isActive: z.boolean(),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DepartmentQueryParams = z.infer<typeof departmentQuerySchema>;
export type BulkCreateDepartmentInput = z.infer<typeof bulkCreateDepartmentSchema>;
export type ToggleStatusInput = z.infer<typeof toggleStatusSchema>;

// =====================================================
// PARSER FUNCTIONS
// =====================================================

export const parseCreateDepartment = (data: unknown): CreateDepartmentInput => {
  return createDepartmentSchema.parse(data);
};

export const parseUpdateDepartment = (data: unknown): UpdateDepartmentInput => {
  return updateDepartmentSchema.parse(data);
};

export const parseDepartmentQuery = (data: unknown): DepartmentQueryParams => {
  return departmentQuerySchema.parse(data);
};

export const parseDepartmentId = (value: unknown): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  throw new BadRequestError('Invalid department ID');
};

export const parseBulkCreateDepartment = (data: unknown): BulkCreateDepartmentInput => {
  return bulkCreateDepartmentSchema.parse(data);
};

export const parseToggleStatus = (data: unknown): ToggleStatusInput => {
  return toggleStatusSchema.parse(data);
};
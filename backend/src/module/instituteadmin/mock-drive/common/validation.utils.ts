// src/modules/instituteadmin/mock-drive/common/validation.utils.ts

import { z } from 'zod';

/**
 * Common validation utilities for mock drive modules
 */

// ============================================
// Date Schemas
// ============================================

/**
 * Schema for parsing ISO date strings to Date objects
 */
export const dateSchema = z
  .string()
  .datetime({ message: 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-15T10:30:00Z)' })
  .transform((val) => new Date(val));

/**
 * Schema for optional/nullable dates
 */
export const optionalDateSchema = z
  .union([
    z.string().datetime().transform((val) => new Date(val)),
    z.date(),
    z.null(),
    z.undefined(),
  ])
  .optional()
  .nullable();

/**
 * Schema for coercing various date inputs to Date objects
 */
export const coerceDateSchema = z.coerce.date({
  errorMap: (issue, ctx) => ({
    message: 'Invalid date format',
  }),
});

// ============================================
// Pagination Schemas
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

// ============================================
// Common Field Schemas
// ============================================

export const cuidSchema = z.string().cuid('Invalid ID format');

export const cuidArraySchema = z.array(cuidSchema);

export const searchSchema = z.string().max(100, 'Search query too long').optional();

export const notesSchema = z
  .string()
  .max(1000, 'Notes cannot exceed 1000 characters')
  .optional()
  .nullable();

// ============================================
// Validation Helpers
// ============================================

/**
 * Creates a refine function for date range validation
 */
export function createDateRangeRefinement<T extends { [key: string]: any }>(
  startField: keyof T,
  endField: keyof T,
  message: string
) {
  return (data: T) => {
    const start = data[startField];
    const end = data[endField];
    if (start && end) {
      return new Date(start) < new Date(end);
    }
    return true;
  };
}

/**
 * Helper to create optional boolean from string query params
 */
export const booleanQuerySchema = z
  .union([z.boolean(), z.string().transform((val) => val === 'true')])
  .optional();

/**
 * Helper for numeric range validation
 */
export function numericRangeSchema(min: number, max: number, fieldName: string) {
  return z
    .number()
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} cannot exceed ${max}`);
}

/**
 * Helper for percentage validation (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100');

// ============================================
// Type Exports
// ============================================

export type PaginationInput = z.infer<typeof paginationSchema>;
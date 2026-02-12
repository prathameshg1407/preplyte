// src/lib/validations/profile.schema.ts

import { z } from 'zod';
import { COURSE_YEARS } from '@/types/profile.types';

// =====================================================
// USER PROFILE SCHEMA
// =====================================================

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
});

// =====================================================
// STUDENT PROFILE SCHEMAS
// =====================================================

export const createStudentProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),

  // FIX: Explicitly allow empty string or null
  studentId: z
    .string()
    .min(2, 'Student ID must be at least 2 characters')
    .max(30, 'Student ID must not exceed 30 characters')
    .regex(/^[A-Z0-9_\-\/]+$/i, 'Student ID must be alphanumeric')
    .optional()
    .or(z.literal(''))
    .or(z.null()),

  // FIX: Explicitly allow empty string or null
  departmentId: z
    .string()
    .optional()
    .or(z.literal(''))
    .or(z.null()),

  // FIX: Explicitly allow empty string (CRITICAL for Individual Users)
  courseYear: z.enum(COURSE_YEARS as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a valid course year' }),
  })
  .optional()
  .or(z.literal(''))
  .or(z.null()),

  // FIX: Ensure collegeName is validated
  collegeName: z.string().optional().or(z.literal('')),

  numberOfBacklogs: z
    .number()
    .or(z.nan()) // Allow NaN if field is cleared
    .optional()
    .transform(val => (isNaN(val as number) ? 0 : val)),

  skills: z
    .array(z.string().min(1).max(50))
    .max(20, 'Maximum 20 skills allowed')
    .optional()
    .default([]),

  marks10: z
    .number()
    .min(0, 'Marks cannot be negative')
    .max(100, 'Marks cannot exceed 100')
    .or(z.nan()) // FIX: Handle empty input (NaN)
    .optional()
    .nullable(),

  marks12: z
    .number()
    .min(0, 'Marks cannot be negative')
    .max(100, 'Marks cannot exceed 100')
    .or(z.nan()) // FIX: Handle empty input (NaN)
    .optional()
    .nullable(),

  cgpaSemesters: z
    .array(z.number().min(0).max(10))
    .max(10, 'Maximum 10 semesters')
    .optional()
    .default([]),
});

export const updateStudentProfileSchema = createStudentProfileSchema
  .omit({ studentId: true })
  .partial();

// =====================================================
// SKILLS SCHEMA
// =====================================================

export const skillsSchema = z.object({
  skills: z
    .array(z.string().min(1, 'Skill cannot be empty').max(50, 'Skill too long'))
    .min(1, 'At least one skill required')
    .max(20, 'Maximum 20 skills allowed'),
});

// =====================================================
// ACADEMICS SCHEMA
// =====================================================

export const academicsSchema = z.object({
  marks10: z
    .number()
    .min(0, 'Marks cannot be negative')
    .max(100, 'Marks cannot exceed 100')
    .or(z.nan())
    .optional(),

  marks12: z
    .number()
    .min(0, 'Marks cannot be negative')
    .max(100, 'Marks cannot exceed 100')
    .or(z.nan())
    .optional(),

  cgpaSemesters: z
    .array(z.number().min(0, 'CGPA cannot be negative').max(10, 'CGPA cannot exceed 10'))
    .max(10, 'Maximum 10 semesters')
    .optional(),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type UpdateUserProfileFormData = z.infer<typeof updateUserProfileSchema>;
export type CreateStudentProfileFormData = z.infer<typeof createStudentProfileSchema>;
export type UpdateStudentProfileFormData = z.infer<typeof updateStudentProfileSchema>;
export type SkillsFormData = z.infer<typeof skillsSchema>;
export type AcademicsFormData = z.infer<typeof academicsSchema>;
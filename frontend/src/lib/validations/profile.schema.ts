// src/lib/validations/profile.schema.ts

import { z } from 'zod';
import { DEPARTMENTS, COURSE_YEARS } from '@/types/profile.types';

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

  studentId: z
    .string()
    .min(6, 'Student ID must be at least 6 characters')
    .max(20, 'Student ID must not exceed 20 characters')
    .regex(/^[A-Z0-9]+$/i, 'Student ID must be alphanumeric'),

  department: z.enum(DEPARTMENTS as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a valid department' }),
  }),

  courseYear: z.enum(COURSE_YEARS as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a valid course year' }),
  }),

  numberOfBacklogs: z
    .number()
    .int('backlogs must be a whole number')
    .min(0, 'backlogs cannot be negative')
    .max(50, 'backlogs cannot exceed 50')
    .optional()
    .default(0),

  skills: z
    .array(z.string().min(1).max(50))
    .max(20, 'Maximum 20 skills allowed')
    .optional()
    .default([]),

  marks10: z
    .number()
    .min(0, 'Marks cannot be negative')
    .max(100, 'Marks cannot exceed 100')
    .optional(),

  marks12: z
    .number()
    .min(0, 'Marks cannot be negative')
    .max(100, 'Marks cannot exceed 100')
    .optional(),

  cgpaSemesters: z
    .array(z.number().min(0).max(10))
    .max(10, 'Maximum 10 semesters')
    .optional()
    .default([]),
});

export const updateStudentProfileSchema = createStudentProfileSchema.partial();

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
    .optional(),

  marks12: z
    .number()
    .min(0, 'Marks cannot be negative')
    .max(100, 'Marks cannot exceed 100')
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
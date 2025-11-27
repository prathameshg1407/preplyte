// src/module/profile/profile.validation.ts

import { z } from 'zod';
import {
  RESUME_LIMITS,
  ALLOWED_RESUME_MIME_TYPES,
  STUDENT_ID_PATTERN,
  COURSE_YEARS,
  DEPARTMENTS,
} from './profile.constants';
import { BadRequestError } from '../../utils/errors';

// =====================================================
// RESUME VALIDATION SCHEMAS
// =====================================================

export const resumeIdParamSchema = z.object({
  resumeId: z.coerce
    .number()
    .int('Resume ID must be an integer')
    .positive('Resume ID must be positive'),
});

// =====================================================
// STUDENT PROFILE VALIDATION SCHEMAS
// =====================================================

export const createStudentProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .trim(),

  studentId: z
    .string()
    .regex(STUDENT_ID_PATTERN, 'Invalid student ID format (6-20 alphanumeric characters)')
    .toUpperCase(),

  department: z.enum(DEPARTMENTS as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid department' }),
  }),

  courseYear: z.enum(COURSE_YEARS as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid course year' }),
  }),

  skills: z
    .array(z.string().min(1).max(50).trim())
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
    .array(
      z
        .number()
        .min(0, 'CGPA cannot be negative')
        .max(10, 'CGPA cannot exceed 10')
    )
    .max(10, 'Maximum 10 semesters allowed')
    .optional()
    .default([]),
});

export const updateStudentProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .trim()
    .optional(),

  department: z
    .enum(DEPARTMENTS as unknown as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid department' }),
    })
    .optional(),

  courseYear: z
    .enum(COURSE_YEARS as unknown as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid course year' }),
    })
    .optional(),

  skills: z
    .array(z.string().min(1).max(50).trim())
    .max(20, 'Maximum 20 skills allowed')
    .optional(),

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
    .array(
      z
        .number()
        .min(0, 'CGPA cannot be negative')
        .max(10, 'CGPA cannot exceed 10')
    )
    .max(10, 'Maximum 10 semesters allowed')
    .optional(),
});

// =====================================================
// USER PROFILE VALIDATION SCHEMAS
// =====================================================

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),
});

// =====================================================
// QUERY SCHEMAS
// =====================================================

export const profileQuerySchema = z.object({
  includeResumes: z.coerce.boolean().optional().default(false),
  includeStudentProfile: z.coerce.boolean().optional().default(true),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type ResumeIdParam = z.infer<typeof resumeIdParamSchema>;
export type CreateStudentProfileInput = z.infer<typeof createStudentProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type ProfileQuery = z.infer<typeof profileQuerySchema>;

// =====================================================
// FILE VALIDATION
// =====================================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const validateResumeFile = (
  file: Express.Multer.File | undefined
): FileValidationResult => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const allowedTypes = ALLOWED_RESUME_MIME_TYPES as readonly string[];
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF and Word documents are allowed',
    };
  }

  if (file.size > RESUME_LIMITS.MAX_FILE_SIZE) {
    const maxSizeMB = RESUME_LIMITS.MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
};

// =====================================================
// HELPER PARSERS
// =====================================================

// In profile.validation.ts
export function parseResumeId(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  throw new BadRequestError('Invalid resume ID');
}

export const parseCreateStudentProfile = (data: unknown): CreateStudentProfileInput => {
  return createStudentProfileSchema.parse(data);
};

export const parseUpdateStudentProfile = (data: unknown): UpdateStudentProfileInput => {
  return updateStudentProfileSchema.parse(data);
};

export const parseUpdateUserProfile = (data: unknown): UpdateUserProfileInput => {
  return updateUserProfileSchema.parse(data);
};
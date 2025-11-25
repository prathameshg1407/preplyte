// src/module/profile/profile.validation.ts

import { z } from 'zod';

// Constants for validation
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

// ============= Parameter Schemas =============

export const resumeIdParamSchema = z.object({
  resumeId: z.coerce
    .number()
    .int('Resume ID must be an integer')
    .positive('Resume ID must be positive'),
});

// ============= Inferred Types =============

export type ResumeIdParam = z.infer<typeof resumeIdParamSchema>;

// ============= File Validation =============

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const validateResumeFile = (file: Express.Multer.File | undefined): FileValidationResult => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF and Word documents are allowed',
    };
  }

  if (file.size > MAX_RESUME_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_RESUME_SIZE / (1024 * 1024)}MB limit`,
    };
  }

  return { valid: true };
};

// ============= Helper Functions =============

export const parseResumeId = (resumeId: string): number | null => {
  const result = resumeIdParamSchema.safeParse({ resumeId });
  return result.success ? result.data.resumeId : null;
};
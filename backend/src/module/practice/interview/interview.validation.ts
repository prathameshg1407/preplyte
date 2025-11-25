// src/modules/interview/interview.validation.ts

import { z } from 'zod';
import { AiInterviewQuestionCategory } from '@prisma/client';
import { CONSTANTS } from '../../../config/constants';

// ============= Request Validation Schemas =============

export const startInterviewSchema = z.object({
  resumeId: z
    .number()
    .int('Resume ID must be an integer')
    .positive('Resume ID must be positive')
    .optional(),
  jobTitle: z
    .string()
    .trim()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must be less than 100 characters')
    .optional(),
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
});

export const submitAnswerSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'Question is required')
    .max(2000, 'Question must be less than 2000 characters'),
  answer: z
    .string()
    .trim()
    .min(1, 'Answer is required')
    .max(10000, 'Answer must be less than 10000 characters'),
  category: z.nativeEnum(AiInterviewQuestionCategory, {
    errorMap: () => ({ message: 'Invalid question category' }),
  }),
  questionIndex: z
    .number()
    .int()
    .min(0)
    .max(CONSTANTS.MAX_QUESTIONS - 1)
    .optional(),
  isTranscribed: z.boolean().optional().default(false),
  timeTakenSeconds: z
    .number()
    .int()
    .min(0)
    .max(CONSTANTS.MAX_TIME_SECONDS)
    .optional(),
});

// ============= Parameter Validation Schemas =============

export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID format'),
});

// ============= Inferred Types from Schemas =============

export type StartInterviewInput = z.infer<typeof startInterviewSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;

// ============= Validation Helper Functions =============

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export const validateRequest = <S extends z.ZodTypeAny>(
  schema: S,
  data: unknown
): ValidationResult<z.infer<S>> => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: ValidationError[] = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
    return { success: false, errors };
  }

  return { success: true, data: result.data };
};

export const parseRequest = <S extends z.ZodTypeAny>(
  schema: S,
  data: unknown
): z.infer<S> => {
  return schema.parse(data);
};

// ============= Custom Validators =============

export const uuidSchema = z.string().uuid();

export const isValidUUID = (id: string): boolean => {
  return uuidSchema.safeParse(id).success;
};

export const sanitizeString = (input: string, maxLength: number = 10000): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Basic XSS prevention
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, maxLength);
};

// ============= Reusable Schema Components =============

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const sortSchema = z.object({
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const listQuerySchema = paginationSchema.merge(sortSchema);

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SortInput = z.infer<typeof sortSchema>;
export type ListQueryInput = z.infer<typeof listQuerySchema>;

// ============= Interview-specific Validators =============

export const validateQuestionCategory = (category: string): boolean => {
  return Object.values(AiInterviewQuestionCategory).includes(
    category as AiInterviewQuestionCategory
  );
};

export const validateAnswerLength = (answer: string): { valid: boolean; error?: string } => {
  const trimmed = answer.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Answer cannot be empty' };
  }
  
  if (trimmed.length < 10) {
    return { valid: false, error: 'Answer is too short. Please provide more detail.' };
  }
  
  if (trimmed.length > 10000) {
    return { valid: false, error: 'Answer is too long (max 10000 characters)' };
  }
  
  return { valid: true };
};
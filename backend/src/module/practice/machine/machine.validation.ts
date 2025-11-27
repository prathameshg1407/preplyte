import { z } from 'zod';
import { SESSION_LIMITS } from './machine.types';

// =====================================================
// SCHEMAS
// =====================================================

export const createSessionSchema = z.object({
  body: z.object({
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
      required_error: 'Difficulty is required',
    }),
    numberOfQuestions: z
      .number({ required_error: 'Number of questions is required' })
      .int('Must be a whole number')
      .min(SESSION_LIMITS.MIN_QUESTIONS, `Minimum ${SESSION_LIMITS.MIN_QUESTIONS} question`)
      .max(SESSION_LIMITS.MAX_QUESTIONS, `Maximum ${SESSION_LIMITS.MAX_QUESTIONS} questions`),
    timeLimit: z
      .number({ required_error: 'Time limit is required' })
      .int('Must be a whole number')
      .min(SESSION_LIMITS.MIN_TIME, `Minimum ${SESSION_LIMITS.MIN_TIME} minutes`)
      .max(SESSION_LIMITS.MAX_TIME, `Maximum ${SESSION_LIMITS.MAX_TIME} minutes`),
    tags: z.array(z.string()).optional(),
  }),
});

export const listSessionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(SESSION_LIMITS.MAX_PAGE_SIZE).default(10),
    status: z.enum(['all', 'completed', 'in_progress', 'expired']).default('all'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  }),
});

export const sessionIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Session ID is required'),
  }),
});

export const questionIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Session ID is required'),
    questionId: z.string().min(1, 'Question ID is required'),
  }),
});

export const runCodeSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    questionId: z.string().min(1, 'Question ID is required'),
  }),
  body: z.object({
    code: z
      .string()
      .min(1, 'Code is required')
      .max(SESSION_LIMITS.MAX_CODE_LENGTH, `Code too long (max ${SESSION_LIMITS.MAX_CODE_LENGTH} characters)`),
    languageId: z.number().int().positive('Language ID must be a positive integer'),
    customInput: z.string().optional(),
  }),
});

export const submitCodeSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    questionId: z.string().min(1, 'Question ID is required'),
  }),
  body: z.object({
    code: z
      .string()
      .min(1, 'Code is required')
      .max(SESSION_LIMITS.MAX_CODE_LENGTH, `Code too long (max ${SESSION_LIMITS.MAX_CODE_LENGTH} characters)`),
    languageId: z.number().int().positive('Language ID must be a positive integer'),
  }),
});

export const submissionsListSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    questionId: z.string().min(1, 'Question ID is required'),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(SESSION_LIMITS.MAX_PAGE_SIZE).default(10),
  }),
});

export const submissionIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Submission ID is required'),
  }),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type CreateSessionInput = z.infer<typeof createSessionSchema>['body'];
export type ListSessionsQuery = z.infer<typeof listSessionsSchema>['query'];
export type RunCodeInput = z.infer<typeof runCodeSchema>['body'];
export type SubmitCodeInput = z.infer<typeof submitCodeSchema>['body'];
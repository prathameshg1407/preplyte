import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
      required_error: 'Difficulty is required',
    }),
    numberOfQuestions: z
      .number()
      .min(1, 'At least 1 question required')
      .max(10, 'Maximum 10 questions allowed'),
    timeLimit: z
      .number()
      .min(30, 'Minimum time limit is 30 minutes')
      .max(180, 'Maximum time limit is 180 minutes'),
    tags: z.array(z.string()).optional(),
  }),
});

export const listSessionsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => parseInt(val || '1')),
    limit: z.string().optional().transform((val) => Math.min(parseInt(val || '10'), 50)),
    status: z.enum(['all', 'completed', 'in_progress', 'expired']).optional().default('all'),
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
    code: z.string().min(1, 'Code is required'),
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
    code: z.string().min(1, 'Code is required'),
    languageId: z.number().int().positive('Language ID must be a positive integer'),
  }),
});

export const submissionsListSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    questionId: z.string().min(1, 'Question ID is required'),
  }),
  query: z.object({
    page: z.string().optional().transform((val) => parseInt(val || '1')),
    limit: z.string().optional().transform((val) => Math.min(parseInt(val || '10'), 50)),
  }),
});

export const submissionIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Submission ID is required'),
  }),
});
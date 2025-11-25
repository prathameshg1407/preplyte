import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
      required_error: 'Difficulty is required',
      invalid_type_error: 'Difficulty must be EASY, MEDIUM, or HARD',
    }),
    questionTypes: z
      .array(z.enum(['QUANTITATIVE', 'VERBAL', 'LOGICAL']))
      .min(1, 'At least one question type is required')
      .max(3, 'Maximum 3 question types allowed'),
    numberOfQuestions: z
      .number({
        required_error: 'Number of questions is required',
        invalid_type_error: 'Number of questions must be a number',
      })
      .min(5, 'Must be at least 5 questions')
      .max(50, 'Maximum 50 questions allowed'),
    timeLimit: z
      .number({
        required_error: 'Time limit is required',
        invalid_type_error: 'Time limit must be a number',
      })
      .min(10, 'Minimum time limit is 10 minutes')
      .max(120, 'Maximum time limit is 120 minutes'),
  }),
});

export const listSessionsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => parseInt(val || '1')),
    limit: z.string().optional().transform((val) => Math.min(parseInt(val || '10'), 50)),
    status: z.enum(['all', 'completed', 'in_progress', 'expired']).optional().default('all'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    sortBy: z.enum(['createdAt', 'completedAt', 'totalScore']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const saveAnswerSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Session ID is required'),
  }),
  body: z.object({
    questionId: z.string().min(1, 'Question ID is required'),
    selectedOptionId: z.string().nullable(),
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

export const solutionsFilterSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Session ID is required'),
  }),
  query: z.object({
    filter: z.enum(['all', 'correct', 'wrong', 'unanswered']).optional().default('all'),
  }),
});
import { z } from 'zod';
import { SESSION_LIMITS } from './aptitude.types';

// =====================================================
// SCHEMAS
// =====================================================

export const createSessionSchema = z.object({
  body: z.object({
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
      required_error: 'Difficulty is required',
      invalid_type_error: 'Difficulty must be EASY, MEDIUM, or HARD',
    }),
    questionTypes: z
      .array(z.enum(['QUANTITATIVE', 'VERBAL', 'LOGICAL']))
      .min(1, 'At least one question type is required')
      .max(SESSION_LIMITS.MAX_QUESTION_TYPES, `Maximum ${SESSION_LIMITS.MAX_QUESTION_TYPES} question types allowed`),
    numberOfQuestions: z
      .number({ required_error: 'Number of questions is required' })
      .int('Must be a whole number')
      .min(SESSION_LIMITS.MIN_QUESTIONS, `Minimum ${SESSION_LIMITS.MIN_QUESTIONS} questions`)
      .max(SESSION_LIMITS.MAX_QUESTIONS, `Maximum ${SESSION_LIMITS.MAX_QUESTIONS} questions`),
    timeLimit: z
      .number({ required_error: 'Time limit is required' })
      .int('Must be a whole number')
      .min(SESSION_LIMITS.MIN_TIME, `Minimum ${SESSION_LIMITS.MIN_TIME} minutes`)
      .max(SESSION_LIMITS.MAX_TIME, `Maximum ${SESSION_LIMITS.MAX_TIME} minutes`),
  }),
});

export const listSessionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(SESSION_LIMITS.MAX_PAGE_SIZE).default(10),
    status: z.enum(['all', 'completed', 'in_progress', 'expired']).default('all'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    sortBy: z.enum(['createdAt', 'completedAt', 'totalScore']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
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

export const saveAnswerSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Session ID is required'),
  }),
  body: z.object({
    questionId: z.string().min(1, 'Question ID is required'),
    selectedOptionId: z.string().nullable(),
  }),
});

export const solutionsFilterSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Session ID is required'),
  }),
  query: z.object({
    filter: z.enum(['all', 'correct', 'wrong', 'unanswered']).default('all'),
  }),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type CreateSessionInput = z.infer<typeof createSessionSchema>['body'];
export type ListSessionsQuery = z.infer<typeof listSessionsSchema>['query'];
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>['body'];
export type SolutionsFilterQuery = z.infer<typeof solutionsFilterSchema>['query'];
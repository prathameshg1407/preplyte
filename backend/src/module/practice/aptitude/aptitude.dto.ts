// src/modules/practice/aptitude/aptitude.dto.ts

import { z } from 'zod';
import { QuestionType, DifficultyLevel } from '@prisma/client';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

export const StartPracticeSchema = z.object({
  questionTypes: z
    .array(z.nativeEnum(QuestionType))
    .min(1, 'At least one question type is required')
    .max(3, 'Maximum 3 question types allowed'),

  difficulty: z.nativeEnum(DifficultyLevel, {
    errorMap: () => ({ message: 'Invalid difficulty level' }),
  }),

  numberOfQuestions: z
    .number()
    .int('Number of questions must be an integer')
    .min(5, 'Minimum 5 questions required')
    .max(50, 'Maximum 50 questions allowed'),
});

export const SaveAnswerSchema = z.object({
  questionId: z.string().cuid('Invalid question ID'),
  selectedOptionId: z.string().cuid('Invalid option ID'),
});

export const SubmitAnswerSchema = z.object({
  questionId: z.string().cuid('Invalid question ID'),
  selectedOptionId: z.string().cuid('Invalid option ID'),
});

export const SubmitTestSchema = z.object({
  answers: z
    .array(SubmitAnswerSchema)
    .optional()
    .default([]),
});

export const SessionIdParamSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID'),
});

export const QuestionIdParamSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID'),
  questionId: z.string().cuid('Invalid question ID'),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const AvailableQuestionsQuerySchema = z.object({
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  questionType: z.nativeEnum(QuestionType).optional(),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type StartPracticeDTO = z.infer<typeof StartPracticeSchema>;
export type SaveAnswerDTO = z.infer<typeof SaveAnswerSchema>;
export type SubmitAnswerDTO = z.infer<typeof SubmitAnswerSchema>;
export type SubmitTestDTO = z.infer<typeof SubmitTestSchema>;
export type SessionIdParamDTO = z.infer<typeof SessionIdParamSchema>;
export type QuestionIdParamDTO = z.infer<typeof QuestionIdParamSchema>;
export type PaginationDTO = z.infer<typeof PaginationSchema>;
export type AvailableQuestionsQueryDTO = z.infer<typeof AvailableQuestionsQuerySchema>;
// src/modules/practice/machine/machine.dto.ts

import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from './judge0.types';

// =====================================================
// VALIDATION HELPERS
// =====================================================

const supportedLanguages = Object.keys(SUPPORTED_LANGUAGES);
const difficultyLevels = ['EASY', 'MEDIUM', 'HARD'] as const;

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

export const StartMachineTestSchema = z.object({
  difficulty: z.enum(difficultyLevels, {
    errorMap: () => ({ message: 'Difficulty must be EASY, MEDIUM, or HARD' }),
  }),
  numberOfQuestions: z
    .number()
    .int('Number of questions must be an integer')
    .min(1, 'At least 1 question required')
    .max(20, 'Maximum 20 questions allowed'),
});

export const RunCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50000, 'Code too long (max 50000 characters)'),
  language: z
    .string()
    .min(1, 'Language is required')
    .refine(
      (lang) => supportedLanguages.includes(lang.toLowerCase()),
      {
        message: `Unsupported language. Supported: ${supportedLanguages.join(', ')}`,
      }
    ),
  questionId: z.string().cuid('Invalid question ID'),
  stdin: z.string().optional(),
});

export const SubmitCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50000, 'Code too long (max 50000 characters)'),
  language: z
    .string()
    .min(1, 'Language is required')
    .refine(
      (lang) => supportedLanguages.includes(lang.toLowerCase()),
      {
        message: `Unsupported language. Supported: ${supportedLanguages.join(', ')}`,
      }
    ),
  questionId: z.string().cuid('Invalid question ID'),
});

export const SubmitTestSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().cuid('Invalid question ID'),
        code: z.string(),
        language: z.string().min(1, 'Language is required'),
      })
    )
    .optional()
    .default([]),
});

export const SessionIdParamSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID'),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const FilterSchema = z.object({
  difficulty: z.enum(difficultyLevels).optional(),
  tags: z.string().optional(),
});

export const AvailableQuestionsQuerySchema = z.object({
  difficulty: z.enum(difficultyLevels).optional(),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type StartMachineTestDTO = z.infer<typeof StartMachineTestSchema>;
export type RunCodeDTO = z.infer<typeof RunCodeSchema>;
export type SubmitCodeDTO = z.infer<typeof SubmitCodeSchema>;
export type SubmitTestDTO = z.infer<typeof SubmitTestSchema>;
export type SessionIdParamDTO = z.infer<typeof SessionIdParamSchema>;
export type PaginationDTO = z.infer<typeof PaginationSchema>;
export type FilterDTO = z.infer<typeof FilterSchema>;
export type AvailableQuestionsQueryDTO = z.infer<typeof AvailableQuestionsQuerySchema>;
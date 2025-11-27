// src/modules/instituteadmin/mock-drive/modules/modules.validation.ts

import { z } from 'zod';
import {
  MockDriveModuleType,
  DifficultyLevel,
  QuestionType,
  AiInterviewDifficulty,
} from '@prisma/client';

// ============================================
// Reusable Schemas
// ============================================

const cuidSchema = z.string().cuid('Invalid ID format');

const percentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage cannot exceed 100');

const booleanQuerySchema = z
  .union([z.boolean(), z.string().transform((val) => val === 'true')])
  .default(false);

// ============================================
// Config Schemas
// ============================================

export const aptitudeConfigSchema = z.object({
  difficulty: z.nativeEnum(DifficultyLevel),
  questionTypes: z
    .array(z.nativeEnum(QuestionType))
    .min(1, 'At least one question type required')
    .max(3),
  numberOfQuestions: z.number().int().min(1).max(100),
  marksPerQuestion: z.number().min(0.5).max(10),
  negativeMarking: z.number().min(0).max(5),
});

export const machineCodingConfigSchema = z.object({
  difficulty: z.nativeEnum(DifficultyLevel),
  numberOfQuestions: z.number().int().min(1).max(10),
  allowedLanguages: z
    .array(z.string().min(1, 'Language name required').max(50, 'Language name too long'))
    .min(1, 'At least one language required')
    .max(10, 'Maximum 10 languages allowed'),
  partialScoring: z.boolean().default(true),
  maxScorePerQuestion: z.number().int().min(10).max(1000),
});

export const aiInterviewConfigSchema = z.object({
  difficulty: z.nativeEnum(AiInterviewDifficulty),
  jobTitle: z.string().min(2).max(100).trim(),
  companyName: z.string().max(100).trim().nullable().optional(),
  focusAreas: z.array(z.string().min(1).max(50).trim()).min(1).max(10),
  targetQuestions: z.number().int().min(5).max(20),
});

const moduleConfigSchema = z.union([
  aptitudeConfigSchema,
  machineCodingConfigSchema,
  aiInterviewConfigSchema,
]);

// ============================================
// Param Schemas
// ============================================

export const mockDriveIdParamSchema = z.object({
  id: cuidSchema,
});

export const moduleIdParamSchema = z.object({
  id: cuidSchema,
  moduleId: cuidSchema,
});

// ============================================
// Query Schemas
// ============================================

export const listModulesQuerySchema = z.object({
  includeInactive: booleanQuerySchema,
  checkAvailability: booleanQuerySchema,
});

// ============================================
// Create Module Schema
// ============================================

export const createModuleSchema = z
  .object({
    moduleType: z.nativeEnum(MockDriveModuleType),
    order: z.number().int().min(1).max(10),
    name: z.string().max(100).trim().nullable().optional(),
    timeLimit: z.number().int().min(5).max(300),
    weightage: percentageSchema,
    config: moduleConfigSchema,
    passingScore: percentageSchema.nullable().optional(),
    instructions: z.string().max(5000).trim().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const { moduleType, config } = data;

    if (moduleType === MockDriveModuleType.APTITUDE) {
      if (!('questionTypes' in config) || !('marksPerQuestion' in config)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Aptitude config requires questionTypes and marksPerQuestion',
          path: ['config'],
        });
      }
    }

    if (moduleType === MockDriveModuleType.MACHINE_CODING) {
      if (!('allowedLanguages' in config) || !('maxScorePerQuestion' in config)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Machine coding config requires allowedLanguages and maxScorePerQuestion',
          path: ['config'],
        });
      }
    }

    if (moduleType === MockDriveModuleType.AI_INTERVIEW) {
      if (!('jobTitle' in config) || !('focusAreas' in config)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'AI interview config requires jobTitle and focusAreas',
          path: ['config'],
        });
      }
    }
  });

// ============================================
// Update Module Schema
// ============================================

export const updateModuleSchema = z.object({
  order: z.number().int().min(1).max(10).optional(),
  name: z.string().max(100).trim().nullable().optional(),
  timeLimit: z.number().int().min(5).max(300).optional(),
  weightage: percentageSchema.optional(),
  config: moduleConfigSchema.optional(),
  passingScore: percentageSchema.nullable().optional(),
  instructions: z.string().max(5000).trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// Reorder Modules Schema
// ============================================

export const reorderModulesSchema = z
  .object({
    modules: z
      .array(z.object({ moduleId: cuidSchema, order: z.number().int().min(1).max(10) }))
      .min(1)
      .max(10),
  })
  .refine(
    (data) => new Set(data.modules.map((m) => m.order)).size === data.modules.length,
    { message: 'Duplicate orders not allowed', path: ['modules'] }
  )
  .refine(
    (data) => new Set(data.modules.map((m) => m.moduleId)).size === data.modules.length,
    { message: 'Duplicate module IDs not allowed', path: ['modules'] }
  );

// ============================================
// Type Exports
// ============================================

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type ReorderModulesInput = z.infer<typeof reorderModulesSchema>;
export type ListModulesQueryInput = z.infer<typeof listModulesQuerySchema>;
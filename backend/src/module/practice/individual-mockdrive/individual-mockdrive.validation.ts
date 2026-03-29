// src/module/practice/individual-mockdrive/individual-mockdrive.validation.ts

import { z } from 'zod';
import { 
  DifficultyLevel, 
  QuestionType, 
  AiInterviewDifficulty, 
  MockDriveModuleType 
} from '@prisma/client';

const AptitudeModuleConfigSchema = z.object({
  difficulty: z.nativeEnum(DifficultyLevel),
  questionTypes: z.array(z.nativeEnum(QuestionType)).min(1),
  numberOfQuestions: z.number().min(1).max(50),
});

const MachineCodingModuleConfigSchema = z.object({
  difficulty: z.nativeEnum(DifficultyLevel),
  numberOfQuestions: z.number().min(1).max(10),
});

const AiInterviewModuleConfigSchema = z.object({
  difficulty: z.nativeEnum(AiInterviewDifficulty),
  jobTitle: z.string().min(2).max(100),
  companyName: z.string().max(100).optional().nullable(),
  focusAreas: z.array(z.string().min(1)).min(1),
  targetQuestions: z.number().int().min(5).max(20),
});

const AptitudeModuleSchema = z.object({
  moduleType: z.literal(MockDriveModuleType.APTITUDE),
  order: z.number().int().min(0),
  name: z.string().max(100).optional().nullable(),
  timeLimit: z.number().int().min(1).max(300), // In minutes
  config: AptitudeModuleConfigSchema,
});

const MachineCodingModuleSchema = z.object({
  moduleType: z.literal(MockDriveModuleType.MACHINE_CODING),
  order: z.number().int().min(0),
  name: z.string().max(100).optional().nullable(),
  timeLimit: z.number().int().min(1).max(300), // In minutes
  config: MachineCodingModuleConfigSchema,
});

const AiInterviewModuleSchema = z.object({
  moduleType: z.literal(MockDriveModuleType.AI_INTERVIEW),
  order: z.number().int().min(0),
  name: z.string().max(100).optional().nullable(),
  timeLimit: z.number().int().min(1).max(300), // In minutes
  config: AiInterviewModuleConfigSchema,
});

const IndividualMockDriveModuleSchema = z.discriminatedUnion('moduleType', [
  AptitudeModuleSchema,
  MachineCodingModuleSchema,
  AiInterviewModuleSchema,
]);

export const createIndividualMockDriveSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional().nullable(),
  modules: z.array(IndividualMockDriveModuleSchema).min(1).max(10).superRefine((modules, ctx) => {
    const uniqueOrders = new Set(modules.map((m) => m.order));
    if (uniqueOrders.size !== modules.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Module order values must be unique',
      });
      return;
    }

    const sortedOrders = [...uniqueOrders].sort((a, b) => a - b);
    const startsAtZero = sortedOrders[0] === 0;
    const contiguous = sortedOrders.every((order, idx) => order === idx);

    if (!startsAtZero || !contiguous) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Module order must start at 0 and be contiguous (0,1,2,...)',
      });
    }
  }),
});

export const updateIndividualMockDriveSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
});

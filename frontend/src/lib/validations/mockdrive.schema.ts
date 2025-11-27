// src/lib/validations/mockdrive.schema.ts

import { z } from 'zod';
import {
  MockDriveStatus,
  DifficultyLevel,
  QuestionType,
  AiInterviewDifficulty,
} from '@/types/admin.mockdrive.types';

// ============================================
// Proctoring Settings Schema
// ============================================

export const proctoringSettingsSchema = z.object({
  detectTabSwitch: z.boolean().default(true),
  maxTabSwitches: z.number().int().min(0).max(100).default(3),
  requireFullscreen: z.boolean().default(false),
  detectCopyPaste: z.boolean().default(true),
  webcamRequired: z.boolean().default(false),
  screenshareRequired: z.boolean().default(false),
});

// ============================================
// Base Mock Drive Schema (without refinements)
// ============================================

const baseMockDriveSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional()
    .nullable(),
  instructions: z
    .string()
    .max(10000, 'Instructions must not exceed 10000 characters')
    .optional()
    .nullable(),
  registrationStartDate: z.string().datetime().optional().nullable(),
  registrationEndDate: z.string().datetime().optional().nullable(),
  maxRegistrations: z
    .number()
    .int()
    .min(1, 'Max registrations must be at least 1')
    .max(100000, 'Max registrations cannot exceed 100000')
    .optional()
    .nullable(),
  driveStartDate: z.string().datetime().optional().nullable(),
  driveEndDate: z.string().datetime().optional().nullable(),
  allowLateSubmission: z.boolean().default(false),
  showLeaderboard: z.boolean().default(true),
  showResultsImmediately: z.boolean().default(false),
  resultsReleaseDate: z.string().datetime().optional().nullable(),
  shuffleQuestions: z.boolean().default(true),
  enableProctoring: z.boolean().default(false),
  proctoringSettings: proctoringSettingsSchema.optional().nullable(),
});

// ============================================
// Date Refinement Helper
// ============================================

const addDateRefinements = <T extends z.ZodTypeAny>(schema: T) => {
  return schema
    .refine(
      (data: z.infer<typeof baseMockDriveSchema>) => {
        if (data.registrationStartDate && data.registrationEndDate) {
          return new Date(data.registrationStartDate) < new Date(data.registrationEndDate);
        }
        return true;
      },
      {
        message: 'Registration start date must be before end date',
        path: ['registrationEndDate'],
      }
    )
    .refine(
      (data: z.infer<typeof baseMockDriveSchema>) => {
        if (data.driveStartDate && data.driveEndDate) {
          return new Date(data.driveStartDate) < new Date(data.driveEndDate);
        }
        return true;
      },
      {
        message: 'Drive start date must be before end date',
        path: ['driveEndDate'],
      }
    );
};

// ============================================
// Create Mock Drive Schema
// ============================================

export const createMockDriveSchema = addDateRefinements(baseMockDriveSchema);

// ============================================
// Update Mock Drive Schema
// ============================================

export const updateMockDriveSchema = addDateRefinements(baseMockDriveSchema.partial());

// ============================================
// Module Config Schemas
// ============================================

export const aptitudeModuleConfigSchema = z.object({
  difficulty: z.nativeEnum(DifficultyLevel),
  questionTypes: z
    .array(z.nativeEnum(QuestionType))
    .min(1, 'At least one question type is required'),
  numberOfQuestions: z
    .number()
    .int()
    .min(1, 'At least 1 question required')
    .max(100, 'Maximum 100 questions allowed'),
  marksPerQuestion: z
    .number()
    .min(0.5, 'Marks per question must be at least 0.5')
    .max(10, 'Marks per question cannot exceed 10'),
  negativeMarking: z
    .number()
    .min(0, 'Negative marking cannot be negative')
    .max(5, 'Negative marking cannot exceed 5'),
});

export const machineCodingModuleConfigSchema = z.object({
  difficulty: z.nativeEnum(DifficultyLevel),
  numberOfQuestions: z
    .number()
    .int()
    .min(1, 'At least 1 question required')
    .max(10, 'Maximum 10 questions allowed'),
  allowedLanguages: z
    .array(z.string())
    .min(1, 'At least one programming language is required'),
  partialScoring: z.boolean().default(true),
  maxScorePerQuestion: z
    .number()
    .int()
    .min(10, 'Max score per question must be at least 10')
    .max(1000, 'Max score per question cannot exceed 1000'),
});

export const aiInterviewModuleConfigSchema = z.object({
  difficulty: z.nativeEnum(AiInterviewDifficulty),
  jobTitle: z
    .string()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title cannot exceed 100 characters'),
  companyName: z
    .string()
    .max(100, 'Company name cannot exceed 100 characters')
    .optional()
    .nullable(),
  focusAreas: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one focus area is required')
    .max(10, 'Maximum 10 focus areas allowed'),
  targetQuestions: z
    .number()
    .int()
    .min(5, 'At least 5 questions required')
    .max(20, 'Maximum 20 questions allowed'),
});

// ============================================
// Type Exports
// ============================================

export type CreateMockDriveFormData = z.infer<typeof createMockDriveSchema>;
export type UpdateMockDriveFormData = z.infer<typeof updateMockDriveSchema>;
export type AptitudeModuleConfigFormData = z.infer<typeof aptitudeModuleConfigSchema>;
export type MachineCodingModuleConfigFormData = z.infer<typeof machineCodingModuleConfigSchema>;
export type AiInterviewModuleConfigFormData = z.infer<typeof aiInterviewModuleConfigSchema>;
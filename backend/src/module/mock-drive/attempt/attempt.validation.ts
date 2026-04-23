// src/module/mock-drive/attempt/attempt.validation.ts

import { z } from 'zod';

// ============================================
// Param Schemas
// ============================================

export const mockDriveIdSchema = z.object({
  params: z.object({
    driveId: z.string().min(1, 'Invalid drive ID format'),
  }),
});

export const submitAttemptSchema = z.object({
  params: z.object({
    driveId: z.string().min(1, 'Invalid drive ID format'),
  }),
  body: z.object({
    terminationReason: z.string().optional(),
    remarks: z.string().optional(),
  }),
});

export const moduleIdSchema = z.object({
  params: z.object({
    driveId: z.string().min(1, 'Invalid drive ID format'),
    moduleId: z.string().min(1, 'Invalid module ID format'),
  }),
});

// ============================================
// Aptitude Module Schemas
// ============================================

export const aptitudeAnswerSchema = z.object({
  params: z.object({
    driveId: z.string().min(1),
    moduleId: z.string().min(1),
  }),
  body: z.object({
    questionId: z.string().min(1, 'Invalid question ID format'),
    selectedOptionId: z.string().min(1, 'Invalid option ID format'),
    timeSpent: z.number().int().min(0).optional(),
  }),
});

export const aptitudeClearSchema = z.object({
  params: z.object({
    driveId: z.string().min(1),
    moduleId: z.string().min(1),
  }),
  body: z.object({
    questionId: z.string().min(1, 'Invalid question ID format'),
  }),
});

export const aptitudeMarkReviewSchema = z.object({
  params: z.object({
    driveId: z.string().min(1),
    moduleId: z.string().min(1),
  }),
  body: z.object({
    questionId: z.string().min(1, 'Invalid question ID format'),
    isMarked: z.boolean().default(true),
  }),
});

// ============================================
// Machine Coding Module Schemas
// ============================================

export const machineSubmitSchema = z.object({
  params: z.object({
    driveId: z.string().min(1),
    moduleId: z.string().min(1),
  }),
  body: z.object({
    questionId: z.string().min(1, 'Invalid question ID format'),
    code: z.string().min(1, 'Code cannot be empty'),
    languageId: z.number().int().positive('Invalid language ID'),
  }),
});

export const machineRunSchema = z.object({
  params: z.object({
    driveId: z.string().min(1),
    moduleId: z.string().min(1),
  }),
  body: z.object({
    questionId: z.string().min(1, 'Invalid question ID format'),
    code: z.string().min(1, 'Code cannot be empty'),
    languageId: z.number().int().positive('Invalid language ID'),
    customInput: z.string().optional(),
  }),
});

// ============================================
// Interview Module Schemas
// ============================================

export const interviewRespondSchema = z.object({
  params: z.object({
    driveId: z.string().min(1),
    moduleId: z.string().min(1),
  }),
  body: z.object({
    answer: z.string().min(1, 'Answer cannot be empty'),
    timeTaken: z.number().int().min(0).optional(),
    audioBuffer: z.string().optional(), // Base64 encoded audio
  }),
});

export const interviewSkipSchema = z.object({
  params: z.object({
    driveId: z.string().min(1),
    moduleId: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});

export const interviewAudioChunkSchema = z.object({
  params: z.object({
    driveId: z.string().min(1),
    moduleId: z.string().min(1),
  }),
  body: z.object({
    chunk: z.string().min(1, 'Audio chunk cannot be empty'),
    isFinal: z.boolean().default(false),
  }),
});

// ============================================
// Type Exports
// ============================================

export type MockDriveIdInput = z.infer<typeof mockDriveIdSchema>;
export type ModuleIdInput = z.infer<typeof moduleIdSchema>;
export type AptitudeAnswerInput = z.infer<typeof aptitudeAnswerSchema>;
export type AptitudeClearInput = z.infer<typeof aptitudeClearSchema>;
export type AptitudeMarkReviewInput = z.infer<typeof aptitudeMarkReviewSchema>;
export type MachineSubmitInput = z.infer<typeof machineSubmitSchema>;
export type MachineRunInput = z.infer<typeof machineRunSchema>;
export type InterviewRespondInput = z.infer<typeof interviewRespondSchema>;
export type InterviewSkipInput = z.infer<typeof interviewSkipSchema>;
export type InterviewAudioChunkInput = z.infer<typeof interviewAudioChunkSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
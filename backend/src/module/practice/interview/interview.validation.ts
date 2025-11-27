// src/module/practice/interview/interview.validation.ts

import { z } from 'zod';
import { AiInterviewDifficulty, AiInterviewQuestionCategory } from '@prisma/client';
import { BadRequestError } from '../../../utils/errors';
import { INTERVIEW_SESSION_CONFIG } from './interview.constants';

// =====================================================
// ENUMS AS ZOD TYPES
// =====================================================

const difficultyEnum = z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD']);
const categoryEnum = z.enum(['INTRODUCTORY', 'TECHNICAL', 'BEHAVIORAL', 'SITUATIONAL', 'CLOSING']);

// =====================================================
// SESSION SCHEMAS
// =====================================================

export const createSessionSchema = z.object({
  resumeId: z
    .string()
    .min(1, 'Resume ID is required')
    .optional(),
  
  jobTitle: z
    .string()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must not exceed 100 characters')
    .trim()
    .optional()
    .default('Software Engineer'),
  
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .trim()
    .optional()
    .nullable(),
  
  difficulty: difficultyEnum
    .optional()
    .default('MID'),
  
  focusAreas: z
    .array(z.string().min(1).max(50).trim())
    .max(5, 'Maximum 5 focus areas allowed')
    .optional()
    .default([]),
  
  targetQuestions: z
    .number()
    .int()
    .min(INTERVIEW_SESSION_CONFIG.MIN_QUESTIONS, `Minimum ${INTERVIEW_SESSION_CONFIG.MIN_QUESTIONS} questions required`)
    .max(INTERVIEW_SESSION_CONFIG.MAX_QUESTIONS, `Maximum ${INTERVIEW_SESSION_CONFIG.MAX_QUESTIONS} questions allowed`)
    .optional()
    .default(INTERVIEW_SESSION_CONFIG.DEFAULT_QUESTIONS),
});

export const updateSessionSchema = z.object({
  jobTitle: z
    .string()
    .min(2)
    .max(100)
    .trim()
    .optional(),
  
  companyName: z
    .string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .nullable(),
  
  difficulty: difficultyEnum.optional(),
  
  focusAreas: z
    .array(z.string().min(1).max(50).trim())
    .max(5)
    .optional(),
  
  targetQuestions: z
    .number()
    .int()
    .min(INTERVIEW_SESSION_CONFIG.MIN_QUESTIONS)
    .max(INTERVIEW_SESSION_CONFIG.MAX_QUESTIONS)
    .optional(),
});

// =====================================================
// QUERY SCHEMAS
// =====================================================

export const sessionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
  status: z.enum(['CREATED', 'STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
  difficulty: difficultyEnum.optional(),
  sortBy: z.enum(['createdAt', 'completedAt', 'overallScore']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

// =====================================================
// WEBSOCKET MESSAGE SCHEMAS
// =====================================================

export const wsMessageSchema = z.object({
  type: z.string().min(1),
  data: z.unknown().optional(),
  timestamp: z.number().optional(),
});

export const audioChunkSchema = z.object({
  type: z.literal('audio_chunk'),
  data: z.instanceof(Buffer).or(z.string()), // Buffer or Base64
});

export const endInterviewSchema = z.object({
  type: z.literal('end_interview'),
  reason: z.enum(['completed', 'cancelled', 'timeout']).optional().default('completed'),
});

// =====================================================
// RESPONSE SCHEMAS
// =====================================================

export const submitResponseSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1, 'Answer cannot be empty').max(5000, 'Answer too long'),
  audioUrl: z.string().url().optional(),
  timeTakenSeconds: z.number().int().min(0).optional(),
});

// =====================================================
// FEEDBACK SCHEMAS
// =====================================================

export const feedbackQuerySchema = z.object({
  includeQuestionDetails: z.coerce.boolean().optional().default(true),
  includeRecommendations: z.coerce.boolean().optional().default(true),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionListQuery = z.infer<typeof sessionListQuerySchema>;
export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;
export type WSMessage = z.infer<typeof wsMessageSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type FeedbackQuery = z.infer<typeof feedbackQuerySchema>;

// =====================================================
// PARSER FUNCTIONS
// =====================================================

export function parseCreateSession(data: unknown): CreateSessionInput {
  try {
    return createSessionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => e.message).join(', ');
      throw new BadRequestError(message);
    }
    throw error;
  }
}

export function parseUpdateSession(data: unknown): UpdateSessionInput {
  try {
    return updateSessionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => e.message).join(', ');
      throw new BadRequestError(message);
    }
    throw error;
  }
}

export function parseSessionListQuery(data: unknown): SessionListQuery {
  try {
    return sessionListQuerySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => e.message).join(', ');
      throw new BadRequestError(message);
    }
    throw error;
  }
}

export function parseSessionId(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  throw new BadRequestError('Invalid session ID');
}

export function parseWSMessage(data: unknown): WSMessage {
  try {
    return wsMessageSchema.parse(data);
  } catch (error) {
    throw new BadRequestError('Invalid WebSocket message format');
  }
}

export function parseSubmitResponse(data: unknown): SubmitResponseInput {
  try {
    return submitResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => e.message).join(', ');
      throw new BadRequestError(message);
    }
    throw error;
  }
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

export function validateAudioBuffer(buffer: Buffer): { valid: boolean; error?: string } {
  const maxSize = 25 * 1024 * 1024; // 25MB
  
  if (!Buffer.isBuffer(buffer)) {
    return { valid: false, error: 'Invalid audio data' };
  }
  
  if (buffer.length === 0) {
    return { valid: false, error: 'Empty audio buffer' };
  }
  
  if (buffer.length > maxSize) {
    return { valid: false, error: 'Audio file too large (max 25MB)' };
  }
  
  return { valid: true };
}

export function validateSessionStatus(
  currentStatus: string,
  allowedStatuses: string[]
): { valid: boolean; error?: string } {
  if (!allowedStatuses.includes(currentStatus)) {
    return {
      valid: false,
      error: `Invalid session status. Current: ${currentStatus}, Allowed: ${allowedStatuses.join(', ')}`,
    };
  }
  return { valid: true };
}
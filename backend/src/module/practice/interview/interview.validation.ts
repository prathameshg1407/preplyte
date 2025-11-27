// interview.validation.ts

import { z } from 'zod';
import { BadRequestError } from '../../../utils/errors';

// =====================================================
// SCHEMAS
// =====================================================

export const startSessionSchema = z.object({
  resumeId: z.number().int().positive().optional(),
  jobTitle: z.string().trim().min(2).max(100).optional(),
  companyName: z.string().trim().min(2).max(100).optional(),
  difficulty: z.enum(['entry', 'mid', 'senior', 'lead']).optional(),
  focusAreas: z.array(z.string().trim().min(1).max(50)).max(5).optional(),
});

export const submitResponseSchema = z
  .object({
    audioBlob: z.string().optional(),
    transcript: z.string().max(10000).optional(),
  })
  .refine((data) => data.audioBlob || data.transcript, {
    message: 'Either audioBlob or transcript must be provided',
  });

export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid(),
});

export const getSessionsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1).default(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(50).default(20)),
});

// =====================================================
// PARSE HELPER
// =====================================================

/**
 * Parse and validate request data against a schema
 * @throws BadRequestError if validation fails
 */
export function parseRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    throw new BadRequestError(
      `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  return result.data;
}
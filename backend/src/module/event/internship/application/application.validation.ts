// backend/src/module/event/internship/application/application.validation.ts

import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';
import { APPLICATION_LIMITS } from '../../event.constants';

export const submitApplicationSchema = z.object({
  internshipId: z.string().cuid(),
  resumeId: z.string().or(z.literal('default')).optional(),
  coverLetter: z.string().max(APPLICATION_LIMITS.MAX_COVER_LETTER_LENGTH).optional(),
  availableFrom: z.string().datetime().optional(),
});

export const reviewApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  adminNotes: z.string().max(APPLICATION_LIMITS.MAX_ADMIN_NOTES_LENGTH).optional(),
});

// backend/src/module/event/job/application/application.validation.ts

import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';
import { APPLICATION_LIMITS } from '../../event.constants';

export const submitApplicationSchema = z.object({
  jobId: z.string().cuid(),
  resumeId: z.string().or(z.literal('default')).optional(),
  coverLetter: z.string().max(APPLICATION_LIMITS.MAX_COVER_LETTER_LENGTH).optional(),
});

export const reviewApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  adminNotes: z.string().max(APPLICATION_LIMITS.MAX_ADMIN_NOTES_LENGTH).optional(),
});

// backend/src/module/event/internship/application/application.types.ts

import { ApplicationStatus } from '@prisma/client';

export interface SubmitInternshipApplicationInput {
  internshipId: string;
  resumeId?: string;
  coverLetter?: string;
  availableFrom?: Date;
}

export interface ReviewInternshipApplicationInput {
  status: ApplicationStatus;
  adminNotes?: string;
}

export interface InternshipApplicationFilters {
  status?: ApplicationStatus[];
  userId?: string;
  internshipId?: string;
}

// backend/src/module/event/job/application/application.types.ts

import { ApplicationStatus } from '@prisma/client';

export interface SubmitApplicationInput {
  jobId: string;
  resumeId?: string;
  coverLetter?: string;
}

export interface ReviewApplicationInput {
  status: ApplicationStatus;
  adminNotes?: string;
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  userId?: string;
  jobId?: string;
}

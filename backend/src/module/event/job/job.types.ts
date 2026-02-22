// backend/src/module/event/job/job.types.ts

import { JobPosting, JobApplication, OpportunityStatus, JobType, WorkMode } from '@prisma/client';
import { 
  BaseOpportunity, 
  BaseOpportunityFilters, 
  EligibilityCriteria, 
  PaginationParams, 
  SortParams 
} from '../shared/event.base.types';

/**
 * =====================================================
 * JOB TYPES
 * =====================================================
 */

export interface CreateJobInput {
  companyName: string;
  roleTitle: string;
  description: string;
  requirements: string[];
  jobType: JobType;
  workMode: WorkMode;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  vacancies: number;
  applicationDeadline: Date;
  isResumeRequired?: boolean;
  status?: OpportunityStatus;
  eligibilityCriteria?: EligibilityCriteria;
  instituteId?: string; // Optional: Only for institute admins
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  status?: OpportunityStatus;
}

export interface JobFilters extends BaseOpportunityFilters {
  jobType?: JobType[];
  salaryCurrency?: string;
}

export interface JobListQuery extends PaginationParams, SortParams, JobFilters {}

export interface JobDetailResponse extends JobPosting {
  _count?: {
    applications: number;
  };
}

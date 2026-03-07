// backend/src/module/event/internship/internship.types.ts

import { Internship, InternshipApplication, OpportunityStatus, InternshipType, DurationType, WorkMode } from '@prisma/client';
import { 
  BaseOpportunityFilters, 
  EligibilityCriteria, 
  PaginationParams, 
  SortParams 
} from '../shared/event.base.types';

/**
 * =====================================================
 * INTERNSHIP TYPES
 * =====================================================
 */

export interface CreateInternshipInput {
  companyName: string;
  roleTitle: string;
  description: string;
  requirements: string[];
  internshipType: InternshipType;
  durationValue: number;
  durationType: DurationType;
  startDate?: Date;
  isFlexibleDates?: boolean;
  workMode: WorkMode;
  location: string;
  stipendMin?: number;
  stipendMax?: number;
  stipendCurrency?: string;
  isPaid?: boolean;
  hasPPO?: boolean;
  ppoDetails?: string;
  vacancies: number;
  applicationDeadline: Date;
  isResumeRequired?: boolean;
  status?: OpportunityStatus;
  eligibilityCriteria?: EligibilityCriteria;
  instituteId?: string;
}

export interface UpdateInternshipInput extends Partial<CreateInternshipInput> {
  status?: OpportunityStatus;
}

export interface InternshipFilters extends BaseOpportunityFilters {
  internshipType?: InternshipType[];
  isPaid?: boolean;
  hasPPO?: boolean;
}

export interface InternshipListQuery extends PaginationParams, SortParams, InternshipFilters {}

export interface InternshipDetailResponse extends Internship {
  _count?: {
    applications: number;
  };
}

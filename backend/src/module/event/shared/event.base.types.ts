// backend/src/module/event/shared/event.base.types.ts

import {
  JobType,
  WorkMode,
  OpportunityStatus,
  ApplicationStatus,
  InternshipType,
  DurationType,
  HackathonStatus,
  HackathonMode,
  ParticipationType,
  HackathonRegistrationStatus,
  TeamStatus,
  TeamMemberRole,
  HackathonSubmissionStatus,
} from '@prisma/client';

/**
 * =====================================================
 * BASE TYPES & INTERFACES
 * =====================================================
 */

// =====================================================
// COMMON ELIGIBILITY
// =====================================================

export interface EligibilityCriteriaRule {
  field: string;
  operator: string;
  value: any;
}

export interface EligibilityCriteria {
  minCgpa?: number;
  maxCgpa?: number;
  minMarks10?: number;
  minMarks12?: number;
  allowedDepartmentIds?: string[];
  allowedCourseYears?: string[];
  requiredSkills?: string[];
  maxBacklogs?: number;
  customRules?: EligibilityCriteriaRule[];
}

export interface EligibilityCheckResult {
  eligible: boolean;
  reasons: string[];
  criteria: EligibilityCriteria;
}

// =====================================================
// BASE OPPORTUNITY (Job & Internship)
// =====================================================

export interface BaseOpportunity {
  id: string;
  companyName: string;
  roleTitle: string;
  description: string;
  requirements: string[];
  workMode: WorkMode;
  location: string;
  vacancies: number;
  applicationDeadline: Date;
  status: OpportunityStatus;
  isResumeRequired: boolean;
  eligibilityCriteria: EligibilityCriteria | null;
  viewsCount: number;
  applicationsStarted: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  closedAt: Date | null;
}

export interface BaseApplication {
  id: string;
  userId: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  appliedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// PAGINATION & FILTERING
// =====================================================

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =====================================================
// FILTERS
// =====================================================

export interface BaseOpportunityFilters {
  search?: string;
  status?: OpportunityStatus[];
  workMode?: WorkMode[];
  instituteId?: string;
  minSalary?: number;
  maxSalary?: number;
  location?: string;
  createdById?: string;
  deadlineFrom?: Date;
  deadlineTo?: Date;
}

export interface HackathonFilters {
  search?: string;
  status?: HackathonStatus[];
  mode?: HackathonMode[];
  participationType?: ParticipationType;
  instituteId?: string;
  themes?: string[];
  eventStartFrom?: Date;
  eventStartTo?: Date;
  registrationOpen?: boolean;
}

// =====================================================
// ANALYTICS & STATS
// =====================================================

export interface OpportunityStats {
  totalViews: number;
  totalApplications: number;
  applicationsByStatus: Record<ApplicationStatus, number>;
  averageApplicationsPerDay: number;
  conversionRate: number; // views to applications
  recentApplications: number; // last 7 days
}

export interface HackathonStats {
  totalViews: number;
  totalRegistrations: number;
  totalTeams: number;
  totalSubmissions: number;
  registrationsByStatus: Record<HackathonRegistrationStatus, number>;
  averageTeamSize: number;
  submissionRate: number; // submissions / registrations
}

// =====================================================
// CREATOR INFO
// =====================================================

export interface CreatorInfo {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export interface InstituteInfo {
  id: string;
  name: string;
}

// =====================================================
// RESPONSE WRAPPERS
// =====================================================

export interface BaseOpportunityResponse extends BaseOpportunity {
  institute: InstituteInfo | null;
  createdBy: CreatorInfo;
  userApplication?: BaseApplication | null;
  stats?: OpportunityStats;
}

export interface BaseApplicationResponse extends BaseApplication {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  resume: {
    id: string;
    fileName: string;
    fileUrl: string;
  } | null;
}

// =====================================================
// HACKATHON SPECIFIC
// =====================================================

export interface HackathonPrize {
  position: string;
  title: string;
  prize: string;
  description?: string;
}

export interface HackathonBase {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  rules: string | null;
  themes: string[];
  mode: HackathonMode;
  venue: string | null;
  websiteUrl: string | null;
  bannerUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  participationType: ParticipationType;
  minTeamSize: number;
  maxTeamSize: number;
  registrationStartDate: Date;
  registrationEndDate: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  submissionDeadline: Date;
  resultsDate: Date | null;
  maxParticipants: number | null;
  prizes: HackathonPrize[] | null;
  isResumeRequired: boolean;
  status: HackathonStatus;
  eligibilityCriteria: EligibilityCriteria | null;
  viewsCount: number;
  registrationsStarted: number;
  participantCount: number;
  teamCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HackathonTeamBase {
  id: string;
  name: string;
  inviteCode: string;
  status: TeamStatus;
  currentSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HackathonSubmissionBase {
  id: string;
  projectName: string;
  projectDescription: string;
  techStack: string[];
  repositoryUrl: string;
  demoUrl: string | null;
  videoUrl: string | null;
  presentationUrl: string | null;
  screenshotsUrls: string[];
  status: HackathonSubmissionStatus;
  submittedAt: Date | null;
  score: number | null;
  rank: number | null;
  feedback: string | null;
  prizeWon: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSavedAt: Date;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type StatusTransition<T extends string> = {
  from: T;
  to: T;
  allowed: boolean;
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

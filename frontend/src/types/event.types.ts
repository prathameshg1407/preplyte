// src/types/event.types.ts

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  INTERNSHIP = 'INTERNSHIP',
}

export enum WorkMode {
  REMOTE = 'REMOTE',
  ON_SITE = 'ON_SITE',
  HYBRID = 'HYBRID',
}

export enum OpportunityStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  HIRED = 'HIRED',
}

export enum HackathonStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  ONGOING = 'ONGOING',
  SUBMISSION_OPEN = 'SUBMISSION_OPEN',
  SUBMISSION_CLOSED = 'SUBMISSION_CLOSED',
  JUDGING = 'JUDGING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum HackathonMode {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID',
}

export enum ParticipationType {
  INDIVIDUAL = 'INDIVIDUAL',
  TEAM = 'TEAM',
  BOTH = 'BOTH',
}

export enum TeamStatus {
  FORMING = 'FORMING',
  COMPLETE = 'COMPLETE',
  LOCKED = 'LOCKED',
  DISQUALIFIED = 'DISQUALIFIED',
}

export enum HackathonSubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  WINNER = 'WINNER',
  DISQUALIFIED = 'DISQUALIFIED',
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
  customRules?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

export interface OpportunityBase {
  id: string;
  title?: string;
  description: string;
  requirements: string[];
  status: OpportunityStatus;
  applicationDeadline: string;
  isResumeRequired: boolean;
  eligibilityCriteria?: EligibilityCriteria;
  instituteId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job extends OpportunityBase {
  companyName: string;
  roleTitle: string;
  jobType: JobType;
  workMode: WorkMode;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  vacancies: number;
}

export interface Internship extends OpportunityBase {
  companyName: string;
  roleTitle: string;
  duration: number;
  location: string;
  stipendMin?: number;
  stipendMax?: number;
  stipendCurrency?: string;
  vacancies: number;
  isPpo: boolean;
}

export interface Hackathon {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  rules?: string;
  themes: string[];
  status: HackathonStatus;
  mode: HackathonMode;
  venue?: string;
  websiteUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  participationType: ParticipationType;
  minTeamSize: number;
  maxTeamSize: number;
  registrationStartDate: string;
  registrationEndDate: string;
  eventStartDate: string;
  eventEndDate: string;
  submissionDeadline: string;
  resultsDate?: string;
  maxParticipants?: number;
  prizes?: Array<{
    position: string;
    title: string;
    prize: string;
    description?: string;
  }>;
  isResumeRequired: boolean;
  eligibilityCriteria?: EligibilityCriteria;
  instituteId?: string;
  createdAt: string;
  updatedAt: string;
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

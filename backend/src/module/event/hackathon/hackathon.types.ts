// backend/src/module/event/hackathon/hackathon.types.ts

import { 
  Hackathon, 
  HackathonRegistration, 
  HackathonTeam, 
  TeamMember, 
  HackathonSubmission, 
  HackathonStatus, 
  HackathonMode, 
  ParticipationType,
  HackathonRegistrationStatus,
  TeamStatus,
  HackathonSubmissionStatus
} from '@prisma/client';
import { 
  BaseOpportunityFilters, 
  EligibilityCriteria, 
  PaginationParams, 
  SortParams,
  HackathonPrize
} from '../shared/event.base.types';

/**
 * =====================================================
 * HACKATHON TYPES
 * =====================================================
 */

export interface CreateHackathonInput {
  title: string;
  tagline?: string;
  description: string;
  rules?: string;
  themes: string[];
  mode: HackathonMode;
  venue?: string;
  websiteUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  participationType: ParticipationType;
  minTeamSize?: number;
  maxTeamSize?: number;
  registrationStartDate: Date;
  registrationEndDate: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  submissionDeadline: Date;
  resultsDate?: Date;
  maxParticipants?: number;
  prizes?: HackathonPrize[];
  isResumeRequired?: boolean;
  status?: HackathonStatus;
  eligibilityCriteria?: EligibilityCriteria;
  instituteId?: string;
}

export interface UpdateHackathonInput extends Partial<CreateHackathonInput> {
  status?: HackathonStatus;
}

export interface HackathonListQuery extends PaginationParams, SortParams, BaseOpportunityFilters {
  mode?: HackathonMode[];
  participationType?: ParticipationType;
  registrationOpen?: boolean;
}

/**
 * =====================================================
 * REGISTRATION & TEAM TYPES
 * =====================================================
 */

export interface RegisterHackathonInput {
  hackathonId: string;
  resumeId?: string;
}

export interface CreateTeamInput {
  hackathonId: string;
  teamName: string;
}

export interface JoinTeamInput {
  hackathonId: string;
  inviteCode: string;
}

/**
 * =====================================================
 * SUBMISSION TYPES
 * =====================================================
 */

export interface SubmitProjectInput {
  hackathonId: string;
  teamId?: string;
  projectName: string;
  projectDescription: string;
  techStack: string[];
  repositoryUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  presentationUrl?: string;
  screenshotsUrls?: string[];
}

export interface ReviewSubmissionInput {
  status: HackathonSubmissionStatus;
  score?: number;
  rank?: number;
  feedback?: string;
  prizeWon?: string;
}

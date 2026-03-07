// backend/src/module/event/hackathon/hackathon.validation.ts

import { z } from 'zod';
import { HackathonMode, ParticipationType, HackathonStatus, HackathonSubmissionStatus } from '@prisma/client';
import { 
  EVENT_LIMITS, 
  HACKATHON_CONSTANTS, 
  ELIGIBILITY_LIMITS, 
  SUBMISSION_LIMITS 
} from '../event.constants';

const EligibilityCriteriaSchema = z.object({
  minCgpa: z.number().min(ELIGIBILITY_LIMITS.MIN_CGPA).max(ELIGIBILITY_LIMITS.MAX_CGPA).optional(),
  maxCgpa: z.number().min(ELIGIBILITY_LIMITS.MIN_CGPA).max(ELIGIBILITY_LIMITS.MAX_CGPA).optional(),
  minMarks10: z.number().min(ELIGIBILITY_LIMITS.MIN_PERCENTAGE).max(ELIGIBILITY_LIMITS.MAX_PERCENTAGE).optional(),
  minMarks12: z.number().min(ELIGIBILITY_LIMITS.MIN_PERCENTAGE).max(ELIGIBILITY_LIMITS.MAX_PERCENTAGE).optional(),
  allowedDepartmentIds: z.array(z.string()).optional(),
  allowedCourseYears: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).max(EVENT_LIMITS.MAX_SKILLS).optional(),
  maxBacklogs: z.number().min(0).max(ELIGIBILITY_LIMITS.MAX_BACKLOGS).optional(),
  customRules: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any()
  })).max(ELIGIBILITY_LIMITS.MAX_CUSTOM_RULES).optional(),
}).optional();

const PrizeSchema = z.object({
  position: z.string(),
  title: z.string(),
  prize: z.string(),
  description: z.string().optional(),
});

const baseCreateHackathonSchema = z.object({
  title: z.string().min(5).max(EVENT_LIMITS.MAX_TITLE_LENGTH),
  tagline: z.string().max(200).optional(),
  description: z.string().min(50).max(EVENT_LIMITS.MAX_DESCRIPTION_LENGTH),
  rules: z.string().max(EVENT_LIMITS.MAX_DESCRIPTION_LENGTH).optional(),
  themes: z.array(z.string()).max(EVENT_LIMITS.MAX_THEMES),
  mode: z.nativeEnum(HackathonMode),
  venue: z.string().max(200).optional(),
  websiteUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  participationType: z.nativeEnum(ParticipationType),
  minTeamSize: z.number().int().min(HACKATHON_CONSTANTS.MIN_PARTICIPANTS).max(EVENT_LIMITS.MAX_TEAM_SIZE).optional().default(HACKATHON_CONSTANTS.DEFAULT_TEAM_SIZE_MIN),
  maxTeamSize: z.number().int().min(HACKATHON_CONSTANTS.MIN_PARTICIPANTS).max(EVENT_LIMITS.MAX_TEAM_SIZE).optional().default(HACKATHON_CONSTANTS.DEFAULT_TEAM_SIZE_MAX),
  registrationStartDate: z.string().datetime(),
  registrationEndDate: z.string().datetime(),
  eventStartDate: z.string().datetime(),
  eventEndDate: z.string().datetime(),
  submissionDeadline: z.string().datetime(),
  resultsDate: z.string().datetime().optional(),
  maxParticipants: z.number().int().min(HACKATHON_CONSTANTS.MIN_PARTICIPANTS).max(HACKATHON_CONSTANTS.MAX_PARTICIPANTS).optional(),
  prizes: z.array(PrizeSchema).max(EVENT_LIMITS.MAX_PRIZES).optional(),
  isResumeRequired: z.boolean().optional().default(false),
  status: z.nativeEnum(HackathonStatus).optional(),
  eligibilityCriteria: EligibilityCriteriaSchema.optional(),
  instituteId: z.string().cuid().optional(),
});

export const createHackathonSchema = baseCreateHackathonSchema.refine(data => {
  const regStart = new Date(data.registrationStartDate);
  const regEnd = new Date(data.registrationEndDate);
  const eventStart = new Date(data.eventStartDate);
  const eventEnd = new Date(data.eventEndDate);
  const subDeadline = new Date(data.submissionDeadline);

  return regStart < regEnd && regEnd < eventStart && eventStart < eventEnd && subDeadline <= eventEnd && subDeadline >= eventStart;
}, {
  message: "Invalid timeline: registration start < end < event start < end, and submission deadline must be within event dates",
  path: ["eventStartDate"]
});

export const updateHackathonSchema = baseCreateHackathonSchema.partial().extend({
  status: z.nativeEnum(HackathonStatus).optional(),
});

export const submitProjectSchema = z.object({
  hackathonId: z.string().cuid(),
  teamId: z.string().cuid().optional(),
  projectName: z.string().min(3).max(SUBMISSION_LIMITS.MAX_PROJECT_NAME_LENGTH),
  projectDescription: z.string().min(20).max(SUBMISSION_LIMITS.MAX_PROJECT_DESCRIPTION_LENGTH),
  techStack: z.array(z.string()).max(SUBMISSION_LIMITS.MAX_TECH_STACK),
  repositoryUrl: z.string().url(),
  demoUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  presentationUrl: z.string().url().optional(),
  screenshotsUrls: z.array(z.string().url()).max(SUBMISSION_LIMITS.MAX_SCREENSHOTS).optional(),
});

export const reviewSubmissionSchema = z.object({
  status: z.nativeEnum(HackathonSubmissionStatus),
  score: z.number().min(0).max(100).optional(),
  rank: z.number().int().min(1).optional(),
  feedback: z.string().max(2000).optional(),
  prizeWon: z.string().max(200).optional(),
});

export const hackathonListQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val)).optional().default('1'),
  limit: z.string().transform(val => parseInt(val)).optional().default('20'),
  search: z.string().optional(),
  status: z.array(z.nativeEnum(HackathonStatus)).optional(),
  mode: z.array(z.nativeEnum(HackathonMode)).optional(),
  participationType: z.nativeEnum(ParticipationType).optional(),
  instituteId: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  registrationOpen: z.preprocess(val => val === 'true', z.boolean()).optional(),
});

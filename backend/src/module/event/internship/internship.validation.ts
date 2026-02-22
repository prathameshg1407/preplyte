// backend/src/module/event/internship/internship.validation.ts

import { z } from 'zod';
import { InternshipType, DurationType, WorkMode, OpportunityStatus } from '@prisma/client';
import { EVENT_LIMITS, COMPENSATION_LIMITS, INTERNSHIP_CONSTANTS, ELIGIBILITY_LIMITS } from '../event.constants';

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

export const baseCreateInternshipSchema = z.object({
  companyName: z.string().min(1).max(EVENT_LIMITS.MAX_TITLE_LENGTH),
  roleTitle: z.string().min(1).max(EVENT_LIMITS.MAX_TITLE_LENGTH),
  description: z.string().min(10).max(EVENT_LIMITS.MAX_DESCRIPTION_LENGTH),
  requirements: z.array(z.string().max(EVENT_LIMITS.MAX_REQUIREMENT_LENGTH)).max(EVENT_LIMITS.MAX_REQUIREMENTS),
  internshipType: z.nativeEnum(InternshipType),
  durationValue: z.number().int().min(INTERNSHIP_CONSTANTS.MIN_DURATION),
  durationType: z.nativeEnum(DurationType),
  startDate: z.string().datetime().optional(),
  isFlexibleDates: z.boolean().optional().default(false),
  workMode: z.nativeEnum(WorkMode),
  location: z.string().min(1).max(200),
  stipendMin: z.number().min(COMPENSATION_LIMITS.MIN_STIPEND).max(COMPENSATION_LIMITS.MAX_STIPEND).optional(),
  stipendMax: z.number().min(COMPENSATION_LIMITS.MIN_STIPEND).max(COMPENSATION_LIMITS.MAX_STIPEND).optional(),
  stipendCurrency: z.string().length(3).optional().default(COMPENSATION_LIMITS.DEFAULT_CURRENCY),
  isPaid: z.boolean().optional().default(true),
  hasPPO: z.boolean().optional().default(false),
  ppoDetails: z.string().optional(),
  vacancies: z.number().int().min(INTERNSHIP_CONSTANTS.MIN_VACANCIES).max(INTERNSHIP_CONSTANTS.MAX_VACANCIES),
  applicationDeadline: z.string().datetime(),
  isResumeRequired: z.boolean().optional().default(true),
  status: z.nativeEnum(OpportunityStatus).optional(),
  eligibilityCriteria: EligibilityCriteriaSchema,
  instituteId: z.string().cuid().optional(),
});

export const createInternshipSchema = baseCreateInternshipSchema.refine(data => {
  if (data.stipendMin && data.stipendMax) {
    return data.stipendMin <= data.stipendMax;
  }
  return true;
}, {
  message: "stipendMin must be less than or equal to stipendMax",
  path: ["stipendMax"]
});

export const updateInternshipSchema = baseCreateInternshipSchema.partial().extend({
  status: z.nativeEnum(OpportunityStatus).optional(),
});

export const internshipListQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val)).optional().default('1'),
  limit: z.string().transform(val => parseInt(val)).optional().default('20'),
  search: z.string().optional(),
  status: z.array(z.nativeEnum(OpportunityStatus)).optional(),
  internshipType: z.array(z.nativeEnum(InternshipType)).optional(),
  workMode: z.array(z.nativeEnum(WorkMode)).optional(),
  isPaid: z.string().transform(val => val === 'true').optional(),
  hasPPO: z.string().transform(val => val === 'true').optional(),
  location: z.string().optional(),
  instituteId: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

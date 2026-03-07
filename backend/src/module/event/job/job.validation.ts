// backend/src/module/event/job/job.validation.ts

import { z } from 'zod';
import { JobType, WorkMode, OpportunityStatus } from '@prisma/client';
import { EVENT_LIMITS, COMPENSATION_LIMITS, JOB_CONSTANTS, ELIGIBILITY_LIMITS } from '../event.constants';

/**
 * =====================================================
 * ELIGIBILITY VALIDATION
 * =====================================================
 */

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

/**
 * =====================================================
 * JOB VALIDATION SCHEMAS
 * =====================================================
 */

export const baseCreateJobSchema = z.object({
  companyName: z.string().min(1).max(EVENT_LIMITS.MAX_TITLE_LENGTH),
  roleTitle: z.string().min(1).max(EVENT_LIMITS.MAX_TITLE_LENGTH),
  description: z.string().min(10).max(EVENT_LIMITS.MAX_DESCRIPTION_LENGTH),
  requirements: z.array(z.string().max(EVENT_LIMITS.MAX_REQUIREMENT_LENGTH)).max(EVENT_LIMITS.MAX_REQUIREMENTS),
  jobType: z.nativeEnum(JobType),
  workMode: z.nativeEnum(WorkMode),
  location: z.string().min(1).max(200),
  salaryMin: z.number().min(COMPENSATION_LIMITS.MIN_SALARY).max(COMPENSATION_LIMITS.MAX_SALARY).optional(),
  salaryMax: z.number().min(COMPENSATION_LIMITS.MIN_SALARY).max(COMPENSATION_LIMITS.MAX_SALARY).optional(),
  salaryCurrency: z.string().length(3).optional().default(COMPENSATION_LIMITS.DEFAULT_CURRENCY),
  vacancies: z.number().int().min(JOB_CONSTANTS.MIN_VACANCIES).max(JOB_CONSTANTS.MAX_VACANCIES),
  applicationDeadline: z.string().datetime(),
  isResumeRequired: z.boolean().optional().default(true),
  status: z.nativeEnum(OpportunityStatus).optional(),
  eligibilityCriteria: EligibilityCriteriaSchema,
  instituteId: z.string().cuid().optional(),
});

export const createJobSchema = baseCreateJobSchema.refine(data => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: "salaryMin must be less than or equal to salaryMax",
  path: ["salaryMax"]
});

export const updateJobSchema = baseCreateJobSchema.partial().extend({
  status: z.nativeEnum(OpportunityStatus).optional(),
});

export const jobListQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val)).optional().default('1'),
  limit: z.string().transform(val => parseInt(val)).optional().default('20'),
  search: z.string().optional(),
  status: z.array(z.nativeEnum(OpportunityStatus)).optional(),
  jobType: z.array(z.nativeEnum(JobType)).optional(),
  workMode: z.array(z.nativeEnum(WorkMode)).optional(),
  minSalary: z.string().transform(val => parseInt(val)).optional(),
  maxSalary: z.string().transform(val => parseInt(val)).optional(),
  location: z.string().optional(),
  instituteId: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

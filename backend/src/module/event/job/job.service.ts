// backend/src/module/event/job/job.service.ts

import { prisma } from '../../../lib/db';
import { OpportunityStatus, Prisma, JobApplication } from '@prisma/client';
import { 
  NotFoundError, 
  BadRequestError, 
  ForbiddenError 
} from '../../../utils/errors';
import { logger } from '../../../utils/logger';
import { 
  CreateJobInput, 
  UpdateJobInput, 
  JobListQuery 
} from './job.types';
import { 
  calculatePagination, 
  calculatePaginationMeta, 
  validateStatusTransition,
  generateUniqueSlug
} from '../shared/event.utils';
import { checkEligibility } from '../shared/eligibility.utils';

/**
 * =====================================================
 * JOB SERVICE
 * =====================================================
 */

export class JobService {
  /**
   * Create a new job posting
   */
  async createJob(input: CreateJobInput, creatorId: string) {
    logger.info('[JobService] Creating new job', { roleTitle: input.roleTitle, creatorId });

    const job = await prisma.jobPosting.create({
      data: {
        instituteId: input.instituteId || null,
        createdById: creatorId,
        companyName: input.companyName,
        roleTitle: input.roleTitle,
        description: input.description,
        requirements: input.requirements,
        jobType: input.jobType,
        workMode: input.workMode,
        location: input.location,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        salaryCurrency: input.salaryCurrency || 'INR',
        vacancies: input.vacancies,
        applicationDeadline: new Date(input.applicationDeadline),
        isResumeRequired: input.isResumeRequired ?? true,
        status: input.status || OpportunityStatus.DRAFT,
        eligibilityCriteria: input.eligibilityCriteria as any,
      },
    });

    return job;
  }

  /**
   * Get a single job by ID
   */
  async getJobById(id: string, userId?: string) {
    const job = await prisma.jobPosting.findUnique({
      where: { id, isDeleted: false },
      include: {
        institute: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!job) {
      throw new NotFoundError('Job posting not found');
    }

    // Increment view count (async, don't block)
    prisma.jobPosting.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    }).catch(err => logger.error('[JobService] Failed to increment view count', { id, err }));

    // If userId is provided, check if they have already applied
    let userApplication: JobApplication | null = null;
    if (userId) {
      userApplication = await prisma.jobApplication.findUnique({
        where: {
          jobId_userId: { jobId: id, userId }
        }
      });
    }

    return { ...job, userApplication };
  }

  /**
   * List jobs with filters and pagination
   */
  async listJobs(query: JobListQuery) {
    const { skip, take, page, limit } = calculatePagination({ 
      page: query.page, 
      limit: query.limit 
    });

    const where: Prisma.JobPostingWhereInput = {
      isDeleted: false,
      status: query.status ? { in: query.status } : OpportunityStatus.PUBLISHED,
    };

    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { roleTitle: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.instituteId) {
      where.instituteId = query.instituteId;
    }

    if (query.jobType) {
      where.jobType = { in: query.jobType };
    }

    if (query.workMode) {
      where.workMode = { in: query.workMode };
    }

    if (query.minSalary !== undefined) {
      where.salaryMax = { gte: query.minSalary };
    }

    if (query.maxSalary !== undefined) {
      where.salaryMin = { lte: query.maxSalary };
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    const [total, data] = await Promise.all([
      prisma.jobPosting.count({ where }),
      prisma.jobPosting.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          institute: { select: { id: true, name: true } },
          _count: { select: { applications: true } }
        }
      })
    ]);

    return {
      data,
      meta: calculatePaginationMeta(total, page, limit)
    };
  }

  /**
   * Update a job posting
   */
  async updateJob(id: string, input: UpdateJobInput, userId: string, userRole: string) {
    const job = await prisma.jobPosting.findUnique({
      where: { id, isDeleted: false }
    });

    if (!job) {
      throw new NotFoundError('Job posting not found');
    }

    // Authorization check
    if (userRole !== 'PLATFORM_ADMIN' && job.createdById !== userId) {
      throw new ForbiddenError('You do not have permission to update this job');
    }

    // Handle status transition
    if (input.status && input.status !== job.status) {
      validateStatusTransition(job.status, input.status, 'OpportunityStatus');
      
      if (input.status === OpportunityStatus.PUBLISHED) {
        (input as any).publishedAt = new Date();
      } else if (input.status === OpportunityStatus.CLOSED) {
        (input as any).closedAt = new Date();
      }
    }

    const updatedJob = await prisma.jobPosting.update({
      where: { id },
      data: {
        ...input,
        eligibilityCriteria: input.eligibilityCriteria as any,
      }
    });

    return updatedJob;
  }

  /**
   * Soft delete a job posting
   */
  async deleteJob(id: string, userId: string, userRole: string) {
    const job = await prisma.jobPosting.findUnique({
      where: { id, isDeleted: false }
    });

    if (!job) {
      throw new NotFoundError('Job posting not found');
    }

    // Authorization check
    if (userRole !== 'PLATFORM_ADMIN' && job.createdById !== userId) {
      throw new ForbiddenError('You do not have permission to delete this job');
    }

    await prisma.jobPosting.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        status: OpportunityStatus.CANCELLED
      }
    });

    return { success: true };
  }

  /**
   * Check eligibility for a job
   */
  async checkUserEligibility(jobId: string, userId: string) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId, isDeleted: false },
      select: { eligibilityCriteria: true }
    });

    if (!job) {
      throw new NotFoundError('Job posting not found');
    }

    return await checkEligibility(userId, job.eligibilityCriteria as any);
  }
}

export const jobService = new JobService();

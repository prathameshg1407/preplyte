// backend/src/module/event/job/application/application.service.ts

import { prisma } from '../../../../lib/db';
import { ApplicationStatus, OpportunityStatus } from '@prisma/client';
import { 
  NotFoundError, 
  BadRequestError, 
  ForbiddenError 
} from '../../../../utils/errors';
import { logger } from '../../../../utils/logger';
import { 
  SubmitApplicationInput, 
  ReviewApplicationInput, 
  ApplicationFilters 
} from './application.types';
import { checkEligibility } from '../../shared/eligibility.utils';

export class ApplicationService {
  /**
   * Submit a job application
   */
  async submitApplication(input: SubmitApplicationInput, userId: string) {
    logger.info('[ApplicationService] Submitting job application', { jobId: input.jobId, userId });

    // 1. Check if job exists and is published
    const job = await prisma.jobPosting.findUnique({
      where: { id: input.jobId, isDeleted: false }
    });

    if (!job) {
      throw new NotFoundError('Job posting not found');
    }

    if (job.status !== OpportunityStatus.PUBLISHED) {
      throw new BadRequestError('This job is not accepting applications');
    }

    // 2. Check deadline
    if (new Date() > new Date(job.applicationDeadline)) {
      throw new BadRequestError('The application deadline for this job has passed');
    }

    // 3. Check if already applied
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: { jobId: input.jobId, userId }
      }
    });

    if (existing) {
      logger.info('[ApplicationService] User already applied, returning existing application', { 
        jobId: input.jobId, 
        userId,
        applicationId: existing.id 
      });
      return existing;
    }

    // 4. Check eligibility
    const eligibilityResult = await checkEligibility(userId, job.eligibilityCriteria as any);
    if (!eligibilityResult.eligible) {
      throw new BadRequestError(`You do not meet the eligibility criteria: ${eligibilityResult.reasons.join(', ')}`);
    }

    // 5. Handle resume
    let finalResumeId = input.resumeId;
    if (finalResumeId === 'default') {
      const defaultResume = await prisma.resume.findFirst({
        where: { userId, isDefault: true }
      });
      if (!defaultResume) {
        throw new BadRequestError('No default resume found. Please upload a resume first.');
      }
      finalResumeId = defaultResume.id;
    }

    if (job.isResumeRequired && !finalResumeId) {
      throw new BadRequestError('A resume is required for this job application');
    }

    // 6. Create application
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.jobApplication.create({
        data: {
          jobId: input.jobId,
          userId: userId,
          resumeId: finalResumeId,
          coverLetter: input.coverLetter,
          status: ApplicationStatus.APPLIED,
        }
      });

      // Increment application count on job (started)
      await tx.jobPosting.update({
        where: { id: input.jobId },
        data: { applicationsStarted: { increment: 1 } }
      });

      return app;
    });

    return application;
  }

  /**
   * Review an application (Admin only)
   */
  async reviewApplication(id: string, input: ReviewApplicationInput, adminId: string) {
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Update status and notes
    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        status: input.status,
        adminNotes: input.adminNotes,
        reviewedAt: new Date(),
        reviewedBy: adminId
      }
    });

    return updated;
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id: string, userId: string, userRole: string) {
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        resume: true
      }
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Check permissions
    if (userRole === 'USER' && application.userId !== userId) {
      throw new ForbiddenError('You do not have permission to view this application');
    }

    return application;
  }

  /**
   * List applications for a job or user
   */
  async listApplications(filters: ApplicationFilters) {
    const where: any = {};
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = { in: filters.status };

    return await prisma.jobApplication.findMany({
      where,
      include: {
        job: {
          select: { id: true, roleTitle: true, companyName: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }
}

export const applicationService = new ApplicationService();

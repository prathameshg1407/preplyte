// backend/src/module/event/internship/application/application.service.ts

import { prisma } from '../../../../lib/db';
import { ApplicationStatus, OpportunityStatus } from '@prisma/client';
import { 
  NotFoundError, 
  BadRequestError, 
  ForbiddenError 
} from '../../../../utils/errors';
import { logger } from '../../../../utils/logger';
import { 
  SubmitInternshipApplicationInput, 
  ReviewInternshipApplicationInput, 
  InternshipApplicationFilters 
} from './application.types';
import { checkEligibility } from '../../shared/eligibility.utils';

export class InternshipApplicationService {
  async submitApplication(input: SubmitInternshipApplicationInput, userId: string) {
    logger.info('[InternshipAppService] Submitting application', { internshipId: input.internshipId, userId });

    const internship = await prisma.internship.findUnique({
      where: { id: input.internshipId, isDeleted: false }
    });

    if (!internship) throw new NotFoundError('Internship not found');
    if (internship.status !== OpportunityStatus.PUBLISHED) throw new BadRequestError('Not accepting applications');

    if (new Date() > new Date(internship.applicationDeadline)) {
      throw new BadRequestError('Deadline passed');
    }

    const existing = await prisma.internshipApplication.findUnique({
      where: { internshipId_userId: { internshipId: input.internshipId, userId } }
    });

    if (existing) {
      logger.info('[InternshipAppService] User already applied, returning existing application', { 
        internshipId: input.internshipId, 
        userId,
        applicationId: existing.id 
      });
      return existing;
    }

    const eligibilityResult = await checkEligibility(userId, internship.eligibilityCriteria as any);
    if (!eligibilityResult.eligible) {
      throw new BadRequestError(`Ineligible: ${eligibilityResult.reasons.join(', ')}`);
    }

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

    if (internship.isResumeRequired && !finalResumeId) {
      throw new BadRequestError('Resume required');
    }

    return await prisma.$transaction(async (tx) => {
      const app = await tx.internshipApplication.create({
        data: {
          internshipId: input.internshipId,
          userId: userId,
          resumeId: finalResumeId,
          coverLetter: input.coverLetter,
          availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
          status: ApplicationStatus.APPLIED,
        }
      });

      await tx.internship.update({
        where: { id: input.internshipId },
        data: { applicationsStarted: { increment: 1 } }
      });

      return app;
    });
  }

  async reviewApplication(id: string, input: ReviewInternshipApplicationInput, adminId: string) {
    const application = await prisma.internshipApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundError('Application not found');

    return await prisma.internshipApplication.update({
      where: { id },
      data: {
        status: input.status,
        adminNotes: input.adminNotes,
        reviewedAt: new Date(),
        reviewedBy: adminId
      }
    });
  }

  async getApplicationById(id: string, userId: string, userRole: string) {
    const application = await prisma.internshipApplication.findUnique({
      where: { id },
      include: {
        internship: true,
        user: { select: { id: true, name: true, email: true } },
        resume: true
      }
    });

    if (!application) throw new NotFoundError('Application not found');
    if (userRole === 'USER' && application.userId !== userId) throw new ForbiddenError('Denied');

    return application;
  }

  async listApplications(filters: InternshipApplicationFilters) {
    const where: any = {};
    if (filters.internshipId) where.internshipId = filters.internshipId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = { in: filters.status };

    return await prisma.internshipApplication.findMany({
      where,
      include: {
        internship: { select: { id: true, roleTitle: true, companyName: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }
}

export const internshipApplicationService = new InternshipApplicationService();

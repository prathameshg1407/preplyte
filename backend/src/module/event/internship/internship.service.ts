// backend/src/module/event/internship/internship.service.ts

import { prisma } from '../../../lib/db';
import { OpportunityStatus, Prisma, InternshipApplication } from '@prisma/client';
import { 
  NotFoundError, 
  BadRequestError, 
  ForbiddenError 
} from '../../../utils/errors';
import { logger } from '../../../utils/logger';
import { 
  CreateInternshipInput, 
  UpdateInternshipInput, 
  InternshipListQuery 
} from './internship.types';
import { 
  calculatePagination, 
  calculatePaginationMeta, 
  validateStatusTransition 
} from '../shared/event.utils';
import { checkEligibility } from '../shared/eligibility.utils';

export class InternshipService {
  /**
   * Create a new internship
   */
  async createInternship(input: CreateInternshipInput, creatorId: string) {
    logger.info('[InternshipService] Creating new internship', { roleTitle: input.roleTitle, creatorId });

    return await prisma.internship.create({
      data: {
        instituteId: input.instituteId || null,
        createdById: creatorId,
        companyName: input.companyName,
        roleTitle: input.roleTitle,
        description: input.description,
        requirements: input.requirements,
        internshipType: input.internshipType,
        durationValue: input.durationValue,
        durationType: input.durationType,
        startDate: input.startDate ? new Date(input.startDate) : null,
        isFlexibleDates: input.isFlexibleDates ?? false,
        workMode: input.workMode,
        location: input.location,
        stipendMin: input.stipendMin,
        stipendMax: input.stipendMax,
        stipendCurrency: input.stipendCurrency || 'INR',
        isPaid: input.isPaid ?? true,
        hasPPO: input.hasPPO ?? false,
        ppoDetails: input.ppoDetails,
        vacancies: input.vacancies,
        applicationDeadline: new Date(input.applicationDeadline),
        isResumeRequired: input.isResumeRequired ?? true,
        status: input.status || OpportunityStatus.DRAFT,
        eligibilityCriteria: input.eligibilityCriteria as any,
      },
    });
  }

  /**
   * Get an internship by ID
   */
  async getInternshipById(id: string, userId?: string) {
    const internship = await prisma.internship.findUnique({
      where: { id, isDeleted: false },
      include: {
        institute: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { applications: true } }
      }
    });

    if (!internship) {
      throw new NotFoundError('Internship posting not found');
    }

    // viewsCount update (async)
    prisma.internship.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    }).catch(err => logger.error('[InternshipService] Failed to increment view count', { id, err }));

    let userApplication: InternshipApplication | null = null;
    if (userId) {
      userApplication = await prisma.internshipApplication.findUnique({
        where: {
          internshipId_userId: { internshipId: id, userId }
        }
      });
    }

    return { ...internship, userApplication };
  }

  /**
   * List internships
   */
  async listInternships(query: InternshipListQuery) {
    const { skip, take, page, limit } = calculatePagination({ 
      page: query.page, 
      limit: query.limit 
    });

    const where: Prisma.InternshipWhereInput = {
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

    if (query.instituteId) where.instituteId = query.instituteId;
    if (query.internshipType) where.internshipType = { in: query.internshipType };
    if (query.isPaid !== undefined) where.isPaid = query.isPaid;
    if (query.hasPPO !== undefined) where.hasPPO = query.hasPPO;
    if (query.location) where.location = { contains: query.location, mode: 'insensitive' };

    const [total, data] = await Promise.all([
      prisma.internship.count({ where }),
      prisma.internship.findMany({
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
   * Update internship
   */
  async updateInternship(id: string, input: UpdateInternshipInput, userId: string, userRole: string) {
    const internship = await prisma.internship.findUnique({
      where: { id, isDeleted: false }
    });

    if (!internship) {
      throw new NotFoundError('Internship not found');
    }

    if (userRole !== 'PLATFORM_ADMIN' && internship.createdById !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (input.status && input.status !== internship.status) {
      validateStatusTransition(internship.status, input.status, 'OpportunityStatus');
      
      if (input.status === OpportunityStatus.PUBLISHED) {
        (input as any).publishedAt = new Date();
      } else if (input.status === OpportunityStatus.CLOSED) {
        (input as any).closedAt = new Date();
      }
    }

    return await prisma.internship.update({
      where: { id },
      data: {
        ...input,
        eligibilityCriteria: input.eligibilityCriteria as any,
      }
    });
  }

  /**
   * Soft delete internship
   */
  async deleteInternship(id: string, userId: string, userRole: string) {
    const internship = await prisma.internship.findUnique({
      where: { id, isDeleted: false }
    });

    if (!internship) throw new NotFoundError('Internship not found');

    if (userRole !== 'PLATFORM_ADMIN' && internship.createdById !== userId) {
      throw new ForbiddenError('Access denied');
    }

    await prisma.internship.update({
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
   * Check eligibility
   */
  async checkUserEligibility(internshipId: string, userId: string) {
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId, isDeleted: false },
      select: { eligibilityCriteria: true }
    });

    if (!internship) throw new NotFoundError('Internship not found');

    return await checkEligibility(userId, internship.eligibilityCriteria as any);
  }
}

export const internshipService = new InternshipService();

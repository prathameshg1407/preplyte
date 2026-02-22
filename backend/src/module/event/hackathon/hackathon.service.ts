// backend/src/module/event/hackathon/hackathon.service.ts

import { prisma } from '../../../lib/db';
import { HackathonStatus, ParticipationType, Prisma } from '@prisma/client';
import { 
  NotFoundError, 
  BadRequestError, 
  ForbiddenError 
} from '../../../utils/errors';
import { logger } from '../../../utils/logger';
import { 
  CreateHackathonInput, 
  UpdateHackathonInput, 
  HackathonListQuery 
} from './hackathon.types';
import { 
  calculatePagination, 
  calculatePaginationMeta, 
  validateStatusTransition 
} from '../shared/event.utils';
import { checkEligibility } from '../shared/eligibility.utils';

export class HackathonService {
  /**
   * Create a new hackathon
   */
  async createHackathon(input: CreateHackathonInput, creatorId: string) {
    logger.info('[HackathonService] Creating new hackathon', { title: input.title, creatorId });

    return await prisma.hackathon.create({
      data: {
        instituteId: input.instituteId || null,
        createdById: creatorId,
        title: input.title,
        tagline: input.tagline,
        description: input.description,
        rules: input.rules,
        themes: input.themes,
        mode: input.mode,
        venue: input.venue,
        websiteUrl: input.websiteUrl,
        bannerUrl: input.bannerUrl,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        participationType: input.participationType,
        minTeamSize: input.minTeamSize ?? 1,
        maxTeamSize: input.maxTeamSize ?? 4,
        registrationStartDate: new Date(input.registrationStartDate),
        registrationEndDate: new Date(input.registrationEndDate),
        eventStartDate: new Date(input.eventStartDate),
        eventEndDate: new Date(input.eventEndDate),
        submissionDeadline: new Date(input.submissionDeadline),
        resultsDate: input.resultsDate ? new Date(input.resultsDate) : null,
        maxParticipants: input.maxParticipants,
        prizes: input.prizes as any,
        isResumeRequired: input.isResumeRequired ?? false,
        status: input.status || HackathonStatus.DRAFT,
        eligibilityCriteria: input.eligibilityCriteria ? (input.eligibilityCriteria as any) : null,
      },
    });
  }

  /**
   * Get a hackathon by ID
   */
  async getHackathonById(id: string, userId?: string) {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id, isDeleted: false },
      include: {
        institute: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      }
    });

    if (!hackathon) {
      throw new NotFoundError('Hackathon not found');
    }

    // Increment views (async)
    prisma.hackathon.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    }).catch(err => logger.error('[HackathonService] Failed to increment views', { id, err }));

    let userRegistration: any = null;
    if (userId) {
      userRegistration = await prisma.hackathonRegistration.findUnique({
        where: { hackathonId_userId: { hackathonId: id, userId } },
        include: { team: true }
      });
    }

    return { ...hackathon, userRegistration };
  }

  /**
   * List hackathons
   */
  async listHackathons(query: HackathonListQuery) {
    const { skip, take, page, limit } = calculatePagination({ 
      page: query.page, 
      limit: query.limit 
    });

    const where: Prisma.HackathonWhereInput = {
      isDeleted: false,
    };

    if (query.status) {
      where.status = { in: query.status as any };
    } else {
      where.status = { not: HackathonStatus.DRAFT };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { tagline: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.instituteId) where.instituteId = query.instituteId;
    if (query.mode) where.mode = { in: query.mode as any };
    if (query.participationType) where.participationType = query.participationType as any;
    
    if (query.registrationOpen) {
      const now = new Date();
      where.registrationStartDate = { lte: now };
      where.registrationEndDate = { gte: now };
      where.status = HackathonStatus.REGISTRATION_OPEN;
    }

    const [total, data] = await Promise.all([
      prisma.hackathon.count({ where }),
      prisma.hackathon.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          institute: { select: { id: true, name: true } }
        }
      })
    ]);

    return {
      data,
      meta: calculatePaginationMeta(total, page, limit)
    };
  }

  /**
   * Update hackathon
   */
  async updateHackathon(id: string, input: UpdateHackathonInput, userId: string, userRole: string) {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id, isDeleted: false }
    });

    if (!hackathon) throw new NotFoundError('Hackathon not found');

    if (userRole !== 'PLATFORM_ADMIN' && hackathon.createdById !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (input.status && input.status !== hackathon.status) {
      validateStatusTransition(hackathon.status, input.status, 'HackathonStatus');
      
      if (input.status === HackathonStatus.PUBLISHED) {
        (input as any).publishedAt = new Date();
      }
    }

    return await prisma.hackathon.update({
      where: { id },
      data: {
        ...input,
        prizes: input.prizes as any,
        eligibilityCriteria: input.eligibilityCriteria ? (input.eligibilityCriteria as any) : null,
      }
    });
  }

  /**
   * Soft delete hackathon
   */
  async deleteHackathon(id: string, userId: string, userRole: string) {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id, isDeleted: false }
    });

    if (!hackathon) throw new NotFoundError('Hackathon not found');

    if (userRole !== 'PLATFORM_ADMIN' && hackathon.createdById !== userId) {
      throw new ForbiddenError('Access denied');
    }

    await prisma.hackathon.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        status: HackathonStatus.CANCELLED
      }
    });

    return { success: true };
  }

  /**
   * Check eligibility
   */
  async checkUserEligibility(hackathonId: string, userId: string) {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId, isDeleted: false },
      select: { eligibilityCriteria: true }
    });

    if (!hackathon) throw new NotFoundError('Hackathon not found');

    // If no eligibility criteria, everyone is eligible
    if (!hackathon.eligibilityCriteria) {
      return { eligible: true, reasons: [] };
    }

    return await checkEligibility(userId, hackathon.eligibilityCriteria as any);
  }
}

export const hackathonService = new HackathonService();

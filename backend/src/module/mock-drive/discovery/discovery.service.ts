// src/module/mock-drive/discovery/discovery.service.ts

import { PrismaClient, MockDriveStatus, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../../utils/errors';
import {
  DiscoveryListParams,
  DiscoveryListResponse,
  EligibilityCheckResponse,
  RegistrationResponse,
  MyRegistrationsResponse,
  EligibilityCheckResult,
} from './discovery.types';
import { MockDriveDetail } from '../shared';
import { checkEligibility } from '../utils/eligibility.utils';
import { isWithinRegistrationPeriod } from '../utils/time.utils';
import { MOCKDRIVE_CONSTANTS } from '../shared/mockdrive.constants';
import { logger } from '../../../utils/logger';

// Roles that can see all institutes' drives
const SUPER_ADMIN_ROLES = ['SUPER_ADMIN'] as const;

export class DiscoveryService {
  constructor(private prisma: PrismaClient) {}

  // ============================================
  // Helper: Get user with institute validation
  // ============================================
  
  private async getUserWithInstituteValidation(
    userId: string,
    userRole?: string
  ): Promise<{ id: string; instituteId: string | null; role: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, instituteId: true, role: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  // ============================================
  // Helper: Check if user can access a drive
  // ============================================

  private canAccessDrive(
    userInstituteId: string | null,
    driveInstituteId: string | null,
    userRole: string
  ): boolean {
    // Super admins can access all drives
    if (SUPER_ADMIN_ROLES.includes(userRole as typeof SUPER_ADMIN_ROLES[number])) {
      return true;
    }

    // User must belong to an institute
    if (!userInstituteId) {
      return false;
    }

    // Drive must belong to user's institute
    return userInstituteId === driveInstituteId;
  }

  // ============================================
  // Helper: Validate drive access
  // ============================================

  private async validateDriveAccess(
    userId: string,
    driveId: string,
    userRole?: string
  ): Promise<{ user: { id: string; instituteId: string | null; role: string }; drive: any }> {
    const user = await this.getUserWithInstituteValidation(userId, userRole);

    const drive = await this.prisma.mockDrive.findUnique({
      where: { id: driveId },
      select: { id: true, instituteId: true },
    });

    if (!drive) {
      throw new NotFoundError('Mock drive');
    }

    if (!this.canAccessDrive(user.instituteId, drive.instituteId, user.role)) {
      // Return generic "not found" to avoid information leakage
      throw new NotFoundError('Mock drive');
    }

    return { user, drive };
  }

  // ============================================
  // List Available Drives
  // ============================================

  async listAvailableDrives(
    userId: string,
    params: DiscoveryListParams,
    userRole?: string
  ): Promise<DiscoveryListResponse> {
    const {
      page = 1,
      limit = MOCKDRIVE_CONSTANTS.DEFAULT_PAGE_SIZE,
      filters = {},
    } = params;

    // Ensure page and limit are numbers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page);
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit);
    const skip = (pageNum - 1) * limitNum;

    logger.debug('Listing available drives', { userId, params });

    // Get user with institute info
    const user = await this.getUserWithInstituteValidation(userId, userRole);

    // Check if user is super admin
    const isSuperAdmin = SUPER_ADMIN_ROLES.includes(
      user.role as typeof SUPER_ADMIN_ROLES[number]
    );

    // For non-super-admin users without an institute, return empty list
    if (!isSuperAdmin && !user.instituteId) {
      logger.warn('User without institute trying to list drives', { userId });
      return {
        drives: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Default statuses if not provided
    const defaultStatuses: MockDriveStatus[] = [
      MockDriveStatus.PUBLISHED,
      MockDriveStatus.REGISTRATION_OPEN,
      MockDriveStatus.REGISTRATION_CLOSED,
      MockDriveStatus.IN_PROGRESS,
    ];

    // Build where clause
    const where: Prisma.MockDriveWhereInput = {
      // Status filter
      status: {
        in: Array.isArray(filters.status) && filters.status.length > 0
          ? filters.status
          : defaultStatuses,
      },
    };

    // ====================================================
    // CRITICAL: Institute-based access control
    // ====================================================
    if (isSuperAdmin) {
      // Super admin can optionally filter by institute
      if (filters.instituteId) {
        where.instituteId = filters.instituteId;
      }
    } else {
      // Non-super-admin users can ONLY see their institute's drives
      // This is mandatory, not optional
      where.instituteId = user.instituteId!;
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Registration open filter
    if (filters.registrationOpen) {
      const now = new Date();
      where.status = MockDriveStatus.REGISTRATION_OPEN;
      where.registrationStartDate = { lte: now };
      where.registrationEndDate = { gte: now };
    }

    logger.debug('Query where clause', { where, isSuperAdmin, userInstituteId: user.instituteId });

    // Get total count and drives in parallel
    const [total, drives] = await Promise.all([
      this.prisma.mockDrive.count({ where }),
      this.prisma.mockDrive.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ driveStartDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          institute: {
            select: { id: true, name: true },
          },
          _count: {
            select: { modules: true, registrations: true },
          },
          registrations: {
            where: { userId },
            select: {
              id: true,
              status: true,
              batch: {
                select: {
                  id: true,
                  name: true,
                  scheduledStartTime: true,
                  scheduledEndTime: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const driveList = drives.map((drive) => {
      const userRegistration = drive.registrations[0];
      return {
        id: drive.id,
        title: drive.title,
        description: drive.description,
        status: drive.status,
        registrationStartDate: drive.registrationStartDate,
        registrationEndDate: drive.registrationEndDate,
        driveStartDate: drive.driveStartDate,
        driveEndDate: drive.driveEndDate,
        moduleCount: drive._count.modules,
        registrationCount: drive._count.registrations,
        institute: drive.institute,
        isRegistered: !!userRegistration,
        registrationStatus: userRegistration?.status || null,
        batchInfo: userRegistration?.batch || null,
      };
    });

    logger.debug('Drives found', { count: driveList.length, total });

    return {
      drives: driveList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  // ============================================
  // Get Drive Details
  // ============================================

  async getDriveDetails(
    userId: string,
    driveId: string,
    userRole?: string
  ): Promise<MockDriveDetail> {
    // Validate user can access this drive
    await this.validateDriveAccess(userId, driveId, userRole);

    const drive = await this.prisma.mockDrive.findUnique({
      where: { id: driveId },
      include: {
        institute: {
          select: { id: true, name: true },
        },
        modules: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            moduleType: true,
            order: true,
            name: true,
            timeLimit: true,
            weightage: true,
            instructions: true,
          },
        },
        eligibilityCriteria: true,
        registrations: {
          where: { userId },
          select: {
            id: true,
            status: true,
            batch: {
              select: {
                id: true,
                name: true,
                scheduledStartTime: true,
                scheduledEndTime: true,
              },
            },
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!drive) {
      throw new NotFoundError('Mock drive');
    }

    const userRegistration = drive.registrations[0];
    const totalTimeLimit = drive.modules.reduce(
      (sum, m) => sum + m.timeLimit,
      0
    );

    return {
      id: drive.id,
      title: drive.title,
      description: drive.description,
      instructions: drive.instructions,
      status: drive.status,
      registrationStartDate: drive.registrationStartDate,
      registrationEndDate: drive.registrationEndDate,
      driveStartDate: drive.driveStartDate,
      driveEndDate: drive.driveEndDate,
      registrationCount: drive._count.registrations,
      institute: drive.institute,
      isRegistered: !!userRegistration,
      registrationStatus: userRegistration?.status || null,
      batchInfo: userRegistration?.batch || null,
      modules: drive.modules,
      eligibilityCriteria: drive.eligibilityCriteria
        ? {
            minCgpa: drive.eligibilityCriteria.minCgpa,
            maxCgpa: drive.eligibilityCriteria.maxCgpa,
            minMarks10: drive.eligibilityCriteria.minMarks10,
            minMarks12: drive.eligibilityCriteria.minMarks12,
            allowedDepartments: drive.eligibilityCriteria.allowedDepartments,
            allowedCourseYears: drive.eligibilityCriteria.allowedCourseYears,
            requiredSkills: drive.eligibilityCriteria.requiredSkills,
            maxBacklogs: drive.eligibilityCriteria.maxBacklogs,
          }
        : null,
      totalTimeLimit,
    };
  }

  // ============================================
  // Check Eligibility
  // ============================================

  async checkEligibility(
    userId: string,
    driveId: string,
    userRole?: string
  ): Promise<EligibilityCheckResponse> {
    // Validate user can access this drive
    await this.validateDriveAccess(userId, driveId, userRole);

    const drive = await this.prisma.mockDrive.findUnique({
      where: { id: driveId },
      include: {
        eligibilityCriteria: true,
        registrations: {
          where: { userId },
          select: { status: true },
        },
      },
    });

    if (!drive) {
      throw new NotFoundError('Mock drive');
    }

    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    const eligibility = checkEligibility(profile, drive.eligibilityCriteria);

    const inRegistrationPeriod = isWithinRegistrationPeriod(
      drive.registrationStartDate,
      drive.registrationEndDate
    );

    const existingRegistration = drive.registrations[0];
    let canRegister =
      eligibility.isEligible && inRegistrationPeriod && !existingRegistration;
    let reason: string | undefined;

    if (existingRegistration) {
      canRegister = false;
      reason = `Already registered with status: ${existingRegistration.status}`;
    } else if (!inRegistrationPeriod) {
      canRegister = false;
      if (
        drive.registrationStartDate &&
        new Date() < drive.registrationStartDate
      ) {
        reason = `Registration opens on ${drive.registrationStartDate.toLocaleDateString()}`;
      } else {
        reason = 'Registration period has ended';
      }
    } else if (!eligibility.isEligible) {
      reason = 'Does not meet eligibility criteria';
    }

    return {
      mockDriveId: driveId,
      eligibility,
      canRegister,
      registrationStatus: existingRegistration?.status || null,
      reason,
    };
  }

  // ============================================
  // Register for Mock Drive
  // ============================================

  async register(
    userId: string,
    driveId: string,
    userRole?: string
  ): Promise<RegistrationResponse> {
    // Validate user can access this drive
    await this.validateDriveAccess(userId, driveId, userRole);

    const eligibilityResult = await this.checkEligibility(userId, driveId, userRole);

    if (!eligibilityResult.canRegister) {
      throw new BadRequestError(
        eligibilityResult.reason || 'Cannot register for this mock drive'
      );
    }

    const drive = await this.prisma.mockDrive.findUnique({
      where: { id: driveId },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!drive) {
      throw new NotFoundError('Mock drive');
    }

    if (
      drive.maxRegistrations &&
      drive._count.registrations >= drive.maxRegistrations
    ) {
      throw new BadRequestError('Maximum registrations reached');
    }

    const registration = await this.prisma.mockDriveRegistration.create({
      data: {
        mockDriveId: driveId,
        userId,
        status: 'PENDING',
        eligibilityCheckResult:
          eligibilityResult.eligibility as unknown as Prisma.InputJsonValue,
        registeredAt: new Date(),
      },
    });

    logger.info('User registered for mock drive', {
      userId,
      driveId,
      registrationId: registration.id,
    });

    return {
      registrationId: registration.id,
      mockDriveId: driveId,
      status: registration.status,
      registeredAt: registration.registeredAt,
      eligibilityCheckResult: eligibilityResult.eligibility,
    };
  }

  // ============================================
  // Withdraw Registration
  // ============================================

  async withdrawRegistration(
    userId: string,
    driveId: string,
    userRole?: string
  ): Promise<void> {
    // Validate user can access this drive
    await this.validateDriveAccess(userId, driveId, userRole);

    const registration = await this.prisma.mockDriveRegistration.findUnique({
      where: {
        mockDriveId_userId: {
          mockDriveId: driveId,
          userId,
        },
      },
      include: {
        mockDrive: true,
      },
    });

    if (!registration) {
      throw new NotFoundError('Registration');
    }

    if (
      registration.status === 'REJECTED' ||
      registration.status === 'WITHDRAWN'
    ) {
      throw new BadRequestError('Cannot withdraw this registration');
    }

    if (
      registration.mockDrive.status === 'IN_PROGRESS' ||
      registration.mockDrive.status === 'COMPLETED'
    ) {
      throw new BadRequestError('Cannot withdraw after drive has started');
    }

    await this.prisma.mockDriveRegistration.update({
      where: { id: registration.id },
      data: { status: 'WITHDRAWN' },
    });

    logger.info('User withdrew registration', {
      userId,
      driveId,
      registrationId: registration.id,
    });
  }

  // ============================================
  // Get My Registrations
  // ============================================

  async getMyRegistrations(userId: string): Promise<MyRegistrationsResponse> {
    // This only shows user's own registrations, so no institute check needed
    // The user can only have registered for drives they had access to
    const registrations = await this.prisma.mockDriveRegistration.findMany({
      where: { userId },
      orderBy: { registeredAt: 'desc' },
      include: {
        mockDrive: {
          include: {
            institute: {
              select: { id: true, name: true },
            },
            _count: {
              select: { modules: true, registrations: true },
            },
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            scheduledStartTime: true,
            scheduledEndTime: true,
            status: true,
          },
        },
      },
    });

    return {
      registrations: registrations.map((reg) => ({
        id: reg.id,
        mockDriveId: reg.mockDriveId,
        status: reg.status,
        registeredAt: reg.registeredAt,
        mockDrive: {
          id: reg.mockDrive.id,
          title: reg.mockDrive.title,
          description: reg.mockDrive.description,
          status: reg.mockDrive.status,
          registrationStartDate: reg.mockDrive.registrationStartDate,
          registrationEndDate: reg.mockDrive.registrationEndDate,
          driveStartDate: reg.mockDrive.driveStartDate,
          driveEndDate: reg.mockDrive.driveEndDate,
          moduleCount: reg.mockDrive._count.modules,
          registrationCount: reg.mockDrive._count.registrations,
          institute: reg.mockDrive.institute,
          isRegistered: true,
          registrationStatus: reg.status,
          batchInfo: reg.batch,
        },
        batch: reg.batch,
      })),
    };
  }
}
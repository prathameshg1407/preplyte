// src/modules/instituteadmin/mock-drive/registration/registration.service.ts

import {
  Prisma,
  MockDriveRegistrationStatus,
  MockDriveStatus,
} from '@prisma/client';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import {
  UpdateRegistrationDTO,
  BulkUpdateRegistrationDTO,
  ListRegistrationsQuery,
  RegistrationDetails,
  RegistrationListItem,
  PaginatedRegistrations,
  RegistrationSummary,
  BulkUpdateResult,
  EligibilityCheckResultData,
  StudentInfo,
  RegistrationNotFoundError,
  RegistrationStatusError,
  RegistrationError,
} from './registration.types';
import {
  MockDriveNotFoundError,
  MockDriveAccessDeniedError,
} from '../mockdrive.types';

// ============================================
// Types
// ============================================

interface RegistrationWithRelations {
  id: string;
  mockDriveId: string;
  userId: string;
  status: MockDriveRegistrationStatus;
  eligibilityCheckResult: Prisma.JsonValue;
  adminNotes: string | null;
  batchId: string | null;
  registeredAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    profile: {
      fullName: string;
      studentId: string;
      department: string;
      courseYear: string;
      averageCgpa: number | null;
      marks10: number | null;
      marks12: number | null;
      skills: string[];
    } | null;
  };
  batch: {
    id: string;
    name: string;
  } | null;
}

// ============================================
// Service Class
// ============================================

export class RegistrationService {
  // ==========================================
  // Get Registration by ID
  // ==========================================

  async getRegistrationById(
    mockDriveId: string,
    registrationId: string,
    instituteId: string
  ): Promise<RegistrationDetails> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const registration = await prisma.mockDriveRegistration.findUnique({
      where: { id: registrationId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        batch: {
          select: { id: true, name: true },
        },
      },
    });

    if (!registration || registration.mockDriveId !== mockDriveId) {
      throw new RegistrationNotFoundError(registrationId);
    }

    return this.mapToDetails(registration as RegistrationWithRelations);
  }

  // ==========================================
  // List Registrations
  // ==========================================

  async listRegistrations(
    mockDriveId: string,
    instituteId: string,
    query: ListRegistrationsQuery
  ): Promise<PaginatedRegistrations> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const {
      page = 1,
      limit = 20,
      status,
      batchId,
      hasBatch,
      search,
      sortBy = 'registeredAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.MockDriveRegistrationWhereInput = {
      mockDriveId,
      ...(status && { status }),
      ...(batchId && { batchId }),
      ...(hasBatch !== undefined && {
        batchId: hasBatch ? { not: null } : null,
      }),
    };

    // Add search filter
    if (search) {
      where.OR = [
        {
          user: {
            profile: {
              fullName: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          },
        },
        {
          user: {
            profile: {
              studentId: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          },
        },
        {
          user: {
            email: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
        },
      ];
    }

    // Build order by
    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [registrations, total, summary] = await Promise.all([
      prisma.mockDriveRegistration.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          batch: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.mockDriveRegistration.count({ where }),
      this.getRegistrationSummary(mockDriveId),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: registrations.map((r) =>
        this.mapToListItem(r as RegistrationWithRelations)
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      summary,
    };
  }

  // ==========================================
  // Update Registration
  // ==========================================

  async updateRegistration(
    mockDriveId: string,
    registrationId: string,
    instituteId: string,
    reviewerId: string,
    data: UpdateRegistrationDTO
  ): Promise<RegistrationDetails> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const registration = await prisma.mockDriveRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.mockDriveId !== mockDriveId) {
      throw new RegistrationNotFoundError(registrationId);
    }

    // Validate status transition
    this.validateStatusTransition(registration.status, data.status);

    const updated = await prisma.mockDriveRegistration.update({
      where: { id: registrationId },
      data: {
        status: data.status,
        adminNotes: data.adminNotes ?? registration.adminNotes,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        batch: {
          select: { id: true, name: true },
        },
      },
    });

    logger.info('Registration updated', {
      registrationId,
      newStatus: data.status,
      reviewerId,
    });

    return this.mapToDetails(updated as RegistrationWithRelations);
  }

  // ==========================================
  // Bulk Update Registrations
  // ==========================================

  async bulkUpdateRegistrations(
    mockDriveId: string,
    instituteId: string,
    reviewerId: string,
    data: BulkUpdateRegistrationDTO
  ): Promise<BulkUpdateResult> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const registrations = await prisma.mockDriveRegistration.findMany({
      where: {
        id: { in: data.registrationIds },
        mockDriveId,
      },
      select: { id: true, status: true },
    });

    const validIds: string[] = [];
    const failedIds: string[] = [];

    for (const regId of data.registrationIds) {
      const reg = registrations.find((r) => r.id === regId);

      if (!reg) {
        failedIds.push(regId);
        continue;
      }

      try {
        this.validateStatusTransition(reg.status, data.status);
        validIds.push(regId);
      } catch {
        failedIds.push(regId);
      }
    }

    if (validIds.length > 0) {
      await prisma.mockDriveRegistration.updateMany({
        where: { id: { in: validIds } },
        data: {
          status: data.status,
          adminNotes: data.adminNotes,
          reviewedAt: new Date(),
          reviewedBy: reviewerId,
        },
      });
    }

    logger.info('Bulk registration update', {
      mockDriveId,
      success: validIds.length,
      failed: failedIds.length,
      newStatus: data.status,
    });

    return {
      success: validIds.length,
      failed: failedIds.length,
      failedIds,
    };
  }

  // ==========================================
  // Approve All Pending
  // ==========================================

  async approveAllPending(
    mockDriveId: string,
    instituteId: string,
    reviewerId: string,
    onlyEligible: boolean = true
  ): Promise<{ approved: number; skipped: number }> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const pendingRegistrations = await prisma.mockDriveRegistration.findMany({
      where: {
        mockDriveId,
        status: MockDriveRegistrationStatus.PENDING,
      },
      select: { id: true, eligibilityCheckResult: true },
    });

    let eligibleIds: string[];
    let skippedCount = 0;

    if (onlyEligible) {
      eligibleIds = pendingRegistrations
        .filter((r) => {
          const result = r.eligibilityCheckResult as EligibilityCheckResultData | null;
          return result === null || result.isEligible !== false;
        })
        .map((r) => r.id);
      skippedCount = pendingRegistrations.length - eligibleIds.length;
    } else {
      eligibleIds = pendingRegistrations.map((r) => r.id);
    }

    if (eligibleIds.length > 0) {
      await prisma.mockDriveRegistration.updateMany({
        where: { id: { in: eligibleIds } },
        data: {
          status: MockDriveRegistrationStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy: reviewerId,
        },
      });
    }

    logger.info('Approved pending registrations', {
      mockDriveId,
      approved: eligibleIds.length,
      skipped: skippedCount,
    });

    return { approved: eligibleIds.length, skipped: skippedCount };
  }

  // ==========================================
  // Reject All Ineligible
  // ==========================================

  async rejectAllIneligible(
    mockDriveId: string,
    instituteId: string,
    reviewerId: string
  ): Promise<{ rejected: number }> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const pendingRegistrations = await prisma.mockDriveRegistration.findMany({
      where: {
        mockDriveId,
        status: MockDriveRegistrationStatus.PENDING,
      },
      select: { id: true, eligibilityCheckResult: true },
    });

    const ineligibleIds = pendingRegistrations
      .filter((r) => {
        const result = r.eligibilityCheckResult as EligibilityCheckResultData | null;
        return result !== null && result.isEligible === false;
      })
      .map((r) => r.id);

    if (ineligibleIds.length > 0) {
      await prisma.mockDriveRegistration.updateMany({
        where: { id: { in: ineligibleIds } },
        data: {
          status: MockDriveRegistrationStatus.REJECTED,
          adminNotes: 'Auto-rejected: Did not meet eligibility criteria',
          reviewedAt: new Date(),
          reviewedBy: reviewerId,
        },
      });
    }

    logger.info('Rejected ineligible registrations', {
      mockDriveId,
      rejected: ineligibleIds.length,
    });

    return { rejected: ineligibleIds.length };
  }

  // ==========================================
  // Get Registration Summary
  // ==========================================

  async getRegistrationSummary(mockDriveId: string): Promise<RegistrationSummary> {
    const [statusCounts, batchCounts] = await Promise.all([
      prisma.mockDriveRegistration.groupBy({
        by: ['status'],
        where: { mockDriveId },
        _count: { id: true },
      }),
      prisma.mockDriveRegistration.groupBy({
        by: ['batchId'],
        where: { mockDriveId },
        _count: { id: true },
      }),
    ]);

    const statusMap = new Map(statusCounts.map((s) => [s.status, s._count.id]));

    const withBatch = batchCounts
      .filter((b) => b.batchId !== null)
      .reduce((sum, b) => sum + b._count.id, 0);

    const total = statusCounts.reduce((sum, s) => sum + s._count.id, 0);

    return {
      total,
      pending: statusMap.get(MockDriveRegistrationStatus.PENDING) ?? 0,
      approved: statusMap.get(MockDriveRegistrationStatus.APPROVED) ?? 0,
      rejected: statusMap.get(MockDriveRegistrationStatus.REJECTED) ?? 0,
      withdrawn: statusMap.get(MockDriveRegistrationStatus.WITHDRAWN) ?? 0,
      withBatch,
      withoutBatch: total - withBatch,
    };
  }

  // ==========================================
  // Export Registrations
  // ==========================================

  async exportRegistrations(
    mockDriveId: string,
    instituteId: string,
    status?: MockDriveRegistrationStatus
  ): Promise<RegistrationDetails[]> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const registrations = await prisma.mockDriveRegistration.findMany({
      where: {
        mockDriveId,
        ...(status && { status }),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        batch: {
          select: { id: true, name: true },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });

    return registrations.map((r) =>
      this.mapToDetails(r as RegistrationWithRelations)
    );
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private async verifyMockDriveAccess(
    mockDriveId: string,
    instituteId: string
  ): Promise<{ id: string; status: MockDriveStatus; instituteId: string }> {
    const mockDrive = await prisma.mockDrive.findUnique({
      where: { id: mockDriveId },
      select: { id: true, status: true, instituteId: true },
    });

    if (!mockDrive) {
      throw new MockDriveNotFoundError(mockDriveId);
    }

    if (mockDrive.instituteId !== instituteId) {
      throw new MockDriveAccessDeniedError();
    }

    return mockDrive;
  }

  private buildOrderBy(
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Prisma.MockDriveRegistrationOrderByWithRelationInput {
    switch (sortBy) {
      case 'studentName':
        return { user: { profile: { fullName: sortOrder } } };
      case 'status':
        return { status: sortOrder };
      case 'registeredAt':
      default:
        return { registeredAt: sortOrder };
    }
  }

  private validateStatusTransition(
    currentStatus: MockDriveRegistrationStatus,
    newStatus: MockDriveRegistrationStatus
  ): void {
    const validTransitions: Record<
      MockDriveRegistrationStatus,
      MockDriveRegistrationStatus[]
    > = {
      [MockDriveRegistrationStatus.PENDING]: [
        MockDriveRegistrationStatus.APPROVED,
        MockDriveRegistrationStatus.REJECTED,
        MockDriveRegistrationStatus.WITHDRAWN,
      ],
      [MockDriveRegistrationStatus.APPROVED]: [
        MockDriveRegistrationStatus.REJECTED,
        MockDriveRegistrationStatus.WITHDRAWN,
      ],
      [MockDriveRegistrationStatus.REJECTED]: [
        MockDriveRegistrationStatus.APPROVED,
        MockDriveRegistrationStatus.PENDING,
      ],
      [MockDriveRegistrationStatus.WITHDRAWN]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new RegistrationStatusError(currentStatus, `transition to ${newStatus}`);
    }
  }

  private mapToDetails(registration: RegistrationWithRelations): RegistrationDetails {
    const student: StudentInfo = {
      id: registration.user.id,
      name: registration.user.profile?.fullName ?? registration.user.name ?? 'Unknown',
      email: registration.user.email,
      studentId: registration.user.profile?.studentId ?? null,
      department: registration.user.profile?.department ?? null,
      courseYear: registration.user.profile?.courseYear ?? null,
      averageCgpa: registration.user.profile?.averageCgpa ?? null,
      marks10: registration.user.profile?.marks10 ?? null,
      marks12: registration.user.profile?.marks12 ?? null,
      skills: registration.user.profile?.skills ?? [],
    };

    return {
      id: registration.id,
      mockDriveId: registration.mockDriveId,
      userId: registration.userId,
      status: registration.status,
      eligibilityCheckResult:
        registration.eligibilityCheckResult as EligibilityCheckResultData | null,
      adminNotes: registration.adminNotes,
      batchId: registration.batchId,
      batchName: registration.batch?.name ?? null,
      registeredAt: registration.registeredAt,
      reviewedAt: registration.reviewedAt,
      reviewedBy: registration.reviewedBy,
      student,
    };
  }

  private mapToListItem(registration: RegistrationWithRelations): RegistrationListItem {
    const eligibilityResult =
      registration.eligibilityCheckResult as EligibilityCheckResultData | null;

    return {
      id: registration.id,
      userId: registration.userId,
      status: registration.status,
      studentName:
        registration.user.profile?.fullName ?? registration.user.name ?? 'Unknown',
      studentId: registration.user.profile?.studentId ?? null,
      department: registration.user.profile?.department ?? null,
      courseYear: registration.user.profile?.courseYear ?? null,
      averageCgpa: registration.user.profile?.averageCgpa ?? null,
      batchId: registration.batchId,
      batchName: registration.batch?.name ?? null,
      registeredAt: registration.registeredAt,
      isEligible: eligibilityResult?.isEligible ?? null,
    };
  }
}

// Export singleton instance
export const registrationService = new RegistrationService();
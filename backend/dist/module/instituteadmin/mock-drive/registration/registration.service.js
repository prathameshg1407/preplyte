"use strict";
// src/modules/instituteadmin/mock-drive/registration/registration.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationService = exports.RegistrationService = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../../../lib/db");
const logger_1 = require("../../../../utils/logger");
const registration_types_1 = require("./registration.types");
const mockdrive_types_1 = require("../mockdrive.types");
// ============================================
// Service Class
// ============================================
class RegistrationService {
    // ==========================================
    // Get Registration by ID
    // ==========================================
    async getRegistrationById(mockDriveId, registrationId, instituteId) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const registration = await db_1.prisma.mockDriveRegistration.findUnique({
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
            throw new registration_types_1.RegistrationNotFoundError(registrationId);
        }
        return this.mapToDetails(registration);
    }
    // ==========================================
    // List Registrations
    // ==========================================
    async listRegistrations(mockDriveId, instituteId, query) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const { page = 1, limit = 20, status, batchId, hasBatch, search, sortBy = 'registeredAt', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
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
                            fullName: { contains: search, mode: client_1.Prisma.QueryMode.insensitive },
                        },
                    },
                },
                {
                    user: {
                        profile: {
                            studentId: { contains: search, mode: client_1.Prisma.QueryMode.insensitive },
                        },
                    },
                },
                {
                    user: {
                        email: { contains: search, mode: client_1.Prisma.QueryMode.insensitive },
                    },
                },
            ];
        }
        // Build order by
        const orderBy = this.buildOrderBy(sortBy, sortOrder);
        const [registrations, total, summary] = await Promise.all([
            db_1.prisma.mockDriveRegistration.findMany({
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
            db_1.prisma.mockDriveRegistration.count({ where }),
            this.getRegistrationSummary(mockDriveId),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: registrations.map((r) => this.mapToListItem(r)),
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
    async updateRegistration(mockDriveId, registrationId, instituteId, reviewerId, data) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const registration = await db_1.prisma.mockDriveRegistration.findUnique({
            where: { id: registrationId },
        });
        if (!registration || registration.mockDriveId !== mockDriveId) {
            throw new registration_types_1.RegistrationNotFoundError(registrationId);
        }
        // Validate status transition
        this.validateStatusTransition(registration.status, data.status);
        const updated = await db_1.prisma.mockDriveRegistration.update({
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
        logger_1.logger.info('Registration updated', {
            registrationId,
            newStatus: data.status,
            reviewerId,
        });
        return this.mapToDetails(updated);
    }
    // ==========================================
    // Bulk Update Registrations
    // ==========================================
    async bulkUpdateRegistrations(mockDriveId, instituteId, reviewerId, data) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const registrations = await db_1.prisma.mockDriveRegistration.findMany({
            where: {
                id: { in: data.registrationIds },
                mockDriveId,
            },
            select: { id: true, status: true },
        });
        const validIds = [];
        const failedIds = [];
        for (const regId of data.registrationIds) {
            const reg = registrations.find((r) => r.id === regId);
            if (!reg) {
                failedIds.push(regId);
                continue;
            }
            try {
                this.validateStatusTransition(reg.status, data.status);
                validIds.push(regId);
            }
            catch {
                failedIds.push(regId);
            }
        }
        if (validIds.length > 0) {
            await db_1.prisma.mockDriveRegistration.updateMany({
                where: { id: { in: validIds } },
                data: {
                    status: data.status,
                    adminNotes: data.adminNotes,
                    reviewedAt: new Date(),
                    reviewedBy: reviewerId,
                },
            });
        }
        logger_1.logger.info('Bulk registration update', {
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
    async approveAllPending(mockDriveId, instituteId, reviewerId, onlyEligible = true) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const pendingRegistrations = await db_1.prisma.mockDriveRegistration.findMany({
            where: {
                mockDriveId,
                status: client_1.MockDriveRegistrationStatus.PENDING,
            },
            select: { id: true, eligibilityCheckResult: true },
        });
        let eligibleIds;
        let skippedCount = 0;
        if (onlyEligible) {
            eligibleIds = pendingRegistrations
                .filter((r) => {
                const result = r.eligibilityCheckResult;
                return result === null || result.isEligible !== false;
            })
                .map((r) => r.id);
            skippedCount = pendingRegistrations.length - eligibleIds.length;
        }
        else {
            eligibleIds = pendingRegistrations.map((r) => r.id);
        }
        if (eligibleIds.length > 0) {
            await db_1.prisma.mockDriveRegistration.updateMany({
                where: { id: { in: eligibleIds } },
                data: {
                    status: client_1.MockDriveRegistrationStatus.APPROVED,
                    reviewedAt: new Date(),
                    reviewedBy: reviewerId,
                },
            });
        }
        logger_1.logger.info('Approved pending registrations', {
            mockDriveId,
            approved: eligibleIds.length,
            skipped: skippedCount,
        });
        return { approved: eligibleIds.length, skipped: skippedCount };
    }
    // ==========================================
    // Reject All Ineligible
    // ==========================================
    async rejectAllIneligible(mockDriveId, instituteId, reviewerId) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const pendingRegistrations = await db_1.prisma.mockDriveRegistration.findMany({
            where: {
                mockDriveId,
                status: client_1.MockDriveRegistrationStatus.PENDING,
            },
            select: { id: true, eligibilityCheckResult: true },
        });
        const ineligibleIds = pendingRegistrations
            .filter((r) => {
            const result = r.eligibilityCheckResult;
            return result !== null && result.isEligible === false;
        })
            .map((r) => r.id);
        if (ineligibleIds.length > 0) {
            await db_1.prisma.mockDriveRegistration.updateMany({
                where: { id: { in: ineligibleIds } },
                data: {
                    status: client_1.MockDriveRegistrationStatus.REJECTED,
                    adminNotes: 'Auto-rejected: Did not meet eligibility criteria',
                    reviewedAt: new Date(),
                    reviewedBy: reviewerId,
                },
            });
        }
        logger_1.logger.info('Rejected ineligible registrations', {
            mockDriveId,
            rejected: ineligibleIds.length,
        });
        return { rejected: ineligibleIds.length };
    }
    // ==========================================
    // Get Registration Summary
    // ==========================================
    async getRegistrationSummary(mockDriveId) {
        const [statusCounts, batchCounts] = await Promise.all([
            db_1.prisma.mockDriveRegistration.groupBy({
                by: ['status'],
                where: { mockDriveId },
                _count: { id: true },
            }),
            db_1.prisma.mockDriveRegistration.groupBy({
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
            pending: statusMap.get(client_1.MockDriveRegistrationStatus.PENDING) ?? 0,
            approved: statusMap.get(client_1.MockDriveRegistrationStatus.APPROVED) ?? 0,
            rejected: statusMap.get(client_1.MockDriveRegistrationStatus.REJECTED) ?? 0,
            withdrawn: statusMap.get(client_1.MockDriveRegistrationStatus.WITHDRAWN) ?? 0,
            withBatch,
            withoutBatch: total - withBatch,
        };
    }
    // ==========================================
    // Export Registrations
    // ==========================================
    async exportRegistrations(mockDriveId, instituteId, status) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const registrations = await db_1.prisma.mockDriveRegistration.findMany({
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
        return registrations.map((r) => this.mapToDetails(r));
    }
    // ==========================================
    // Private Helper Methods
    // ==========================================
    async verifyMockDriveAccess(mockDriveId, instituteId) {
        const mockDrive = await db_1.prisma.mockDrive.findUnique({
            where: { id: mockDriveId },
            select: { id: true, status: true, instituteId: true },
        });
        if (!mockDrive) {
            throw new mockdrive_types_1.MockDriveNotFoundError(mockDriveId);
        }
        if (mockDrive.instituteId !== instituteId) {
            throw new mockdrive_types_1.MockDriveAccessDeniedError();
        }
        return mockDrive;
    }
    buildOrderBy(sortBy, sortOrder) {
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
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [client_1.MockDriveRegistrationStatus.PENDING]: [
                client_1.MockDriveRegistrationStatus.APPROVED,
                client_1.MockDriveRegistrationStatus.REJECTED,
                client_1.MockDriveRegistrationStatus.WITHDRAWN,
            ],
            [client_1.MockDriveRegistrationStatus.APPROVED]: [
                client_1.MockDriveRegistrationStatus.REJECTED,
                client_1.MockDriveRegistrationStatus.WITHDRAWN,
            ],
            [client_1.MockDriveRegistrationStatus.REJECTED]: [
                client_1.MockDriveRegistrationStatus.APPROVED,
                client_1.MockDriveRegistrationStatus.PENDING,
            ],
            [client_1.MockDriveRegistrationStatus.WITHDRAWN]: [],
        };
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new registration_types_1.RegistrationStatusError(currentStatus, `transition to ${newStatus}`);
        }
    }
    mapToDetails(registration) {
        const student = {
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
            eligibilityCheckResult: registration.eligibilityCheckResult,
            adminNotes: registration.adminNotes,
            batchId: registration.batchId,
            batchName: registration.batch?.name ?? null,
            registeredAt: registration.registeredAt,
            reviewedAt: registration.reviewedAt,
            reviewedBy: registration.reviewedBy,
            student,
        };
    }
    mapToListItem(registration) {
        const eligibilityResult = registration.eligibilityCheckResult;
        return {
            id: registration.id,
            userId: registration.userId,
            status: registration.status,
            studentName: registration.user.profile?.fullName ?? registration.user.name ?? 'Unknown',
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
exports.RegistrationService = RegistrationService;
// Export singleton instance
exports.registrationService = new RegistrationService();
//# sourceMappingURL=registration.service.js.map
"use strict";
// src/module/mock-drive/discovery/discovery.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryService = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../utils/errors");
const eligibility_utils_1 = require("../utils/eligibility.utils");
const time_utils_1 = require("../utils/time.utils");
const mockdrive_constants_1 = require("../shared/mockdrive.constants");
const logger_1 = require("../../../utils/logger");
// Roles that can see all institutes' drives
const SUPER_ADMIN_ROLES = ['SUPER_ADMIN'];
class DiscoveryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ============================================
    // Helper: Get user with institute validation
    // ============================================
    async getUserWithInstituteValidation(userId, userRole) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, instituteId: true, role: true },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User');
        }
        return user;
    }
    // ============================================
    // Helper: Check if user can access a drive
    // ============================================
    canAccessDrive(userInstituteId, driveInstituteId, userRole) {
        // Super admins can access all drives
        if (SUPER_ADMIN_ROLES.includes(userRole)) {
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
    async validateDriveAccess(userId, driveId, userRole) {
        const user = await this.getUserWithInstituteValidation(userId, userRole);
        const drive = await this.prisma.mockDrive.findUnique({
            where: { id: driveId },
            select: { id: true, instituteId: true },
        });
        if (!drive) {
            throw new errors_1.NotFoundError('Mock drive');
        }
        if (!this.canAccessDrive(user.instituteId, drive.instituteId, user.role)) {
            // Return generic "not found" to avoid information leakage
            throw new errors_1.NotFoundError('Mock drive');
        }
        return { user, drive };
    }
    // ============================================
    // List Available Drives
    // ============================================
    async listAvailableDrives(userId, params, userRole) {
        const { page = 1, limit = mockdrive_constants_1.MOCKDRIVE_CONSTANTS.DEFAULT_PAGE_SIZE, filters = {}, } = params;
        // Ensure page and limit are numbers
        const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page);
        const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit);
        const skip = (pageNum - 1) * limitNum;
        logger_1.logger.debug('Listing available drives', { userId, params });
        // Get user with institute info
        const user = await this.getUserWithInstituteValidation(userId, userRole);
        // Check if user is super admin
        const isSuperAdmin = SUPER_ADMIN_ROLES.includes(user.role);
        // For non-super-admin users without an institute, return empty list
        if (!isSuperAdmin && !user.instituteId) {
            logger_1.logger.warn('User without institute trying to list drives', { userId });
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
        const defaultStatuses = [
            client_1.MockDriveStatus.PUBLISHED,
            client_1.MockDriveStatus.REGISTRATION_OPEN,
            client_1.MockDriveStatus.REGISTRATION_CLOSED,
            client_1.MockDriveStatus.IN_PROGRESS,
        ];
        // Build where clause
        const where = {
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
        }
        else {
            // Non-super-admin users can ONLY see their institute's drives
            // This is mandatory, not optional
            where.instituteId = user.instituteId;
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
            where.status = client_1.MockDriveStatus.REGISTRATION_OPEN;
            where.registrationStartDate = { lte: now };
            where.registrationEndDate = { gte: now };
        }
        logger_1.logger.debug('Query where clause', { where, isSuperAdmin, userInstituteId: user.instituteId });
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
        logger_1.logger.debug('Drives found', { count: driveList.length, total });
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
    async getDriveDetails(userId, driveId, userRole) {
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
            throw new errors_1.NotFoundError('Mock drive');
        }
        const userRegistration = drive.registrations[0];
        const totalTimeLimit = drive.modules.reduce((sum, m) => sum + m.timeLimit, 0);
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
                    allowedDepartmentIds: drive.eligibilityCriteria.allowedDepartmentIds,
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
    async checkEligibility(userId, driveId, userRole) {
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
            throw new errors_1.NotFoundError('Mock drive');
        }
        const profile = await this.prisma.studentProfile.findUnique({
            where: { userId },
        });
        const eligibility = (0, eligibility_utils_1.checkEligibility)(profile, drive.eligibilityCriteria);
        const inRegistrationPeriod = (0, time_utils_1.isWithinRegistrationPeriod)(drive.registrationStartDate, drive.registrationEndDate);
        const existingRegistration = drive.registrations[0];
        let canRegister = eligibility.isEligible && inRegistrationPeriod && !existingRegistration;
        let reason;
        if (existingRegistration) {
            canRegister = false;
            reason = `Already registered with status: ${existingRegistration.status}`;
        }
        else if (!inRegistrationPeriod) {
            canRegister = false;
            if (drive.registrationStartDate &&
                new Date() < drive.registrationStartDate) {
                reason = `Registration opens on ${drive.registrationStartDate.toLocaleDateString()}`;
            }
            else {
                reason = 'Registration period has ended';
            }
        }
        else if (!eligibility.isEligible) {
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
    async register(userId, driveId, userRole) {
        // Validate user can access this drive
        await this.validateDriveAccess(userId, driveId, userRole);
        const eligibilityResult = await this.checkEligibility(userId, driveId, userRole);
        if (!eligibilityResult.canRegister) {
            throw new errors_1.BadRequestError(eligibilityResult.reason || 'Cannot register for this mock drive');
        }
        const drive = await this.prisma.mockDrive.findUnique({
            where: { id: driveId },
            include: {
                _count: { select: { registrations: true } },
            },
        });
        if (!drive) {
            throw new errors_1.NotFoundError('Mock drive');
        }
        if (drive.maxRegistrations &&
            drive._count.registrations >= drive.maxRegistrations) {
            throw new errors_1.BadRequestError('Maximum registrations reached');
        }
        const registration = await this.prisma.mockDriveRegistration.create({
            data: {
                mockDriveId: driveId,
                userId,
                status: 'PENDING',
                eligibilityCheckResult: eligibilityResult.eligibility,
                registeredAt: new Date(),
            },
        });
        logger_1.logger.info('User registered for mock drive', {
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
    async withdrawRegistration(userId, driveId, userRole) {
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
            throw new errors_1.NotFoundError('Registration');
        }
        if (registration.status === 'REJECTED' ||
            registration.status === 'WITHDRAWN') {
            throw new errors_1.BadRequestError('Cannot withdraw this registration');
        }
        if (registration.mockDrive.status === 'IN_PROGRESS' ||
            registration.mockDrive.status === 'COMPLETED') {
            throw new errors_1.BadRequestError('Cannot withdraw after drive has started');
        }
        await this.prisma.mockDriveRegistration.update({
            where: { id: registration.id },
            data: { status: 'WITHDRAWN' },
        });
        logger_1.logger.info('User withdrew registration', {
            userId,
            driveId,
            registrationId: registration.id,
        });
    }
    // ============================================
    // Get My Registrations
    // ============================================
    async getMyRegistrations(userId) {
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
exports.DiscoveryService = DiscoveryService;
//# sourceMappingURL=discovery.service.js.map
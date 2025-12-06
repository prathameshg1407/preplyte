"use strict";
// src/modules/instituteadmin/mock-drive/mockdrive.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDriveService = exports.MockDriveService = exports.MockDriveRaceConditionError = exports.InsufficientQuestionsError = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../../lib/db");
const logger_1 = require("../../../utils/logger");
const mockdrive_types_1 = require("./mockdrive.types");
// ============================================
// Custom Error Classes
// ============================================
class InsufficientQuestionsError extends mockdrive_types_1.MockDrivePublishError {
    moduleType;
    required;
    available;
    deficit;
    constructor(moduleType, required, available, additionalContext) {
        const deficit = required - available;
        const message = `Insufficient ${moduleType} questions. ` +
            `Required: ${required}, Available: ${available}. ` +
            `Please add ${deficit} more question${deficit > 1 ? 's' : ''} or reduce the module requirement.` +
            (additionalContext ? ` ${additionalContext}` : '');
        super(message);
        this.name = 'InsufficientQuestionsError';
        this.moduleType = moduleType;
        this.required = required;
        this.available = available;
        this.deficit = deficit;
    }
}
exports.InsufficientQuestionsError = InsufficientQuestionsError;
class MockDriveRaceConditionError extends mockdrive_types_1.MockDriveValidationError {
    constructor(mockDriveId, expectedStatus, actualStatus) {
        super(`Mock drive ${mockDriveId} status changed during operation. ` +
            `Expected: ${expectedStatus}, Actual: ${actualStatus}. Please try again.`);
        this.name = 'MockDriveRaceConditionError';
    }
}
exports.MockDriveRaceConditionError = MockDriveRaceConditionError;
// ============================================
// Helper Functions
// ============================================
/**
 * Converts a value to Prisma's JSON input type
 */
function toJson(value) {
    return value;
}
/**
 * Safely parses JSON config from database
 */
function parseModuleConfig(config) {
    if (typeof config === 'object' && config !== null) {
        return config;
    }
    throw new mockdrive_types_1.MockDriveValidationError('Invalid module configuration');
}
// ============================================
// Service Class
// ============================================
class MockDriveService {
    // ==========================================
    // Create Mock Drive
    // ==========================================
    async create(instituteId, data) {
        const startTime = Date.now();
        logger_1.logger.info('Creating mock drive', { instituteId, title: data.title });
        const institute = await db_1.prisma.institute.findUnique({
            where: { id: instituteId },
            select: { id: true, name: true },
        });
        if (!institute) {
            logger_1.logger.warn('Institute not found during mock drive creation', {
                instituteId,
            });
            throw new mockdrive_types_1.MockDriveValidationError('Institute not found');
        }
        try {
            const mockDrive = await db_1.prisma.mockDrive.create({
                data: {
                    instituteId,
                    title: data.title.trim(),
                    description: data.description?.trim() ?? null,
                    instructions: data.instructions?.trim() ?? null,
                    registrationStartDate: data.registrationStartDate ?? null,
                    registrationEndDate: data.registrationEndDate ?? null,
                    maxRegistrations: data.maxRegistrations ?? null,
                    driveStartDate: data.driveStartDate ?? null,
                    driveEndDate: data.driveEndDate ?? null,
                    allowLateSubmission: data.allowLateSubmission ?? false,
                    showLeaderboard: data.showLeaderboard ?? true,
                    showResultsImmediately: data.showResultsImmediately ?? false,
                    resultsReleaseDate: data.resultsReleaseDate ?? null,
                    shuffleQuestions: data.shuffleQuestions ?? true,
                    enableProctoring: data.enableProctoring ?? false,
                    proctoringSettings: data.enableProctoring && data.proctoringSettings
                        ? toJson(data.proctoringSettings)
                        : client_1.Prisma.DbNull,
                    status: client_1.MockDriveStatus.DRAFT,
                },
                include: this.getDetailedInclude(),
            });
            const duration = Date.now() - startTime;
            logger_1.logger.info('Mock drive created successfully', {
                mockDriveId: mockDrive.id,
                instituteId,
                instituteName: institute.name,
                durationMs: duration,
            });
            return this.mapToDetails(mockDrive);
        }
        catch (error) {
            logger_1.logger.error('Failed to create mock drive', {
                instituteId,
                title: data.title,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    // ==========================================
    // Get Mock Drive by ID
    // ==========================================
    async getById(mockDriveId, instituteId) {
        const startTime = Date.now();
        const mockDrive = await db_1.prisma.mockDrive.findUnique({
            where: { id: mockDriveId },
            include: this.getDetailedInclude(),
        });
        if (!mockDrive) {
            logger_1.logger.warn('Mock drive not found', { mockDriveId, instituteId });
            throw new mockdrive_types_1.MockDriveNotFoundError(mockDriveId);
        }
        if (mockDrive.instituteId !== instituteId) {
            logger_1.logger.warn('Mock drive access denied', {
                mockDriveId,
                requestedBy: instituteId,
                ownedBy: mockDrive.instituteId,
            });
            throw new mockdrive_types_1.MockDriveAccessDeniedError();
        }
        const duration = Date.now() - startTime;
        logger_1.logger.debug('Mock drive retrieved', { mockDriveId, durationMs: duration });
        return this.mapToDetails(mockDrive);
    }
    // ==========================================
    // List Mock Drives
    // ==========================================
    async list(instituteId, query) {
        const startTime = Date.now();
        const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        const take = Math.min(limit, 100);
        const where = {
            instituteId,
            ...(status && { status }),
        };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                {
                    description: { contains: search, mode: client_1.Prisma.QueryMode.insensitive },
                },
            ];
        }
        const [mockDrives, total] = await Promise.all([
            db_1.prisma.mockDrive.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    _count: {
                        select: {
                            registrations: true,
                            batches: true,
                            modules: { where: { isActive: true } },
                        },
                    },
                },
            }),
            db_1.prisma.mockDrive.count({ where }),
        ]);
        const totalPages = Math.ceil(total / take);
        const duration = Date.now() - startTime;
        logger_1.logger.debug('Mock drives listed', {
            instituteId,
            total,
            page,
            limit: take,
            durationMs: duration,
        });
        return {
            data: mockDrives.map((md) => ({
                id: md.id,
                title: md.title,
                status: md.status,
                registrationStartDate: md.registrationStartDate,
                registrationEndDate: md.registrationEndDate,
                driveStartDate: md.driveStartDate,
                driveEndDate: md.driveEndDate,
                totalRegistrations: md._count.registrations,
                totalBatches: md._count.batches,
                totalModules: md._count.modules,
                createdAt: md.createdAt,
            })),
            pagination: {
                page,
                limit: take,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        };
    }
    // ==========================================
    // Update Mock Drive
    // ==========================================
    async update(mockDriveId, instituteId, data) {
        const startTime = Date.now();
        logger_1.logger.info('Updating mock drive', {
            mockDriveId,
            instituteId,
            fields: Object.keys(data),
        });
        const existing = await this.verifyAccess(mockDriveId, instituteId);
        if (data.status) {
            this.validateStatusTransition(existing.status, data.status);
        }
        if (existing.status !== client_1.MockDriveStatus.DRAFT) {
            this.validatePublishedDriveUpdate(data, existing.status);
        }
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title.trim();
        if (data.description !== undefined) {
            updateData.description = data.description?.trim() ?? null;
        }
        if (data.instructions !== undefined) {
            updateData.instructions = data.instructions?.trim() ?? null;
        }
        if (data.registrationStartDate !== undefined) {
            updateData.registrationStartDate = data.registrationStartDate;
        }
        if (data.registrationEndDate !== undefined) {
            updateData.registrationEndDate = data.registrationEndDate;
        }
        if (data.maxRegistrations !== undefined) {
            updateData.maxRegistrations = data.maxRegistrations;
        }
        if (data.driveStartDate !== undefined) {
            updateData.driveStartDate = data.driveStartDate;
        }
        if (data.driveEndDate !== undefined) {
            updateData.driveEndDate = data.driveEndDate;
        }
        if (data.allowLateSubmission !== undefined) {
            updateData.allowLateSubmission = data.allowLateSubmission;
        }
        if (data.showLeaderboard !== undefined) {
            updateData.showLeaderboard = data.showLeaderboard;
        }
        if (data.showResultsImmediately !== undefined) {
            updateData.showResultsImmediately = data.showResultsImmediately;
        }
        if (data.resultsReleaseDate !== undefined) {
            updateData.resultsReleaseDate = data.resultsReleaseDate;
        }
        if (data.shuffleQuestions !== undefined) {
            updateData.shuffleQuestions = data.shuffleQuestions;
        }
        if (data.enableProctoring !== undefined) {
            updateData.enableProctoring = data.enableProctoring;
        }
        if (data.proctoringSettings !== undefined) {
            updateData.proctoringSettings = data.proctoringSettings
                ? toJson(data.proctoringSettings)
                : client_1.Prisma.DbNull;
        }
        if (data.status !== undefined) {
            updateData.status = data.status;
        }
        const mockDrive = await db_1.prisma.mockDrive.update({
            where: { id: mockDriveId },
            data: updateData,
            include: this.getDetailedInclude(),
        });
        const duration = Date.now() - startTime;
        logger_1.logger.info('Mock drive updated', {
            mockDriveId,
            durationMs: duration,
        });
        return this.mapToDetails(mockDrive);
    }
    // ==========================================
    // Delete Mock Drive
    // ==========================================
    async delete(mockDriveId, instituteId) {
        logger_1.logger.info('Deleting mock drive', { mockDriveId, instituteId });
        const existing = await this.verifyAccess(mockDriveId, instituteId);
        const deletableStatuses = [
            client_1.MockDriveStatus.DRAFT,
            client_1.MockDriveStatus.CANCELLED,
        ];
        if (!deletableStatuses.includes(existing.status)) {
            logger_1.logger.warn('Cannot delete mock drive - invalid status', {
                mockDriveId,
                status: existing.status,
            });
            throw new mockdrive_types_1.MockDriveInvalidStatusError(existing.status, 'delete');
        }
        const attemptCount = await db_1.prisma.mockDriveAttempt.count({
            where: { mockDriveId },
        });
        if (attemptCount > 0) {
            logger_1.logger.warn('Cannot delete mock drive - has attempts', {
                mockDriveId,
                attemptCount,
            });
            throw new mockdrive_types_1.MockDriveValidationError('Cannot delete mock drive with existing attempts. Consider cancelling instead.');
        }
        await db_1.prisma.mockDrive.delete({
            where: { id: mockDriveId },
        });
        logger_1.logger.info('Mock drive deleted', { mockDriveId });
    }
    // ==========================================
    // Validate for Publish
    // ==========================================
    async validateForPublish(mockDriveId, instituteId) {
        const startTime = Date.now();
        logger_1.logger.info('Validating mock drive for publish', {
            mockDriveId,
            instituteId,
        });
        await this.verifyAccess(mockDriveId, instituteId);
        const mockDrive = await db_1.prisma.mockDrive.findUnique({
            where: { id: mockDriveId },
            include: {
                modules: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
                eligibilityCriteria: true,
            },
        });
        if (!mockDrive) {
            throw new mockdrive_types_1.MockDriveNotFoundError(mockDriveId);
        }
        const errors = [];
        const warnings = [];
        // Check status
        if (mockDrive.status !== client_1.MockDriveStatus.DRAFT) {
            errors.push(`Mock drive must be in DRAFT status to publish (current: ${mockDrive.status})`);
        }
        // Check required dates
        this.validateDates(mockDrive, errors, warnings);
        // Check modules - pass warnings array
        await this.validateModules(mockDrive.modules, errors, warnings);
        // Check eligibility (warning only)
        if (!mockDrive.eligibilityCriteria) {
            warnings.push('No eligibility criteria set - all students will be eligible');
        }
        if (mockDrive.maxRegistrations === null) {
            warnings.push('No maximum registration limit set');
        }
        const duration = Date.now() - startTime;
        const result = {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
        logger_1.logger.info('Mock drive validation completed', {
            mockDriveId,
            isValid: result.isValid,
            errorCount: errors.length,
            warningCount: warnings.length,
            durationMs: duration,
        });
        if (!result.isValid) {
            logger_1.logger.warn('Mock drive validation failed', {
                mockDriveId,
                errors,
                warnings,
            });
        }
        return result;
    }
    // ==========================================
    // Publish Mock Drive
    // ==========================================
    async publish(mockDriveId, instituteId) {
        const startTime = Date.now();
        logger_1.logger.info('Publishing mock drive', { mockDriveId, instituteId });
        const validation = await this.validateForPublish(mockDriveId, instituteId);
        if (!validation.isValid) {
            logger_1.logger.warn('Mock drive publish validation failed', {
                mockDriveId,
                instituteId,
                errors: validation.errors,
                warnings: validation.warnings,
            });
            throw new mockdrive_types_1.MockDrivePublishError(validation.errors.join('; '));
        }
        const mockDrive = await db_1.prisma.$transaction(async (tx) => {
            const current = await tx.mockDrive.findUnique({
                where: { id: mockDriveId },
                select: {
                    status: true,
                    questionsGenerated: true,
                    title: true,
                },
            });
            if (!current) {
                throw new mockdrive_types_1.MockDriveNotFoundError(mockDriveId);
            }
            if (current.status !== client_1.MockDriveStatus.DRAFT) {
                logger_1.logger.warn('Mock drive status changed during publish', {
                    mockDriveId,
                    expectedStatus: client_1.MockDriveStatus.DRAFT,
                    actualStatus: current.status,
                });
                throw new MockDriveRaceConditionError(mockDriveId, client_1.MockDriveStatus.DRAFT, current.status);
            }
            if (current.questionsGenerated) {
                logger_1.logger.warn('Questions already generated for mock drive', {
                    mockDriveId,
                });
                throw new mockdrive_types_1.MockDrivePublishError('Questions have already been generated. This may indicate a concurrent publish attempt.');
            }
            // Normalize module orders before generating questions
            await this.normalizeModuleOrders(mockDriveId, tx);
            // Generate questions for all modules
            await this.generateModuleQuestions(mockDriveId, tx);
            // Update status
            return tx.mockDrive.update({
                where: { id: mockDriveId },
                data: {
                    status: client_1.MockDriveStatus.PUBLISHED,
                    questionsGenerated: true,
                    questionsGeneratedAt: new Date(),
                },
                include: this.getDetailedInclude(),
            });
        }, {
            maxWait: 10000,
            timeout: 30000,
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
        });
        const duration = Date.now() - startTime;
        logger_1.logger.info('Mock drive published successfully', {
            mockDriveId,
            durationMs: duration,
        });
        return this.mapToDetails(mockDrive);
    }
    // ==========================================
    // Cancel Mock Drive
    // ==========================================
    async cancel(mockDriveId, instituteId) {
        logger_1.logger.info('Cancelling mock drive', { mockDriveId, instituteId });
        const existing = await this.verifyAccess(mockDriveId, instituteId);
        const nonCancellableStatuses = [
            client_1.MockDriveStatus.COMPLETED,
            client_1.MockDriveStatus.CANCELLED,
        ];
        if (nonCancellableStatuses.includes(existing.status)) {
            logger_1.logger.warn('Cannot cancel mock drive - invalid status', {
                mockDriveId,
                status: existing.status,
            });
            throw new mockdrive_types_1.MockDriveInvalidStatusError(existing.status, 'cancel');
        }
        const mockDrive = await db_1.prisma.mockDrive.update({
            where: { id: mockDriveId },
            data: { status: client_1.MockDriveStatus.CANCELLED },
            include: this.getDetailedInclude(),
        });
        logger_1.logger.info('Mock drive cancelled', {
            mockDriveId,
            previousStatus: existing.status,
        });
        return this.mapToDetails(mockDrive);
    }
    // ==========================================
    // Open Registration
    // ==========================================
    async openRegistration(mockDriveId, instituteId) {
        logger_1.logger.info('Opening registration for mock drive', {
            mockDriveId,
            instituteId,
        });
        const existing = await this.verifyAccess(mockDriveId, instituteId);
        if (existing.status !== client_1.MockDriveStatus.PUBLISHED) {
            throw new mockdrive_types_1.MockDriveInvalidStatusError(existing.status, 'open registration');
        }
        const mockDrive = await db_1.prisma.mockDrive.update({
            where: { id: mockDriveId },
            data: { status: client_1.MockDriveStatus.REGISTRATION_OPEN },
            include: this.getDetailedInclude(),
        });
        logger_1.logger.info('Mock drive registration opened', { mockDriveId });
        return this.mapToDetails(mockDrive);
    }
    // ==========================================
    // Close Registration
    // ==========================================
    async closeRegistration(mockDriveId, instituteId) {
        logger_1.logger.info('Closing registration for mock drive', {
            mockDriveId,
            instituteId,
        });
        const existing = await this.verifyAccess(mockDriveId, instituteId);
        if (existing.status !== client_1.MockDriveStatus.REGISTRATION_OPEN) {
            throw new mockdrive_types_1.MockDriveInvalidStatusError(existing.status, 'close registration');
        }
        const mockDrive = await db_1.prisma.mockDrive.update({
            where: { id: mockDriveId },
            data: { status: client_1.MockDriveStatus.REGISTRATION_CLOSED },
            include: this.getDetailedInclude(),
        });
        logger_1.logger.info('Mock drive registration closed', { mockDriveId });
        return this.mapToDetails(mockDrive);
    }
    // ==========================================
    // Start Drive
    // ==========================================
    async startDrive(mockDriveId, instituteId) {
        logger_1.logger.info('Starting mock drive', { mockDriveId, instituteId });
        const existing = await this.verifyAccess(mockDriveId, instituteId);
        if (existing.status !== client_1.MockDriveStatus.REGISTRATION_CLOSED) {
            throw new mockdrive_types_1.MockDriveInvalidStatusError(existing.status, 'start drive');
        }
        const mockDrive = await db_1.prisma.mockDrive.update({
            where: { id: mockDriveId },
            data: { status: client_1.MockDriveStatus.IN_PROGRESS },
            include: this.getDetailedInclude(),
        });
        logger_1.logger.info('Mock drive started', { mockDriveId });
        return this.mapToDetails(mockDrive);
    }
    // ==========================================
    // Complete Drive
    // ==========================================
    async completeDrive(mockDriveId, instituteId) {
        logger_1.logger.info('Completing mock drive', { mockDriveId, instituteId });
        const existing = await this.verifyAccess(mockDriveId, instituteId);
        if (existing.status !== client_1.MockDriveStatus.IN_PROGRESS) {
            throw new mockdrive_types_1.MockDriveInvalidStatusError(existing.status, 'complete drive');
        }
        const mockDrive = await db_1.prisma.mockDrive.update({
            where: { id: mockDriveId },
            data: { status: client_1.MockDriveStatus.COMPLETED },
            include: this.getDetailedInclude(),
        });
        logger_1.logger.info('Mock drive completed', { mockDriveId });
        return this.mapToDetails(mockDrive);
    }
    // ==========================================
    // Get Mock Drive Stats
    // ==========================================
    async getStats(mockDriveId, instituteId) {
        const startTime = Date.now();
        await this.verifyAccess(mockDriveId, instituteId);
        const [registrationStats, batchCount, attemptStats, completedStats] = await Promise.all([
            db_1.prisma.mockDriveRegistration.groupBy({
                by: ['status'],
                where: { mockDriveId },
                _count: { id: true },
            }),
            db_1.prisma.mockDriveBatch.count({ where: { mockDriveId } }),
            db_1.prisma.mockDriveAttempt.groupBy({
                by: ['status'],
                where: { mockDriveId },
                _count: { id: true },
            }),
            db_1.prisma.mockDriveAttempt.aggregate({
                where: {
                    mockDriveId,
                    status: 'COMPLETED',
                },
                _avg: { totalScore: true },
            }),
        ]);
        const registrationMap = new Map(registrationStats.map((r) => [r.status, r._count.id]));
        const attemptMap = new Map(attemptStats.map((a) => [a.status, a._count.id]));
        const duration = Date.now() - startTime;
        logger_1.logger.debug('Mock drive stats retrieved', {
            mockDriveId,
            durationMs: duration,
        });
        return {
            totalRegistrations: registrationStats.reduce((acc, r) => acc + r._count.id, 0),
            pendingRegistrations: registrationMap.get('PENDING') ?? 0,
            approvedRegistrations: registrationMap.get('APPROVED') ?? 0,
            rejectedRegistrations: registrationMap.get('REJECTED') ?? 0,
            totalBatches: batchCount,
            completedAttempts: attemptMap.get('COMPLETED') ?? 0,
            inProgressAttempts: attemptMap.get('IN_PROGRESS') ?? 0,
            averageScore: completedStats._avg.totalScore,
        };
    }
    // ==========================================
    // Duplicate Mock Drive
    // ==========================================
    async duplicate(mockDriveId, instituteId, newTitle) {
        logger_1.logger.info('Duplicating mock drive', {
            mockDriveId,
            instituteId,
            newTitle,
        });
        const original = await this.getById(mockDriveId, instituteId);
        const duplicated = await db_1.prisma.$transaction(async (tx) => {
            const newMockDrive = await tx.mockDrive.create({
                data: {
                    instituteId,
                    title: newTitle?.trim() || `${original.title} (Copy)`,
                    description: original.description,
                    instructions: original.instructions,
                    allowLateSubmission: original.allowLateSubmission,
                    showLeaderboard: original.showLeaderboard,
                    showResultsImmediately: original.showResultsImmediately,
                    shuffleQuestions: original.shuffleQuestions,
                    enableProctoring: original.enableProctoring,
                    proctoringSettings: original.proctoringSettings
                        ? toJson(original.proctoringSettings)
                        : client_1.Prisma.DbNull,
                    status: client_1.MockDriveStatus.DRAFT,
                },
            });
            if (original.eligibilityCriteria) {
                await tx.mockDriveEligibility.create({
                    data: {
                        mockDriveId: newMockDrive.id,
                        minCgpa: original.eligibilityCriteria.minCgpa,
                        maxCgpa: original.eligibilityCriteria.maxCgpa,
                        minMarks10: original.eligibilityCriteria.minMarks10,
                        minMarks12: original.eligibilityCriteria.minMarks12,
                        allowedDepartments: original.eligibilityCriteria.allowedDepartments,
                        allowedCourseYears: original.eligibilityCriteria.allowedCourseYears,
                        requiredSkills: original.eligibilityCriteria.requiredSkills,
                        maxBacklogs: original.eligibilityCriteria.maxBacklogs,
                        customRules: original.eligibilityCriteria.customRules
                            ? toJson(original.eligibilityCriteria.customRules)
                            : client_1.Prisma.DbNull,
                    },
                });
            }
            if (original.modules.length > 0) {
                await tx.mockDriveModule.createMany({
                    data: original.modules.map((module) => ({
                        mockDriveId: newMockDrive.id,
                        moduleType: module.moduleType,
                        order: module.order,
                        name: module.name,
                        timeLimit: module.timeLimit,
                        weightage: module.weightage,
                        config: toJson(module.config),
                        passingScore: module.passingScore,
                        instructions: module.instructions,
                        isActive: module.isActive,
                    })),
                });
            }
            return newMockDrive;
        });
        logger_1.logger.info('Mock drive duplicated', {
            originalId: mockDriveId,
            newId: duplicated.id,
        });
        return this.getById(duplicated.id, instituteId);
    }
    // ==========================================
    // Get Question Availability Summary
    // ==========================================
    async getQuestionAvailability(mockDriveId, instituteId) {
        await this.verifyAccess(mockDriveId, instituteId);
        const modules = await db_1.prisma.mockDriveModule.findMany({
            where: { mockDriveId, isActive: true },
            orderBy: { order: 'asc' },
        });
        const results = [];
        for (const module of modules) {
            const config = parseModuleConfig(module.config);
            const availability = await this.checkModuleQuestionsAvailability(module.moduleType, config);
            results.push({
                moduleId: module.id,
                moduleType: module.moduleType,
                order: module.order,
                availability,
            });
        }
        return results;
    }
    // ==========================================
    // Private Helper Methods
    // ==========================================
    async verifyAccess(mockDriveId, instituteId) {
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
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [client_1.MockDriveStatus.DRAFT]: [
                client_1.MockDriveStatus.PUBLISHED,
                client_1.MockDriveStatus.CANCELLED,
            ],
            [client_1.MockDriveStatus.PUBLISHED]: [
                client_1.MockDriveStatus.REGISTRATION_OPEN,
                client_1.MockDriveStatus.CANCELLED,
            ],
            [client_1.MockDriveStatus.REGISTRATION_OPEN]: [
                client_1.MockDriveStatus.REGISTRATION_CLOSED,
                client_1.MockDriveStatus.CANCELLED,
            ],
            [client_1.MockDriveStatus.REGISTRATION_CLOSED]: [
                client_1.MockDriveStatus.IN_PROGRESS,
                client_1.MockDriveStatus.CANCELLED,
            ],
            [client_1.MockDriveStatus.IN_PROGRESS]: [
                client_1.MockDriveStatus.COMPLETED,
                client_1.MockDriveStatus.CANCELLED,
            ],
            [client_1.MockDriveStatus.COMPLETED]: [],
            [client_1.MockDriveStatus.CANCELLED]: [],
        };
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new mockdrive_types_1.MockDriveInvalidStatusError(currentStatus, `transition to ${newStatus}`);
        }
    }
    validatePublishedDriveUpdate(data, currentStatus) {
        const allowedFields = new Set([
            'description',
            'instructions',
            'showLeaderboard',
            'showResultsImmediately',
            'resultsReleaseDate',
            'status',
        ]);
        const attemptedFields = Object.keys(data).filter((key) => data[key] !== undefined);
        const restrictedFields = attemptedFields.filter((field) => !allowedFields.has(field));
        if (restrictedFields.length > 0) {
            throw new mockdrive_types_1.MockDriveInvalidStatusError(currentStatus, `update fields: ${restrictedFields.join(', ')}`);
        }
    }
    validateDates(mockDrive, errors, warnings) {
        if (!mockDrive.registrationStartDate) {
            errors.push('Registration start date is required');
        }
        if (!mockDrive.registrationEndDate) {
            errors.push('Registration end date is required');
        }
        if (!mockDrive.driveStartDate) {
            errors.push('Drive start date is required');
        }
        if (!mockDrive.driveEndDate) {
            errors.push('Drive end date is required');
        }
        if (mockDrive.registrationStartDate && mockDrive.registrationEndDate) {
            if (mockDrive.registrationStartDate >= mockDrive.registrationEndDate) {
                errors.push('Registration start date must be before end date');
            }
        }
        if (mockDrive.driveStartDate && mockDrive.driveEndDate) {
            if (mockDrive.driveStartDate >= mockDrive.driveEndDate) {
                errors.push('Drive start date must be before end date');
            }
        }
        if (mockDrive.registrationEndDate && mockDrive.driveStartDate) {
            if (mockDrive.registrationEndDate > mockDrive.driveStartDate) {
                warnings.push('Registration ends after drive starts - consider adjusting');
            }
        }
        const now = new Date();
        if (mockDrive.registrationStartDate &&
            mockDrive.registrationStartDate < now) {
            warnings.push('Registration start date is in the past');
        }
    }
    async validateModules(modules, errors, warnings) {
        if (modules.length === 0) {
            errors.push('At least one active module is required');
            return;
        }
        const orders = modules.map((m) => m.order);
        const uniqueOrders = new Set(orders);
        // Check for duplicate orders - this IS an error
        if (uniqueOrders.size !== orders.length) {
            const duplicates = orders.filter((o, i) => orders.indexOf(o) !== i);
            errors.push(`Duplicate module orders found: ${[...new Set(duplicates)].join(', ')}`);
        }
        // Check for non-positive orders - this IS an error
        const invalidOrders = orders.filter((o) => o < 1);
        if (invalidOrders.length > 0) {
            errors.push('Module orders must be positive integers (found: ' +
                invalidOrders.join(', ') +
                ')');
        }
        // Check for gaps - this is just a warning (will be auto-fixed)
        const sortedOrders = [...orders].sort((a, b) => a - b);
        const expectedOrders = Array.from({ length: orders.length }, (_, i) => i + 1);
        const hasGaps = !sortedOrders.every((o, i) => o === expectedOrders[i]);
        if (hasGaps && uniqueOrders.size === orders.length) {
            warnings.push(`Module orders have gaps (${sortedOrders.join(', ')}). ` +
                `They will be automatically renumbered to ${expectedOrders.join(', ')} during publish.`);
        }
        // Check total weightage
        const totalWeightage = modules.reduce((sum, m) => sum + m.weightage, 0);
        if (Math.abs(totalWeightage - 100) > 0.01) {
            errors.push(`Module weightages must sum to 100% (currently ${totalWeightage.toFixed(2)}%)`);
        }
        // Check questions availability for each module
        for (const module of modules) {
            const config = parseModuleConfig(module.config);
            const availability = await this.checkModuleQuestionsAvailability(module.moduleType, config);
            if (!availability.hasEnough) {
                const contextInfo = module.moduleType === client_1.MockDriveModuleType.APTITUDE
                    ? `(Difficulty: ${availability.criteria.difficulty}, Types: ${availability.criteria.questionTypes?.join(', ')})`
                    : `(Difficulty: ${availability.criteria.difficulty})`;
                errors.push(`Module ${module.order} (${module.moduleType}): Insufficient questions. ` +
                    `Required: ${availability.required}, Available: ${availability.available} ${contextInfo}`);
            }
        }
    }
    async normalizeModuleOrders(mockDriveId, tx) {
        const modules = await tx.mockDriveModule.findMany({
            where: { mockDriveId, isActive: true },
            orderBy: { order: 'asc' },
            select: { id: true, order: true },
        });
        const needsRenumbering = modules.some((m, i) => m.order !== i + 1);
        if (needsRenumbering) {
            logger_1.logger.info('Normalizing module orders', {
                mockDriveId,
                before: modules.map((m) => ({ id: m.id, order: m.order })),
            });
            await Promise.all(modules.map((module, index) => tx.mockDriveModule.update({
                where: { id: module.id },
                data: { order: index + 1 },
            })));
            logger_1.logger.info('Module orders normalized', {
                mockDriveId,
                after: modules.map((m, i) => ({ id: m.id, order: i + 1 })),
            });
        }
    }
    async checkModuleQuestionsAvailability(moduleType, config) {
        let required = 0;
        let available = 0;
        let criteria = { difficulty: 'MEDIUM' };
        if (moduleType === client_1.MockDriveModuleType.APTITUDE) {
            const aptConfig = config;
            required = aptConfig.numberOfQuestions;
            criteria = {
                difficulty: aptConfig.difficulty,
                questionTypes: aptConfig.questionTypes,
            };
            available = await db_1.prisma.aptitudeQuestion.count({
                where: {
                    isActive: true,
                    difficulty: aptConfig.difficulty,
                    questionType: { in: aptConfig.questionTypes },
                },
            });
            logger_1.logger.debug('Aptitude question availability check', {
                required,
                available,
                difficulty: aptConfig.difficulty,
                questionTypes: aptConfig.questionTypes,
                hasEnough: available >= required,
            });
        }
        else if (moduleType === client_1.MockDriveModuleType.MACHINE_CODING) {
            const machineConfig = config;
            required = machineConfig.numberOfQuestions;
            criteria = {
                difficulty: machineConfig.difficulty,
            };
            available = await db_1.prisma.machineQuestion.count({
                where: {
                    isActive: true,
                    difficulty: machineConfig.difficulty,
                },
            });
            logger_1.logger.debug('Machine coding question availability check', {
                required,
                available,
                difficulty: machineConfig.difficulty,
                hasEnough: available >= required,
            });
        }
        else {
            logger_1.logger.debug('AI Interview module - no question check needed', {
                moduleType,
            });
            return {
                required: 0,
                available: 0,
                hasEnough: true,
                criteria: { difficulty: 'N/A' },
            };
        }
        const hasEnough = available >= required;
        if (!hasEnough) {
            logger_1.logger.warn('Insufficient questions for module', {
                moduleType,
                required,
                available,
                deficit: required - available,
                criteria,
            });
        }
        return { required, available, hasEnough, criteria };
    }
    async generateModuleQuestions(mockDriveId, tx) {
        const startTime = Date.now();
        logger_1.logger.info('Generating module questions', { mockDriveId });
        const modules = await tx.mockDriveModule.findMany({
            where: { mockDriveId, isActive: true },
            orderBy: { order: 'asc' },
        });
        for (const module of modules) {
            const config = parseModuleConfig(module.config);
            const moduleStartTime = Date.now();
            if (module.moduleType === client_1.MockDriveModuleType.APTITUDE) {
                await this.generateAptitudeQuestions(module.id, config, tx);
            }
            else if (module.moduleType === client_1.MockDriveModuleType.MACHINE_CODING) {
                await this.generateMachineQuestions(module.id, config, tx);
            }
            logger_1.logger.debug('Module questions generated', {
                moduleId: module.id,
                moduleType: module.moduleType,
                order: module.order,
                durationMs: Date.now() - moduleStartTime,
            });
        }
        logger_1.logger.info('All module questions generated', {
            mockDriveId,
            moduleCount: modules.length,
            durationMs: Date.now() - startTime,
        });
    }
    async generateAptitudeQuestions(moduleId, config, tx) {
        const questions = await tx.$queryRaw `
      SELECT id 
      FROM aptitude_questions
      WHERE "isActive" = true
        AND difficulty = ${config.difficulty}::"DifficultyLevel"
        AND "questionType" = ANY(${config.questionTypes}::"QuestionType"[])
      ORDER BY RANDOM()
      LIMIT ${config.numberOfQuestions}
    `;
        if (questions.length < config.numberOfQuestions) {
            throw new InsufficientQuestionsError(client_1.MockDriveModuleType.APTITUDE, config.numberOfQuestions, questions.length, `Criteria: difficulty=${config.difficulty}, types=${config.questionTypes.join(',')}`);
        }
        await tx.mockDriveModuleQuestion.createMany({
            data: questions.map((q, index) => ({
                moduleId,
                aptitudeQuestionId: q.id,
                order: index + 1,
            })),
        });
        logger_1.logger.debug('Aptitude questions assigned to module', {
            moduleId,
            questionCount: questions.length,
        });
    }
    async generateMachineQuestions(moduleId, config, tx) {
        const questions = await tx.$queryRaw `
      SELECT id 
      FROM machine_questions
      WHERE "isActive" = true
        AND difficulty = ${config.difficulty}::"DifficultyLevel"
      ORDER BY RANDOM()
      LIMIT ${config.numberOfQuestions}
    `;
        if (questions.length < config.numberOfQuestions) {
            throw new InsufficientQuestionsError(client_1.MockDriveModuleType.MACHINE_CODING, config.numberOfQuestions, questions.length, `Criteria: difficulty=${config.difficulty}`);
        }
        await tx.mockDriveModuleQuestion.createMany({
            data: questions.map((q, index) => ({
                moduleId,
                machineQuestionId: q.id,
                order: index + 1,
            })),
        });
        logger_1.logger.debug('Machine coding questions assigned to module', {
            moduleId,
            questionCount: questions.length,
        });
    }
    getDetailedInclude() {
        return {
            eligibilityCriteria: true,
            modules: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
                include: {
                    _count: {
                        select: { moduleQuestions: true },
                    },
                },
            },
            _count: {
                select: {
                    registrations: true,
                    batches: true,
                    attempts: true,
                },
            },
        };
    }
    mapToDetails(mockDrive) {
        const eligibilityCriteria = mockDrive.eligibilityCriteria
            ? {
                id: mockDrive.eligibilityCriteria.id,
                minCgpa: mockDrive.eligibilityCriteria.minCgpa,
                maxCgpa: mockDrive.eligibilityCriteria.maxCgpa,
                minMarks10: mockDrive.eligibilityCriteria.minMarks10,
                minMarks12: mockDrive.eligibilityCriteria.minMarks12,
                allowedDepartments: mockDrive.eligibilityCriteria.allowedDepartments,
                allowedCourseYears: mockDrive.eligibilityCriteria.allowedCourseYears,
                requiredSkills: mockDrive.eligibilityCriteria.requiredSkills,
                maxBacklogs: mockDrive.eligibilityCriteria.maxBacklogs,
                customRules: mockDrive.eligibilityCriteria.customRules,
            }
            : null;
        const modules = mockDrive.modules.map((m) => ({
            id: m.id,
            mockDriveId: mockDrive.id,
            moduleType: m.moduleType,
            order: m.order,
            name: m.name,
            timeLimit: m.timeLimit,
            weightage: m.weightage,
            config: m.config,
            passingScore: m.passingScore,
            instructions: m.instructions,
            isActive: m.isActive,
            questionsCount: m._count?.moduleQuestions ?? 0,
            createdAt: mockDrive.createdAt,
            updatedAt: mockDrive.updatedAt,
        }));
        return {
            id: mockDrive.id,
            instituteId: mockDrive.instituteId,
            title: mockDrive.title,
            description: mockDrive.description,
            instructions: mockDrive.instructions,
            status: mockDrive.status,
            registrationStartDate: mockDrive.registrationStartDate,
            registrationEndDate: mockDrive.registrationEndDate,
            maxRegistrations: mockDrive.maxRegistrations,
            driveStartDate: mockDrive.driveStartDate,
            driveEndDate: mockDrive.driveEndDate,
            allowLateSubmission: mockDrive.allowLateSubmission,
            showLeaderboard: mockDrive.showLeaderboard,
            showResultsImmediately: mockDrive.showResultsImmediately,
            resultsReleaseDate: mockDrive.resultsReleaseDate,
            shuffleQuestions: mockDrive.shuffleQuestions,
            enableProctoring: mockDrive.enableProctoring,
            proctoringSettings: mockDrive.proctoringSettings,
            questionsGenerated: mockDrive.questionsGenerated,
            questionsGeneratedAt: mockDrive.questionsGeneratedAt,
            createdAt: mockDrive.createdAt,
            updatedAt: mockDrive.updatedAt,
            eligibilityCriteria,
            modules,
            stats: {
                totalRegistrations: mockDrive._count?.registrations ?? 0,
                pendingRegistrations: 0,
                approvedRegistrations: 0,
                rejectedRegistrations: 0,
                totalBatches: mockDrive._count?.batches ?? 0,
                completedAttempts: 0,
                inProgressAttempts: 0,
                averageScore: null,
            },
        };
    }
}
exports.MockDriveService = MockDriveService;
// Export singleton instance
exports.mockDriveService = new MockDriveService();
//# sourceMappingURL=mockdrive.service.js.map
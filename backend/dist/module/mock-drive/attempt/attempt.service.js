"use strict";
// src/module/mock-drive/attempt/attempt.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptService = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../../../utils/errors");
const aptitude_executor_1 = require("./executors/aptitude.executor");
const machine_executor_1 = require("./executors/machine.executor");
const interview_executor_1 = require("./executors/interview.executor");
const time_utils_1 = require("../utils/time.utils");
const scoring_utils_1 = require("../utils/scoring.utils");
// ============================================
// Service Implementation
// ============================================
class AttemptService {
    prisma;
    executors;
    constructor(prisma) {
        this.prisma = prisma;
        // Initialize executors separately to avoid type inference issues
        this.executors = new Map();
        this.executors.set('APTITUDE', new aptitude_executor_1.AptitudeModuleExecutor(prisma));
        this.executors.set('MACHINE_CODING', new machine_executor_1.MachineModuleExecutor(prisma));
        this.executors.set('AI_INTERVIEW', new interview_executor_1.InterviewModuleExecutor(prisma));
    }
    // ============================================
    // Public Methods
    // ============================================
    async getAttemptState(userId, driveId) {
        const attempt = await this.findAttemptWithModules(userId, driveId);
        if (!attempt) {
            return null;
        }
        return {
            attempt: this.mapToAttemptState(attempt),
            currentModule: this.findCurrentModuleState(attempt),
        };
    }
    async startAttempt(userId, driveId) {
        // Check for existing attempt
        const existingAttempt = await this.prisma.mockDriveAttempt.findFirst({
            where: { mockDriveId: driveId, userId },
        });
        if (existingAttempt) {
            throw new errors_1.AppError('ATTEMPT_EXISTS', 'Attempt already exists for this mock drive', 400);
        }
        // Validate registration and timing
        const registration = await this.validateRegistration(userId, driveId);
        // Create attempt with module attempts
        const attempt = await this.createAttemptWithModules(userId, driveId, registration.batch.id, registration.mockDrive.modules);
        return {
            attemptId: attempt.id,
            status: attempt.status,
            currentModule: this.findCurrentModuleState(attempt),
            modules: this.mapToAttemptState(attempt).modules,
        };
    }
    async startModule(userId, driveId, moduleId) {
        const { attempt, moduleAttempt } = await this.getActiveModuleAttempt(userId, driveId, moduleId);
        // Validate module can be started
        this.validateModuleStart(moduleAttempt);
        // If already in progress, return current state
        if (moduleAttempt.status === 'IN_PROGRESS') {
            return this.buildModuleResponse(moduleAttempt);
        }
        // Initialize and start module
        const now = new Date();
        const expiresAt = (0, time_utils_1.calculateExpiresAt)(now, moduleAttempt.module.timeLimit);
        const executor = this.getExecutor(moduleAttempt.module.moduleType);
        const context = this.buildExecutorContext(attempt.id, moduleAttempt, userId);
        const { data: initialData } = await executor.initialize(context);
        const updatedModuleAttempt = await this.prisma.mockDriveModuleAttempt.update({
            where: { id: moduleAttempt.id },
            data: {
                status: 'IN_PROGRESS',
                startedAt: now,
                expiresAt,
                moduleData: initialData,
            },
            include: { module: true },
        });
        return this.buildModuleResponse(updatedModuleAttempt);
    }
    async handleModuleAction(userId, driveId, moduleId, action, payload) {
        const { attempt, moduleAttempt } = await this.getActiveModuleAttempt(userId, driveId, moduleId);
        // Validate module is in progress
        if (moduleAttempt.status !== 'IN_PROGRESS') {
            throw new errors_1.AppError('MODULE_NOT_IN_PROGRESS', `Module is ${moduleAttempt.status.toLowerCase()}`, 400);
        }
        // Check expiration
        if ((0, time_utils_1.isExpired)(moduleAttempt.expiresAt)) {
            await this.submitModule(userId, driveId, moduleId, true);
            throw new errors_1.AppError('MODULE_EXPIRED', 'Module time has expired. Module has been auto-submitted.', 400);
        }
        // Execute action
        const executor = this.getExecutor(moduleAttempt.module.moduleType);
        const context = this.buildExecutorContext(attempt.id, moduleAttempt, userId);
        const updatedData = await executor.handleAction(context, action, payload);
        // Merge and persist data
        const existingData = moduleAttempt.moduleData || {};
        const mergedData = {
            ...existingData,
            ...updatedData,
        };
        await this.prisma.mockDriveModuleAttempt.update({
            where: { id: moduleAttempt.id },
            data: {
                moduleData: mergedData,
                timeSpentSeconds: this.calculateTimeSpent(moduleAttempt.startedAt),
            },
        });
        return {
            success: true,
            updatedData: updatedData,
            timeRemainingSeconds: (0, time_utils_1.calculateTimeRemaining)(moduleAttempt.expiresAt),
        };
    }
    async submitModule(userId, driveId, moduleId, isAutoSubmit = false) {
        const attempt = await this.findAttemptWithModules(userId, driveId, 'IN_PROGRESS');
        if (!attempt) {
            throw new errors_1.AppError('NO_ACTIVE_ATTEMPT', 'No active attempt found', 404);
        }
        const moduleIndex = attempt.moduleAttempts.findIndex((ma) => ma.moduleId === moduleId);
        if (moduleIndex === -1) {
            throw new errors_1.AppError('MODULE_NOT_FOUND', 'Module not found in attempt', 404);
        }
        const moduleAttempt = attempt.moduleAttempts[moduleIndex];
        if (moduleAttempt.status !== 'IN_PROGRESS') {
            throw new errors_1.AppError('MODULE_NOT_IN_PROGRESS', `Module is ${moduleAttempt.status.toLowerCase()}`, 400);
        }
        // Finalize module
        const executor = this.getExecutor(moduleAttempt.module.moduleType);
        const context = this.buildExecutorContext(attempt.id, moduleAttempt, userId);
        const result = await executor.finalize(context);
        const status = (0, time_utils_1.isExpired)(moduleAttempt.expiresAt)
            ? 'TIMED_OUT'
            : 'COMPLETED';
        // Update module attempt
        await this.prisma.mockDriveModuleAttempt.update({
            where: { id: moduleAttempt.id },
            data: {
                status,
                completedAt: new Date(),
                moduleData: result.data,
                score: result.score,
                maxScore: result.maxScore,
                percentage: result.percentage,
                isPassed: result.isPassed,
                isAutoSubmitted: isAutoSubmit,
                timeSpentSeconds: this.calculateTimeSpent(moduleAttempt.startedAt),
            },
        });
        // Handle next module or complete attempt
        const isLastModule = moduleIndex === attempt.moduleAttempts.length - 1;
        let nextModule = null;
        if (!isLastModule) {
            nextModule = await this.unlockNextModule(attempt, moduleIndex);
        }
        else {
            await this.completeAttempt(attempt.id);
        }
        return {
            moduleAttemptId: moduleAttempt.id,
            status,
            score: result.score,
            maxScore: result.maxScore,
            percentage: result.percentage,
            isPassed: result.isPassed,
            nextModule,
            isLastModule,
            attemptCompleted: isLastModule,
        };
    }
    async getModuleState(userId, driveId, moduleId) {
        const attemptState = await this.getAttemptState(userId, driveId);
        if (!attemptState) {
            throw new errors_1.AppError('NO_ATTEMPT', 'No attempt found', 404);
        }
        const moduleState = attemptState.attempt.modules.find((m) => m.moduleId === moduleId) || null;
        return {
            attempt: attemptState.attempt,
            module: moduleState,
            currentModule: attemptState.currentModule,
        };
    }
    // ============================================
    // Private Methods - Attempt Management
    // ============================================
    async findAttemptWithModules(userId, driveId, status) {
        return this.prisma.mockDriveAttempt.findFirst({
            where: {
                mockDriveId: driveId,
                userId,
                ...(status && { status }),
            },
            include: {
                moduleAttempts: {
                    include: { module: true },
                    orderBy: { module: { order: 'asc' } },
                },
            },
        });
    }
    async validateRegistration(userId, driveId) {
        const registration = await this.prisma.mockDriveRegistration.findUnique({
            where: {
                mockDriveId_userId: { mockDriveId: driveId, userId },
            },
            include: {
                batch: true,
                mockDrive: {
                    include: {
                        modules: {
                            where: { isActive: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        if (!registration) {
            throw new errors_1.AppError('NOT_REGISTERED', 'Not registered for this mock drive', 403);
        }
        if (registration.status !== 'APPROVED') {
            throw new errors_1.AppError('REGISTRATION_NOT_APPROVED', `Registration is ${registration.status.toLowerCase()}`, 403);
        }
        if (!registration.batch) {
            throw new errors_1.AppError('NO_BATCH_ASSIGNED', 'No batch assigned. Please wait for batch assignment.', 400);
        }
        const { canStart, reason } = (0, time_utils_1.canStartAttempt)(registration.batch.scheduledStartTime, registration.batch.scheduledEndTime);
        if (!canStart) {
            throw new errors_1.AppError('CANNOT_START_ATTEMPT', reason || 'Cannot start attempt now', 400);
        }
        return registration;
    }
    async createAttemptWithModules(userId, driveId, batchId, modules) {
        return this.prisma.$transaction(async (tx) => {
            const newAttempt = await tx.mockDriveAttempt.create({
                data: {
                    mockDriveId: driveId,
                    batchId,
                    userId,
                    status: 'IN_PROGRESS',
                    currentModuleOrder: 0,
                    startedAt: new Date(),
                },
            });
            const moduleAttempts = modules.map((module, index) => ({
                attemptId: newAttempt.id,
                moduleId: module.id,
                status: index === 0
                    ? client_1.MockDriveModuleAttemptStatus.AVAILABLE
                    : client_1.MockDriveModuleAttemptStatus.LOCKED,
            }));
            await tx.mockDriveModuleAttempt.createMany({ data: moduleAttempts });
            const result = await tx.mockDriveAttempt.findUnique({
                where: { id: newAttempt.id },
                include: {
                    moduleAttempts: {
                        include: { module: true },
                        orderBy: { module: { order: 'asc' } },
                    },
                },
            });
            if (!result) {
                throw new errors_1.AppError('ATTEMPT_CREATION_FAILED', 'Failed to create attempt', 500);
            }
            return result;
        });
    }
    async completeAttempt(attemptId) {
        const attempt = await this.prisma.mockDriveAttempt.findUnique({
            where: { id: attemptId },
            include: {
                moduleAttempts: {
                    include: { module: true },
                    orderBy: { module: { order: 'asc' } },
                },
            },
        });
        if (!attempt) {
            throw new errors_1.AppError('ATTEMPT_NOT_FOUND', 'Attempt not found', 404);
        }
        const moduleScores = attempt.moduleAttempts.map((ma) => ({
            moduleId: ma.moduleId,
            moduleName: ma.module.name,
            moduleType: ma.module.moduleType,
            score: ma.score || 0,
            maxScore: ma.maxScore || 0,
            percentage: ma.percentage || 0,
            isPassed: ma.isPassed || false,
        }));
        const { totalScore, percentageScore } = (0, scoring_utils_1.calculateOverallScore)(moduleScores.map((ms) => ({
            score: ms.score,
            maxScore: ms.maxScore,
            weightage: attempt.moduleAttempts.find((ma) => ma.moduleId === ms.moduleId)?.module.weightage || 1,
        })));
        const completedAt = new Date();
        await this.prisma.mockDriveAttempt.update({
            where: { id: attemptId },
            data: {
                status: 'COMPLETED',
                completedAt,
                totalScore,
                percentageScore,
                moduleScoresSummary: moduleScores,
            },
        });
        await this.updateLeaderboard(attempt.mockDriveId, attempt.batchId, attempt.userId, {
            totalScore,
            percentageScore,
            moduleScores,
            completedAt,
        });
        return {
            attemptId,
            status: 'COMPLETED',
            totalScore,
            percentageScore,
            completedAt,
            moduleScores,
        };
    }
    // ============================================
    // Private Methods - Module Management
    // ============================================
    async getActiveModuleAttempt(userId, driveId, moduleId) {
        const attempt = await this.findAttemptWithModules(userId, driveId, 'IN_PROGRESS');
        if (!attempt) {
            throw new errors_1.AppError('NO_ACTIVE_ATTEMPT', 'No active attempt found', 404);
        }
        const moduleAttempt = attempt.moduleAttempts.find((ma) => ma.moduleId === moduleId);
        if (!moduleAttempt) {
            throw new errors_1.AppError('MODULE_NOT_FOUND', 'Module not found in attempt', 404);
        }
        return { attempt, moduleAttempt };
    }
    validateModuleStart(moduleAttempt) {
        if (moduleAttempt.status === 'LOCKED') {
            throw new errors_1.AppError('MODULE_LOCKED', 'Module is locked. Complete previous modules first.', 400);
        }
        if (moduleAttempt.status === 'COMPLETED' || moduleAttempt.status === 'TIMED_OUT') {
            throw new errors_1.AppError('MODULE_ALREADY_COMPLETED', `Module is already ${moduleAttempt.status.toLowerCase()}`, 400);
        }
    }
    async unlockNextModule(attempt, currentIndex) {
        const nextModuleAttempt = attempt.moduleAttempts[currentIndex + 1];
        await this.prisma.$transaction([
            this.prisma.mockDriveModuleAttempt.update({
                where: { id: nextModuleAttempt.id },
                data: { status: 'AVAILABLE' },
            }),
            this.prisma.mockDriveAttempt.update({
                where: { id: attempt.id },
                data: { currentModuleOrder: nextModuleAttempt.module.order },
            }),
        ]);
        return {
            moduleAttemptId: nextModuleAttempt.id,
            moduleId: nextModuleAttempt.moduleId,
            moduleType: nextModuleAttempt.module.moduleType,
            order: nextModuleAttempt.module.order,
            name: nextModuleAttempt.module.name,
            status: 'AVAILABLE',
            timeLimit: nextModuleAttempt.module.timeLimit,
            instructions: nextModuleAttempt.module.instructions,
            startedAt: null,
            expiresAt: null,
            timeRemainingSeconds: nextModuleAttempt.module.timeLimit * 60,
            config: nextModuleAttempt.module.config,
            data: null,
        };
    }
    // ============================================
    // Private Methods - Leaderboard
    // ============================================
    async updateLeaderboard(mockDriveId, batchId, userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        const studentName = user?.profile?.fullName || user?.name || 'Unknown';
        const studentId = user?.profile?.studentId;
        const departmentId = user?.profile?.departmentId;
        const leaderboardData = {
            studentName,
            studentId,
            departmentId,
            totalScore: data.totalScore,
            percentageScore: data.percentageScore,
            moduleScores: data.moduleScores,
            completedAt: data.completedAt,
        };
        // Update batch leaderboard
        await this.prisma.mockDriveLeaderboard.upsert({
            where: {
                mockDriveId_batchId_userId: { mockDriveId, batchId, userId },
            },
            create: {
                mockDriveId,
                batchId,
                userId,
                ...leaderboardData,
                rank: 0,
            },
            update: leaderboardData,
        });
        // Update overall leaderboard
        const existingOverall = await this.prisma.mockDriveLeaderboard.findFirst({
            where: { mockDriveId, batchId: null, userId },
        });
        if (existingOverall) {
            await this.prisma.mockDriveLeaderboard.update({
                where: { id: existingOverall.id },
                data: leaderboardData,
            });
        }
        else {
            await this.prisma.mockDriveLeaderboard.create({
                data: {
                    mockDriveId,
                    batchId: null,
                    userId,
                    ...leaderboardData,
                    rank: 0,
                },
            });
        }
        // Recalculate ranks
        await Promise.all([
            this.recalculateRanks(mockDriveId, batchId),
            this.recalculateRanks(mockDriveId, null),
        ]);
    }
    async recalculateRanks(mockDriveId, batchId) {
        const entries = await this.prisma.mockDriveLeaderboard.findMany({
            where: { mockDriveId, batchId },
            orderBy: [{ percentageScore: 'desc' }, { completedAt: 'asc' }],
        });
        await Promise.all(entries.map((entry, index) => this.prisma.mockDriveLeaderboard.update({
            where: { id: entry.id },
            data: { rank: index + 1 },
        })));
    }
    // ============================================
    // Private Methods - Utilities
    // ============================================
    getExecutor(moduleType) {
        const executor = this.executors.get(moduleType);
        if (!executor) {
            throw new errors_1.AppError('NO_EXECUTOR', `No executor for module type: ${moduleType}`, 500);
        }
        return executor;
    }
    buildExecutorContext(attemptId, moduleAttempt, userId) {
        return {
            attemptId,
            moduleAttemptId: moduleAttempt.id,
            moduleId: moduleAttempt.moduleId,
            userId,
            config: moduleAttempt.module.config,
            existingData: moduleAttempt.moduleData,
        };
    }
    buildModuleResponse(moduleAttempt) {
        return {
            moduleAttemptId: moduleAttempt.id,
            status: moduleAttempt.status,
            startedAt: moduleAttempt.startedAt,
            expiresAt: moduleAttempt.expiresAt,
            timeRemainingSeconds: (0, time_utils_1.calculateTimeRemaining)(moduleAttempt.expiresAt),
            moduleType: moduleAttempt.module.moduleType,
            config: moduleAttempt.module.config,
            data: moduleAttempt.moduleData,
            instructions: moduleAttempt.module.instructions,
        };
    }
    calculateTimeSpent(startedAt) {
        if (!startedAt)
            return 0;
        return Math.floor((Date.now() - startedAt.getTime()) / 1000);
    }
    mapToAttemptState(attempt) {
        return {
            attemptId: attempt.id,
            status: attempt.status,
            currentModuleOrder: attempt.currentModuleOrder,
            startedAt: attempt.startedAt,
            modules: attempt.moduleAttempts.map((ma) => ({
                moduleId: ma.moduleId,
                moduleType: ma.module.moduleType,
                order: ma.module.order,
                name: ma.module.name,
                status: ma.status,
                timeLimit: ma.module.timeLimit,
                startedAt: ma.startedAt,
                expiresAt: ma.expiresAt,
                timeSpentSeconds: ma.timeSpentSeconds || 0,
            })),
        };
    }
    findCurrentModuleState(attempt) {
        const current = attempt.moduleAttempts.find((ma) => ma.status === 'AVAILABLE' || ma.status === 'IN_PROGRESS');
        if (!current)
            return null;
        // Properly cast moduleData through unknown first
        const moduleData = current.status === 'IN_PROGRESS' && current.moduleData
            ? current.moduleData
            : null;
        return {
            moduleAttemptId: current.id,
            moduleId: current.moduleId,
            moduleType: current.module.moduleType,
            order: current.module.order,
            name: current.module.name,
            status: current.status,
            timeLimit: current.module.timeLimit,
            instructions: current.module.instructions,
            startedAt: current.startedAt,
            expiresAt: current.expiresAt,
            timeRemainingSeconds: (0, time_utils_1.calculateTimeRemaining)(current.expiresAt),
            config: current.module.config,
            data: moduleData,
        };
    }
}
exports.AttemptService = AttemptService;
//# sourceMappingURL=attempt.service.js.map
// src/module/mock-drive/attempt/attempt.service.ts

import {
  PrismaClient,
  MockDriveAttemptStatus,
  MockDriveModuleAttemptStatus,
  MockDriveModuleType,
  Prisma,
} from '@prisma/client';
import { AppError } from '../../../utils/errors';
import {
  StartAttemptResponse,
  GetAttemptResponse,
  StartModuleResponse,
  ModuleActionResponse,
  SubmitModuleResponse,
  CompleteAttemptResponse,
  ModuleScoreSummary,
  LeaderboardUpdateData,
} from './attempt.types';
import {
  AttemptState,
  CurrentModuleState,
  ModuleConfig,
  ModuleData,
  ModuleAttemptState,
} from '../shared';
import { AptitudeModuleExecutor } from './executors/aptitude.executor';
import { MachineModuleExecutor } from './executors/machine.executor';
import { InterviewModuleExecutor } from './executors/interview.executor';
import { BaseModuleExecutor, ModuleExecutorContext } from './executors/base.executor';
import {
  calculateTimeRemaining,
  calculateExpiresAt,
  isExpired,
  canStartAttempt,
} from '../utils/time.utils';
import { calculateOverallScore } from '../utils/scoring.utils';

// ============================================
// Types for Prisma Results
// ============================================

type AttemptWithModules = Prisma.MockDriveAttemptGetPayload<{
  include: {
    moduleAttempts: {
      include: { module: true };
    };
  };
}>;

type ModuleAttemptWithModule = Prisma.MockDriveModuleAttemptGetPayload<{
  include: { module: true };
}>;

// ============================================
// Service Implementation
// ============================================

export class AttemptService {
  private readonly executors: Map<MockDriveModuleType, BaseModuleExecutor>;

  constructor(private readonly prisma: PrismaClient) {
    // Initialize executors separately to avoid type inference issues
    this.executors = new Map();
    this.executors.set('APTITUDE', new AptitudeModuleExecutor(prisma));
    this.executors.set('MACHINE_CODING', new MachineModuleExecutor(prisma));
    this.executors.set('AI_INTERVIEW', new InterviewModuleExecutor(prisma));
  }

  // ============================================
  // Public Methods
  // ============================================

  async getAttemptState(
    userId: string,
    driveId: string
  ): Promise<GetAttemptResponse | null> {
    const attempt = await this.findAttemptWithModules(userId, driveId);

    if (!attempt) {
      return null;
    }

    return {
      attempt: this.mapToAttemptState(attempt),
      currentModule: this.findCurrentModuleState(attempt),
    };
  }

  async startAttempt(userId: string, driveId: string): Promise<StartAttemptResponse> {
    // Check for existing attempt
    const existingAttempt = await this.prisma.mockDriveAttempt.findFirst({
      where: { mockDriveId: driveId, userId },
    });

    if (existingAttempt) {
      throw new AppError('ATTEMPT_EXISTS', 'Attempt already exists for this mock drive', 400);
    }

    // Validate registration and timing
    const registration = await this.validateRegistration(userId, driveId);

    // Create attempt with module attempts
    const attempt = await this.createAttemptWithModules(
      userId,
      driveId,
      registration.batch!.id,
      registration.mockDrive.modules
    );

    return {
      attemptId: attempt.id,
      status: attempt.status,
      currentModule: this.findCurrentModuleState(attempt),
      modules: this.mapToAttemptState(attempt).modules,
    };
  }

  async submitAttempt(userId: string, driveId: string): Promise<void> {
    const registration = await this.prisma.mockDriveRegistration.findUnique({
      where: {
        mockDriveId_userId: { mockDriveId: driveId, userId },
      },
      include: {
        attempt: true,
      },
    });

    if (!registration?.attempt) {
      throw new AppError('ATTEMPT_NOT_FOUND', 'No active attempt found', 404);
    }

    if (registration.attempt.status === 'COMPLETED') {
      return;
    }

    // Auto-submit all in-progress modules
    const inProgressModules = await this.prisma.mockDriveModuleAttempt.findMany({
      where: {
        attemptId: registration.attempt.id,
        status: 'IN_PROGRESS',
      },
    });

    for (const moduleAttempt of inProgressModules) {
      // We can reuse cancel/submit logic here, or just force complete
      // For now, let's just mark them completed
      await this.prisma.mockDriveModuleAttempt.update({
        where: { id: moduleAttempt.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    // Complete the attempt
    await this.updateAttemptStatus(registration.attempt.id, 'COMPLETED');
  }

  async startModule(
    userId: string,
    driveId: string,
    moduleId: string
  ): Promise<StartModuleResponse> {
    const { attempt, moduleAttempt } = await this.getActiveModuleAttempt(
      userId,
      driveId,
      moduleId
    );

    // Validate module can be started
    this.validateModuleStart(moduleAttempt);

    // If already in progress, return current state
    if (moduleAttempt.status === 'IN_PROGRESS') {
      return this.buildModuleResponse(moduleAttempt);
    }

    // Initialize and start module
    const now = new Date();
    const expiresAt = calculateExpiresAt(now, moduleAttempt.module.timeLimit);

    const executor = this.getExecutor(moduleAttempt.module.moduleType);
    const context = this.buildExecutorContext(attempt.id, moduleAttempt, userId);
    const { data: initialData } = await executor.initialize(context);

    const updatedModuleAttempt = await this.prisma.mockDriveModuleAttempt.update({
      where: { id: moduleAttempt.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: now,
        expiresAt,
        moduleData: initialData as unknown as Prisma.InputJsonValue,
      },
      include: { module: true },
    });

    return this.buildModuleResponse(updatedModuleAttempt);
  }

  async handleModuleAction(
    userId: string,
    driveId: string,
    moduleId: string,
    action: string,
    payload: unknown
  ): Promise<ModuleActionResponse> {
    const { attempt, moduleAttempt } = await this.getActiveModuleAttempt(
      userId,
      driveId,
      moduleId
    );

    // Validate module is in progress
    if (moduleAttempt.status !== 'IN_PROGRESS') {
      throw new AppError(
        'MODULE_NOT_IN_PROGRESS',
        `Module is ${moduleAttempt.status.toLowerCase()}`,
        400
      );
    }

    // Check expiration
    if (isExpired(moduleAttempt.expiresAt)) {
      await this.submitModule(userId, driveId, moduleId, true);
      throw new AppError(
        'MODULE_EXPIRED',
        'Module time has expired. Module has been auto-submitted.',
        400
      );
    }

    // Execute action
    const executor = this.getExecutor(moduleAttempt.module.moduleType);
    const context = this.buildExecutorContext(attempt.id, moduleAttempt, userId);
    const updatedData = await executor.handleAction(context, action, payload);

    // Merge and persist data
    const existingData = (moduleAttempt.moduleData as Record<string, unknown>) || {};
    const mergedData = {
      ...existingData,
      ...updatedData,
    };

    await this.prisma.mockDriveModuleAttempt.update({
      where: { id: moduleAttempt.id },
      data: {
        moduleData: mergedData as unknown as Prisma.InputJsonValue,
        timeSpentSeconds: this.calculateTimeSpent(moduleAttempt.startedAt),
      },
    });

    return {
      success: true,
      updatedData: updatedData as Partial<ModuleData>,
      timeRemainingSeconds: calculateTimeRemaining(moduleAttempt.expiresAt),
    };
  }

  async submitModule(
    userId: string,
    driveId: string,
    moduleId: string,
    isAutoSubmit: boolean = false
  ): Promise<SubmitModuleResponse> {
    const attempt = await this.findAttemptWithModules(userId, driveId, 'IN_PROGRESS');

    if (!attempt) {
      throw new AppError('NO_ACTIVE_ATTEMPT', 'No active attempt found', 404);
    }

    const moduleIndex = attempt.moduleAttempts.findIndex(
      (ma) => ma.moduleId === moduleId
    );

    if (moduleIndex === -1) {
      throw new AppError('MODULE_NOT_FOUND', 'Module not found in attempt', 404);
    }

    const moduleAttempt = attempt.moduleAttempts[moduleIndex];

    if (moduleAttempt.status !== 'IN_PROGRESS') {
      throw new AppError(
        'MODULE_NOT_IN_PROGRESS',
        `Module is ${moduleAttempt.status.toLowerCase()}`,
        400
      );
    }

    // Finalize module
    const executor = this.getExecutor(moduleAttempt.module.moduleType);
    const context = this.buildExecutorContext(attempt.id, moduleAttempt, userId);
    const result = await executor.finalize(context);

    const status: MockDriveModuleAttemptStatus = isExpired(moduleAttempt.expiresAt)
      ? 'TIMED_OUT'
      : 'COMPLETED';

    // Update module attempt
    await this.prisma.mockDriveModuleAttempt.update({
      where: { id: moduleAttempt.id },
      data: {
        status,
        completedAt: new Date(),
        moduleData: result.data as unknown as Prisma.InputJsonValue,
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
    let nextModule: CurrentModuleState | null = null;

    if (!isLastModule) {
      nextModule = await this.unlockNextModule(attempt, moduleIndex);
    } else {
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

  async getModuleState(
    userId: string,
    driveId: string,
    moduleId: string
  ): Promise<{
    attempt: AttemptState;
    module: ModuleAttemptState | null;
    currentModule: CurrentModuleState | null;
  }> {
    const attemptState = await this.getAttemptState(userId, driveId);

    if (!attemptState) {
      throw new AppError('NO_ATTEMPT', 'No attempt found', 404);
    }

    const moduleState = attemptState.attempt.modules.find(
      (m) => m.moduleId === moduleId
    ) || null;

    return {
      attempt: attemptState.attempt,
      module: moduleState,
      currentModule: attemptState.currentModule,
    };
  }

  // ============================================
  // Private Methods - Attempt Management
  // ============================================

  private async findAttemptWithModules(
    userId: string,
    driveId: string,
    status?: MockDriveAttemptStatus
  ): Promise<AttemptWithModules | null> {
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

  private async validateRegistration(userId: string, driveId: string) {
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
      throw new AppError('NOT_REGISTERED', 'Not registered for this mock drive', 403);
    }

    if (registration.status !== 'APPROVED') {
      throw new AppError(
        'REGISTRATION_NOT_APPROVED',
        `Registration is ${registration.status.toLowerCase()}`,
        403
      );
    }

    if (!registration.batch) {
      throw new AppError(
        'NO_BATCH_ASSIGNED',
        'No batch assigned. Please wait for batch assignment.',
        400
      );
    }

    const { canStart, reason } = canStartAttempt(
      registration.batch.scheduledStartTime,
      registration.batch.scheduledEndTime
    );

    if (!canStart) {
      throw new AppError('CANNOT_START_ATTEMPT', reason || 'Cannot start attempt now', 400);
    }

    return registration;
  }

  private async createAttemptWithModules(
    userId: string,
    driveId: string,
    batchId: string,
    modules: Array<{ id: string; order: number }>
  ): Promise<AttemptWithModules> {
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
          ? MockDriveModuleAttemptStatus.AVAILABLE
          : MockDriveModuleAttemptStatus.LOCKED,
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
        throw new AppError('ATTEMPT_CREATION_FAILED', 'Failed to create attempt', 500);
      }

      return result;
    });
  }

  private async completeAttempt(attemptId: string): Promise<CompleteAttemptResponse> {
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
      throw new AppError('ATTEMPT_NOT_FOUND', 'Attempt not found', 404);
    }

    const moduleScores: ModuleScoreSummary[] = attempt.moduleAttempts.map((ma) => ({
      moduleId: ma.moduleId,
      moduleName: ma.module.name,
      moduleType: ma.module.moduleType,
      score: ma.score || 0,
      maxScore: ma.maxScore || 0,
      percentage: ma.percentage || 0,
      isPassed: ma.isPassed || false,
    }));

    const { totalScore, percentageScore } = calculateOverallScore(
      moduleScores.map((ms) => ({
        score: ms.score,
        maxScore: ms.maxScore,
        weightage: attempt.moduleAttempts.find((ma) => ma.moduleId === ms.moduleId)?.module.weightage || 1,
      }))
    );

    const completedAt = new Date();

    await this.prisma.mockDriveAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        completedAt,
        totalScore,
        percentageScore,
        moduleScoresSummary: moduleScores as unknown as Prisma.InputJsonValue,
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

  private async getActiveModuleAttempt(
    userId: string,
    driveId: string,
    moduleId: string
  ): Promise<{ attempt: AttemptWithModules; moduleAttempt: ModuleAttemptWithModule }> {
    const attempt = await this.findAttemptWithModules(userId, driveId, 'IN_PROGRESS');

    if (!attempt) {
      throw new AppError('NO_ACTIVE_ATTEMPT', 'No active attempt found', 404);
    }

    const moduleAttempt = attempt.moduleAttempts.find((ma) => ma.moduleId === moduleId);

    if (!moduleAttempt) {
      throw new AppError('MODULE_NOT_FOUND', 'Module not found in attempt', 404);
    }

    return { attempt, moduleAttempt };
  }

  private validateModuleStart(moduleAttempt: ModuleAttemptWithModule): void {
    if (moduleAttempt.status === 'LOCKED') {
      throw new AppError(
        'MODULE_LOCKED',
        'Module is locked. Complete previous modules first.',
        400
      );
    }

    if (moduleAttempt.status === 'COMPLETED' || moduleAttempt.status === 'TIMED_OUT') {
      throw new AppError(
        'MODULE_ALREADY_COMPLETED',
        `Module is already ${moduleAttempt.status.toLowerCase()}`,
        400
      );
    }
  }

  private async unlockNextModule(
    attempt: AttemptWithModules,
    currentIndex: number
  ): Promise<CurrentModuleState> {
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
      config: nextModuleAttempt.module.config as unknown as ModuleConfig,
      data: null,
    };
  }

  // ============================================
  // Private Methods - Leaderboard
  // ============================================

  private async updateLeaderboard(
    mockDriveId: string,
    batchId: string,
    userId: string,
    data: LeaderboardUpdateData
  ): Promise<void> {
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
      moduleScores: data.moduleScores as unknown as Prisma.InputJsonValue,
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
    } else {
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

  private async recalculateRanks(
    mockDriveId: string,
    batchId: string | null
  ): Promise<void> {
    const entries = await this.prisma.mockDriveLeaderboard.findMany({
      where: { mockDriveId, batchId },
      orderBy: [{ percentageScore: 'desc' }, { completedAt: 'asc' }],
    });

    await Promise.all(
      entries.map((entry, index) =>
        this.prisma.mockDriveLeaderboard.update({
          where: { id: entry.id },
          data: { rank: index + 1 },
        })
      )
    );
  }

  private async updateAttemptStatus(
    attemptId: string,
    status: MockDriveAttemptStatus
  ): Promise<void> {
    await this.prisma.mockDriveAttempt.update({
      where: { id: attemptId },
      data: {
        status,
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });
  }

  // ============================================
  // Private Methods - Utilities
  // ============================================

  private getExecutor(moduleType: MockDriveModuleType): BaseModuleExecutor {
    const executor = this.executors.get(moduleType);
    if (!executor) {
      throw new AppError('NO_EXECUTOR', `No executor for module type: ${moduleType}`, 500);
    }
    return executor;
  }

  private buildExecutorContext(
    attemptId: string,
    moduleAttempt: ModuleAttemptWithModule,
    userId: string
  ): ModuleExecutorContext {
    return {
      attemptId,
      moduleAttemptId: moduleAttempt.id,
      moduleId: moduleAttempt.moduleId,
      userId,
      config: moduleAttempt.module.config as unknown as ModuleConfig,
      existingData: moduleAttempt.moduleData as unknown as ModuleData | null,
    };
  }

  private buildModuleResponse(moduleAttempt: ModuleAttemptWithModule): StartModuleResponse {
    return {
      moduleAttemptId: moduleAttempt.id,
      status: moduleAttempt.status,
      startedAt: moduleAttempt.startedAt!,
      expiresAt: moduleAttempt.expiresAt!,
      timeRemainingSeconds: calculateTimeRemaining(moduleAttempt.expiresAt),
      moduleType: moduleAttempt.module.moduleType,
      config: moduleAttempt.module.config as unknown as ModuleConfig,
      data: moduleAttempt.moduleData as Partial<ModuleData>,
      instructions: moduleAttempt.module.instructions,
    };
  }

  private calculateTimeSpent(startedAt: Date | null): number {
    if (!startedAt) return 0;
    return Math.floor((Date.now() - startedAt.getTime()) / 1000);
  }

  private mapToAttemptState(attempt: AttemptWithModules): AttemptState {
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

  private findCurrentModuleState(attempt: AttemptWithModules): CurrentModuleState | null {
    const current = attempt.moduleAttempts.find(
      (ma) => ma.status === 'AVAILABLE' || ma.status === 'IN_PROGRESS'
    );

    if (!current) return null;

    // Properly cast moduleData through unknown first
    const moduleData = current.status === 'IN_PROGRESS' && current.moduleData
      ? (current.moduleData as unknown as ModuleData)
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
      timeRemainingSeconds: calculateTimeRemaining(current.expiresAt),
      config: current.module.config as unknown as ModuleConfig,
      data: moduleData,
    };
  }
}
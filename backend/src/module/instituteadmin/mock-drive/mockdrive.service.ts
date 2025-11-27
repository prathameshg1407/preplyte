// src/modules/instituteadmin/mock-drive/mockdrive.service.ts

import { Prisma, MockDriveStatus, MockDriveModuleType } from '@prisma/client';
import { prisma } from '../../../lib/db';
import { logger } from '../../../utils/logger';
import {
  CreateMockDriveDTO,
  UpdateMockDriveDTO,
  ListMockDrivesQuery,
  MockDriveListItem,
  MockDriveDetails,
  MockDriveStats,
  PaginatedResponse,
  MockDriveNotFoundError,
  MockDriveAccessDeniedError,
  MockDriveInvalidStatusError,
  MockDrivePublishError,
  MockDriveValidationError,
  ModuleConfig,
  AptitudeModuleConfig,
  MachineCodingModuleConfig,
  ProctoringSettings,
  EligibilityCriteriaResponse,
  PublishValidationResult,
} from './mockdrive.types';
import { ModuleResponse } from './modules';

// ============================================
// Custom Error Classes
// ============================================

export class InsufficientQuestionsError extends MockDrivePublishError {
  public readonly moduleType: MockDriveModuleType;
  public readonly required: number;
  public readonly available: number;
  public readonly deficit: number;

  constructor(
    moduleType: MockDriveModuleType,
    required: number,
    available: number,
    additionalContext?: string
  ) {
    const deficit = required - available;
    const message =
      `Insufficient ${moduleType} questions. ` +
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

export class MockDriveRaceConditionError extends MockDriveValidationError {
  constructor(
    mockDriveId: string,
    expectedStatus: string,
    actualStatus: string
  ) {
    super(
      `Mock drive ${mockDriveId} status changed during operation. ` +
        `Expected: ${expectedStatus}, Actual: ${actualStatus}. Please try again.`
    );
    this.name = 'MockDriveRaceConditionError';
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Converts a value to Prisma's JSON input type
 */
function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

/**
 * Safely parses JSON config from database
 */
function parseModuleConfig(config: Prisma.JsonValue): ModuleConfig {
  if (typeof config === 'object' && config !== null) {
    return config as unknown as ModuleConfig;
  }
  throw new MockDriveValidationError('Invalid module configuration');
}

// ============================================
// Types
// ============================================

interface MockDriveWithIncludes {
  id: string;
  instituteId: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: MockDriveStatus;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  maxRegistrations: number | null;
  driveStartDate: Date | null;
  driveEndDate: Date | null;
  allowLateSubmission: boolean;
  showLeaderboard: boolean;
  showResultsImmediately: boolean;
  resultsReleaseDate: Date | null;
  shuffleQuestions: boolean;
  enableProctoring: boolean;
  proctoringSettings: Prisma.JsonValue;
  questionsGenerated: boolean;
  questionsGeneratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  eligibilityCriteria: {
    id: string;
    minCgpa: number | null;
    maxCgpa: number | null;
    minMarks10: number | null;
    minMarks12: number | null;
    allowedDepartments: string[];
    allowedCourseYears: string[];
    requiredSkills: string[];
    maxBacklogs: number | null;
    customRules: Prisma.JsonValue;
  } | null;
  modules: Array<{
    id: string;
    moduleType: MockDriveModuleType;
    order: number;
    name: string | null;
    timeLimit: number;
    weightage: number;
    config: Prisma.JsonValue;
    passingScore: number | null;
    instructions: string | null;
    isActive: boolean;
    _count?: {
      moduleQuestions: number;
    };
  }>;
  _count?: {
    registrations: number;
    batches: number;
    attempts: number;
  };
}

interface QuestionAvailability {
  required: number;
  available: number;
  hasEnough: boolean;
  criteria: {
    difficulty: string;
    questionTypes?: string[];
  };
}

interface ModuleValidationResult {
  moduleId: string;
  moduleType: MockDriveModuleType;
  order: number;
  availability: QuestionAvailability;
}

// ============================================
// Service Class
// ============================================

export class MockDriveService {
  // ==========================================
  // Create Mock Drive
  // ==========================================

  async create(
    instituteId: string,
    data: CreateMockDriveDTO
  ): Promise<MockDriveDetails> {
    const startTime = Date.now();
    logger.info('Creating mock drive', { instituteId, title: data.title });

    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
      select: { id: true, name: true },
    });

    if (!institute) {
      logger.warn('Institute not found during mock drive creation', {
        instituteId,
      });
      throw new MockDriveValidationError('Institute not found');
    }

    try {
      const mockDrive = await prisma.mockDrive.create({
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
          proctoringSettings:
            data.enableProctoring && data.proctoringSettings
              ? toJson(data.proctoringSettings)
              : Prisma.DbNull,
          status: MockDriveStatus.DRAFT,
        },
        include: this.getDetailedInclude(),
      });

      const duration = Date.now() - startTime;
      logger.info('Mock drive created successfully', {
        mockDriveId: mockDrive.id,
        instituteId,
        instituteName: institute.name,
        durationMs: duration,
      });

      return this.mapToDetails(mockDrive as MockDriveWithIncludes);
    } catch (error) {
      logger.error('Failed to create mock drive', {
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

  async getById(
    mockDriveId: string,
    instituteId: string
  ): Promise<MockDriveDetails> {
    const startTime = Date.now();

    const mockDrive = await prisma.mockDrive.findUnique({
      where: { id: mockDriveId },
      include: this.getDetailedInclude(),
    });

    if (!mockDrive) {
      logger.warn('Mock drive not found', { mockDriveId, instituteId });
      throw new MockDriveNotFoundError(mockDriveId);
    }

    if (mockDrive.instituteId !== instituteId) {
      logger.warn('Mock drive access denied', {
        mockDriveId,
        requestedBy: instituteId,
        ownedBy: mockDrive.instituteId,
      });
      throw new MockDriveAccessDeniedError();
    }

    const duration = Date.now() - startTime;
    logger.debug('Mock drive retrieved', { mockDriveId, durationMs: duration });

    return this.mapToDetails(mockDrive as MockDriveWithIncludes);
  }

  // ==========================================
  // List Mock Drives
  // ==========================================

  async list(
    instituteId: string,
    query: ListMockDrivesQuery
  ): Promise<PaginatedResponse<MockDriveListItem>> {
    const startTime = Date.now();
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: Prisma.MockDriveWhereInput = {
      instituteId,
      ...(status && { status }),
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          description: { contains: search, mode: Prisma.QueryMode.insensitive },
        },
      ];
    }

    const [mockDrives, total] = await Promise.all([
      prisma.mockDrive.findMany({
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
      prisma.mockDrive.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);
    const duration = Date.now() - startTime;

    logger.debug('Mock drives listed', {
      instituteId,
      total,
      page,
      limit: take,
      durationMs: duration,
    });

    return {
      data: mockDrives.map(
        (md): MockDriveListItem => ({
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
        })
      ),
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

  async update(
    mockDriveId: string,
    instituteId: string,
    data: UpdateMockDriveDTO
  ): Promise<MockDriveDetails> {
    const startTime = Date.now();
    logger.info('Updating mock drive', {
      mockDriveId,
      instituteId,
      fields: Object.keys(data),
    });

    const existing = await this.verifyAccess(mockDriveId, instituteId);

    if (data.status) {
      this.validateStatusTransition(existing.status, data.status);
    }

    if (existing.status !== MockDriveStatus.DRAFT) {
      this.validatePublishedDriveUpdate(data, existing.status);
    }

    const updateData: Prisma.MockDriveUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title.trim();
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
        : Prisma.DbNull;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const mockDrive = await prisma.mockDrive.update({
      where: { id: mockDriveId },
      data: updateData,
      include: this.getDetailedInclude(),
    });

    const duration = Date.now() - startTime;
    logger.info('Mock drive updated', {
      mockDriveId,
      durationMs: duration,
    });

    return this.mapToDetails(mockDrive as MockDriveWithIncludes);
  }

  // ==========================================
  // Delete Mock Drive
  // ==========================================

  async delete(mockDriveId: string, instituteId: string): Promise<void> {
    logger.info('Deleting mock drive', { mockDriveId, instituteId });

    const existing = await this.verifyAccess(mockDriveId, instituteId);

    const deletableStatuses: MockDriveStatus[] = [
      MockDriveStatus.DRAFT,
      MockDriveStatus.CANCELLED,
    ];

    if (!deletableStatuses.includes(existing.status)) {
      logger.warn('Cannot delete mock drive - invalid status', {
        mockDriveId,
        status: existing.status,
      });
      throw new MockDriveInvalidStatusError(existing.status, 'delete');
    }

    const attemptCount = await prisma.mockDriveAttempt.count({
      where: { mockDriveId },
    });

    if (attemptCount > 0) {
      logger.warn('Cannot delete mock drive - has attempts', {
        mockDriveId,
        attemptCount,
      });
      throw new MockDriveValidationError(
        'Cannot delete mock drive with existing attempts. Consider cancelling instead.'
      );
    }

    await prisma.mockDrive.delete({
      where: { id: mockDriveId },
    });

    logger.info('Mock drive deleted', { mockDriveId });
  }

  // ==========================================
  // Validate for Publish
  // ==========================================

  async validateForPublish(
    mockDriveId: string,
    instituteId: string
  ): Promise<PublishValidationResult> {
    const startTime = Date.now();
    logger.info('Validating mock drive for publish', {
      mockDriveId,
      instituteId,
    });

    await this.verifyAccess(mockDriveId, instituteId);

    const mockDrive = await prisma.mockDrive.findUnique({
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
      throw new MockDriveNotFoundError(mockDriveId);
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check status
    if (mockDrive.status !== MockDriveStatus.DRAFT) {
      errors.push(
        `Mock drive must be in DRAFT status to publish (current: ${mockDrive.status})`
      );
    }

    // Check required dates
    this.validateDates(mockDrive, errors, warnings);

    // Check modules - pass warnings array
    await this.validateModules(mockDrive.modules, errors, warnings);

    // Check eligibility (warning only)
    if (!mockDrive.eligibilityCriteria) {
      warnings.push(
        'No eligibility criteria set - all students will be eligible'
      );
    }

    if (mockDrive.maxRegistrations === null) {
      warnings.push('No maximum registration limit set');
    }

    const duration = Date.now() - startTime;
    const result: PublishValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    logger.info('Mock drive validation completed', {
      mockDriveId,
      isValid: result.isValid,
      errorCount: errors.length,
      warningCount: warnings.length,
      durationMs: duration,
    });

    if (!result.isValid) {
      logger.warn('Mock drive validation failed', {
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

  async publish(
    mockDriveId: string,
    instituteId: string
  ): Promise<MockDriveDetails> {
    const startTime = Date.now();
    logger.info('Publishing mock drive', { mockDriveId, instituteId });

    const validation = await this.validateForPublish(mockDriveId, instituteId);

    if (!validation.isValid) {
      logger.warn('Mock drive publish validation failed', {
        mockDriveId,
        instituteId,
        errors: validation.errors,
        warnings: validation.warnings,
      });
      throw new MockDrivePublishError(validation.errors.join('; '));
    }

    const mockDrive = await prisma.$transaction(
      async (tx) => {
        const current = await tx.mockDrive.findUnique({
          where: { id: mockDriveId },
          select: {
            status: true,
            questionsGenerated: true,
            title: true,
          },
        });

        if (!current) {
          throw new MockDriveNotFoundError(mockDriveId);
        }

        if (current.status !== MockDriveStatus.DRAFT) {
          logger.warn('Mock drive status changed during publish', {
            mockDriveId,
            expectedStatus: MockDriveStatus.DRAFT,
            actualStatus: current.status,
          });
          throw new MockDriveRaceConditionError(
            mockDriveId,
            MockDriveStatus.DRAFT,
            current.status
          );
        }

        if (current.questionsGenerated) {
          logger.warn('Questions already generated for mock drive', {
            mockDriveId,
          });
          throw new MockDrivePublishError(
            'Questions have already been generated. This may indicate a concurrent publish attempt.'
          );
        }

        // Normalize module orders before generating questions
        await this.normalizeModuleOrders(mockDriveId, tx);

        // Generate questions for all modules
        await this.generateModuleQuestions(mockDriveId, tx);

        // Update status
        return tx.mockDrive.update({
          where: { id: mockDriveId },
          data: {
            status: MockDriveStatus.PUBLISHED,
            questionsGenerated: true,
            questionsGeneratedAt: new Date(),
          },
          include: this.getDetailedInclude(),
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    const duration = Date.now() - startTime;
    logger.info('Mock drive published successfully', {
      mockDriveId,
      durationMs: duration,
    });

    return this.mapToDetails(mockDrive as MockDriveWithIncludes);
  }

  // ==========================================
  // Cancel Mock Drive
  // ==========================================

  async cancel(
    mockDriveId: string,
    instituteId: string
  ): Promise<MockDriveDetails> {
    logger.info('Cancelling mock drive', { mockDriveId, instituteId });

    const existing = await this.verifyAccess(mockDriveId, instituteId);

    const nonCancellableStatuses: MockDriveStatus[] = [
      MockDriveStatus.COMPLETED,
      MockDriveStatus.CANCELLED,
    ];

    if (nonCancellableStatuses.includes(existing.status)) {
      logger.warn('Cannot cancel mock drive - invalid status', {
        mockDriveId,
        status: existing.status,
      });
      throw new MockDriveInvalidStatusError(existing.status, 'cancel');
    }

    const mockDrive = await prisma.mockDrive.update({
      where: { id: mockDriveId },
      data: { status: MockDriveStatus.CANCELLED },
      include: this.getDetailedInclude(),
    });

    logger.info('Mock drive cancelled', {
      mockDriveId,
      previousStatus: existing.status,
    });

    return this.mapToDetails(mockDrive as MockDriveWithIncludes);
  }

  // ==========================================
  // Open Registration
  // ==========================================

  async openRegistration(
    mockDriveId: string,
    instituteId: string
  ): Promise<MockDriveDetails> {
    logger.info('Opening registration for mock drive', {
      mockDriveId,
      instituteId,
    });

    const existing = await this.verifyAccess(mockDriveId, instituteId);

    if (existing.status !== MockDriveStatus.PUBLISHED) {
      throw new MockDriveInvalidStatusError(
        existing.status,
        'open registration'
      );
    }

    const mockDrive = await prisma.mockDrive.update({
      where: { id: mockDriveId },
      data: { status: MockDriveStatus.REGISTRATION_OPEN },
      include: this.getDetailedInclude(),
    });

    logger.info('Mock drive registration opened', { mockDriveId });

    return this.mapToDetails(mockDrive as MockDriveWithIncludes);
  }

  // ==========================================
  // Close Registration
  // ==========================================

  async closeRegistration(
    mockDriveId: string,
    instituteId: string
  ): Promise<MockDriveDetails> {
    logger.info('Closing registration for mock drive', {
      mockDriveId,
      instituteId,
    });

    const existing = await this.verifyAccess(mockDriveId, instituteId);

    if (existing.status !== MockDriveStatus.REGISTRATION_OPEN) {
      throw new MockDriveInvalidStatusError(
        existing.status,
        'close registration'
      );
    }

    const mockDrive = await prisma.mockDrive.update({
      where: { id: mockDriveId },
      data: { status: MockDriveStatus.REGISTRATION_CLOSED },
      include: this.getDetailedInclude(),
    });

    logger.info('Mock drive registration closed', { mockDriveId });

    return this.mapToDetails(mockDrive as MockDriveWithIncludes);
  }

  // ==========================================
  // Start Drive
  // ==========================================

  async startDrive(
    mockDriveId: string,
    instituteId: string
  ): Promise<MockDriveDetails> {
    logger.info('Starting mock drive', { mockDriveId, instituteId });

    const existing = await this.verifyAccess(mockDriveId, instituteId);

    if (existing.status !== MockDriveStatus.REGISTRATION_CLOSED) {
      throw new MockDriveInvalidStatusError(existing.status, 'start drive');
    }

    const mockDrive = await prisma.mockDrive.update({
      where: { id: mockDriveId },
      data: { status: MockDriveStatus.IN_PROGRESS },
      include: this.getDetailedInclude(),
    });

    logger.info('Mock drive started', { mockDriveId });

    return this.mapToDetails(mockDrive as MockDriveWithIncludes);
  }

  // ==========================================
  // Complete Drive
  // ==========================================

  async completeDrive(
    mockDriveId: string,
    instituteId: string
  ): Promise<MockDriveDetails> {
    logger.info('Completing mock drive', { mockDriveId, instituteId });

    const existing = await this.verifyAccess(mockDriveId, instituteId);

    if (existing.status !== MockDriveStatus.IN_PROGRESS) {
      throw new MockDriveInvalidStatusError(existing.status, 'complete drive');
    }

    const mockDrive = await prisma.mockDrive.update({
      where: { id: mockDriveId },
      data: { status: MockDriveStatus.COMPLETED },
      include: this.getDetailedInclude(),
    });

    logger.info('Mock drive completed', { mockDriveId });

    return this.mapToDetails(mockDrive as MockDriveWithIncludes);
  }

  // ==========================================
  // Get Mock Drive Stats
  // ==========================================

  async getStats(
    mockDriveId: string,
    instituteId: string
  ): Promise<MockDriveStats> {
    const startTime = Date.now();
    await this.verifyAccess(mockDriveId, instituteId);

    const [registrationStats, batchCount, attemptStats, completedStats] =
      await Promise.all([
        prisma.mockDriveRegistration.groupBy({
          by: ['status'],
          where: { mockDriveId },
          _count: { id: true },
        }),
        prisma.mockDriveBatch.count({ where: { mockDriveId } }),
        prisma.mockDriveAttempt.groupBy({
          by: ['status'],
          where: { mockDriveId },
          _count: { id: true },
        }),
        prisma.mockDriveAttempt.aggregate({
          where: {
            mockDriveId,
            status: 'COMPLETED',
          },
          _avg: { totalScore: true },
        }),
      ]);

    const registrationMap = new Map(
      registrationStats.map((r) => [r.status, r._count.id])
    );

    const attemptMap = new Map(
      attemptStats.map((a) => [a.status, a._count.id])
    );

    const duration = Date.now() - startTime;
    logger.debug('Mock drive stats retrieved', {
      mockDriveId,
      durationMs: duration,
    });

    return {
      totalRegistrations: registrationStats.reduce(
        (acc, r) => acc + r._count.id,
        0
      ),
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

  async duplicate(
    mockDriveId: string,
    instituteId: string,
    newTitle?: string
  ): Promise<MockDriveDetails> {
    logger.info('Duplicating mock drive', {
      mockDriveId,
      instituteId,
      newTitle,
    });

    const original = await this.getById(mockDriveId, instituteId);

    const duplicated = await prisma.$transaction(async (tx) => {
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
            : Prisma.DbNull,
          status: MockDriveStatus.DRAFT,
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
            allowedDepartments:
              original.eligibilityCriteria.allowedDepartments,
            allowedCourseYears:
              original.eligibilityCriteria.allowedCourseYears,
            requiredSkills: original.eligibilityCriteria.requiredSkills,
            maxBacklogs: original.eligibilityCriteria.maxBacklogs,
            customRules: original.eligibilityCriteria.customRules
              ? toJson(original.eligibilityCriteria.customRules)
              : Prisma.DbNull,
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

    logger.info('Mock drive duplicated', {
      originalId: mockDriveId,
      newId: duplicated.id,
    });

    return this.getById(duplicated.id, instituteId);
  }

  // ==========================================
  // Get Question Availability Summary
  // ==========================================

  async getQuestionAvailability(
    mockDriveId: string,
    instituteId: string
  ): Promise<ModuleValidationResult[]> {
    await this.verifyAccess(mockDriveId, instituteId);

    const modules = await prisma.mockDriveModule.findMany({
      where: { mockDriveId, isActive: true },
      orderBy: { order: 'asc' },
    });

    const results: ModuleValidationResult[] = [];

    for (const module of modules) {
      const config = parseModuleConfig(module.config);
      const availability = await this.checkModuleQuestionsAvailability(
        module.moduleType,
        config
      );

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

  private async verifyAccess(
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

  private validateStatusTransition(
    currentStatus: MockDriveStatus,
    newStatus: MockDriveStatus
  ): void {
    const validTransitions: Record<MockDriveStatus, MockDriveStatus[]> = {
      [MockDriveStatus.DRAFT]: [
        MockDriveStatus.PUBLISHED,
        MockDriveStatus.CANCELLED,
      ],
      [MockDriveStatus.PUBLISHED]: [
        MockDriveStatus.REGISTRATION_OPEN,
        MockDriveStatus.CANCELLED,
      ],
      [MockDriveStatus.REGISTRATION_OPEN]: [
        MockDriveStatus.REGISTRATION_CLOSED,
        MockDriveStatus.CANCELLED,
      ],
      [MockDriveStatus.REGISTRATION_CLOSED]: [
        MockDriveStatus.IN_PROGRESS,
        MockDriveStatus.CANCELLED,
      ],
      [MockDriveStatus.IN_PROGRESS]: [
        MockDriveStatus.COMPLETED,
        MockDriveStatus.CANCELLED,
      ],
      [MockDriveStatus.COMPLETED]: [],
      [MockDriveStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new MockDriveInvalidStatusError(
        currentStatus,
        `transition to ${newStatus}`
      );
    }
  }

  private validatePublishedDriveUpdate(
    data: UpdateMockDriveDTO,
    currentStatus: MockDriveStatus
  ): void {
    const allowedFields = new Set([
      'description',
      'instructions',
      'showLeaderboard',
      'showResultsImmediately',
      'resultsReleaseDate',
      'status',
    ]);

    const attemptedFields = Object.keys(data).filter(
      (key) => data[key as keyof UpdateMockDriveDTO] !== undefined
    );

    const restrictedFields = attemptedFields.filter(
      (field) => !allowedFields.has(field)
    );

    if (restrictedFields.length > 0) {
      throw new MockDriveInvalidStatusError(
        currentStatus,
        `update fields: ${restrictedFields.join(', ')}`
      );
    }
  }

  private validateDates(
    mockDrive: {
      registrationStartDate: Date | null;
      registrationEndDate: Date | null;
      driveStartDate: Date | null;
      driveEndDate: Date | null;
    },
    errors: string[],
    warnings: string[]
  ): void {
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
        warnings.push(
          'Registration ends after drive starts - consider adjusting'
        );
      }
    }

    const now = new Date();
    if (
      mockDrive.registrationStartDate &&
      mockDrive.registrationStartDate < now
    ) {
      warnings.push('Registration start date is in the past');
    }
  }

  private async validateModules(
    modules: Array<{
      id: string;
      moduleType: MockDriveModuleType;
      order: number;
      config: Prisma.JsonValue;
      weightage: number;
    }>,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    if (modules.length === 0) {
      errors.push('At least one active module is required');
      return;
    }

    const orders = modules.map((m) => m.order);
    const uniqueOrders = new Set(orders);

    // Check for duplicate orders - this IS an error
    if (uniqueOrders.size !== orders.length) {
      const duplicates = orders.filter((o, i) => orders.indexOf(o) !== i);
      errors.push(
        `Duplicate module orders found: ${[...new Set(duplicates)].join(', ')}`
      );
    }

    // Check for non-positive orders - this IS an error
    const invalidOrders = orders.filter((o) => o < 1);
    if (invalidOrders.length > 0) {
      errors.push(
        'Module orders must be positive integers (found: ' +
          invalidOrders.join(', ') +
          ')'
      );
    }

    // Check for gaps - this is just a warning (will be auto-fixed)
    const sortedOrders = [...orders].sort((a, b) => a - b);
    const expectedOrders = Array.from(
      { length: orders.length },
      (_, i) => i + 1
    );
    const hasGaps = !sortedOrders.every((o, i) => o === expectedOrders[i]);

    if (hasGaps && uniqueOrders.size === orders.length) {
      warnings.push(
        `Module orders have gaps (${sortedOrders.join(', ')}). ` +
          `They will be automatically renumbered to ${expectedOrders.join(', ')} during publish.`
      );
    }

    // Check total weightage
    const totalWeightage = modules.reduce((sum, m) => sum + m.weightage, 0);
    if (Math.abs(totalWeightage - 100) > 0.01) {
      errors.push(
        `Module weightages must sum to 100% (currently ${totalWeightage.toFixed(2)}%)`
      );
    }

    // Check questions availability for each module
    for (const module of modules) {
      const config = parseModuleConfig(module.config);
      const availability = await this.checkModuleQuestionsAvailability(
        module.moduleType,
        config
      );

      if (!availability.hasEnough) {
        const contextInfo =
          module.moduleType === MockDriveModuleType.APTITUDE
            ? `(Difficulty: ${availability.criteria.difficulty}, Types: ${availability.criteria.questionTypes?.join(', ')})`
            : `(Difficulty: ${availability.criteria.difficulty})`;

        errors.push(
          `Module ${module.order} (${module.moduleType}): Insufficient questions. ` +
            `Required: ${availability.required}, Available: ${availability.available} ${contextInfo}`
        );
      }
    }
  }

  private async normalizeModuleOrders(
    mockDriveId: string,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    const modules = await tx.mockDriveModule.findMany({
      where: { mockDriveId, isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, order: true },
    });

    const needsRenumbering = modules.some((m, i) => m.order !== i + 1);

    if (needsRenumbering) {
      logger.info('Normalizing module orders', {
        mockDriveId,
        before: modules.map((m) => ({ id: m.id, order: m.order })),
      });

      await Promise.all(
        modules.map((module, index) =>
          tx.mockDriveModule.update({
            where: { id: module.id },
            data: { order: index + 1 },
          })
        )
      );

      logger.info('Module orders normalized', {
        mockDriveId,
        after: modules.map((m, i) => ({ id: m.id, order: i + 1 })),
      });
    }
  }

  private async checkModuleQuestionsAvailability(
    moduleType: MockDriveModuleType,
    config: ModuleConfig
  ): Promise<QuestionAvailability> {
    let required = 0;
    let available = 0;
    let criteria: QuestionAvailability['criteria'] = { difficulty: 'MEDIUM' };

    if (moduleType === MockDriveModuleType.APTITUDE) {
      const aptConfig = config as AptitudeModuleConfig;
      required = aptConfig.numberOfQuestions;
      criteria = {
        difficulty: aptConfig.difficulty,
        questionTypes: aptConfig.questionTypes,
      };

      available = await prisma.aptitudeQuestion.count({
        where: {
          isActive: true,
          difficulty: aptConfig.difficulty,
          questionType: { in: aptConfig.questionTypes },
        },
      });

      logger.debug('Aptitude question availability check', {
        required,
        available,
        difficulty: aptConfig.difficulty,
        questionTypes: aptConfig.questionTypes,
        hasEnough: available >= required,
      });
    } else if (moduleType === MockDriveModuleType.MACHINE_CODING) {
      const machineConfig = config as MachineCodingModuleConfig;
      required = machineConfig.numberOfQuestions;
      criteria = {
        difficulty: machineConfig.difficulty,
      };

      available = await prisma.machineQuestion.count({
        where: {
          isActive: true,
          difficulty: machineConfig.difficulty,
        },
      });

      logger.debug('Machine coding question availability check', {
        required,
        available,
        difficulty: machineConfig.difficulty,
        hasEnough: available >= required,
      });
    } else {
      logger.debug('AI Interview module - no question check needed', {
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
      logger.warn('Insufficient questions for module', {
        moduleType,
        required,
        available,
        deficit: required - available,
        criteria,
      });
    }

    return { required, available, hasEnough, criteria };
  }

  private async generateModuleQuestions(
    mockDriveId: string,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    const startTime = Date.now();
    logger.info('Generating module questions', { mockDriveId });

    const modules = await tx.mockDriveModule.findMany({
      where: { mockDriveId, isActive: true },
      orderBy: { order: 'asc' },
    });

    for (const module of modules) {
      const config = parseModuleConfig(module.config);
      const moduleStartTime = Date.now();

      if (module.moduleType === MockDriveModuleType.APTITUDE) {
        await this.generateAptitudeQuestions(
          module.id,
          config as AptitudeModuleConfig,
          tx
        );
      } else if (module.moduleType === MockDriveModuleType.MACHINE_CODING) {
        await this.generateMachineQuestions(
          module.id,
          config as MachineCodingModuleConfig,
          tx
        );
      }

      logger.debug('Module questions generated', {
        moduleId: module.id,
        moduleType: module.moduleType,
        order: module.order,
        durationMs: Date.now() - moduleStartTime,
      });
    }

    logger.info('All module questions generated', {
      mockDriveId,
      moduleCount: modules.length,
      durationMs: Date.now() - startTime,
    });
  }

  private async generateAptitudeQuestions(
    moduleId: string,
    config: AptitudeModuleConfig,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    const questions = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id 
      FROM aptitude_questions
      WHERE "isActive" = true
        AND difficulty = ${config.difficulty}::"DifficultyLevel"
        AND "questionType" = ANY(${config.questionTypes}::"QuestionType"[])
      ORDER BY RANDOM()
      LIMIT ${config.numberOfQuestions}
    `;

    if (questions.length < config.numberOfQuestions) {
      throw new InsufficientQuestionsError(
        MockDriveModuleType.APTITUDE,
        config.numberOfQuestions,
        questions.length,
        `Criteria: difficulty=${config.difficulty}, types=${config.questionTypes.join(',')}`
      );
    }

    await tx.mockDriveModuleQuestion.createMany({
      data: questions.map((q, index) => ({
        moduleId,
        aptitudeQuestionId: q.id,
        order: index + 1,
      })),
    });

    logger.debug('Aptitude questions assigned to module', {
      moduleId,
      questionCount: questions.length,
    });
  }

  private async generateMachineQuestions(
    moduleId: string,
    config: MachineCodingModuleConfig,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    const questions = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id 
      FROM machine_questions
      WHERE "isActive" = true
        AND difficulty = ${config.difficulty}::"DifficultyLevel"
      ORDER BY RANDOM()
      LIMIT ${config.numberOfQuestions}
    `;

    if (questions.length < config.numberOfQuestions) {
      throw new InsufficientQuestionsError(
        MockDriveModuleType.MACHINE_CODING,
        config.numberOfQuestions,
        questions.length,
        `Criteria: difficulty=${config.difficulty}`
      );
    }

    await tx.mockDriveModuleQuestion.createMany({
      data: questions.map((q, index) => ({
        moduleId,
        machineQuestionId: q.id,
        order: index + 1,
      })),
    });

    logger.debug('Machine coding questions assigned to module', {
      moduleId,
      questionCount: questions.length,
    });
  }

  private getDetailedInclude() {
    return {
      eligibilityCriteria: true,
      modules: {
        where: { isActive: true },
        orderBy: { order: 'asc' } as const,
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

  private mapToDetails(mockDrive: MockDriveWithIncludes): MockDriveDetails {
    const eligibilityCriteria: EligibilityCriteriaResponse | null =
      mockDrive.eligibilityCriteria
        ? {
            id: mockDrive.eligibilityCriteria.id,
            minCgpa: mockDrive.eligibilityCriteria.minCgpa,
            maxCgpa: mockDrive.eligibilityCriteria.maxCgpa,
            minMarks10: mockDrive.eligibilityCriteria.minMarks10,
            minMarks12: mockDrive.eligibilityCriteria.minMarks12,
            allowedDepartments:
              mockDrive.eligibilityCriteria.allowedDepartments,
            allowedCourseYears:
              mockDrive.eligibilityCriteria.allowedCourseYears,
            requiredSkills: mockDrive.eligibilityCriteria.requiredSkills,
            maxBacklogs: mockDrive.eligibilityCriteria.maxBacklogs,
            customRules: mockDrive.eligibilityCriteria.customRules as Record<
              string,
              unknown
            > | null,
          }
        : null;

    const modules: ModuleResponse[] = mockDrive.modules.map((m) => ({
      id: m.id,
      mockDriveId: mockDrive.id,
      moduleType: m.moduleType,
      order: m.order,
      name: m.name,
      timeLimit: m.timeLimit,
      weightage: m.weightage,
      config: m.config as unknown as ModuleConfig,
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
      proctoringSettings:
        mockDrive.proctoringSettings as ProctoringSettings | null,
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

// Export singleton instance
export const mockDriveService = new MockDriveService();
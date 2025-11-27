// src/modules/instituteadmin/mock-drive/modules/modules.service.ts

import { Prisma, MockDriveStatus, MockDriveModuleType } from '@prisma/client';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import {
  CreateModuleDTO,
  UpdateModuleDTO,
  ReorderModulesDTO,
  ListModulesOptions,
  ModuleResponse,
  ModuleWithAvailability,
  ModulesSummary,
  ModuleValidation,
  ModuleAvailability,
  ModuleConfig,
  isAptitudeConfig,
  isMachineCodingConfig,
  isAiInterviewConfig,
  ModuleNotFoundError,
  ModuleValidationError,
  ModuleOrderConflictError,
  ModuleConfigError,
} from './modules.types';

// ============================================
// Constants
// ============================================

const MAX_MODULES = 10;

const DEFAULT_MODULE_NAMES: Record<MockDriveModuleType, string> = {
  [MockDriveModuleType.APTITUDE]: 'Aptitude Round',
  [MockDriveModuleType.MACHINE_CODING]: 'Coding Round',
  [MockDriveModuleType.AI_INTERVIEW]: 'AI Interview',
};

// Supported programming languages for machine coding
const SUPPORTED_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Scala',
  'R',
];

// ============================================
// JSON Type Helpers
// ============================================

function toJsonValue(config: ModuleConfig): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(config)) as Prisma.InputJsonValue;
}

function fromJsonValue(json: Prisma.JsonValue | null): ModuleConfig | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return null;
  }
  return json as unknown as ModuleConfig;
}

// ============================================
// Inline Error Classes
// ============================================

class MockDriveNotFoundError extends Error {
  code = 'MOCK_DRIVE_NOT_FOUND';
  statusCode = 404;
  constructor(id: string) {
    super(`Mock drive not found: ${id}`);
  }
}

class MockDriveAccessDeniedError extends Error {
  code = 'ACCESS_DENIED';
  statusCode = 403;
  constructor() {
    super('Access denied to this mock drive');
  }
}

class MockDriveInvalidStatusError extends Error {
  code = 'INVALID_STATUS';
  statusCode = 400;
  constructor(status: MockDriveStatus, action: string) {
    super(`Cannot ${action} when mock drive status is ${status}`);
  }
}

// ============================================
// Types
// ============================================

interface MockDriveInfo {
  id: string;
  status: MockDriveStatus;
  instituteId: string;
}

interface ModuleEntity {
  id: string;
  mockDriveId: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string | null;
  timeLimit: number;
  weightage: number;
  config: Prisma.JsonValue;
  passingScore: number | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { moduleQuestions: number };
}

// ============================================
// Service Class
// ============================================

export class MockDriveModuleService {
  // ==========================================
  // Add Module
  // ==========================================

  async addModule(
    mockDriveId: string,
    instituteId: string,
    data: CreateModuleDTO
  ): Promise<ModuleResponse> {
    const mockDrive = await this.verifyAccess(mockDriveId, instituteId);

    if (mockDrive.status !== MockDriveStatus.DRAFT) {
      throw new MockDriveInvalidStatusError(mockDrive.status, 'add modules');
    }

    // Check order conflict
    const existing = await prisma.mockDriveModule.findFirst({
      where: { mockDriveId, order: data.order, isActive: true },
    });

    if (existing) {
      throw new ModuleOrderConflictError(data.order);
    }

    // Validate config
    this.validateConfig(data.moduleType, data.config);

    // Check max modules
    const count = await prisma.mockDriveModule.count({
      where: { mockDriveId, isActive: true },
    });

    if (count >= MAX_MODULES) {
      throw new ModuleValidationError(`Maximum ${MAX_MODULES} modules allowed`);
    }

    const module = await prisma.mockDriveModule.create({
      data: {
        mockDriveId,
        moduleType: data.moduleType,
        order: data.order,
        name: data.name ?? DEFAULT_MODULE_NAMES[data.moduleType],
        timeLimit: data.timeLimit,
        weightage: data.weightage,
        config: toJsonValue(data.config),
        passingScore: data.passingScore ?? null,
        instructions: data.instructions ?? null,
        isActive: true,
      },
      include: { _count: { select: { moduleQuestions: true } } },
    });

    logger.info('Module added', { mockDriveId, moduleId: module.id });
    return this.toResponse(module);
  }

  // ==========================================
  // Get Modules
  // ==========================================

  async getModules(
    mockDriveId: string,
    instituteId: string,
    options: ListModulesOptions = {}
  ): Promise<ModuleResponse[] | ModuleWithAvailability[]> {
    await this.verifyAccess(mockDriveId, instituteId);

    const modules = await prisma.mockDriveModule.findMany({
      where: {
        mockDriveId,
        ...(options.includeInactive ? {} : { isActive: true }),
      },
      orderBy: { order: 'asc' },
      include: { _count: { select: { moduleQuestions: true } } },
    });

    if (options.checkAvailability) {
      return Promise.all(
        modules.map(async (m) => {
          const config = fromJsonValue(m.config);
          if (!config) {
            return {
              ...this.toResponse(m),
              availableQuestions: 0,
              requiredQuestions: 0,
              hasEnoughQuestions: false,
            };
          }
          const availability = await this.checkAvailability(m.moduleType, config);
          return { ...this.toResponse(m), ...availability };
        })
      );
    }

    return modules.map((m) => this.toResponse(m));
  }

  // ==========================================
  // Get Modules Summary
  // ==========================================

  async getModulesSummary(mockDriveId: string, instituteId: string): Promise<ModulesSummary> {
    await this.verifyAccess(mockDriveId, instituteId);

    const modules = await prisma.mockDriveModule.findMany({
      where: { mockDriveId },
      orderBy: { order: 'asc' },
      include: { _count: { select: { moduleQuestions: true } } },
    });

    const active = modules.filter((m) => m.isActive);
    const validation = await this.validateModules(modules);

    return {
      totalModules: modules.length,
      activeModules: active.length,
      totalWeightage: active.reduce((sum, m) => sum + m.weightage, 0),
      totalTimeLimit: active.reduce((sum, m) => sum + m.timeLimit, 0),
      modules: modules.map((m) => this.toResponse(m)),
      validation,
    };
  }

  // ==========================================
  // Get Single Module
  // ==========================================

  async getModule(
    mockDriveId: string,
    moduleId: string,
    instituteId: string
  ): Promise<ModuleWithAvailability> {
    await this.verifyAccess(mockDriveId, instituteId);

    const module = await prisma.mockDriveModule.findFirst({
      where: { id: moduleId, mockDriveId },
      include: { _count: { select: { moduleQuestions: true } } },
    });

    if (!module) {
      throw new ModuleNotFoundError(moduleId);
    }

    const config = fromJsonValue(module.config);
    const availability = config
      ? await this.checkAvailability(module.moduleType, config)
      : { availableQuestions: 0, requiredQuestions: 0, hasEnoughQuestions: false };

    return { ...this.toResponse(module), ...availability };
  }

  // ==========================================
  // Update Module
  // ==========================================

  async updateModule(
    mockDriveId: string,
    moduleId: string,
    instituteId: string,
    data: UpdateModuleDTO
  ): Promise<ModuleResponse> {
    const mockDrive = await this.verifyAccess(mockDriveId, instituteId);

    if (mockDrive.status !== MockDriveStatus.DRAFT) {
      throw new MockDriveInvalidStatusError(mockDrive.status, 'update modules');
    }

    const existing = await prisma.mockDriveModule.findFirst({
      where: { id: moduleId, mockDriveId },
    });

    if (!existing) {
      throw new ModuleNotFoundError(moduleId);
    }

    // Check order conflict
    if (data.order !== undefined && data.order !== existing.order) {
      const conflict = await prisma.mockDriveModule.findFirst({
        where: { mockDriveId, order: data.order, isActive: true, id: { not: moduleId } },
      });
      if (conflict) {
        throw new ModuleOrderConflictError(data.order);
      }
    }

    // Validate config if provided
    if (data.config) {
      this.validateConfig(existing.moduleType, data.config);
    }

    // Build update data
    const updateData: Prisma.MockDriveModuleUpdateInput = {};
    if (data.order !== undefined) updateData.order = data.order;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit;
    if (data.weightage !== undefined) updateData.weightage = data.weightage;
    if (data.config !== undefined) updateData.config = toJsonValue(data.config);
    if (data.passingScore !== undefined) updateData.passingScore = data.passingScore;
    if (data.instructions !== undefined) updateData.instructions = data.instructions;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const module = await prisma.mockDriveModule.update({
      where: { id: moduleId },
      data: updateData,
      include: { _count: { select: { moduleQuestions: true } } },
    });

    logger.info('Module updated', { moduleId });
    return this.toResponse(module);
  }

  // ==========================================
  // Delete Module
  // ==========================================

  async deleteModule(mockDriveId: string, moduleId: string, instituteId: string): Promise<void> {
    const mockDrive = await this.verifyAccess(mockDriveId, instituteId);

    if (mockDrive.status !== MockDriveStatus.DRAFT) {
      throw new MockDriveInvalidStatusError(mockDrive.status, 'delete modules');
    }

    const existing = await prisma.mockDriveModule.findFirst({
      where: { id: moduleId, mockDriveId },
    });

    if (!existing) {
      throw new ModuleNotFoundError(moduleId);
    }

    await prisma.mockDriveModule.delete({ where: { id: moduleId } });
    logger.info('Module deleted', { moduleId });
  }

  // ==========================================
  // Reorder Modules
  // ==========================================

  async reorderModules(
    mockDriveId: string,
    instituteId: string,
    data: ReorderModulesDTO
  ): Promise<ModuleResponse[]> {
    const mockDrive = await this.verifyAccess(mockDriveId, instituteId);

    if (mockDrive.status !== MockDriveStatus.DRAFT) {
      throw new MockDriveInvalidStatusError(mockDrive.status, 'reorder modules');
    }

    const moduleIds = data.modules.map((m) => m.moduleId);
    const existing = await prisma.mockDriveModule.findMany({
      where: { id: { in: moduleIds }, mockDriveId },
    });

    if (existing.length !== moduleIds.length) {
      throw new ModuleValidationError('One or more modules not found');
    }

    await prisma.$transaction(
      data.modules.map(({ moduleId, order }) =>
        prisma.mockDriveModule.update({ where: { id: moduleId }, data: { order } })
      )
    );

    const modules = await prisma.mockDriveModule.findMany({
      where: { mockDriveId, isActive: true },
      orderBy: { order: 'asc' },
      include: { _count: { select: { moduleQuestions: true } } },
    });

    logger.info('Modules reordered', { mockDriveId });
    return modules.map((m) => this.toResponse(m));
  }

  // ==========================================
  // Duplicate Module
  // ==========================================

  async duplicateModule(
    mockDriveId: string,
    moduleId: string,
    instituteId: string
  ): Promise<ModuleResponse> {
    const mockDrive = await this.verifyAccess(mockDriveId, instituteId);

    if (mockDrive.status !== MockDriveStatus.DRAFT) {
      throw new MockDriveInvalidStatusError(mockDrive.status, 'duplicate modules');
    }

    const existing = await prisma.mockDriveModule.findFirst({
      where: { id: moduleId, mockDriveId },
    });

    if (!existing) {
      throw new ModuleNotFoundError(moduleId);
    }

    const maxOrder = await prisma.mockDriveModule.findFirst({
      where: { mockDriveId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = (maxOrder?.order ?? 0) + 1;

    if (newOrder > MAX_MODULES) {
      throw new ModuleValidationError(`Maximum ${MAX_MODULES} modules allowed`);
    }

    const configValue =
      existing.config !== null
        ? (existing.config as Prisma.InputJsonValue)
        : Prisma.JsonNull;

    const duplicate = await prisma.mockDriveModule.create({
      data: {
        mockDriveId,
        moduleType: existing.moduleType,
        order: newOrder,
        name: existing.name ? `${existing.name} (Copy)` : null,
        timeLimit: existing.timeLimit,
        weightage: existing.weightage,
        config: configValue,
        passingScore: existing.passingScore,
        instructions: existing.instructions,
        isActive: true,
      },
      include: { _count: { select: { moduleQuestions: true } } },
    });

    logger.info('Module duplicated', { originalId: moduleId, newId: duplicate.id });
    return this.toResponse(duplicate);
  }

  // ==========================================
  // Get Supported Languages
  // ==========================================

  getSupportedLanguages(): string[] {
    return [...SUPPORTED_LANGUAGES];
  }

  // ==========================================
  // Private Helpers
  // ==========================================

  private async verifyAccess(mockDriveId: string, instituteId: string): Promise<MockDriveInfo> {
    const mockDrive = await prisma.mockDrive.findUnique({
      where: { id: mockDriveId },
      select: { id: true, status: true, instituteId: true },
    });

    if (!mockDrive) throw new MockDriveNotFoundError(mockDriveId);
    if (mockDrive.instituteId !== instituteId) throw new MockDriveAccessDeniedError();

    return mockDrive;
  }

  private validateConfig(type: MockDriveModuleType, config: ModuleConfig): void {
    if (type === MockDriveModuleType.APTITUDE) {
      if (!isAptitudeConfig(config)) {
        throw new ModuleConfigError('Invalid aptitude config');
      }
      if (config.questionTypes.length === 0) {
        throw new ModuleConfigError('At least one question type required');
      }
    }

    if (type === MockDriveModuleType.MACHINE_CODING) {
      if (!isMachineCodingConfig(config)) {
        throw new ModuleConfigError('Invalid machine coding config');
      }
      if (config.allowedLanguages.length === 0) {
        throw new ModuleConfigError('At least one language required');
      }
      // Validate language names (optional: check against supported list)
      const invalidLanguages = config.allowedLanguages.filter(
        (lang) => typeof lang !== 'string' || lang.trim().length === 0
      );
      if (invalidLanguages.length > 0) {
        throw new ModuleConfigError('Invalid language names provided');
      }
    }

    if (type === MockDriveModuleType.AI_INTERVIEW) {
      if (!isAiInterviewConfig(config)) {
        throw new ModuleConfigError('Invalid AI interview config');
      }
      if (!config.jobTitle || config.jobTitle.length < 2) {
        throw new ModuleConfigError('Valid job title required');
      }
      if (config.focusAreas.length === 0) {
        throw new ModuleConfigError('At least one focus area required');
      }
    }
  }

  private async checkAvailability(
    type: MockDriveModuleType,
    config: ModuleConfig
  ): Promise<ModuleAvailability> {
    let available = 0;
    let required = 0;

    if (type === MockDriveModuleType.APTITUDE && isAptitudeConfig(config)) {
      required = config.numberOfQuestions;
      available = await prisma.aptitudeQuestion.count({
        where: {
          isActive: true,
          difficulty: config.difficulty,
          questionType: { in: config.questionTypes },
        },
      });
    }

    if (type === MockDriveModuleType.MACHINE_CODING && isMachineCodingConfig(config)) {
      required = config.numberOfQuestions;
      // For machine coding, we check available questions by difficulty
      available = await prisma.machineQuestion.count({
        where: { isActive: true, difficulty: config.difficulty },
      });
    }

    if (type === MockDriveModuleType.AI_INTERVIEW && isAiInterviewConfig(config)) {
      required = config.targetQuestions;
      available = required; // Always available (generated dynamically)
    }

    return {
      availableQuestions: available,
      requiredQuestions: required,
      hasEnoughQuestions: available >= required,
    };
  }

  private async validateModules(modules: ModuleEntity[]): Promise<ModuleValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const active = modules.filter((m) => m.isActive);

    if (active.length === 0) {
      errors.push('At least one active module required');
    }

    const totalWeightage = active.reduce((sum, m) => sum + m.weightage, 0);
    if (Math.abs(totalWeightage - 100) > 0.01) {
      errors.push(`Weightages must sum to 100% (currently ${totalWeightage.toFixed(2)}%)`);
    }

    const orders = active.map((m) => m.order).sort((a, b) => a - b);
    const expected = Array.from({ length: orders.length }, (_, i) => i + 1);
    if (!orders.every((o, i) => o === expected[i])) {
      warnings.push('Module orders are not sequential starting from 1');
    }

    for (const module of active) {
      const config = fromJsonValue(module.config);
      if (!config) {
        errors.push(`Module ${module.order}: Invalid configuration`);
        continue;
      }

      const avail = await this.checkAvailability(module.moduleType, config);
      if (!avail.hasEnoughQuestions) {
        errors.push(
          `Module ${module.order}: Need ${avail.requiredQuestions} questions, have ${avail.availableQuestions}`
        );
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  private toResponse(module: ModuleEntity): ModuleResponse {
    const config = fromJsonValue(module.config);

    return {
      id: module.id,
      mockDriveId: module.mockDriveId,
      moduleType: module.moduleType,
      order: module.order,
      name: module.name,
      timeLimit: module.timeLimit,
      weightage: module.weightage,
      config: config ?? ({} as ModuleConfig),
      passingScore: module.passingScore,
      instructions: module.instructions,
      isActive: module.isActive,
      questionsCount: module._count?.moduleQuestions ?? 0,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    };
  }
}

export const mockDriveModuleService = new MockDriveModuleService();
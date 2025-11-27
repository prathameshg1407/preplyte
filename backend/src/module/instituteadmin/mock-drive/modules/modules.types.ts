// src/modules/instituteadmin/mock-drive/modules/modules.types.ts

import {
  MockDriveModuleType,
  DifficultyLevel,
  QuestionType,
  AiInterviewDifficulty,
} from '@prisma/client';

// ============================================
// Module Configuration Types
// ============================================

export interface AptitudeModuleConfig {
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: number;
  negativeMarking: number;
}

export interface MachineCodingModuleConfig {
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  allowedLanguages: string[];
  partialScoring: boolean;
  maxScorePerQuestion: number;
}

export interface AiInterviewModuleConfig {
  difficulty: AiInterviewDifficulty;
  jobTitle: string;
  companyName?: string | null;
  focusAreas: string[];
  targetQuestions: number;
}

export type ModuleConfig =
  | AptitudeModuleConfig
  | MachineCodingModuleConfig
  | AiInterviewModuleConfig;

// ============================================
// Type Guards
// ============================================

export function isAptitudeConfig(config: ModuleConfig): config is AptitudeModuleConfig {
  return 'questionTypes' in config && 'marksPerQuestion' in config;
}

export function isMachineCodingConfig(config: ModuleConfig): config is MachineCodingModuleConfig {
  return 'allowedLanguages' in config && 'maxScorePerQuestion' in config;
}

export function isAiInterviewConfig(config: ModuleConfig): config is AiInterviewModuleConfig {
  return 'jobTitle' in config && 'focusAreas' in config;
}

// ============================================
// DTOs
// ============================================

export interface CreateModuleDTO {
  moduleType: MockDriveModuleType;
  order: number;
  name?: string | null;
  timeLimit: number;
  weightage: number;
  config: ModuleConfig;
  passingScore?: number | null;
  instructions?: string | null;
}

export interface UpdateModuleDTO {
  order?: number;
  name?: string | null;
  timeLimit?: number;
  weightage?: number;
  config?: ModuleConfig;
  passingScore?: number | null;
  instructions?: string | null;
  isActive?: boolean;
}

export interface ReorderModulesDTO {
  modules: Array<{ moduleId: string; order: number }>;
}

// ============================================
// Query Types
// ============================================

export interface ListModulesOptions {
  includeInactive?: boolean;
  checkAvailability?: boolean;
}

// ============================================
// Response Types
// ============================================

export interface ModuleResponse {
  id: string;
  mockDriveId: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string | null;
  timeLimit: number;
  weightage: number;
  config: ModuleConfig;
  passingScore: number | null;
  instructions: string | null;
  isActive: boolean;
  questionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleAvailability {
  availableQuestions: number;
  requiredQuestions: number;
  hasEnoughQuestions: boolean;
}

export interface ModuleWithAvailability extends ModuleResponse, ModuleAvailability {}

export interface ModuleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ModulesSummary {
  totalModules: number;
  activeModules: number;
  totalWeightage: number;
  totalTimeLimit: number;
  modules: ModuleResponse[];
  validation: ModuleValidation;
}

// ============================================
// Error Classes
// ============================================

export class ModuleError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ModuleError';
  }
}

export class ModuleNotFoundError extends ModuleError {
  constructor(moduleId: string) {
    super('MODULE_NOT_FOUND', `Module not found: ${moduleId}`, 404);
  }
}

export class ModuleValidationError extends ModuleError {
  constructor(message: string) {
    super('MODULE_VALIDATION_ERROR', message, 400);
  }
}

export class ModuleOrderConflictError extends ModuleError {
  constructor(order: number) {
    super('MODULE_ORDER_CONFLICT', `Module with order ${order} already exists`, 409);
  }
}

export class ModuleConfigError extends ModuleError {
  constructor(message: string) {
    super('MODULE_CONFIG_ERROR', message, 400);
  }
}
// src/module/mock-drive/attempt/executors/base.executor.ts

import { PrismaClient, MockDriveModuleType } from '@prisma/client';
import { ModuleConfig, ModuleData } from '../../shared';

// ============================================
// Context Types
// ============================================

export interface ModuleExecutorContext {
  attemptId: string;
  moduleAttemptId: string;
  moduleId: string;
  userId: string;
  config: ModuleConfig;
  existingData: ModuleData | null;
}

// ============================================
// Result Types
// ============================================

export interface InitializeResult {
  data: Partial<ModuleData>;
}

export interface SubmitResult {
  data: ModuleData;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
}

// ============================================
// Abstract Base Executor
// ============================================

export abstract class BaseModuleExecutor {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly moduleType: MockDriveModuleType
  ) {}

  /**
   * Initialize module state when starting
   */
  abstract initialize(context: ModuleExecutorContext): Promise<InitializeResult>;

  /**
   * Handle user actions during the module
   */
  abstract handleAction(
    context: ModuleExecutorContext,
    action: string,
    payload: unknown
  ): Promise<Partial<ModuleData>>;

  /**
   * Finalize and score the module on submission
   */
  abstract finalize(context: ModuleExecutorContext): Promise<SubmitResult>;

  /**
   * Validate that context has required data
   */
  protected validateContext(context: ModuleExecutorContext): void {
    if (!context.attemptId || !context.moduleAttemptId || !context.moduleId) {
      throw new Error('Invalid executor context: missing required IDs');
    }
  }

  /**
   * Check if action is valid for this executor
   */
  protected isValidAction(action: string, validActions: string[]): boolean {
    return validActions.includes(action);
  }
}
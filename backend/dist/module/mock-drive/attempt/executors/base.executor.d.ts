import { PrismaClient, MockDriveModuleType } from '@prisma/client';
import { ModuleConfig, ModuleData } from '../../shared';
export interface ModuleExecutorContext {
    attemptId: string;
    moduleAttemptId: string;
    moduleId: string;
    userId: string;
    config: ModuleConfig;
    existingData: ModuleData | null;
}
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
export declare abstract class BaseModuleExecutor {
    protected readonly prisma: PrismaClient;
    protected readonly moduleType: MockDriveModuleType;
    constructor(prisma: PrismaClient, moduleType: MockDriveModuleType);
    /**
     * Initialize module state when starting
     */
    abstract initialize(context: ModuleExecutorContext): Promise<InitializeResult>;
    /**
     * Handle user actions during the module
     */
    abstract handleAction(context: ModuleExecutorContext, action: string, payload: unknown): Promise<Partial<ModuleData>>;
    /**
     * Finalize and score the module on submission
     */
    abstract finalize(context: ModuleExecutorContext): Promise<SubmitResult>;
    /**
     * Validate that context has required data
     */
    protected validateContext(context: ModuleExecutorContext): void;
    /**
     * Check if action is valid for this executor
     */
    protected isValidAction(action: string, validActions: string[]): boolean;
}
//# sourceMappingURL=base.executor.d.ts.map
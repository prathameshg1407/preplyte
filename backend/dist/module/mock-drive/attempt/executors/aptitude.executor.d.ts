import { PrismaClient } from '@prisma/client';
import { BaseModuleExecutor, ModuleExecutorContext, InitializeResult, SubmitResult } from './base.executor';
import { AptitudeModuleData } from '../../shared';
export declare class AptitudeModuleExecutor extends BaseModuleExecutor {
    constructor(prisma: PrismaClient);
    initialize(context: ModuleExecutorContext): Promise<InitializeResult>;
    handleAction(context: ModuleExecutorContext, action: string, payload: unknown): Promise<Partial<AptitudeModuleData>>;
    finalize(context: ModuleExecutorContext): Promise<SubmitResult>;
    private handleAnswer;
    private handleClear;
    private handleMarkReview;
    private calculateSummary;
    private shuffleWithSeed;
    private hashString;
    private nextRandom;
}
//# sourceMappingURL=aptitude.executor.d.ts.map
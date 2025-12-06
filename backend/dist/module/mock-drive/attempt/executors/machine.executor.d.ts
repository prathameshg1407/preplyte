import { PrismaClient } from '@prisma/client';
import { BaseModuleExecutor, ModuleExecutorContext, InitializeResult, SubmitResult } from './base.executor';
import { MachineModuleData } from '../../shared';
export declare class MachineModuleExecutor extends BaseModuleExecutor {
    constructor(prisma: PrismaClient);
    initialize(context: ModuleExecutorContext): Promise<InitializeResult>;
    handleAction(context: ModuleExecutorContext, action: string, payload: unknown): Promise<Partial<MachineModuleData>>;
    finalize(context: ModuleExecutorContext): Promise<SubmitResult>;
    private handleSubmit;
    private handleRun;
    private executeCode;
    private runCodeWithInput;
    private determineOverallStatus;
    private validateLanguage;
    private createSubmission;
    private updateQuestionWithSubmission;
    private calculateSubmissionScore;
    private calculateSummary;
}
//# sourceMappingURL=machine.executor.d.ts.map
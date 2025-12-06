import { PrismaClient } from '@prisma/client';
import { StartAttemptResponse, GetAttemptResponse, StartModuleResponse, ModuleActionResponse, SubmitModuleResponse } from './attempt.types';
import { AttemptState, CurrentModuleState, ModuleAttemptState } from '../shared';
export declare class AttemptService {
    private readonly prisma;
    private readonly executors;
    constructor(prisma: PrismaClient);
    getAttemptState(userId: string, driveId: string): Promise<GetAttemptResponse | null>;
    startAttempt(userId: string, driveId: string): Promise<StartAttemptResponse>;
    startModule(userId: string, driveId: string, moduleId: string): Promise<StartModuleResponse>;
    handleModuleAction(userId: string, driveId: string, moduleId: string, action: string, payload: unknown): Promise<ModuleActionResponse>;
    submitModule(userId: string, driveId: string, moduleId: string, isAutoSubmit?: boolean): Promise<SubmitModuleResponse>;
    getModuleState(userId: string, driveId: string, moduleId: string): Promise<{
        attempt: AttemptState;
        module: ModuleAttemptState | null;
        currentModule: CurrentModuleState | null;
    }>;
    private findAttemptWithModules;
    private validateRegistration;
    private createAttemptWithModules;
    private completeAttempt;
    private getActiveModuleAttempt;
    private validateModuleStart;
    private unlockNextModule;
    private updateLeaderboard;
    private recalculateRanks;
    private getExecutor;
    private buildExecutorContext;
    private buildModuleResponse;
    private calculateTimeSpent;
    private mapToAttemptState;
    private findCurrentModuleState;
}
//# sourceMappingURL=attempt.service.d.ts.map
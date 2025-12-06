import { PrismaClient } from '@prisma/client';
import { BaseModuleExecutor, ModuleExecutorContext, InitializeResult, SubmitResult } from './base.executor';
import { ModuleData } from '../../shared';
export declare class InterviewModuleExecutor extends BaseModuleExecutor {
    private readonly runtimeContexts;
    constructor(prisma: PrismaClient);
    initialize(context: ModuleExecutorContext): Promise<InitializeResult>;
    handleAction(context: ModuleExecutorContext, action: string, payload: unknown): Promise<Partial<ModuleData>>;
    finalize(context: ModuleExecutorContext): Promise<SubmitResult>;
    private handleRespond;
    private handleSkip;
    private handleStartVoice;
    private handleAudioChunk;
    private handleGetAudioQuestion;
    private handleEndEarly;
    private getDefaultResume;
    private parseResume;
    private createMinimalResume;
    private getOrRebuildRuntimeContext;
    private createMessage;
    private getLastAssistantMessage;
    private generateNextQuestion;
    private addClosingMessage;
    private transcribeAudio;
    private createZeroScores;
    private calculateOverallScore;
    private calculateCategoryScores;
    private inferCategory;
    private generateFeedbackSummary;
    private calculateAverageScoresByDimension;
    private identifyStrengths;
    private identifyImprovements;
    private generateSummaryText;
}
//# sourceMappingURL=interview.executor.d.ts.map
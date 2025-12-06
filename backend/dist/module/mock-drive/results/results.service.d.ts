import { PrismaClient } from '@prisma/client';
import { ResultOverview, DetailedReport } from './results.types';
export declare class ResultsService {
    private prisma;
    constructor(prisma: PrismaClient);
    getResultOverview(userId: string, driveId: string): Promise<ResultOverview>;
    getDetailedReport(userId: string, driveId: string): Promise<DetailedReport>;
    private generateModuleAnalysis;
    private generateAptitudeAnalysis;
    private generateMachineAnalysis;
    private generateInterviewAnalysis;
    private generateModuleFeedback;
    private generateModuleRecommendations;
    private generateOverallInsights;
    private generateOverallFeedback;
    private getComparisonStats;
}
//# sourceMappingURL=results.service.d.ts.map
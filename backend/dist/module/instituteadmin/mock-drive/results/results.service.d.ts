import { ListResultsQuery, PaginatedResults, DetailedResult, RankingEntry, ResultStatistics, ExportOptions, ExportResult } from './results.types';
export declare class ResultsService {
    listResults(mockDriveId: string, instituteId: string, query: ListResultsQuery): Promise<PaginatedResults>;
    getDetailedResult(mockDriveId: string, attemptId: string, instituteId: string): Promise<DetailedResult>;
    getStatistics(mockDriveId: string, instituteId: string, batchId?: string): Promise<ResultStatistics>;
    calculateRankings(mockDriveId: string, instituteId: string, batchId?: string): Promise<RankingEntry[]>;
    exportResults(mockDriveId: string, instituteId: string, options: ExportOptions): Promise<ExportResult>;
    generateReport(mockDriveId: string, attemptId: string, instituteId: string): Promise<void>;
    generateAllReports(mockDriveId: string, instituteId: string): Promise<{
        generated: number;
        skipped: number;
        failed: number;
    }>;
    private verifyAccess;
    private buildOrderBy;
    private generateRecommendations;
    private getModuleFeedback;
    private sanitizeFilename;
    private toCSV;
}
export declare const resultsService: ResultsService;
//# sourceMappingURL=results.service.d.ts.map
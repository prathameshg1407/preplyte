import { AnalyticsOverview, AnalyticsQuery, ScoreDistribution, ModulePerformance, BatchComparison, TimeAnalysis, CompletionTrend, DepartmentBreakdown, CourseYearBreakdown, FullAnalytics } from './analytics.types';
export declare class AnalyticsService {
    getFullAnalytics(mockDriveId: string, instituteId: string, query?: AnalyticsQuery): Promise<FullAnalytics>;
    getOverview(mockDriveId: string, batchId?: string): Promise<AnalyticsOverview>;
    getScoreDistribution(mockDriveId: string, batchId?: string, bucketSize?: number): Promise<ScoreDistribution>;
    getModulePerformance(mockDriveId: string, batchId?: string): Promise<ModulePerformance[]>;
    getBatchComparison(mockDriveId: string): Promise<BatchComparison[]>;
    getTimeAnalysis(mockDriveId: string, batchId?: string): Promise<TimeAnalysis>;
    getCompletionTrend(mockDriveId: string, batchId?: string, startDate?: Date, endDate?: Date): Promise<CompletionTrend[]>;
    getDepartmentBreakdown(mockDriveId: string, batchId?: string): Promise<DepartmentBreakdown[]>;
    getCourseYearBreakdown(mockDriveId: string, batchId?: string): Promise<CourseYearBreakdown[]>;
    private buildAttemptWhere;
    private buildModuleAttemptWhere;
    private buildDateRangeWhere;
    /**
     * Returns a percentage (0-100), always returns a number (0 if no data)
     * Use for fields that should never be null (completionRate, percentage in ranges)
     */
    private calculateRate;
    /**
     * Returns a percentage (0-100) or null if no data
     * Use for optional percentage fields (passRate, averagePercentage)
     */
    private calculatePercentageNullable;
    /**
     * Returns average or null if no values
     */
    private calculateAverage;
    private toCountMap;
    private sumCounts;
    private groupAttemptsByField;
    private verifyMockDriveAccess;
    private getMedianScore;
    private createScoreRanges;
    private calculateModuleStats;
    private calculateModuleScoreDistribution;
}
export declare const analyticsService: AnalyticsService;
//# sourceMappingURL=analytics.service.d.ts.map
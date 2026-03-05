import { z } from 'zod';
export declare const analyticsQuerySchema: z.ZodEffects<z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    batchId?: string | undefined;
}, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    batchId?: string | undefined;
}>, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    batchId?: string | undefined;
}, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    batchId?: string | undefined;
}>;
export declare const overviewQuerySchema: z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    batchId?: string | undefined;
}, {
    batchId?: string | undefined;
}>;
export declare const scoreDistributionQuerySchema: z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
    bucketSize: z.ZodOptional<z.ZodPipeline<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, z.ZodDefault<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    batchId?: string | undefined;
    bucketSize?: number | undefined;
}, {
    batchId?: string | undefined;
    bucketSize?: string | number | undefined;
}>;
export declare const modulePerformanceQuerySchema: z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
    moduleId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    moduleId?: string | undefined;
    batchId?: string | undefined;
}, {
    moduleId?: string | undefined;
    batchId?: string | undefined;
}>;
export declare const timeAnalysisQuerySchema: z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
    includeModuleBreakdown: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodString, boolean, string>]>>>;
}, "strip", z.ZodTypeAny, {
    includeModuleBreakdown: boolean;
    batchId?: string | undefined;
}, {
    batchId?: string | undefined;
    includeModuleBreakdown?: string | boolean | undefined;
}>;
export declare const questionAnalysisQuerySchema: z.ZodObject<{
    moduleId: z.ZodString;
    batchId: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["correctRate", "totalAttempts", "averageTime"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    limit: z.ZodOptional<z.ZodPipeline<z.ZodUnion<[z.ZodEffects<z.ZodString, number, string>, z.ZodNumber]>, z.ZodDefault<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    sortBy: "correctRate" | "totalAttempts" | "averageTime";
    sortOrder: "asc" | "desc";
    moduleId: string;
    limit?: number | undefined;
    batchId?: string | undefined;
}, {
    moduleId: string;
    limit?: string | number | undefined;
    sortBy?: "correctRate" | "totalAttempts" | "averageTime" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    batchId?: string | undefined;
}>;
export declare const demographicAnalysisQuerySchema: z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
    groupBy: z.ZodDefault<z.ZodEnum<["department", "courseYear", "both"]>>;
}, "strip", z.ZodTypeAny, {
    groupBy: "department" | "courseYear" | "both";
    batchId?: string | undefined;
}, {
    batchId?: string | undefined;
    groupBy?: "department" | "courseYear" | "both" | undefined;
}>;
export declare const completionTrendQuerySchema: z.ZodEffects<z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    granularity: z.ZodDefault<z.ZodEnum<["hour", "day", "week"]>>;
}, "strip", z.ZodTypeAny, {
    granularity: "hour" | "day" | "week";
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    batchId?: string | undefined;
}, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    batchId?: string | undefined;
    granularity?: "hour" | "day" | "week" | undefined;
}>, {
    granularity: "hour" | "day" | "week";
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    batchId?: string | undefined;
}, {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    batchId?: string | undefined;
    granularity?: "hour" | "day" | "week" | undefined;
}>;
export declare const exportAnalyticsSchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodEnum<["csv", "xlsx", "json", "pdf"]>>;
    sections: z.ZodDefault<z.ZodArray<z.ZodEnum<["overview", "scoreDistribution", "modulePerformance", "batchComparison", "timeAnalysis", "questionAnalysis", "demographics", "completionTrend"]>, "many">>;
    batchId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "csv" | "pdf" | "xlsx";
    sections: ("overview" | "scoreDistribution" | "modulePerformance" | "batchComparison" | "timeAnalysis" | "completionTrend" | "questionAnalysis" | "demographics")[];
    batchId?: string | undefined;
}, {
    format?: "json" | "csv" | "pdf" | "xlsx" | undefined;
    batchId?: string | undefined;
    sections?: ("overview" | "scoreDistribution" | "modulePerformance" | "batchComparison" | "timeAnalysis" | "completionTrend" | "questionAnalysis" | "demographics")[] | undefined;
}>;
export declare const mockDriveIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type OverviewQueryInput = z.infer<typeof overviewQuerySchema>;
export type ScoreDistributionQueryInput = z.infer<typeof scoreDistributionQuerySchema>;
export type ModulePerformanceQueryInput = z.infer<typeof modulePerformanceQuerySchema>;
export type TimeAnalysisQueryInput = z.infer<typeof timeAnalysisQuerySchema>;
export type QuestionAnalysisQueryInput = z.infer<typeof questionAnalysisQuerySchema>;
export type DemographicAnalysisQueryInput = z.infer<typeof demographicAnalysisQuerySchema>;
export type CompletionTrendQueryInput = z.infer<typeof completionTrendQuerySchema>;
export type ExportAnalyticsInput = z.infer<typeof exportAnalyticsSchema>;
//# sourceMappingURL=analytics.validation.d.ts.map
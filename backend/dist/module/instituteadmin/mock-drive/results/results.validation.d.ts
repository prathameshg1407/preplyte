import { z } from 'zod';
export declare const mockDriveIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const attemptIdParamSchema: z.ZodObject<{
    id: z.ZodString;
    attemptId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    attemptId: string;
}, {
    id: string;
    attemptId: string;
}>;
export declare const listResultsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    batchId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        NOT_STARTED: "NOT_STARTED";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        TIMED_OUT: "TIMED_OUT";
        ABANDONED: "ABANDONED";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["rank", "totalScore", "completedAt", "studentName"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "completedAt" | "totalScore" | "rank" | "studentName";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED" | "TIMED_OUT" | "ABANDONED" | undefined;
    batchId?: string | undefined;
}, {
    search?: string | undefined;
    status?: "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED" | "TIMED_OUT" | "ABANDONED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "completedAt" | "totalScore" | "rank" | "studentName" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    batchId?: string | undefined;
}>;
export declare const exportResultsQuerySchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodEnum<["csv", "json"]>>;
    batchId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "csv";
    batchId?: string | undefined;
}, {
    format?: "json" | "csv" | undefined;
    batchId?: string | undefined;
}>;
export declare const statisticsQuerySchema: z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    batchId?: string | undefined;
}, {
    batchId?: string | undefined;
}>;
export type ListResultsQuery = z.infer<typeof listResultsQuerySchema>;
export type ExportResultsQuery = z.infer<typeof exportResultsQuerySchema>;
export type StatisticsQuery = z.infer<typeof statisticsQuerySchema>;
//# sourceMappingURL=results.validation.d.ts.map
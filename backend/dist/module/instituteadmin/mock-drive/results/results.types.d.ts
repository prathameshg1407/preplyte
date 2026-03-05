import { MockDriveAttemptStatus, MockDriveModuleType } from '@prisma/client';
export interface ListResultsQuery {
    page?: number;
    limit?: number;
    batchId?: string;
    status?: MockDriveAttemptStatus;
    search?: string;
    sortBy?: 'rank' | 'totalScore' | 'completedAt' | 'studentName';
    sortOrder?: 'asc' | 'desc';
}
export interface ExportOptions {
    format: 'csv' | 'json';
    batchId?: string;
}
export interface ResultListItem {
    attemptId: string;
    userId: string;
    studentName: string;
    studentId: string | null;
    departmentId: string | null;
    batchName: string | null;
    status: MockDriveAttemptStatus;
    totalScore: number | null;
    percentageScore: number | null;
    rank: number | null;
    isPassed: boolean | null;
    completedAt: Date | null;
}
export interface PaginatedResults {
    data: ResultListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ModuleResultSummary {
    moduleId: string;
    moduleName: string;
    moduleType: MockDriveModuleType;
    score: number | null;
    maxScore: number | null;
    percentage: number | null;
    isPassed: boolean | null;
    timeSpentSeconds: number;
}
export interface DetailedResult {
    attemptId: string;
    mockDriveId: string;
    student: {
        userId: string;
        name: string;
        email: string;
        studentId: string | null;
        departmentId: string | null;
    };
    batch: {
        id: string;
        name: string;
    } | null;
    status: MockDriveAttemptStatus;
    totalScore: number | null;
    percentageScore: number | null;
    rank: number | null;
    isPassed: boolean | null;
    startedAt: Date | null;
    completedAt: Date | null;
    modules: ModuleResultSummary[];
    report: {
        performanceSummary: string;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    } | null;
}
export interface RankingEntry {
    attemptId: string;
    userId: string;
    studentName: string;
    rank: number;
    totalScore: number;
    percentageScore: number;
}
export interface ResultStatistics {
    total: number;
    completed: number;
    passed: number;
    failed: number;
    avgScore: number | null;
    highScore: number | null;
    lowScore: number | null;
    passRate: number | null;
}
export interface ExportResult {
    filename: string;
    data: string;
    contentType: string;
}
export declare class ResultsError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode?: number);
}
export declare class MockDriveNotFoundError extends ResultsError {
    constructor(id: string);
}
export declare class AccessDeniedError extends ResultsError {
    constructor();
}
export declare class ResultNotFoundError extends ResultsError {
    constructor(attemptId: string);
}
//# sourceMappingURL=results.types.d.ts.map
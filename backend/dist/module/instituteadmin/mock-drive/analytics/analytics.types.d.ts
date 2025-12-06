import { MockDriveModuleType } from '@prisma/client';
import { BaseError } from '../common/common.types';
export interface RegistrationStats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
}
export interface ParticipationStats {
    totalRegistered: number;
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
}
export interface ScoreStats {
    average: number | null;
    highest: number | null;
    lowest: number | null;
    median: number | null;
}
export interface BatchStats {
    total: number;
    completed: number;
    inProgress: number;
    scheduled: number;
}
export interface AnalyticsOverview {
    registrations: RegistrationStats;
    participation: ParticipationStats;
    scores: ScoreStats;
    batches: BatchStats;
}
export interface ScoreRange {
    label: string;
    min: number;
    max: number;
    count: number;
    percentage: number;
}
export interface ScoreDistribution {
    ranges: ScoreRange[];
    totalStudents: number;
}
export interface ModuleStats {
    averageScore: number | null;
    averagePercentage: number | null;
    averageTimeSpent: number | null;
    passRate: number | null;
    completionRate: number;
}
export interface ModulePerformance {
    moduleId: string;
    moduleName: string;
    moduleType: MockDriveModuleType;
    order: number;
    stats: ModuleStats;
    scoreDistribution: ScoreRange[];
}
export interface BatchComparison {
    batchId: string;
    batchName: string;
    batchNumber: number;
    totalStudents: number;
    completedStudents: number;
    averageScore: number | null;
    averagePercentage: number | null;
    highestScore: number | null;
    lowestScore: number | null;
    passRate: number | null;
}
export interface OverallTimeStats {
    averageDuration: number | null;
    minDuration: number | null;
    maxDuration: number | null;
}
export interface ModuleTimeStats {
    moduleId: string;
    moduleName: string;
    moduleType: MockDriveModuleType;
    timeLimit: number;
    averageTimeUsed: number | null;
    averageTimeUsedPercentage: number | null;
}
export interface TimeAnalysis {
    overall: OverallTimeStats;
    byModule: ModuleTimeStats[];
}
export interface QuestionStats {
    questionId: string;
    questionText: string;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
    totalAttempts: number;
    correctRate: number;
    averageTimeSpent: number | null;
}
export interface QuestionAnalysis {
    totalQuestions: number;
    questions: QuestionStats[];
}
export interface CompletionTrend {
    date: string;
    completed: number;
    cumulative: number;
}
export interface DepartmentBreakdown {
    department: string;
    totalStudents: number;
    completedStudents: number;
    averageScore: number | null;
    passRate: number | null;
}
export interface CourseYearBreakdown {
    courseYear: string;
    totalStudents: number;
    completedStudents: number;
    averageScore: number | null;
    passRate: number | null;
}
export interface FullAnalytics {
    overview: AnalyticsOverview;
    scoreDistribution: ScoreDistribution;
    modulePerformance: ModulePerformance[];
    batchComparison: BatchComparison[];
    timeAnalysis: TimeAnalysis;
    completionTrend: CompletionTrend[];
    departmentBreakdown: DepartmentBreakdown[];
    courseYearBreakdown: CourseYearBreakdown[];
}
export interface AnalyticsQuery {
    batchId?: string;
    startDate?: Date;
    endDate?: Date;
}
export declare class AnalyticsError extends BaseError {
    constructor(code: string | undefined, message: string, statusCode?: number);
}
export declare class InsufficientDataError extends AnalyticsError {
    constructor(message?: string);
}
//# sourceMappingURL=analytics.types.d.ts.map
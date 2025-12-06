import { MockDriveModuleType, MockDriveAttemptStatus } from '@prisma/client';
export interface ResultOverview {
    attemptId: string;
    mockDriveId: string;
    mockDriveTitle: string;
    status: MockDriveAttemptStatus;
    startedAt: Date | null;
    completedAt: Date | null;
    totalScore: number | null;
    percentageScore: number | null;
    rank: number | null;
    totalParticipants: number;
    isPassed: boolean;
    moduleScores: ModuleScoreDetail[];
}
export interface ModuleScoreDetail {
    moduleId: string;
    moduleName: string | null;
    moduleType: MockDriveModuleType;
    order: number;
    score: number;
    maxScore: number;
    percentage: number;
    isPassed: boolean;
    timeSpentSeconds: number;
    status: string;
}
export interface DetailedReport {
    overview: ResultOverview;
    moduleReports: ModuleReport[];
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
    overallFeedback: string;
    comparisonStats: ComparisonStats;
}
export interface ModuleReport {
    moduleId: string;
    moduleName: string | null;
    moduleType: MockDriveModuleType;
    score: number;
    maxScore: number;
    percentage: number;
    timeSpentSeconds: number;
    detailedAnalysis: any;
    feedback: string;
    recommendations: string[];
}
export interface ComparisonStats {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    percentile: number;
    rankInBatch: number;
    totalInBatch: number;
    rankOverall: number;
    totalOverall: number;
}
export interface AptitudeAnalysis {
    totalQuestions: number;
    correct: number;
    wrong: number;
    unanswered: number;
    accuracy: number;
    questionTypeAnalysis: Array<{
        type: string;
        total: number;
        correct: number;
        accuracy: number;
    }>;
    timeAnalysis: {
        averageTimePerQuestion: number;
        fastestQuestion: number;
        slowestQuestion: number;
    };
}
export interface MachineAnalysis {
    totalQuestions: number;
    solved: number;
    partial: number;
    unattempted: number;
    totalSubmissions: number;
    languagesUsed: string[];
    questionAnalysis: Array<{
        questionId: string;
        title: string;
        solved: boolean;
        bestScore: number;
        maxScore: number;
        submissionCount: number;
    }>;
}
export interface InterviewAnalysis {
    totalQuestions: number;
    answered: number;
    skipped: number;
    overallScore: number;
    categoryScores: Record<string, {
        score: number;
        count: number;
    }>;
    communicationScore: number;
    technicalScore: number;
    keyStrengths: string[];
    areasForImprovement: string[];
}
//# sourceMappingURL=results.types.d.ts.map
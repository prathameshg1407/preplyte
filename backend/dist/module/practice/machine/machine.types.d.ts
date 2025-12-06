import { DifficultyLevel, SubmissionStatus } from '@prisma/client';
export interface CreateSessionDto {
    difficulty: DifficultyLevel;
    numberOfQuestions: number;
    timeLimit: number;
    tags?: string[];
}
export interface RunCodeDto {
    code: string;
    languageId: number;
    customInput?: string;
}
export interface SubmitCodeDto {
    code: string;
    languageId: number;
}
export interface SessionListFilters {
    page: number;
    limit: number;
    status: SessionFilterStatus;
    difficulty?: DifficultyLevel;
}
export interface SessionResponse {
    id: string;
    userId: string;
    difficulty: DifficultyLevel;
    numberOfQuestions: number;
    timeLimit: number;
    startedAt: Date;
    expiresAt: Date;
    completedAt: Date | null;
    totalScore: number | null;
    totalSolved: number | null;
    status: SessionStatus;
    createdAt: Date;
}
export interface SessionDetails extends Omit<SessionResponse, 'status'> {
    status: SessionStatus;
    timeRemaining: number;
    timeRemainingFormatted: string;
    progress: SessionProgress;
    updatedAt: Date;
}
export interface SessionProgress {
    solved: number;
    attempted: number;
    unattempted?: number;
    total: number;
    solvedPercentage?: number;
}
export interface QuestionProgress {
    id: string;
    sessionQuestionId: string;
    order: number;
    title: string;
    difficulty: DifficultyLevel;
    tags: string[];
    isSolved: boolean;
    submissionCount: number;
    bestSubmission: BestSubmission | null;
}
export interface BestSubmission {
    status: SubmissionStatus;
    executionTime?: number;
    memoryUsed?: number;
    testCasesPassed?: number;
    testCasesTotal?: number;
    submittedAt: Date;
}
export interface QuestionNavigation {
    previousQuestionId: string | null;
    nextQuestionId: string | null;
    currentPosition: number;
    totalQuestions: number;
}
export interface TestCaseResult {
    testCaseId?: string;
    testCaseNumber?: number;
    type?: TestCaseType;
    input: string;
    expectedOutput: string;
    actualOutput: string | null;
    status: TestCaseStatus;
    executionTime: number | null;
    memoryUsed: number | null;
    stderr?: string | null;
}
export interface CodeExecutionResult {
    sessionId: string;
    questionId: string;
    executionType: ExecutionType;
    results?: TestCaseResult[];
    result?: CustomInputResult;
    summary?: ExecutionSummary;
    compilationStatus: CompilationStatus;
    compileOutput: string | null;
}
export interface CustomInputResult {
    input: string;
    output: string;
    executionTime: number;
    memoryUsed: number;
    status: string;
}
export interface ExecutionSummary {
    totalTestCases: number;
    passed: number;
    failed: number;
    averageExecutionTime?: number;
    maxMemoryUsed?: number;
}
export interface SubmissionResult {
    submissionId: string;
    sessionId: string;
    questionId: string;
    status: SubmissionStatus;
    testCasesPassed: number;
    testCasesTotal: number;
    executionTime: number | null;
    memoryUsed: number | null;
    submittedAt: Date;
    judgedAt: Date;
    isSolved: boolean;
    score: number;
    message: string;
    failedTestCase?: FailedTestCase;
}
export interface FailedTestCase {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    message: string;
}
export interface PerformanceEvaluation {
    rank: PerformanceRank;
    message: string;
    suggestions: string[];
}
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export type SessionStatus = 'in_progress' | 'completed' | 'expired';
export type SessionFilterStatus = 'all' | SessionStatus;
export type TestCaseType = 'SAMPLE' | 'HIDDEN';
export type TestCaseStatus = 'PASSED' | 'FAILED' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED';
export type ExecutionType = 'sample_test_cases' | 'custom_input';
export type CompilationStatus = 'SUCCESS' | 'COMPILATION_ERROR';
export type PerformanceRank = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
export declare const SESSION_LIMITS: {
    readonly MIN_QUESTIONS: 1;
    readonly MAX_QUESTIONS: 10;
    readonly MIN_TIME: 30;
    readonly MAX_TIME: 180;
    readonly MAX_CODE_LENGTH: 50000;
    readonly MAX_PAGE_SIZE: 50;
};
export declare const PERFORMANCE_THRESHOLDS: {
    readonly EASY: {
        readonly excellent: 100;
        readonly good: 80;
        readonly average: 50;
    };
    readonly MEDIUM: {
        readonly excellent: 100;
        readonly good: 66;
        readonly average: 33;
    };
    readonly HARD: {
        readonly excellent: 100;
        readonly good: 50;
        readonly average: 25;
    };
};
export declare const LANGUAGE_MAP: Record<number, string>;
export declare const getLanguageName: (id: number) => string;
//# sourceMappingURL=machine.types.d.ts.map
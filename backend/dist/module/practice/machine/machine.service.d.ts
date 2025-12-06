import { CreateSessionDto, RunCodeDto, SubmitCodeDto, SessionListFilters, SessionStatus, CodeExecutionResult, SubmissionResult, PerformanceEvaluation } from './machine.types';
declare class MachineService {
    createSession(userId: string, dto: CreateSessionDto): Promise<{
        id: string;
        userId: string;
        difficulty: import("@prisma/client").$Enums.DifficultyLevel;
        numberOfQuestions: number;
        timeLimit: number;
        startedAt: Date;
        expiresAt: Date;
        completedAt: Date | null;
        totalScore: number | null;
        totalSolved: number | null;
        status: "in_progress";
        createdAt: Date;
    }>;
    listSessions(userId: string, filters: SessionListFilters): Promise<{
        sessions: {
            status: SessionStatus;
            solvedPercentage: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date;
            userId: string;
            completedAt: Date | null;
            totalScore: number | null;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            numberOfQuestions: number;
            timeLimit: number;
            startedAt: Date;
            totalSolved: number | null;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    getSessionDetails(userId: string, sessionId: string): Promise<{
        id: string;
        userId: string;
        difficulty: import("@prisma/client").$Enums.DifficultyLevel;
        numberOfQuestions: number;
        timeLimit: number;
        startedAt: Date;
        expiresAt: Date;
        completedAt: Date | null;
        status: SessionStatus;
        timeRemaining: number;
        timeRemainingFormatted: string;
        progress: {
            solved: number;
            attempted: number;
            total: number;
        };
        totalScore: number | null;
        totalSolved: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSessionStatus(userId: string, sessionId: string): Promise<{
        sessionId: string;
        status: SessionStatus;
        timeRemaining: number;
        timeRemainingFormatted: string;
        startedAt: Date;
        expiresAt: Date;
        progress: {
            solved: number;
            attempted: number;
            unattempted: number;
            total: number;
            solvedPercentage: number;
        };
        submissionStats: {
            totalSubmissions: number;
            acceptedSubmissions: number;
            lastSubmissionAt: Date;
        };
    }>;
    getSessionQuestions(userId: string, sessionId: string): Promise<{
        sessionId: string;
        status: SessionStatus;
        questions: {
            id: string;
            sessionQuestionId: string;
            order: number;
            title: string;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            tags: string[];
            isSolved: boolean;
            submissionCount: number;
            bestSubmission: {
                status: import("@prisma/client").$Enums.SubmissionStatus;
                executionTime: number | undefined;
                memoryUsed: number | undefined;
                testCasesPassed: number;
                testCasesTotal: number;
                submittedAt: Date;
            } | null;
        }[];
        totalQuestions: number;
        solvedCount: number;
    }>;
    getQuestion(userId: string, sessionId: string, questionId: string): Promise<{
        sessionId: string;
        sessionQuestionId: string;
        question: {
            id: string;
            title: string;
            description: string;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            inputFormat: string;
            outputFormat: string;
            constraints: string[];
            tags: string[];
            sampleTestCases: {
                id: string;
                input: string;
                expectedOutput: string;
            }[];
            totalTestCases: number;
        };
        isSolved: boolean;
        submissionCount: number;
        lastSubmission: {
            id: string;
            status: import("@prisma/client").$Enums.SubmissionStatus;
            languageId: number;
            testCasesPassed: number;
            testCasesTotal: number;
            submittedAt: Date;
        } | null;
        navigation: {
            previousQuestionId: string | null;
            nextQuestionId: string | null;
            currentPosition: number;
            totalQuestions: number;
        };
    }>;
    runCode(userId: string, sessionId: string, questionId: string, dto: RunCodeDto): Promise<CodeExecutionResult>;
    submitCode(userId: string, sessionId: string, questionId: string, dto: SubmitCodeDto): Promise<SubmissionResult>;
    completeSession(userId: string, sessionId: string): Promise<{
        sessionId: string;
        status: "completed";
        completedAt: Date;
        timeTaken: number;
        results: {
            totalSolved: number;
            totalQuestions: number;
            totalScore: number;
            solvedPercentage: number;
            questions: {
                id: string;
                title: string;
                isSolved: boolean;
                submissionCount: number;
                bestStatus: import("@prisma/client").$Enums.SubmissionStatus;
            }[];
        };
    }>;
    getSessionResults(userId: string, sessionId: string): Promise<{
        sessionId: string;
        status: "completed";
        completedAt: Date;
        timeTaken: number;
        timeLimit: number;
        difficulty: import("@prisma/client").$Enums.DifficultyLevel;
        summary: {
            totalSolved: number | null;
            totalQuestions: number;
            totalScore: number | null;
            maxPossibleScore: number;
            solvedPercentage: number;
            totalSubmissions: number;
        };
        questions: {
            order: any;
            id: any;
            title: any;
            difficulty: any;
            tags: any;
            isSolved: any;
            score: number;
            submissionCount: any;
            bestSubmission: {
                id: any;
                status: any;
                executionTime: any;
                memoryUsed: any;
                languageId: any;
                language: string;
                submittedAt: any;
            } | null;
        }[];
        performance: PerformanceEvaluation;
    }>;
    getSubmissionHistory(userId: string, sessionId: string, questionId: string, page: number, limit: number): Promise<{
        sessionId: string;
        questionId: string;
        questionTitle: string;
        submissions: {
            id: string;
            status: import("@prisma/client").$Enums.SubmissionStatus;
            languageId: number;
            language: string;
            executionTime: number | null;
            memoryUsed: number | null;
            testCasesPassed: number;
            testCasesTotal: number;
            submittedAt: Date;
            judgedAt: Date | null;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
        stats: {
            totalSubmissions: number;
            acceptedCount: number;
            wrongAnswerCount: number;
            compilationErrorCount: number;
            firstAcceptedAt: Date | null;
        };
    }>;
    getSubmissionDetails(userId: string, submissionId: string): Promise<{
        id: string;
        sessionId: string;
        questionId: string;
        questionTitle: string;
        code: string;
        languageId: number;
        language: string;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        executionTime: number | null;
        memoryUsed: number | null;
        testCasesPassed: number;
        testCasesTotal: number;
        stdout: string | null;
        stderr: string | null;
        compileError: string | null;
        submittedAt: Date;
        judgedAt: Date | null;
        testCaseResults: {
            testCaseNumber: number;
            type: import("@prisma/client").$Enums.TestCaseType;
            status: string;
            input: string;
            expectedOutput: string;
            actualOutput: string;
        }[];
    }>;
    private ensureNoActiveSession;
    private fetchQuestions;
    private buildSessionWhereClause;
    private validateSessionForExecution;
    private runWithCustomInput;
    private runAgainstSampleTestCases;
    private processSubmissionResults;
    private analyzeResults;
    private markSubmissionError;
    private waitForJudge0;
    private mapResultStatus;
    private calculateExecutionStats;
    private formatQuestionResult;
    private evaluatePerformance;
}
export declare const machineService: MachineService;
export {};
//# sourceMappingURL=machine.service.d.ts.map
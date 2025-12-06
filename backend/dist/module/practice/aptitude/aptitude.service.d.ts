import { CreateSessionDto, SaveAnswerDto, SessionListFilters, SessionStatus, SolutionFilter, TypeBreakdown, PerformanceEvaluation } from './aptitude.types';
declare class AptitudeService {
    createSession(userId: string, dto: CreateSessionDto): Promise<{
        completedAt: null;
        totalScore: null;
        totalCorrect: null;
        totalWrong: null;
        totalUnanswered: null;
        id: string;
        createdAt: Date;
        expiresAt: Date;
        difficulty: import("@prisma/client").$Enums.DifficultyLevel;
        questionTypes: import("@prisma/client").$Enums.QuestionType[];
        numberOfQuestions: number;
        timeLimit: number;
        startedAt: Date;
    }>;
    listSessions(userId: string, filters: SessionListFilters): Promise<{
        sessions: {
            status: SessionStatus;
            id: string;
            expiresAt: Date;
            completedAt: Date | null;
            totalScore: number | null;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            questionTypes: import("@prisma/client").$Enums.QuestionType[];
            numberOfQuestions: number;
            timeLimit: number;
            startedAt: Date;
            totalCorrect: number | null;
            totalWrong: number | null;
            totalUnanswered: number | null;
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
    private buildSessionWhereClause;
    getSessionDetails(userId: string, sessionId: string): Promise<Record<string, unknown>>;
    getSessionQuestions(userId: string, sessionId: string): Promise<{
        sessionId: string;
        status: SessionStatus;
        questions: {
            correctOptionId?: string | undefined;
            isCorrect?: boolean | null | undefined;
            id: string;
            order: number;
            questionText: string;
            questionType: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            options: {
                isCorrect?: boolean | undefined;
                id: string;
                text: string;
            }[];
            selectedOptionId: string | null;
            answeredAt: Date | null;
        }[];
        totalQuestions: number;
        answeredCount: number;
    }>;
    getQuestion(userId: string, sessionId: string, questionId: string): Promise<{
        sessionId: string;
        sessionStatus: SessionStatus;
        question: {
            id: string;
            sessionQuestionId: string;
            order: number;
            questionText: string;
            questionType: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            options: {
                id: string;
                text: string;
            }[];
            selectedOptionId: string | null;
            answeredAt: Date | null;
        };
        navigation: {
            previousQuestionId: string | null;
            nextQuestionId: string | null;
            currentPosition: number;
            totalQuestions: number;
        };
    }>;
    saveAnswer(userId: string, sessionId: string, dto: SaveAnswerDto): Promise<{
        sessionId: string;
        questionId: string;
        selectedOptionId: string | null;
        answeredAt: Date | null;
        progress: {
            answered: number;
            unanswered: number;
            total: number;
        };
    }>;
    submitSession(userId: string, sessionId: string): Promise<{
        sessionId: string;
        status: "completed";
        completedAt: Date;
        timeTaken: number;
        results: {
            totalQuestions: number;
            scorePercentage: number;
            totalCorrect: number;
            totalWrong: number;
            totalUnanswered: number;
            breakdownByType: Record<string, TypeBreakdown>;
            totalScore: number;
        };
    }>;
    getSessionStatus(userId: string, sessionId: string): Promise<{
        sessionId: string;
        status: SessionStatus;
        timeRemaining: number;
        timeRemainingFormatted: string;
        startedAt: Date;
        expiresAt: Date;
        progress: {
            answered: number;
            unanswered: number;
            total: number;
            percentageComplete: number;
        };
        lastActivityAt: Date;
    }>;
    getSessionResults(userId: string, sessionId: string): Promise<{
        sessionId: string;
        status: "completed";
        completedAt: Date;
        timeTaken: number;
        timeLimit: number;
        difficulty: import("@prisma/client").$Enums.DifficultyLevel;
        summary: {
            totalScore: number | null;
            totalCorrect: number | null;
            totalWrong: number | null;
            totalUnanswered: number | null;
            totalQuestions: number;
            scorePercentage: number | null;
            accuracy: number;
            attemptRate: number;
        };
        breakdown: {
            byType: Record<string, TypeBreakdown>;
            byDifficulty: Record<string, TypeBreakdown>;
        };
        performance: PerformanceEvaluation;
    }>;
    getSolutions(userId: string, sessionId: string, filter: SolutionFilter): Promise<{
        sessionId: string;
        status: "completed";
        solutions: {
            order: number;
            questionId: string;
            questionText: string;
            questionType: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.DifficultyLevel;
            options: {
                isCorrect: boolean;
                id: string;
                text: string;
            }[];
            selectedOptionId: string | null;
            correctOptionId: string;
            isCorrect: boolean | null;
            explanation: string | null;
        }[];
        summary: {
            totalCorrect: number | null;
            totalWrong: number | null;
            totalUnanswered: number | null;
        };
    }>;
    private buildSolutionFilter;
    private calculateResults;
    private calculateDetailedBreakdown;
    private evaluatePerformance;
}
export declare const aptitudeService: AptitudeService;
export {};
//# sourceMappingURL=aptitude.service.d.ts.map
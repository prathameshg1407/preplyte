import { z } from 'zod';
export declare const createSessionSchema: z.ZodObject<{
    body: z.ZodObject<{
        difficulty: z.ZodEnum<["EASY", "MEDIUM", "HARD"]>;
        questionTypes: z.ZodArray<z.ZodEnum<["QUANTITATIVE", "VERBAL", "LOGICAL"]>, "many">;
        numberOfQuestions: z.ZodNumber;
        timeLimit: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        timeLimit: number;
    }, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        timeLimit: number;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        timeLimit: number;
    };
}, {
    body: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        timeLimit: number;
    };
}>;
export declare const listSessionsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        status: z.ZodDefault<z.ZodEnum<["all", "completed", "in_progress", "expired"]>>;
        difficulty: z.ZodOptional<z.ZodEnum<["EASY", "MEDIUM", "HARD"]>>;
        sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "completedAt", "totalScore"]>>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "all" | "in_progress" | "completed" | "expired";
        page: number;
        limit: number;
        sortBy: "createdAt" | "completedAt" | "totalScore";
        sortOrder: "asc" | "desc";
        difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
    }, {
        status?: "all" | "in_progress" | "completed" | "expired" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: "createdAt" | "completedAt" | "totalScore" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        status: "all" | "in_progress" | "completed" | "expired";
        page: number;
        limit: number;
        sortBy: "createdAt" | "completedAt" | "totalScore";
        sortOrder: "asc" | "desc";
        difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
    };
}, {
    query: {
        status?: "all" | "in_progress" | "completed" | "expired" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: "createdAt" | "completedAt" | "totalScore" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
    };
}>;
export declare const sessionIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const questionIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        questionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        questionId: string;
    }, {
        id: string;
        questionId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
        questionId: string;
    };
}, {
    params: {
        id: string;
        questionId: string;
    };
}>;
export declare const saveAnswerSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        questionId: z.ZodString;
        selectedOptionId: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
        selectedOptionId: string | null;
    }, {
        questionId: string;
        selectedOptionId: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        questionId: string;
        selectedOptionId: string | null;
    };
}, {
    params: {
        id: string;
    };
    body: {
        questionId: string;
        selectedOptionId: string | null;
    };
}>;
export declare const solutionsFilterSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    query: z.ZodObject<{
        filter: z.ZodDefault<z.ZodEnum<["all", "correct", "wrong", "unanswered"]>>;
    }, "strip", z.ZodTypeAny, {
        filter: "all" | "correct" | "wrong" | "unanswered";
    }, {
        filter?: "all" | "correct" | "wrong" | "unanswered" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        filter: "all" | "correct" | "wrong" | "unanswered";
    };
    params: {
        id: string;
    };
}, {
    query: {
        filter?: "all" | "correct" | "wrong" | "unanswered" | undefined;
    };
    params: {
        id: string;
    };
}>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>['body'];
export type ListSessionsQuery = z.infer<typeof listSessionsSchema>['query'];
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>['body'];
export type SolutionsFilterQuery = z.infer<typeof solutionsFilterSchema>['query'];
//# sourceMappingURL=aptitude.validation.d.ts.map
import { z } from 'zod';
export declare const createSessionSchema: z.ZodObject<{
    body: z.ZodObject<{
        difficulty: z.ZodEnum<["EASY", "MEDIUM", "HARD"]>;
        numberOfQuestions: z.ZodNumber;
        timeLimit: z.ZodNumber;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        timeLimit: number;
        tags?: string[] | undefined;
    }, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        timeLimit: number;
        tags?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        timeLimit: number;
        tags?: string[] | undefined;
    };
}, {
    body: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        timeLimit: number;
        tags?: string[] | undefined;
    };
}>;
export declare const listSessionsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        status: z.ZodDefault<z.ZodEnum<["all", "completed", "in_progress", "expired"]>>;
        difficulty: z.ZodOptional<z.ZodEnum<["EASY", "MEDIUM", "HARD"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "all" | "in_progress" | "completed" | "expired";
        page: number;
        limit: number;
        difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
    }, {
        status?: "all" | "in_progress" | "completed" | "expired" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        status: "all" | "in_progress" | "completed" | "expired";
        page: number;
        limit: number;
        difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
    };
}, {
    query: {
        status?: "all" | "in_progress" | "completed" | "expired" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
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
export declare const runCodeSchema: z.ZodObject<{
    params: z.ZodObject<{
        sessionId: z.ZodString;
        questionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        questionId: string;
    }, {
        sessionId: string;
        questionId: string;
    }>;
    body: z.ZodObject<{
        code: z.ZodString;
        languageId: z.ZodNumber;
        customInput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        languageId: number;
        customInput?: string | undefined;
    }, {
        code: string;
        languageId: number;
        customInput?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        sessionId: string;
        questionId: string;
    };
    body: {
        code: string;
        languageId: number;
        customInput?: string | undefined;
    };
}, {
    params: {
        sessionId: string;
        questionId: string;
    };
    body: {
        code: string;
        languageId: number;
        customInput?: string | undefined;
    };
}>;
export declare const submitCodeSchema: z.ZodObject<{
    params: z.ZodObject<{
        sessionId: z.ZodString;
        questionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        questionId: string;
    }, {
        sessionId: string;
        questionId: string;
    }>;
    body: z.ZodObject<{
        code: z.ZodString;
        languageId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        code: string;
        languageId: number;
    }, {
        code: string;
        languageId: number;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        sessionId: string;
        questionId: string;
    };
    body: {
        code: string;
        languageId: number;
    };
}, {
    params: {
        sessionId: string;
        questionId: string;
    };
    body: {
        code: string;
        languageId: number;
    };
}>;
export declare const submissionsListSchema: z.ZodObject<{
    params: z.ZodObject<{
        sessionId: z.ZodString;
        questionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sessionId: string;
        questionId: string;
    }, {
        sessionId: string;
        questionId: string;
    }>;
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
    };
    params: {
        sessionId: string;
        questionId: string;
    };
}, {
    query: {
        page?: number | undefined;
        limit?: number | undefined;
    };
    params: {
        sessionId: string;
        questionId: string;
    };
}>;
export declare const submissionIdSchema: z.ZodObject<{
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
export type CreateSessionInput = z.infer<typeof createSessionSchema>['body'];
export type ListSessionsQuery = z.infer<typeof listSessionsSchema>['query'];
export type RunCodeInput = z.infer<typeof runCodeSchema>['body'];
export type SubmitCodeInput = z.infer<typeof submitCodeSchema>['body'];
//# sourceMappingURL=machine.validation.d.ts.map
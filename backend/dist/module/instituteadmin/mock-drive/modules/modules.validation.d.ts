import { z } from 'zod';
export declare const aptitudeConfigSchema: z.ZodObject<{
    difficulty: z.ZodNativeEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>;
    questionTypes: z.ZodArray<z.ZodNativeEnum<{
        QUANTITATIVE: "QUANTITATIVE";
        VERBAL: "VERBAL";
        LOGICAL: "LOGICAL";
    }>, "many">;
    numberOfQuestions: z.ZodNumber;
    marksPerQuestion: z.ZodNumber;
    negativeMarking: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    difficulty: "EASY" | "MEDIUM" | "HARD";
    questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
    numberOfQuestions: number;
    marksPerQuestion: number;
    negativeMarking: number;
}, {
    difficulty: "EASY" | "MEDIUM" | "HARD";
    questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
    numberOfQuestions: number;
    marksPerQuestion: number;
    negativeMarking: number;
}>;
export declare const machineCodingConfigSchema: z.ZodObject<{
    difficulty: z.ZodNativeEnum<{
        EASY: "EASY";
        MEDIUM: "MEDIUM";
        HARD: "HARD";
    }>;
    numberOfQuestions: z.ZodNumber;
    allowedLanguages: z.ZodArray<z.ZodString, "many">;
    partialScoring: z.ZodDefault<z.ZodBoolean>;
    maxScorePerQuestion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    difficulty: "EASY" | "MEDIUM" | "HARD";
    numberOfQuestions: number;
    allowedLanguages: string[];
    maxScorePerQuestion: number;
    partialScoring: boolean;
}, {
    difficulty: "EASY" | "MEDIUM" | "HARD";
    numberOfQuestions: number;
    allowedLanguages: string[];
    maxScorePerQuestion: number;
    partialScoring?: boolean | undefined;
}>;
export declare const aiInterviewConfigSchema: z.ZodObject<{
    difficulty: z.ZodNativeEnum<{
        ENTRY: "ENTRY";
        MID: "MID";
        SENIOR: "SENIOR";
        LEAD: "LEAD";
    }>;
    jobTitle: z.ZodString;
    companyName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    focusAreas: z.ZodArray<z.ZodString, "many">;
    targetQuestions: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
    jobTitle: string;
    focusAreas: string[];
    targetQuestions: number;
    companyName?: string | null | undefined;
}, {
    difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
    jobTitle: string;
    focusAreas: string[];
    targetQuestions: number;
    companyName?: string | null | undefined;
}>;
export declare const mockDriveIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const moduleIdParamSchema: z.ZodObject<{
    id: z.ZodString;
    moduleId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    moduleId: string;
}, {
    id: string;
    moduleId: string;
}>;
export declare const listModulesQuerySchema: z.ZodObject<{
    includeInactive: z.ZodDefault<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodString, boolean, string>]>>;
    checkAvailability: z.ZodDefault<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodString, boolean, string>]>>;
}, "strip", z.ZodTypeAny, {
    includeInactive: boolean;
    checkAvailability: boolean;
}, {
    includeInactive?: string | boolean | undefined;
    checkAvailability?: string | boolean | undefined;
}>;
export declare const createModuleSchema: z.ZodEffects<z.ZodObject<{
    moduleType: z.ZodNativeEnum<{
        APTITUDE: "APTITUDE";
        MACHINE_CODING: "MACHINE_CODING";
        AI_INTERVIEW: "AI_INTERVIEW";
    }>;
    order: z.ZodNumber;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeLimit: z.ZodNumber;
    weightage: z.ZodNumber;
    config: z.ZodUnion<[z.ZodObject<{
        difficulty: z.ZodNativeEnum<{
            EASY: "EASY";
            MEDIUM: "MEDIUM";
            HARD: "HARD";
        }>;
        questionTypes: z.ZodArray<z.ZodNativeEnum<{
            QUANTITATIVE: "QUANTITATIVE";
            VERBAL: "VERBAL";
            LOGICAL: "LOGICAL";
        }>, "many">;
        numberOfQuestions: z.ZodNumber;
        marksPerQuestion: z.ZodNumber;
        negativeMarking: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    }, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    }>, z.ZodObject<{
        difficulty: z.ZodNativeEnum<{
            EASY: "EASY";
            MEDIUM: "MEDIUM";
            HARD: "HARD";
        }>;
        numberOfQuestions: z.ZodNumber;
        allowedLanguages: z.ZodArray<z.ZodString, "many">;
        partialScoring: z.ZodDefault<z.ZodBoolean>;
        maxScorePerQuestion: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring: boolean;
    }, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring?: boolean | undefined;
    }>, z.ZodObject<{
        difficulty: z.ZodNativeEnum<{
            ENTRY: "ENTRY";
            MID: "MID";
            SENIOR: "SENIOR";
            LEAD: "LEAD";
        }>;
        jobTitle: z.ZodString;
        companyName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        focusAreas: z.ZodArray<z.ZodString, "many">;
        targetQuestions: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    }, {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    }>]>;
    passingScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    timeLimit: number;
    order: number;
    config: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    } | {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring: boolean;
    } | {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    };
    moduleType: "APTITUDE" | "MACHINE_CODING" | "AI_INTERVIEW";
    weightage: number;
    name?: string | null | undefined;
    instructions?: string | null | undefined;
    passingScore?: number | null | undefined;
}, {
    timeLimit: number;
    order: number;
    config: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    } | {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring?: boolean | undefined;
    } | {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    };
    moduleType: "APTITUDE" | "MACHINE_CODING" | "AI_INTERVIEW";
    weightage: number;
    name?: string | null | undefined;
    instructions?: string | null | undefined;
    passingScore?: number | null | undefined;
}>, {
    timeLimit: number;
    order: number;
    config: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    } | {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring: boolean;
    } | {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    };
    moduleType: "APTITUDE" | "MACHINE_CODING" | "AI_INTERVIEW";
    weightage: number;
    name?: string | null | undefined;
    instructions?: string | null | undefined;
    passingScore?: number | null | undefined;
}, {
    timeLimit: number;
    order: number;
    config: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    } | {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring?: boolean | undefined;
    } | {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    };
    moduleType: "APTITUDE" | "MACHINE_CODING" | "AI_INTERVIEW";
    weightage: number;
    name?: string | null | undefined;
    instructions?: string | null | undefined;
    passingScore?: number | null | undefined;
}>;
export declare const updateModuleSchema: z.ZodObject<{
    order: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeLimit: z.ZodOptional<z.ZodNumber>;
    weightage: z.ZodOptional<z.ZodNumber>;
    config: z.ZodOptional<z.ZodUnion<[z.ZodObject<{
        difficulty: z.ZodNativeEnum<{
            EASY: "EASY";
            MEDIUM: "MEDIUM";
            HARD: "HARD";
        }>;
        questionTypes: z.ZodArray<z.ZodNativeEnum<{
            QUANTITATIVE: "QUANTITATIVE";
            VERBAL: "VERBAL";
            LOGICAL: "LOGICAL";
        }>, "many">;
        numberOfQuestions: z.ZodNumber;
        marksPerQuestion: z.ZodNumber;
        negativeMarking: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    }, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    }>, z.ZodObject<{
        difficulty: z.ZodNativeEnum<{
            EASY: "EASY";
            MEDIUM: "MEDIUM";
            HARD: "HARD";
        }>;
        numberOfQuestions: z.ZodNumber;
        allowedLanguages: z.ZodArray<z.ZodString, "many">;
        partialScoring: z.ZodDefault<z.ZodBoolean>;
        maxScorePerQuestion: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring: boolean;
    }, {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring?: boolean | undefined;
    }>, z.ZodObject<{
        difficulty: z.ZodNativeEnum<{
            ENTRY: "ENTRY";
            MID: "MID";
            SENIOR: "SENIOR";
            LEAD: "LEAD";
        }>;
        jobTitle: z.ZodString;
        companyName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        focusAreas: z.ZodArray<z.ZodString, "many">;
        targetQuestions: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    }, {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    }>]>>;
    passingScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | null | undefined;
    isActive?: boolean | undefined;
    timeLimit?: number | undefined;
    order?: number | undefined;
    config?: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    } | {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring: boolean;
    } | {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    } | undefined;
    instructions?: string | null | undefined;
    weightage?: number | undefined;
    passingScore?: number | null | undefined;
}, {
    name?: string | null | undefined;
    isActive?: boolean | undefined;
    timeLimit?: number | undefined;
    order?: number | undefined;
    config?: {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        questionTypes: ("QUANTITATIVE" | "VERBAL" | "LOGICAL")[];
        numberOfQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
    } | {
        difficulty: "EASY" | "MEDIUM" | "HARD";
        numberOfQuestions: number;
        allowedLanguages: string[];
        maxScorePerQuestion: number;
        partialScoring?: boolean | undefined;
    } | {
        difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
        jobTitle: string;
        focusAreas: string[];
        targetQuestions: number;
        companyName?: string | null | undefined;
    } | undefined;
    instructions?: string | null | undefined;
    weightage?: number | undefined;
    passingScore?: number | null | undefined;
}>;
export declare const reorderModulesSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    modules: z.ZodArray<z.ZodObject<{
        moduleId: z.ZodString;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        order: number;
        moduleId: string;
    }, {
        order: number;
        moduleId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    modules: {
        order: number;
        moduleId: string;
    }[];
}, {
    modules: {
        order: number;
        moduleId: string;
    }[];
}>, {
    modules: {
        order: number;
        moduleId: string;
    }[];
}, {
    modules: {
        order: number;
        moduleId: string;
    }[];
}>, {
    modules: {
        order: number;
        moduleId: string;
    }[];
}, {
    modules: {
        order: number;
        moduleId: string;
    }[];
}>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type ReorderModulesInput = z.infer<typeof reorderModulesSchema>;
export type ListModulesQueryInput = z.infer<typeof listModulesQuerySchema>;
//# sourceMappingURL=modules.validation.d.ts.map
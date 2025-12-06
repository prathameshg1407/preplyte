import { z } from 'zod';
export declare const mockDriveIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        driveId: string;
    }, {
        driveId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        driveId: string;
    };
}, {
    params: {
        driveId: string;
    };
}>;
export declare const moduleIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
        driveId: string;
    }, {
        moduleId: string;
        driveId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
        driveId: string;
    };
}, {
    params: {
        moduleId: string;
        driveId: string;
    };
}>;
export declare const aptitudeAnswerSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
        driveId: string;
    }, {
        moduleId: string;
        driveId: string;
    }>;
    body: z.ZodObject<{
        questionId: z.ZodString;
        selectedOptionId: z.ZodString;
        timeSpent: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
        selectedOptionId: string;
        timeSpent?: number | undefined;
    }, {
        questionId: string;
        selectedOptionId: string;
        timeSpent?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        questionId: string;
        selectedOptionId: string;
        timeSpent?: number | undefined;
    };
}, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        questionId: string;
        selectedOptionId: string;
        timeSpent?: number | undefined;
    };
}>;
export declare const aptitudeClearSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
        driveId: string;
    }, {
        moduleId: string;
        driveId: string;
    }>;
    body: z.ZodObject<{
        questionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
    }, {
        questionId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        questionId: string;
    };
}, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        questionId: string;
    };
}>;
export declare const aptitudeMarkReviewSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
        driveId: string;
    }, {
        moduleId: string;
        driveId: string;
    }>;
    body: z.ZodObject<{
        questionId: z.ZodString;
        isMarked: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
        isMarked: boolean;
    }, {
        questionId: string;
        isMarked?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        questionId: string;
        isMarked: boolean;
    };
}, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        questionId: string;
        isMarked?: boolean | undefined;
    };
}>;
export declare const machineSubmitSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
        driveId: string;
    }, {
        moduleId: string;
        driveId: string;
    }>;
    body: z.ZodObject<{
        questionId: z.ZodString;
        code: z.ZodString;
        languageId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        code: string;
        questionId: string;
        languageId: number;
    }, {
        code: string;
        questionId: string;
        languageId: number;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        code: string;
        questionId: string;
        languageId: number;
    };
}, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        code: string;
        questionId: string;
        languageId: number;
    };
}>;
export declare const machineRunSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
        driveId: string;
    }, {
        moduleId: string;
        driveId: string;
    }>;
    body: z.ZodObject<{
        questionId: z.ZodString;
        code: z.ZodString;
        languageId: z.ZodNumber;
        customInput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        questionId: string;
        languageId: number;
        customInput?: string | undefined;
    }, {
        code: string;
        questionId: string;
        languageId: number;
        customInput?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        code: string;
        questionId: string;
        languageId: number;
        customInput?: string | undefined;
    };
}, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        code: string;
        questionId: string;
        languageId: number;
        customInput?: string | undefined;
    };
}>;
export declare const interviewRespondSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
        driveId: string;
    }, {
        moduleId: string;
        driveId: string;
    }>;
    body: z.ZodObject<{
        answer: z.ZodString;
        timeTaken: z.ZodOptional<z.ZodNumber>;
        audioBuffer: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        answer: string;
        timeTaken?: number | undefined;
        audioBuffer?: string | undefined;
    }, {
        answer: string;
        timeTaken?: number | undefined;
        audioBuffer?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        answer: string;
        timeTaken?: number | undefined;
        audioBuffer?: string | undefined;
    };
}, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        answer: string;
        timeTaken?: number | undefined;
        audioBuffer?: string | undefined;
    };
}>;
export declare const interviewSkipSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
        driveId: string;
    }, {
        moduleId: string;
        driveId: string;
    }>;
    body: z.ZodObject<{
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reason?: string | undefined;
    }, {
        reason?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        reason?: string | undefined;
    };
}, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        reason?: string | undefined;
    };
}>;
export declare const interviewAudioChunkSchema: z.ZodObject<{
    params: z.ZodObject<{
        driveId: z.ZodString;
        moduleId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        moduleId: string;
        driveId: string;
    }, {
        moduleId: string;
        driveId: string;
    }>;
    body: z.ZodObject<{
        chunk: z.ZodString;
        isFinal: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isFinal: boolean;
        chunk: string;
    }, {
        chunk: string;
        isFinal?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        isFinal: boolean;
        chunk: string;
    };
}, {
    params: {
        moduleId: string;
        driveId: string;
    };
    body: {
        chunk: string;
        isFinal?: boolean | undefined;
    };
}>;
export type MockDriveIdInput = z.infer<typeof mockDriveIdSchema>;
export type ModuleIdInput = z.infer<typeof moduleIdSchema>;
export type AptitudeAnswerInput = z.infer<typeof aptitudeAnswerSchema>;
export type AptitudeClearInput = z.infer<typeof aptitudeClearSchema>;
export type AptitudeMarkReviewInput = z.infer<typeof aptitudeMarkReviewSchema>;
export type MachineSubmitInput = z.infer<typeof machineSubmitSchema>;
export type MachineRunInput = z.infer<typeof machineRunSchema>;
export type InterviewRespondInput = z.infer<typeof interviewRespondSchema>;
export type InterviewSkipInput = z.infer<typeof interviewSkipSchema>;
export type InterviewAudioChunkInput = z.infer<typeof interviewAudioChunkSchema>;
//# sourceMappingURL=attempt.validation.d.ts.map
import { z } from 'zod';
export declare const proctoringSettingsSchema: z.ZodObject<{
    detectTabSwitch: z.ZodDefault<z.ZodBoolean>;
    maxTabSwitches: z.ZodDefault<z.ZodNumber>;
    requireFullscreen: z.ZodDefault<z.ZodBoolean>;
    detectCopyPaste: z.ZodDefault<z.ZodBoolean>;
    webcamRequired: z.ZodDefault<z.ZodBoolean>;
    screenshareRequired: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    detectTabSwitch: boolean;
    maxTabSwitches: number;
    requireFullscreen: boolean;
    detectCopyPaste: boolean;
    webcamRequired: boolean;
    screenshareRequired: boolean;
}, {
    detectTabSwitch?: boolean | undefined;
    maxTabSwitches?: number | undefined;
    requireFullscreen?: boolean | undefined;
    detectCopyPaste?: boolean | undefined;
    webcamRequired?: boolean | undefined;
    screenshareRequired?: boolean | undefined;
}>;
export declare const createMockDriveSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    instructions: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    registrationStartDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    registrationEndDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    maxRegistrations: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    driveStartDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    driveEndDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    allowLateSubmission: z.ZodDefault<z.ZodBoolean>;
    showLeaderboard: z.ZodDefault<z.ZodBoolean>;
    showResultsImmediately: z.ZodDefault<z.ZodBoolean>;
    resultsReleaseDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    shuffleQuestions: z.ZodDefault<z.ZodBoolean>;
    enableProctoring: z.ZodDefault<z.ZodBoolean>;
    proctoringSettings: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        detectTabSwitch: z.ZodDefault<z.ZodBoolean>;
        maxTabSwitches: z.ZodDefault<z.ZodNumber>;
        requireFullscreen: z.ZodDefault<z.ZodBoolean>;
        detectCopyPaste: z.ZodDefault<z.ZodBoolean>;
        webcamRequired: z.ZodDefault<z.ZodBoolean>;
        screenshareRequired: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    }, {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    allowLateSubmission: boolean;
    showLeaderboard: boolean;
    showResultsImmediately: boolean;
    shuffleQuestions: boolean;
    enableProctoring: boolean;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: Date | null | undefined;
    registrationEndDate?: Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: Date | null | undefined;
    driveEndDate?: Date | null | undefined;
    resultsReleaseDate?: Date | null | undefined;
    proctoringSettings?: {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    } | null | undefined;
}, {
    title: string;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: string | Date | null | undefined;
    registrationEndDate?: string | Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: string | Date | null | undefined;
    driveEndDate?: string | Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: string | Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    } | null | undefined;
}>, {
    title: string;
    allowLateSubmission: boolean;
    showLeaderboard: boolean;
    showResultsImmediately: boolean;
    shuffleQuestions: boolean;
    enableProctoring: boolean;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: Date | null | undefined;
    registrationEndDate?: Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: Date | null | undefined;
    driveEndDate?: Date | null | undefined;
    resultsReleaseDate?: Date | null | undefined;
    proctoringSettings?: {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    } | null | undefined;
}, {
    title: string;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: string | Date | null | undefined;
    registrationEndDate?: string | Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: string | Date | null | undefined;
    driveEndDate?: string | Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: string | Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    } | null | undefined;
}>, {
    title: string;
    allowLateSubmission: boolean;
    showLeaderboard: boolean;
    showResultsImmediately: boolean;
    shuffleQuestions: boolean;
    enableProctoring: boolean;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: Date | null | undefined;
    registrationEndDate?: Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: Date | null | undefined;
    driveEndDate?: Date | null | undefined;
    resultsReleaseDate?: Date | null | undefined;
    proctoringSettings?: {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    } | null | undefined;
}, {
    title: string;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: string | Date | null | undefined;
    registrationEndDate?: string | Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: string | Date | null | undefined;
    driveEndDate?: string | Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: string | Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    } | null | undefined;
}>, {
    title: string;
    allowLateSubmission: boolean;
    showLeaderboard: boolean;
    showResultsImmediately: boolean;
    shuffleQuestions: boolean;
    enableProctoring: boolean;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: Date | null | undefined;
    registrationEndDate?: Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: Date | null | undefined;
    driveEndDate?: Date | null | undefined;
    resultsReleaseDate?: Date | null | undefined;
    proctoringSettings?: {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    } | null | undefined;
}, {
    title: string;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: string | Date | null | undefined;
    registrationEndDate?: string | Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: string | Date | null | undefined;
    driveEndDate?: string | Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: string | Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    } | null | undefined;
}>, {
    title: string;
    allowLateSubmission: boolean;
    showLeaderboard: boolean;
    showResultsImmediately: boolean;
    shuffleQuestions: boolean;
    enableProctoring: boolean;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: Date | null | undefined;
    registrationEndDate?: Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: Date | null | undefined;
    driveEndDate?: Date | null | undefined;
    resultsReleaseDate?: Date | null | undefined;
    proctoringSettings?: {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    } | null | undefined;
}, {
    title: string;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: string | Date | null | undefined;
    registrationEndDate?: string | Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: string | Date | null | undefined;
    driveEndDate?: string | Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: string | Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    } | null | undefined;
}>;
export declare const updateMockDriveSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    instructions: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    registrationStartDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    registrationEndDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    maxRegistrations: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    driveStartDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    driveEndDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    allowLateSubmission: z.ZodOptional<z.ZodBoolean>;
    showLeaderboard: z.ZodOptional<z.ZodBoolean>;
    showResultsImmediately: z.ZodOptional<z.ZodBoolean>;
    resultsReleaseDate: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
    shuffleQuestions: z.ZodOptional<z.ZodBoolean>;
    enableProctoring: z.ZodOptional<z.ZodBoolean>;
    proctoringSettings: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        detectTabSwitch: z.ZodDefault<z.ZodBoolean>;
        maxTabSwitches: z.ZodDefault<z.ZodNumber>;
        requireFullscreen: z.ZodDefault<z.ZodBoolean>;
        detectCopyPaste: z.ZodDefault<z.ZodBoolean>;
        webcamRequired: z.ZodDefault<z.ZodBoolean>;
        screenshareRequired: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    }, {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    }>>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        DRAFT: "DRAFT";
        PUBLISHED: "PUBLISHED";
        REGISTRATION_OPEN: "REGISTRATION_OPEN";
        REGISTRATION_CLOSED: "REGISTRATION_CLOSED";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | undefined;
    title?: string | undefined;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: Date | null | undefined;
    registrationEndDate?: Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: Date | null | undefined;
    driveEndDate?: Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    } | null | undefined;
}, {
    status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | undefined;
    title?: string | undefined;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: string | Date | null | undefined;
    registrationEndDate?: string | Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: string | Date | null | undefined;
    driveEndDate?: string | Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: string | Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    } | null | undefined;
}>, {
    status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | undefined;
    title?: string | undefined;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: Date | null | undefined;
    registrationEndDate?: Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: Date | null | undefined;
    driveEndDate?: Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    } | null | undefined;
}, {
    status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | undefined;
    title?: string | undefined;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: string | Date | null | undefined;
    registrationEndDate?: string | Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: string | Date | null | undefined;
    driveEndDate?: string | Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: string | Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    } | null | undefined;
}>, {
    status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | undefined;
    title?: string | undefined;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: Date | null | undefined;
    registrationEndDate?: Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: Date | null | undefined;
    driveEndDate?: Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch: boolean;
        maxTabSwitches: number;
        requireFullscreen: boolean;
        detectCopyPaste: boolean;
        webcamRequired: boolean;
        screenshareRequired: boolean;
    } | null | undefined;
}, {
    status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | undefined;
    title?: string | undefined;
    description?: string | null | undefined;
    instructions?: string | null | undefined;
    registrationStartDate?: string | Date | null | undefined;
    registrationEndDate?: string | Date | null | undefined;
    maxRegistrations?: number | null | undefined;
    driveStartDate?: string | Date | null | undefined;
    driveEndDate?: string | Date | null | undefined;
    allowLateSubmission?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    showResultsImmediately?: boolean | undefined;
    resultsReleaseDate?: string | Date | null | undefined;
    shuffleQuestions?: boolean | undefined;
    enableProctoring?: boolean | undefined;
    proctoringSettings?: {
        detectTabSwitch?: boolean | undefined;
        maxTabSwitches?: number | undefined;
        requireFullscreen?: boolean | undefined;
        detectCopyPaste?: boolean | undefined;
        webcamRequired?: boolean | undefined;
        screenshareRequired?: boolean | undefined;
    } | null | undefined;
}>;
export declare const listMockDrivesQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<{
        DRAFT: "DRAFT";
        PUBLISHED: "PUBLISHED";
        REGISTRATION_OPEN: "REGISTRATION_OPEN";
        REGISTRATION_CLOSED: "REGISTRATION_CLOSED";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "title", "driveStartDate", "registrationEndDate"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "title" | "registrationEndDate" | "driveStartDate";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | undefined;
}, {
    search?: string | undefined;
    status?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "title" | "registrationEndDate" | "driveStartDate" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const mockDriveIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type CreateMockDriveInput = z.infer<typeof createMockDriveSchema>;
export type UpdateMockDriveInput = z.infer<typeof updateMockDriveSchema>;
export type ListMockDrivesQueryInput = z.infer<typeof listMockDrivesQuerySchema>;
export type ProctoringSettingsInput = z.infer<typeof proctoringSettingsSchema>;
//# sourceMappingURL=mockdrive.validation.d.ts.map
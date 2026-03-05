import { z } from 'zod';
export declare const createSessionSchema: z.ZodObject<{
    resumeId: z.ZodOptional<z.ZodString>;
    jobTitle: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    companyName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    difficulty: z.ZodDefault<z.ZodOptional<z.ZodEnum<["ENTRY", "MID", "SENIOR", "LEAD"]>>>;
    focusAreas: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    targetQuestions: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    difficulty: "ENTRY" | "MID" | "SENIOR" | "LEAD";
    jobTitle: string;
    focusAreas: string[];
    targetQuestions: number;
    resumeId?: string | undefined;
    companyName?: string | null | undefined;
}, {
    difficulty?: "ENTRY" | "MID" | "SENIOR" | "LEAD" | undefined;
    resumeId?: string | undefined;
    jobTitle?: string | undefined;
    companyName?: string | null | undefined;
    focusAreas?: string[] | undefined;
    targetQuestions?: number | undefined;
}>;
export declare const updateSessionSchema: z.ZodObject<{
    jobTitle: z.ZodOptional<z.ZodString>;
    companyName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    difficulty: z.ZodOptional<z.ZodEnum<["ENTRY", "MID", "SENIOR", "LEAD"]>>;
    focusAreas: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    targetQuestions: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    difficulty?: "ENTRY" | "MID" | "SENIOR" | "LEAD" | undefined;
    jobTitle?: string | undefined;
    companyName?: string | null | undefined;
    focusAreas?: string[] | undefined;
    targetQuestions?: number | undefined;
}, {
    difficulty?: "ENTRY" | "MID" | "SENIOR" | "LEAD" | undefined;
    jobTitle?: string | undefined;
    companyName?: string | null | undefined;
    focusAreas?: string[] | undefined;
    targetQuestions?: number | undefined;
}>;
export declare const sessionListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    pageSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<["CREATED", "STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "FAILED"]>>;
    difficulty: z.ZodOptional<z.ZodEnum<["ENTRY", "MID", "SENIOR", "LEAD"]>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["createdAt", "completedAt", "overallScore"]>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    sortBy: "createdAt" | "completedAt" | "overallScore";
    sortOrder: "asc" | "desc";
    pageSize: number;
    status?: "FAILED" | "CREATED" | "STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
    difficulty?: "ENTRY" | "MID" | "SENIOR" | "LEAD" | undefined;
}, {
    status?: "FAILED" | "CREATED" | "STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "completedAt" | "overallScore" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    difficulty?: "ENTRY" | "MID" | "SENIOR" | "LEAD" | undefined;
    pageSize?: number | undefined;
}>;
export declare const sessionIdParamSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
export declare const wsMessageSchema: z.ZodObject<{
    type: z.ZodString;
    data: z.ZodOptional<z.ZodUnknown>;
    timestamp: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: string;
    timestamp?: number | undefined;
    data?: unknown;
}, {
    type: string;
    timestamp?: number | undefined;
    data?: unknown;
}>;
export declare const audioChunkSchema: z.ZodObject<{
    type: z.ZodLiteral<"audio_chunk">;
    data: z.ZodUnion<[z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>, z.ZodString]>;
}, "strip", z.ZodTypeAny, {
    data: string | Buffer<ArrayBufferLike>;
    type: "audio_chunk";
}, {
    data: string | Buffer<ArrayBufferLike>;
    type: "audio_chunk";
}>;
export declare const endInterviewSchema: z.ZodObject<{
    type: z.ZodLiteral<"end_interview">;
    reason: z.ZodDefault<z.ZodOptional<z.ZodEnum<["completed", "cancelled", "timeout"]>>>;
}, "strip", z.ZodTypeAny, {
    type: "end_interview";
    reason: "completed" | "timeout" | "cancelled";
}, {
    type: "end_interview";
    reason?: "completed" | "timeout" | "cancelled" | undefined;
}>;
export declare const submitResponseSchema: z.ZodObject<{
    questionId: z.ZodString;
    answer: z.ZodString;
    audioUrl: z.ZodOptional<z.ZodString>;
    timeTakenSeconds: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    questionId: string;
    answer: string;
    timeTakenSeconds?: number | undefined;
    audioUrl?: string | undefined;
}, {
    questionId: string;
    answer: string;
    timeTakenSeconds?: number | undefined;
    audioUrl?: string | undefined;
}>;
export declare const feedbackQuerySchema: z.ZodObject<{
    includeQuestionDetails: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeRecommendations: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeQuestionDetails: boolean;
    includeRecommendations: boolean;
}, {
    includeQuestionDetails?: boolean | undefined;
    includeRecommendations?: boolean | undefined;
}>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionListQuery = z.infer<typeof sessionListQuerySchema>;
export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;
export type WSMessage = z.infer<typeof wsMessageSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type FeedbackQuery = z.infer<typeof feedbackQuerySchema>;
export declare function parseCreateSession(data: unknown): CreateSessionInput;
export declare function parseUpdateSession(data: unknown): UpdateSessionInput;
export declare function parseSessionListQuery(data: unknown): SessionListQuery;
export declare function parseSessionId(value: unknown): string;
export declare function parseWSMessage(data: unknown): WSMessage;
export declare function parseSubmitResponse(data: unknown): SubmitResponseInput;
export declare function validateAudioBuffer(buffer: Buffer): {
    valid: boolean;
    error?: string;
};
export declare function validateSessionStatus(currentStatus: string, allowedStatuses: string[]): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=interview.validation.d.ts.map
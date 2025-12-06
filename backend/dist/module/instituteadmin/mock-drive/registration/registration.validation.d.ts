import { z } from 'zod';
export declare const updateRegistrationSchema: z.ZodObject<{
    status: z.ZodNativeEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        WITHDRAWN: "WITHDRAWN";
    }>;
    adminNotes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
    adminNotes?: string | null | undefined;
}, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
    adminNotes?: string | null | undefined;
}>;
export declare const bulkUpdateRegistrationSchema: z.ZodEffects<z.ZodObject<{
    registrationIds: z.ZodArray<z.ZodString, "many">;
    status: z.ZodEnum<["APPROVED", "REJECTED"]>;
    adminNotes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "APPROVED" | "REJECTED";
    registrationIds: string[];
    adminNotes?: string | null | undefined;
}, {
    status: "APPROVED" | "REJECTED";
    registrationIds: string[];
    adminNotes?: string | null | undefined;
}>, {
    status: "APPROVED" | "REJECTED";
    registrationIds: string[];
    adminNotes?: string | null | undefined;
}, {
    status: "APPROVED" | "REJECTED";
    registrationIds: string[];
    adminNotes?: string | null | undefined;
}>;
export declare const listRegistrationsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        WITHDRAWN: "WITHDRAWN";
    }>>;
    batchId: z.ZodOptional<z.ZodString>;
    hasBatch: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodString, boolean, string>]>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["registeredAt", "studentName", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "status" | "registeredAt" | "studentName";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" | undefined;
    batchId?: string | undefined;
    hasBatch?: boolean | undefined;
}, {
    search?: string | undefined;
    status?: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "registeredAt" | "studentName" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    batchId?: string | undefined;
    hasBatch?: string | boolean | undefined;
}>;
export declare const registrationIdParamSchema: z.ZodObject<{
    id: z.ZodString;
    regId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    regId: string;
}, {
    id: string;
    regId: string;
}>;
export declare const mockDriveIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type BulkUpdateRegistrationInput = z.infer<typeof bulkUpdateRegistrationSchema>;
export type ListRegistrationsQueryInput = z.infer<typeof listRegistrationsQuerySchema>;
//# sourceMappingURL=registration.validation.d.ts.map
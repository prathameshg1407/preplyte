import { z } from 'zod';
export declare const mockDriveIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const batchIdParamSchema: z.ZodObject<{
    id: z.ZodString;
    batchId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    batchId: string;
}, {
    id: string;
    batchId: string;
}>;
export declare const createBatchSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    scheduledStartTime: z.ZodDate;
    scheduledEndTime: z.ZodDate;
    maxCapacity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}, {
    name: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}>, {
    name: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}, {
    name: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}>, {
    name: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}, {
    name: string;
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const updateBatchSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    scheduledStartTime: z.ZodOptional<z.ZodDate>;
    scheduledEndTime: z.ZodOptional<z.ZodDate>;
    maxCapacity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        CREATED: "CREATED";
        SCHEDULED: "SCHEDULED";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "CREATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SCHEDULED" | undefined;
    name?: string | undefined;
    scheduledStartTime?: Date | undefined;
    scheduledEndTime?: Date | undefined;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}, {
    status?: "CREATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SCHEDULED" | undefined;
    name?: string | undefined;
    scheduledStartTime?: Date | undefined;
    scheduledEndTime?: Date | undefined;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}>, {
    status?: "CREATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SCHEDULED" | undefined;
    name?: string | undefined;
    scheduledStartTime?: Date | undefined;
    scheduledEndTime?: Date | undefined;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}, {
    status?: "CREATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SCHEDULED" | undefined;
    name?: string | undefined;
    scheduledStartTime?: Date | undefined;
    scheduledEndTime?: Date | undefined;
    maxCapacity?: number | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const autoCreateBatchesSchema: z.ZodEffects<z.ZodObject<{
    batchSize: z.ZodNumber;
    startTime: z.ZodDate;
    intervalMinutes: z.ZodNumber;
    prefix: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    batchSize: number;
    startTime: Date;
    intervalMinutes: number;
    prefix: string;
}, {
    batchSize: number;
    startTime: Date;
    intervalMinutes: number;
    prefix?: string | undefined;
}>, {
    batchSize: number;
    startTime: Date;
    intervalMinutes: number;
    prefix: string;
}, {
    batchSize: number;
    startTime: Date;
    intervalMinutes: number;
    prefix?: string | undefined;
}>;
export declare const assignStudentsSchema: z.ZodObject<{
    registrationIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    registrationIds: string[];
}, {
    registrationIds: string[];
}>;
export declare const listBatchesQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        CREATED: "CREATED";
        SCHEDULED: "SCHEDULED";
        IN_PROGRESS: "IN_PROGRESS";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
    sortBy: z.ZodDefault<z.ZodEnum<["scheduledStartTime", "batchNumber", "createdAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "scheduledStartTime" | "batchNumber";
    sortOrder: "asc" | "desc";
    status?: "CREATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SCHEDULED" | undefined;
}, {
    status?: "CREATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SCHEDULED" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "scheduledStartTime" | "batchNumber" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
export type AutoCreateBatchesInput = z.infer<typeof autoCreateBatchesSchema>;
export type AssignStudentsInput = z.infer<typeof assignStudentsSchema>;
export type ListBatchesQueryInput = z.infer<typeof listBatchesQuerySchema>;
//# sourceMappingURL=batch.validation.d.ts.map
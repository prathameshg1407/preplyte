import { z } from 'zod';
export declare const discoveryListSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
        limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodNumber>;
        status: z.ZodOptional<z.ZodPipeline<z.ZodUnion<[z.ZodEffects<z.ZodString, string[], string>, z.ZodArray<z.ZodString, "many">]>, z.ZodArray<z.ZodNativeEnum<{
            DRAFT: "DRAFT";
            PUBLISHED: "PUBLISHED";
            REGISTRATION_OPEN: "REGISTRATION_OPEN";
            REGISTRATION_CLOSED: "REGISTRATION_CLOSED";
            IN_PROGRESS: "IN_PROGRESS";
            COMPLETED: "COMPLETED";
            CANCELLED: "CANCELLED";
        }>, "many">>>;
        instituteId: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        registrationOpen: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        registrationOpen: boolean;
        search?: string | undefined;
        instituteId?: string | undefined;
        status?: ("IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED")[] | undefined;
    }, {
        search?: string | undefined;
        instituteId?: string | undefined;
        status?: string | string[] | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        registrationOpen?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        registrationOpen: boolean;
        search?: string | undefined;
        instituteId?: string | undefined;
        status?: ("IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED")[] | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        instituteId?: string | undefined;
        status?: string | string[] | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        registrationOpen?: string | undefined;
    };
}>;
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
export type DiscoveryListInput = z.infer<typeof discoveryListSchema>;
export type MockDriveIdInput = z.infer<typeof mockDriveIdSchema>;
//# sourceMappingURL=discovery.validation.d.ts.map
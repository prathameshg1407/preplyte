import { z } from 'zod';
export declare const createInstituteSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        domain: z.ZodString;
        isActive: z.ZodDefault<z.ZodBoolean>;
        profile: z.ZodOptional<z.ZodObject<{
            logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        }, {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        domain: string;
        name: string;
        isActive: boolean;
        profile?: {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        } | undefined;
    }, {
        domain: string;
        name: string;
        profile?: {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        } | undefined;
        isActive?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        domain: string;
        name: string;
        isActive: boolean;
        profile?: {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        } | undefined;
    };
}, {
    body: {
        domain: string;
        name: string;
        profile?: {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        } | undefined;
        isActive?: boolean | undefined;
    };
}>;
export declare const updateInstituteSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        domain: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodBoolean>;
        profile: z.ZodOptional<z.ZodObject<{
            logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            location: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        }, {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        profile?: {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        } | undefined;
        domain?: string | undefined;
        name?: string | undefined;
        isActive?: boolean | undefined;
    }, {
        profile?: {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        } | undefined;
        domain?: string | undefined;
        name?: string | undefined;
        isActive?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        profile?: {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        } | undefined;
        domain?: string | undefined;
        name?: string | undefined;
        isActive?: boolean | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        profile?: {
            logoUrl?: string | null | undefined;
            location?: string | null | undefined;
        } | undefined;
        domain?: string | undefined;
        name?: string | undefined;
        isActive?: boolean | undefined;
    };
}>;
export declare const instituteIdSchema: z.ZodObject<{
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
export declare const instituteFiltersSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        search: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false"]>, boolean, "true" | "false">>;
        sortBy: z.ZodDefault<z.ZodEnum<["name", "createdAt", "totalStudents"]>>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortBy: "name" | "createdAt" | "totalStudents";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        isActive?: boolean | undefined;
    }, {
        search?: string | undefined;
        isActive?: "true" | "false" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: "name" | "createdAt" | "totalStudents" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        sortBy: "name" | "createdAt" | "totalStudents";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        isActive?: boolean | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        isActive?: "true" | "false" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: "name" | "createdAt" | "totalStudents" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    };
}>;
export declare const instituteStudentsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        search: z.ZodOptional<z.ZodString>;
        departmentId: z.ZodOptional<z.ZodString>;
        courseYear: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false"]>, boolean, "true" | "false">>;
        sortBy: z.ZodDefault<z.ZodEnum<["name", "email", "createdAt", "averageCgpa"]>>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortBy: "email" | "name" | "createdAt" | "averageCgpa";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        isActive?: boolean | undefined;
        departmentId?: string | undefined;
        courseYear?: string | undefined;
    }, {
        search?: string | undefined;
        isActive?: "true" | "false" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: "email" | "name" | "createdAt" | "averageCgpa" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        departmentId?: string | undefined;
        courseYear?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        sortBy: "email" | "name" | "createdAt" | "averageCgpa";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        isActive?: boolean | undefined;
        departmentId?: string | undefined;
        courseYear?: string | undefined;
    };
    params: {
        id: string;
    };
}, {
    query: {
        search?: string | undefined;
        isActive?: "true" | "false" | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: "email" | "name" | "createdAt" | "averageCgpa" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        departmentId?: string | undefined;
        courseYear?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        role: z.ZodDefault<z.ZodNativeEnum<{
            PLATFORM_ADMIN: "PLATFORM_ADMIN";
            INSTITUTE_ADMIN: "INSTITUTE_ADMIN";
            USER: "USER";
        }>>;
        instituteId: z.ZodOptional<z.ZodString>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        isActive: boolean;
        password: string;
        role: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER";
        name?: string | undefined;
        instituteId?: string | undefined;
    }, {
        email: string;
        password: string;
        name?: string | undefined;
        isActive?: boolean | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        isActive: boolean;
        password: string;
        role: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER";
        name?: string | undefined;
        instituteId?: string | undefined;
    };
}, {
    body: {
        email: string;
        password: string;
        name?: string | undefined;
        isActive?: boolean | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | undefined;
    };
}>;
export declare const updateUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        email: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodNativeEnum<{
            PLATFORM_ADMIN: "PLATFORM_ADMIN";
            INSTITUTE_ADMIN: "INSTITUTE_ADMIN";
            USER: "USER";
        }>>;
        instituteId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        name?: string | null | undefined;
        isActive?: boolean | undefined;
        password?: string | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | null | undefined;
    }, {
        email?: string | undefined;
        name?: string | null | undefined;
        isActive?: boolean | undefined;
        password?: string | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        email?: string | undefined;
        name?: string | null | undefined;
        isActive?: boolean | undefined;
        password?: string | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | null | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        email?: string | undefined;
        name?: string | null | undefined;
        isActive?: boolean | undefined;
        password?: string | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | null | undefined;
    };
}>;
export declare const userIdSchema: z.ZodObject<{
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
export declare const userFiltersSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        search: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodNativeEnum<{
            PLATFORM_ADMIN: "PLATFORM_ADMIN";
            INSTITUTE_ADMIN: "INSTITUTE_ADMIN";
            USER: "USER";
        }>>;
        instituteId: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false"]>, boolean, "true" | "false">>;
        hasProfile: z.ZodOptional<z.ZodEffects<z.ZodEnum<["true", "false"]>, boolean, "true" | "false">>;
        sortBy: z.ZodDefault<z.ZodEnum<["name", "email", "createdAt", "lastLoginAt"]>>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        sortBy: "email" | "name" | "createdAt" | "lastLoginAt";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        isActive?: boolean | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | undefined;
        hasProfile?: boolean | undefined;
    }, {
        search?: string | undefined;
        isActive?: "true" | "false" | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: "email" | "name" | "createdAt" | "lastLoginAt" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        hasProfile?: "true" | "false" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        sortBy: "email" | "name" | "createdAt" | "lastLoginAt";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        isActive?: boolean | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | undefined;
        hasProfile?: boolean | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        isActive?: "true" | "false" | undefined;
        role?: "PLATFORM_ADMIN" | "INSTITUTE_ADMIN" | "USER" | undefined;
        instituteId?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
        sortBy?: "email" | "name" | "createdAt" | "lastLoginAt" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        hasProfile?: "true" | "false" | undefined;
    };
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        newPassword: string;
    }, {
        newPassword: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        newPassword: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        newPassword: string;
    };
}>;
export declare const dateRangeSchema: z.ZodObject<{
    query: z.ZodEffects<z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>, {
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
}, {
    query: {
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
}>;
export declare const reportFiltersSchema: z.ZodObject<{
    query: z.ZodEffects<z.ZodObject<{
        instituteId: z.ZodOptional<z.ZodString>;
        format: z.ZodDefault<z.ZodEnum<["json", "csv"]>>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        format: "json" | "csv";
        instituteId?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        format?: "json" | "csv" | undefined;
        instituteId?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>, {
        format: "json" | "csv";
        instituteId?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        format?: "json" | "csv" | undefined;
        instituteId?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        format: "json" | "csv";
        instituteId?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
}, {
    query: {
        format?: "json" | "csv" | undefined;
        instituteId?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
}>;
export type CreateInstituteDto = z.infer<typeof createInstituteSchema>['body'];
export type UpdateInstituteDto = z.infer<typeof updateInstituteSchema>['body'];
export type InstituteFiltersDto = z.infer<typeof instituteFiltersSchema>['query'];
export type StudentFiltersDto = z.infer<typeof instituteStudentsSchema>['query'];
export type CreateUserDto = z.infer<typeof createUserSchema>['body'];
export type UpdateUserDto = z.infer<typeof updateUserSchema>['body'];
export type UserFiltersDto = z.infer<typeof userFiltersSchema>['query'];
export type ReportFiltersDto = z.infer<typeof reportFiltersSchema>['query'];
export type DateRangeDto = z.infer<typeof dateRangeSchema>['query'];
//# sourceMappingURL=admin.validation.d.ts.map
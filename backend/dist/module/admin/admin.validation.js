"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportFiltersSchema = exports.dateRangeSchema = exports.resetPasswordSchema = exports.userFiltersSchema = exports.userIdSchema = exports.updateUserSchema = exports.createUserSchema = exports.instituteStudentsSchema = exports.instituteFiltersSchema = exports.instituteIdSchema = exports.updateInstituteSchema = exports.createInstituteSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// =====================================================
// SHARED SCHEMAS
// =====================================================
const cuid = zod_1.z.string().cuid();
const pagination = {
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
};
const booleanString = zod_1.z.enum(['true', 'false']).transform((v) => v === 'true');
const domain = zod_1.z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, 'Invalid domain format');
const password = zod_1.z.string().min(8).max(100);
const dateRange = {
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
};
const dateRangeRefinement = {
    refine: (data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.startDate) <= new Date(data.endDate);
        }
        return true;
    },
    message: 'startDate must be before or equal to endDate',
};
// =====================================================
// INSTITUTE SCHEMAS
// =====================================================
const instituteProfile = zod_1.z.object({
    logoUrl: zod_1.z.string().url().nullable().optional(),
    location: zod_1.z.string().max(500).nullable().optional(),
});
exports.createInstituteSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(200),
        domain,
        isActive: zod_1.z.boolean().default(true),
        profile: instituteProfile.optional(),
    }),
});
exports.updateInstituteSchema = zod_1.z.object({
    params: zod_1.z.object({ id: cuid }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(200).optional(),
        domain: domain.optional(),
        isActive: zod_1.z.boolean().optional(),
        profile: instituteProfile.optional(),
    }),
});
exports.instituteIdSchema = zod_1.z.object({
    params: zod_1.z.object({ id: cuid }),
});
exports.instituteFiltersSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().max(200).optional(),
        isActive: booleanString.optional(),
        sortBy: zod_1.z.enum(['name', 'createdAt', 'totalStudents']).default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
        ...pagination,
    }),
});
exports.instituteStudentsSchema = zod_1.z.object({
    params: zod_1.z.object({ id: cuid }),
    query: zod_1.z.object({
        search: zod_1.z.string().max(200).optional(),
        department: zod_1.z.string().max(100).optional(),
        courseYear: zod_1.z.string().max(50).optional(),
        isActive: booleanString.optional(),
        sortBy: zod_1.z.enum(['name', 'email', 'createdAt', 'averageCgpa']).default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
        ...pagination,
    }),
});
// =====================================================
// USER SCHEMAS
// =====================================================
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email().max(255),
        password,
        name: zod_1.z.string().min(1).max(200).optional(),
        role: zod_1.z.nativeEnum(client_1.UserRole).default(client_1.UserRole.USER),
        instituteId: cuid.optional(),
        isActive: zod_1.z.boolean().default(true),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({ id: cuid }),
    body: zod_1.z.object({
        email: zod_1.z.string().email().max(255).optional(),
        password: password.optional(),
        name: zod_1.z.string().min(1).max(200).nullable().optional(),
        role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
        instituteId: cuid.nullable().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.userIdSchema = zod_1.z.object({
    params: zod_1.z.object({ id: cuid }),
});
exports.userFiltersSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().max(200).optional(),
        role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
        instituteId: cuid.optional(),
        isActive: booleanString.optional(),
        hasProfile: booleanString.optional(),
        sortBy: zod_1.z.enum(['name', 'email', 'createdAt', 'lastLoginAt']).default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
        ...pagination,
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    params: zod_1.z.object({ id: cuid }),
    body: zod_1.z.object({ newPassword: password }),
});
// =====================================================
// ANALYTICS & REPORTS SCHEMAS
// =====================================================
exports.dateRangeSchema = zod_1.z.object({
    query: zod_1.z.object(dateRange).refine(dateRangeRefinement.refine, dateRangeRefinement.message),
});
exports.reportFiltersSchema = zod_1.z.object({
    query: zod_1.z
        .object({
        ...dateRange,
        instituteId: cuid.optional(),
        format: zod_1.z.enum(['json', 'csv']).default('json'),
    })
        .refine(dateRangeRefinement.refine, dateRangeRefinement.message),
});
//# sourceMappingURL=admin.validation.js.map
import { z } from 'zod';
import { UserRole } from '@prisma/client';

// =====================================================
// SHARED SCHEMAS
// =====================================================

const cuid = z.string().cuid();

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

const booleanString = z.enum(['true', 'false']).transform((v) => v === 'true');

const domain = z
  .string()
  .min(3)
  .max(100)
  .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, 'Invalid domain format');

const password = z.string().min(8).max(100);

const dateRange = {
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
};

const dateRangeRefinement = {
  refine: (data: { startDate?: string; endDate?: string }) => {
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

const instituteProfile = z.object({
  logoUrl: z.string().url().nullable().optional(),
  location: z.string().max(500).nullable().optional(),
});

export const createInstituteSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    domain,
    isActive: z.boolean().default(true),
    profile: instituteProfile.optional(),
  }),
});

export const updateInstituteSchema = z.object({
  params: z.object({ id: cuid }),
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    domain: domain.optional(),
    isActive: z.boolean().optional(),
    profile: instituteProfile.optional(),
  }),
});

export const instituteIdSchema = z.object({
  params: z.object({ id: cuid }),
});

export const instituteFiltersSchema = z.object({
  query: z.object({
    search: z.string().max(200).optional(),
    isActive: booleanString.optional(),
    sortBy: z.enum(['name', 'createdAt', 'totalStudents']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    ...pagination,
  }),
});

export const instituteStudentsSchema = z.object({
  params: z.object({ id: cuid }),
  query: z.object({
    search: z.string().max(200).optional(),
    departmentId: z.string().max(100).optional(),
    courseYear: z.string().max(50).optional(),
    isActive: booleanString.optional(),
    sortBy: z.enum(['name', 'email', 'createdAt', 'averageCgpa']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    ...pagination,
  }),
});

// =====================================================
// USER SCHEMAS
// =====================================================

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email().max(255),
    password,
    name: z.string().min(1).max(200).optional(),
    role: z.nativeEnum(UserRole).default(UserRole.USER),
    instituteId: cuid.optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: cuid }),
  body: z.object({
    email: z.string().email().max(255).optional(),
    password: password.optional(),
    name: z.string().min(1).max(200).nullable().optional(),
    role: z.nativeEnum(UserRole).optional(),
    instituteId: cuid.nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({ id: cuid }),
});

export const userFiltersSchema = z.object({
  query: z.object({
    search: z.string().max(200).optional(),
    role: z.nativeEnum(UserRole).optional(),
    instituteId: cuid.optional(),
    isActive: booleanString.optional(),
    hasProfile: booleanString.optional(),
    sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    ...pagination,
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({ id: cuid }),
  body: z.object({ newPassword: password }),
});

// =====================================================
// ANALYTICS & REPORTS SCHEMAS
// =====================================================

export const dateRangeSchema = z.object({
  query: z.object(dateRange).refine(dateRangeRefinement.refine, dateRangeRefinement.message),
});

export const reportFiltersSchema = z.object({
  query: z
    .object({
      ...dateRange,
      instituteId: cuid.optional(),
      format: z.enum(['json', 'csv']).default('json'),
    })
    .refine(dateRangeRefinement.refine, dateRangeRefinement.message),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type CreateInstituteDto = z.infer<typeof createInstituteSchema>['body'];
export type UpdateInstituteDto = z.infer<typeof updateInstituteSchema>['body'];
export type InstituteFiltersDto = z.infer<typeof instituteFiltersSchema>['query'];
export type StudentFiltersDto = z.infer<typeof instituteStudentsSchema>['query'];
export type CreateUserDto = z.infer<typeof createUserSchema>['body'];
export type UpdateUserDto = z.infer<typeof updateUserSchema>['body'];
export type UserFiltersDto = z.infer<typeof userFiltersSchema>['query'];
export type ReportFiltersDto = z.infer<typeof reportFiltersSchema>['query'];
export type DateRangeDto = z.infer<typeof dateRangeSchema>['query'];
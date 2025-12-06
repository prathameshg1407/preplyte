"use strict";
// src/modules/instituteadmin/mock-drive/batch/batch.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBatchesQuerySchema = exports.assignStudentsSchema = exports.autoCreateBatchesSchema = exports.updateBatchSchema = exports.createBatchSchema = exports.batchIdParamSchema = exports.mockDriveIdParamSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// ============================================
// Constants
// ============================================
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
// ============================================
// Reusable Schemas
// ============================================
const cuidSchema = zod_1.z.string().cuid('Invalid ID format');
const dateSchema = zod_1.z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date format',
});
// ============================================
// Param Schemas
// ============================================
exports.mockDriveIdParamSchema = zod_1.z.object({
    id: cuidSchema,
});
exports.batchIdParamSchema = zod_1.z.object({
    id: cuidSchema,
    batchId: cuidSchema,
});
// ============================================
// Create Batch Schema
// ============================================
exports.createBatchSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .min(1, 'Batch name is required')
        .max(100, 'Batch name cannot exceed 100 characters')
        .trim(),
    scheduledStartTime: dateSchema,
    scheduledEndTime: dateSchema,
    maxCapacity: zod_1.z
        .number()
        .int('Capacity must be a whole number')
        .min(1, 'Capacity must be at least 1')
        .max(10000, 'Capacity cannot exceed 10000')
        .nullable()
        .optional(),
    notes: zod_1.z.string().max(1000, 'Notes cannot exceed 1000 characters').nullable().optional(),
})
    .refine((data) => data.scheduledEndTime > data.scheduledStartTime, {
    message: 'End time must be after start time',
    path: ['scheduledEndTime'],
})
    .refine((data) => data.scheduledStartTime > new Date(), {
    message: 'Scheduled start time must be in the future',
    path: ['scheduledStartTime'],
});
// ============================================
// Update Batch Schema
// ============================================
exports.updateBatchSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .min(1, 'Batch name cannot be empty')
        .max(100, 'Batch name cannot exceed 100 characters')
        .trim()
        .optional(),
    scheduledStartTime: dateSchema.optional(),
    scheduledEndTime: dateSchema.optional(),
    maxCapacity: zod_1.z
        .number()
        .int('Capacity must be a whole number')
        .min(1, 'Capacity must be at least 1')
        .max(10000, 'Capacity cannot exceed 10000')
        .nullable()
        .optional(),
    notes: zod_1.z.string().max(1000, 'Notes cannot exceed 1000 characters').nullable().optional(),
    status: zod_1.z.nativeEnum(client_1.MockDriveBatchStatus).optional(),
})
    .refine((data) => {
    if (data.scheduledStartTime && data.scheduledEndTime) {
        return data.scheduledEndTime > data.scheduledStartTime;
    }
    return true;
}, {
    message: 'End time must be after start time',
    path: ['scheduledEndTime'],
});
// ============================================
// Auto Create Batches Schema
// ============================================
exports.autoCreateBatchesSchema = zod_1.z
    .object({
    batchSize: zod_1.z
        .number()
        .int('Batch size must be a whole number')
        .min(1, 'Batch size must be at least 1')
        .max(500, 'Batch size cannot exceed 500'),
    startTime: dateSchema,
    intervalMinutes: zod_1.z
        .number()
        .int('Interval must be a whole number')
        .min(30, 'Interval must be at least 30 minutes')
        .max(1440, 'Interval cannot exceed 24 hours'),
    prefix: zod_1.z
        .string()
        .max(50, 'Prefix cannot exceed 50 characters')
        .trim()
        .default('Batch'),
})
    .refine((data) => data.startTime > new Date(), {
    message: 'Start time must be in the future',
    path: ['startTime'],
});
// ============================================
// Assign/Unassign Students Schema
// ============================================
exports.assignStudentsSchema = zod_1.z.object({
    registrationIds: zod_1.z
        .array(cuidSchema)
        .min(1, 'At least one registration is required')
        .max(500, 'Cannot process more than 500 students at once'),
});
// ============================================
// List Batches Query Schema
// ============================================
exports.listBatchesQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(DEFAULT_PAGE),
    limit: zod_1.z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    status: zod_1.z.nativeEnum(client_1.MockDriveBatchStatus).optional(),
    sortBy: zod_1.z.enum(['scheduledStartTime', 'batchNumber', 'createdAt']).default('scheduledStartTime'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
//# sourceMappingURL=batch.validation.js.map
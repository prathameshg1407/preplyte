"use strict";
// src/modules/instituteadmin/mock-drive/registration/registration.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDriveIdParamSchema = exports.registrationIdParamSchema = exports.listRegistrationsQuerySchema = exports.bulkUpdateRegistrationSchema = exports.updateRegistrationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const validation_utils_1 = require("../common/validation.utils");
// ============================================
// Update Registration Schema
// ============================================
exports.updateRegistrationSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.MockDriveRegistrationStatus, {
        errorMap: () => ({ message: 'Invalid registration status' }),
    }),
    adminNotes: validation_utils_1.notesSchema,
});
// ============================================
// Bulk Update Schema
// ============================================
exports.bulkUpdateRegistrationSchema = zod_1.z
    .object({
    registrationIds: zod_1.z
        .array(validation_utils_1.cuidSchema)
        .min(1, 'At least one registration is required')
        .max(100, 'Cannot update more than 100 registrations at once'),
    status: zod_1.z.enum([client_1.MockDriveRegistrationStatus.APPROVED, client_1.MockDriveRegistrationStatus.REJECTED], {
        errorMap: () => ({
            message: 'Bulk update only supports APPROVED or REJECTED status',
        }),
    }),
    adminNotes: validation_utils_1.notesSchema,
})
    .refine((data) => {
    // Ensure unique registration IDs
    return new Set(data.registrationIds).size === data.registrationIds.length;
}, {
    message: 'Duplicate registration IDs are not allowed',
    path: ['registrationIds'],
});
// ============================================
// List Query Schema
// ============================================
exports.listRegistrationsQuerySchema = validation_utils_1.paginationSchema.extend({
    status: zod_1.z.nativeEnum(client_1.MockDriveRegistrationStatus).optional(),
    batchId: validation_utils_1.cuidSchema.optional(),
    hasBatch: validation_utils_1.booleanQuerySchema,
    search: validation_utils_1.searchSchema,
    sortBy: zod_1.z.enum(['registeredAt', 'studentName', 'status']).default('registeredAt'),
    sortOrder: validation_utils_1.sortOrderSchema,
});
// ============================================
// Param Schemas
// ============================================
exports.registrationIdParamSchema = zod_1.z.object({
    id: validation_utils_1.cuidSchema,
    regId: validation_utils_1.cuidSchema,
});
exports.mockDriveIdParamSchema = zod_1.z.object({
    id: validation_utils_1.cuidSchema,
});
//# sourceMappingURL=registration.validation.js.map
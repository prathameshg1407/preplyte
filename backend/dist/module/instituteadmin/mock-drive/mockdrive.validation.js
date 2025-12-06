"use strict";
// src/modules/instituteadmin/mock-drive/mockdrive.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDriveIdParamSchema = exports.listMockDrivesQuerySchema = exports.updateMockDriveSchema = exports.createMockDriveSchema = exports.proctoringSettingsSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const validation_utils_1 = require("./common/validation.utils");
// ============================================
// Proctoring Settings Schema
// ============================================
exports.proctoringSettingsSchema = zod_1.z.object({
    detectTabSwitch: zod_1.z.boolean().default(true),
    maxTabSwitches: zod_1.z.number().int().min(0).max(100).default(3),
    requireFullscreen: zod_1.z.boolean().default(false),
    detectCopyPaste: zod_1.z.boolean().default(true),
    webcamRequired: zod_1.z.boolean().default(false),
    screenshareRequired: zod_1.z.boolean().default(false),
});
// ============================================
// Create Mock Drive Schema
// ============================================
exports.createMockDriveSchema = zod_1.z
    .object({
    title: zod_1.z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must not exceed 200 characters')
        .trim(),
    description: zod_1.z
        .string()
        .max(5000, 'Description must not exceed 5000 characters')
        .trim()
        .optional()
        .nullable(),
    instructions: zod_1.z
        .string()
        .max(10000, 'Instructions must not exceed 10000 characters')
        .trim()
        .optional()
        .nullable(),
    registrationStartDate: validation_utils_1.optionalDateSchema,
    registrationEndDate: validation_utils_1.optionalDateSchema,
    maxRegistrations: zod_1.z
        .number()
        .int()
        .min(1, 'Max registrations must be at least 1')
        .max(100000, 'Max registrations cannot exceed 100000')
        .optional()
        .nullable(),
    driveStartDate: validation_utils_1.optionalDateSchema,
    driveEndDate: validation_utils_1.optionalDateSchema,
    allowLateSubmission: zod_1.z.boolean().default(false),
    showLeaderboard: zod_1.z.boolean().default(true),
    showResultsImmediately: zod_1.z.boolean().default(false),
    resultsReleaseDate: validation_utils_1.optionalDateSchema,
    shuffleQuestions: zod_1.z.boolean().default(true),
    enableProctoring: zod_1.z.boolean().default(false),
    proctoringSettings: exports.proctoringSettingsSchema.optional().nullable(),
})
    .refine((data) => {
    if (data.registrationStartDate && data.registrationEndDate) {
        return new Date(data.registrationStartDate) < new Date(data.registrationEndDate);
    }
    return true;
}, {
    message: 'Registration start date must be before end date',
    path: ['registrationEndDate'],
})
    .refine((data) => {
    if (data.driveStartDate && data.driveEndDate) {
        return new Date(data.driveStartDate) < new Date(data.driveEndDate);
    }
    return true;
}, {
    message: 'Drive start date must be before end date',
    path: ['driveEndDate'],
})
    .refine((data) => {
    if (data.registrationEndDate && data.driveStartDate) {
        return new Date(data.registrationEndDate) <= new Date(data.driveStartDate);
    }
    return true;
}, {
    message: 'Registration must end before or when drive starts',
    path: ['driveStartDate'],
})
    .refine((data) => {
    // If proctoring is disabled, settings should be null or undefined
    if (!data.enableProctoring && data.proctoringSettings) {
        return true; // Allow but will be ignored
    }
    return true;
}, {
    message: 'Proctoring settings are only applicable when proctoring is enabled',
    path: ['proctoringSettings'],
});
// ============================================
// Update Mock Drive Schema
// ============================================
exports.updateMockDriveSchema = zod_1.z
    .object({
    title: zod_1.z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must not exceed 200 characters')
        .trim()
        .optional(),
    description: zod_1.z
        .string()
        .max(5000, 'Description must not exceed 5000 characters')
        .trim()
        .optional()
        .nullable(),
    instructions: zod_1.z
        .string()
        .max(10000, 'Instructions must not exceed 10000 characters')
        .trim()
        .optional()
        .nullable(),
    registrationStartDate: validation_utils_1.optionalDateSchema,
    registrationEndDate: validation_utils_1.optionalDateSchema,
    maxRegistrations: zod_1.z
        .number()
        .int()
        .min(1, 'Max registrations must be at least 1')
        .max(100000, 'Max registrations cannot exceed 100000')
        .optional()
        .nullable(),
    driveStartDate: validation_utils_1.optionalDateSchema,
    driveEndDate: validation_utils_1.optionalDateSchema,
    allowLateSubmission: zod_1.z.boolean().optional(),
    showLeaderboard: zod_1.z.boolean().optional(),
    showResultsImmediately: zod_1.z.boolean().optional(),
    resultsReleaseDate: validation_utils_1.optionalDateSchema,
    shuffleQuestions: zod_1.z.boolean().optional(),
    enableProctoring: zod_1.z.boolean().optional(),
    proctoringSettings: exports.proctoringSettingsSchema.optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.MockDriveStatus).optional(),
})
    .refine((data) => {
    if (data.registrationStartDate && data.registrationEndDate) {
        return new Date(data.registrationStartDate) < new Date(data.registrationEndDate);
    }
    return true;
}, {
    message: 'Registration start date must be before end date',
    path: ['registrationEndDate'],
})
    .refine((data) => {
    if (data.driveStartDate && data.driveEndDate) {
        return new Date(data.driveStartDate) < new Date(data.driveEndDate);
    }
    return true;
}, {
    message: 'Drive start date must be before end date',
    path: ['driveEndDate'],
});
// ============================================
// Query Parameters Schema
// ============================================
exports.listMockDrivesQuerySchema = validation_utils_1.paginationSchema.extend({
    status: zod_1.z.nativeEnum(client_1.MockDriveStatus).optional(),
    search: validation_utils_1.searchSchema,
    sortBy: zod_1.z
        .enum(['createdAt', 'title', 'driveStartDate', 'registrationEndDate'])
        .default('createdAt'),
    sortOrder: validation_utils_1.sortOrderSchema,
});
// ============================================
// ID Parameter Schema
// ============================================
exports.mockDriveIdParamSchema = zod_1.z.object({
    id: validation_utils_1.cuidSchema,
});
//# sourceMappingURL=mockdrive.validation.js.map
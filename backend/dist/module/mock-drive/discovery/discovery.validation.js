"use strict";
// src/module/mock-drive/discovery/discovery.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDriveIdSchema = exports.discoveryListSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Helper to parse comma-separated string to array
const statusArraySchema = zod_1.z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim()))
    .pipe(zod_1.z.array(zod_1.z.nativeEnum(client_1.MockDriveStatus)))
    .optional();
// Alternative: Accept both string and array
const statusSchema = zod_1.z
    .union([
    zod_1.z.string().transform((val) => val.split(',').map((s) => s.trim())),
    zod_1.z.array(zod_1.z.string()),
])
    .pipe(zod_1.z.array(zod_1.z.nativeEnum(client_1.MockDriveStatus)))
    .optional();
exports.discoveryListSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .pipe(zod_1.z.number().min(1)),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 10))
            .pipe(zod_1.z.number().min(1).max(100)),
        status: statusSchema,
        instituteId: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        registrationOpen: zod_1.z
            .string()
            .optional()
            .transform((val) => val === 'true'),
    }),
});
exports.mockDriveIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        driveId: zod_1.z.string().min(1, 'Drive ID is required'),
    }),
});
//# sourceMappingURL=discovery.validation.js.map
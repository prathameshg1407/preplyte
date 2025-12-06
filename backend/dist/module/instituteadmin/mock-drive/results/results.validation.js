"use strict";
// src/modules/instituteadmin/mock-drive/results/results.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.statisticsQuerySchema = exports.exportResultsQuerySchema = exports.listResultsQuerySchema = exports.attemptIdParamSchema = exports.mockDriveIdParamSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// ============================================
// Constants (inline to avoid circular deps)
// ============================================
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
// ============================================
// Reusable Schemas
// ============================================
const cuidSchema = zod_1.z.string().cuid('Invalid ID format');
const booleanQuerySchema = zod_1.z
    .union([zod_1.z.boolean(), zod_1.z.string().transform((val) => val === 'true')])
    .optional();
// ============================================
// Param Schemas
// ============================================
exports.mockDriveIdParamSchema = zod_1.z.object({
    id: cuidSchema,
});
exports.attemptIdParamSchema = zod_1.z.object({
    id: cuidSchema,
    attemptId: cuidSchema,
});
// ============================================
// List Results Query Schema
// ============================================
exports.listResultsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(DEFAULT_PAGE),
    limit: zod_1.z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    batchId: cuidSchema.optional(),
    status: zod_1.z.nativeEnum(client_1.MockDriveAttemptStatus).optional(),
    search: zod_1.z.string().trim().max(100).optional(),
    sortBy: zod_1.z.enum(['rank', 'totalScore', 'completedAt', 'studentName']).default('rank'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
// ============================================
// Export Results Query Schema
// ============================================
exports.exportResultsQuerySchema = zod_1.z.object({
    format: zod_1.z.enum(['csv', 'json']).default('csv'),
    batchId: cuidSchema.optional(),
});
// ============================================
// Statistics Query Schema
// ============================================
exports.statisticsQuerySchema = zod_1.z.object({
    batchId: cuidSchema.optional(),
});
//# sourceMappingURL=results.validation.js.map
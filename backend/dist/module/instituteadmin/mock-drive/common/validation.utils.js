"use strict";
// src/modules/instituteadmin/mock-drive/common/validation.utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.percentageSchema = exports.booleanQuerySchema = exports.notesSchema = exports.searchSchema = exports.cuidArraySchema = exports.cuidSchema = exports.sortOrderSchema = exports.paginationSchema = exports.coerceDateSchema = exports.optionalDateSchema = exports.dateSchema = void 0;
exports.createDateRangeRefinement = createDateRangeRefinement;
exports.numericRangeSchema = numericRangeSchema;
const zod_1 = require("zod");
/**
 * Common validation utilities for mock drive modules
 */
// ============================================
// Date Schemas
// ============================================
/**
 * Schema for parsing ISO date strings to Date objects
 */
exports.dateSchema = zod_1.z
    .string()
    .datetime({ message: 'Invalid date format. Use ISO 8601 format (e.g., 2024-01-15T10:30:00Z)' })
    .transform((val) => new Date(val));
/**
 * Schema for optional/nullable dates
 */
exports.optionalDateSchema = zod_1.z
    .union([
    zod_1.z.string().datetime().transform((val) => new Date(val)),
    zod_1.z.date(),
    zod_1.z.null(),
    zod_1.z.undefined(),
])
    .optional()
    .nullable();
/**
 * Schema for coercing various date inputs to Date objects
 */
exports.coerceDateSchema = zod_1.z.coerce.date({
    errorMap: (issue, ctx) => ({
        message: 'Invalid date format',
    }),
});
// ============================================
// Pagination Schemas
// ============================================
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.sortOrderSchema = zod_1.z.enum(['asc', 'desc']).default('desc');
// ============================================
// Common Field Schemas
// ============================================
exports.cuidSchema = zod_1.z.string().cuid('Invalid ID format');
exports.cuidArraySchema = zod_1.z.array(exports.cuidSchema);
exports.searchSchema = zod_1.z.string().max(100, 'Search query too long').optional();
exports.notesSchema = zod_1.z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
    .nullable();
// ============================================
// Validation Helpers
// ============================================
/**
 * Creates a refine function for date range validation
 */
function createDateRangeRefinement(startField, endField, message) {
    return (data) => {
        const start = data[startField];
        const end = data[endField];
        if (start && end) {
            return new Date(start) < new Date(end);
        }
        return true;
    };
}
/**
 * Helper to create optional boolean from string query params
 */
exports.booleanQuerySchema = zod_1.z
    .union([zod_1.z.boolean(), zod_1.z.string().transform((val) => val === 'true')])
    .optional();
/**
 * Helper for numeric range validation
 */
function numericRangeSchema(min, max, fieldName) {
    return zod_1.z
        .number()
        .min(min, `${fieldName} must be at least ${min}`)
        .max(max, `${fieldName} cannot exceed ${max}`);
}
/**
 * Helper for percentage validation (0-100)
 */
exports.percentageSchema = zod_1.z
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100');
//# sourceMappingURL=validation.utils.js.map
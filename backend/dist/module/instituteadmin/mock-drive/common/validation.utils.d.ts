import { z } from 'zod';
/**
 * Common validation utilities for mock drive modules
 */
/**
 * Schema for parsing ISO date strings to Date objects
 */
export declare const dateSchema: z.ZodEffects<z.ZodString, Date, string>;
/**
 * Schema for optional/nullable dates
 */
export declare const optionalDateSchema: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, Date, string>, z.ZodDate, z.ZodNull, z.ZodUndefined]>>>;
/**
 * Schema for coercing various date inputs to Date objects
 */
export declare const coerceDateSchema: z.ZodDate;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const sortOrderSchema: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
export declare const cuidSchema: z.ZodString;
export declare const cuidArraySchema: z.ZodArray<z.ZodString, "many">;
export declare const searchSchema: z.ZodOptional<z.ZodString>;
export declare const notesSchema: z.ZodNullable<z.ZodOptional<z.ZodString>>;
/**
 * Creates a refine function for date range validation
 */
export declare function createDateRangeRefinement<T extends {
    [key: string]: any;
}>(startField: keyof T, endField: keyof T, message: string): (data: T) => boolean;
/**
 * Helper to create optional boolean from string query params
 */
export declare const booleanQuerySchema: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodEffects<z.ZodString, boolean, string>]>>;
/**
 * Helper for numeric range validation
 */
export declare function numericRangeSchema(min: number, max: number, fieldName: string): z.ZodNumber;
/**
 * Helper for percentage validation (0-100)
 */
export declare const percentageSchema: z.ZodNumber;
export type PaginationInput = z.infer<typeof paginationSchema>;
//# sourceMappingURL=validation.utils.d.ts.map
import { Prisma } from '@prisma/client';
type JsonValue = Prisma.JsonValue;
type InputJsonValue = Prisma.InputJsonValue;
type JsonObject = Prisma.JsonObject;
type JsonArray = Prisma.JsonArray;
type NullableJsonInput = InputJsonValue | typeof Prisma.JsonNull | typeof Prisma.DbNull;
export declare class PrismaJsonHelper {
    /**
     * Convert any data to Prisma JSON input
     * Returns empty object for null/undefined - use toJsonNullable for explicit null
     */
    static toJson<T>(data: T): InputJsonValue;
    /**
     * Convert data to Prisma JSON, with null values becoming Prisma.JsonNull
     * Use this when you want to explicitly set a JSON field to null in the database
     */
    static toJsonNullable<T>(data: T | null | undefined): NullableJsonInput;
    /**
     * Convert data to Prisma JSON, with explicit handling for undefined vs null
     * - undefined: returns undefined (field not updated in Prisma)
     * - null: returns Prisma.JsonNull (explicitly set to null)
     * - value: returns the JSON value
     */
    static toJsonOptional<T>(data: T | null | undefined): NullableJsonInput | undefined;
    /**
     * Convert Prisma JSON to typed object with required default
     */
    static fromJson<T>(json: JsonValue, defaultValue: T): T;
    /**
     * Convert Prisma JSON to typed object, returning null if not present
     */
    static fromJsonNullable<T>(json: JsonValue): T | null;
    /**
     * Safely get a nested property from JSON
     */
    static getNestedValue<T>(json: JsonValue, path: string, defaultValue: T): T;
    /**
     * Check if a JSON value is empty (null, undefined, empty object, or empty array)
     */
    static isEmpty(json: JsonValue): boolean;
    /**
     * Check if a JSON value is a non-empty array
     */
    static isNonEmptyArray(json: JsonValue): json is JsonArray & {
        length: number;
    };
    /**
     * Check if a JSON value is a non-empty object
     */
    static isNonEmptyObject(json: JsonValue): json is JsonObject;
    /**
     * Safely get an array from JSON value
     */
    static toArray<T>(json: JsonValue, defaultValue?: T[]): T[];
    /**
     * Safely get an object from JSON value
     */
    static toObject<T extends Record<string, unknown>>(json: JsonValue, defaultValue: T): T;
    /**
     * Merge two JSON objects (shallow merge)
     */
    static merge<T extends Record<string, unknown>>(base: JsonValue, updates: Partial<T>): InputJsonValue;
    /**
     * Deep merge two JSON objects
     */
    static deepMerge<T extends Record<string, unknown>>(base: JsonValue, updates: Partial<T>): InputJsonValue;
    private static deepMergeObjects;
    private static isPlainObject;
}
export {};
//# sourceMappingURL=prisma-helper.d.ts.map
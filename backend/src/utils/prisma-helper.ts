// src/utils/prisma-helper.ts
import { Prisma } from '@prisma/client';

// =====================================================
// TYPES
// =====================================================
type JsonValue = Prisma.JsonValue;
type InputJsonValue = Prisma.InputJsonValue;
type JsonObject = Prisma.JsonObject;
type JsonArray = Prisma.JsonArray;
// Type for nullable JSON input (for update/create operations)
type NullableJsonInput = InputJsonValue | typeof Prisma.JsonNull | typeof Prisma.DbNull;

// =====================================================
// PRISMA JSON HELPER
// =====================================================
export class PrismaJsonHelper {
  /**
   * Convert any data to Prisma JSON input
   * Returns empty object for null/undefined - use toJsonNullable for explicit null
   */
  static toJson<T>(data: T): InputJsonValue {
    if (data === undefined || data === null) {
      // Return empty object as a safe default
      // Use toJsonNullable if you need to set the field to null
      return {};
    }
    try {
      // Deep clone and convert to JSON-safe value
      return JSON.parse(JSON.stringify(data)) as InputJsonValue;
    } catch {
      return {};
    }
  }

  /**
   * Convert data to Prisma JSON, with null values becoming Prisma.JsonNull
   * Use this when you want to explicitly set a JSON field to null in the database
   */
  static toJsonNullable<T>(data: T | null | undefined): NullableJsonInput {
    if (data === undefined || data === null) {
      return Prisma.JsonNull;
    }
    try {
      return JSON.parse(JSON.stringify(data)) as InputJsonValue;
    } catch {
      return Prisma.JsonNull;
    }
  }

  /**
   * Convert data to Prisma JSON, with explicit handling for undefined vs null
   * - undefined: returns undefined (field not updated in Prisma)
   * - null: returns Prisma.JsonNull (explicitly set to null)
   * - value: returns the JSON value
   */
  static toJsonOptional<T>(
    data: T | null | undefined
  ): NullableJsonInput | undefined {
    if (data === undefined) {
      return undefined; // Don't update the field
    }
    if (data === null) {
      return Prisma.JsonNull; // Explicitly set to null
    }
    return this.toJson(data);
  }

  /**
   * Convert Prisma JSON to typed object with required default
   */
  static fromJson<T>(json: JsonValue, defaultValue: T): T {
    if (json === null || json === undefined) {
      return defaultValue;
    }
    // Safer cast with optional chaining for nested access
    return (json as unknown as T) ?? defaultValue;
  }

  /**
   * Convert Prisma JSON to typed object, returning null if not present
   */
  static fromJsonNullable<T>(json: JsonValue): T | null {
    if (json === null || json === undefined) {
      return null;
    }
    return json as unknown as T;
  }

  /**
   * Safely get a nested property from JSON
   */
  static getNestedValue<T>(
    json: JsonValue,
    path: string,
    defaultValue: T
  ): T {
    if (!json || typeof json !== 'object') {
      return defaultValue;
    }
    const keys = path.split('.');
    let current: JsonValue = json;
    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      if (typeof current !== 'object' || Array.isArray(current)) {
        return defaultValue;
      }
      current = (current as JsonObject)[key] as JsonValue;
    }
    if (current === undefined || current === null) {
      return defaultValue;
    }
    return current as unknown as T;
  }

  /**
   * Check if a JSON value is empty (null, undefined, empty object, or empty array)
   */
  static isEmpty(json: JsonValue): boolean {
    if (json === null || json === undefined) {
      return true;
    }
    if (Array.isArray(json)) {
      return json.length === 0;
    }
    if (typeof json === 'object') {
      return Object.keys(json).length === 0;
    }
    return false;
  }

  /**
   * Check if a JSON value is a non-empty array
   */
  static isNonEmptyArray(json: JsonValue): json is JsonArray & { length: number } {
    return Array.isArray(json) && json.length > 0;
  }

  /**
   * Check if a JSON value is a non-empty object
   */
  static isNonEmptyObject(json: JsonValue): json is JsonObject {
    return (
      json !== null &&
      typeof json === 'object' &&
      !Array.isArray(json) &&
      Object.keys(json).length > 0
    );
  }

  /**
   * Safely get an array from JSON value
   */
  static toArray<T>(json: JsonValue, defaultValue: T[] = []): T[] {
    if (!Array.isArray(json)) {
      return defaultValue;
    }
    return json as unknown as T[];
  }

  /**
   * Safely get an object from JSON value
   */
  static toObject<T extends Record<string, unknown>>(
    json: JsonValue,
    defaultValue: T
  ): T {
    if (json === null || typeof json !== 'object' || Array.isArray(json)) {
      return defaultValue;
    }
    return json as unknown as T;
  }

  /**
   * Merge two JSON objects (shallow merge)
   */
  static merge<T extends Record<string, unknown>>(
    base: JsonValue,
    updates: Partial<T>
  ): InputJsonValue {
    const baseObj = this.toObject(base, {} as Record<string, unknown>);
    return this.toJson({ ...baseObj, ...updates });
  }

  /**
   * Deep merge two JSON objects
   */
  static deepMerge<T extends Record<string, unknown>>(
    base: JsonValue,
    updates: Partial<T>
  ): InputJsonValue {
    const baseObj = this.toObject(base, {} as Record<string, unknown>);
    return this.toJson(this.deepMergeObjects(baseObj, updates as Record<string, unknown>));
  }

  private static deepMergeObjects(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      if (
        this.isPlainObject(sourceValue) &&
        this.isPlainObject(targetValue)
      ) {
        result[key] = this.deepMergeObjects(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        // For arrays, replace with source (or implement deep array merge if needed)
        result[key] = sourceValue;
      } else {
        result[key] = sourceValue;
      }
    }
    return result;
  }

  private static isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.prototype.toString.call(value) === '[object Object]'
    );
  }
}
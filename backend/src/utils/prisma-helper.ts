// src/utils/prisma-helper.ts

import { Prisma } from '@prisma/client';

export class PrismaJsonHelper {
  /**
   * Convert any data to Prisma JSON input
   * Handles undefined by returning null (use Prisma.DbNull for explicit DB null)
   */
  static toJson<T>(data: T): Prisma.InputJsonValue {
    if (data === undefined || data === null) {
      // Return null as a valid JSON value
      // If you need to set the DB field to NULL, use Prisma.DbNull in the query directly
      return null as unknown as Prisma.InputJsonValue;
    }
    
    // Deep clone and convert to JSON-safe value
    return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;
  }

  /**
   * Convert any data to Prisma JSON input, with explicit null handling
   * Use this when you want to explicitly set a JSON field to null in the database
   */
  static toJsonOrNull<T>(data: T | null | undefined): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (data === undefined || data === null) {
      return Prisma.JsonNull;
    }
    return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;
  }

  /**
   * Convert Prisma JSON to typed object
   */
  static fromJson<T>(json: Prisma.JsonValue, defaultValue?: T): T {
    if (json === null || json === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      return null as unknown as T;
    }
    return json as unknown as T;
  }

  /**
   * Safely get a nested property from JSON
   */
  static getNestedValue<T>(
    json: Prisma.JsonValue,
    path: string,
    defaultValue?: T
  ): T | undefined {
    if (!json || typeof json !== 'object') {
      return defaultValue;
    }

    const keys = path.split('.');
    let current: unknown = json;

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current !== undefined ? (current as T) : defaultValue;
  }

  /**
   * Check if a JSON value is empty (null, undefined, empty object, or empty array)
   */
  static isEmpty(json: Prisma.JsonValue): boolean {
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
   * Merge two JSON objects (shallow merge)
   */
  static merge<T extends Record<string, unknown>>(
    base: Prisma.JsonValue,
    updates: Partial<T>
  ): Prisma.InputJsonValue {
    const baseObj = this.fromJson<Record<string, unknown>>(base, {});
    return this.toJson({ ...baseObj, ...updates });
  }
}
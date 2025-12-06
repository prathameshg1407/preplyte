"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaJsonHelper = void 0;
// src/utils/prisma-helper.ts
const client_1 = require("@prisma/client");
// =====================================================
// PRISMA JSON HELPER
// =====================================================
class PrismaJsonHelper {
    /**
     * Convert any data to Prisma JSON input
     * Returns empty object for null/undefined - use toJsonNullable for explicit null
     */
    static toJson(data) {
        if (data === undefined || data === null) {
            // Return empty object as a safe default
            // Use toJsonNullable if you need to set the field to null
            return {};
        }
        try {
            // Deep clone and convert to JSON-safe value
            return JSON.parse(JSON.stringify(data));
        }
        catch {
            return {};
        }
    }
    /**
     * Convert data to Prisma JSON, with null values becoming Prisma.JsonNull
     * Use this when you want to explicitly set a JSON field to null in the database
     */
    static toJsonNullable(data) {
        if (data === undefined || data === null) {
            return client_1.Prisma.JsonNull;
        }
        try {
            return JSON.parse(JSON.stringify(data));
        }
        catch {
            return client_1.Prisma.JsonNull;
        }
    }
    /**
     * Convert data to Prisma JSON, with explicit handling for undefined vs null
     * - undefined: returns undefined (field not updated in Prisma)
     * - null: returns Prisma.JsonNull (explicitly set to null)
     * - value: returns the JSON value
     */
    static toJsonOptional(data) {
        if (data === undefined) {
            return undefined; // Don't update the field
        }
        if (data === null) {
            return client_1.Prisma.JsonNull; // Explicitly set to null
        }
        return this.toJson(data);
    }
    /**
     * Convert Prisma JSON to typed object with required default
     */
    static fromJson(json, defaultValue) {
        if (json === null || json === undefined) {
            return defaultValue;
        }
        // Safer cast with optional chaining for nested access
        return json ?? defaultValue;
    }
    /**
     * Convert Prisma JSON to typed object, returning null if not present
     */
    static fromJsonNullable(json) {
        if (json === null || json === undefined) {
            return null;
        }
        return json;
    }
    /**
     * Safely get a nested property from JSON
     */
    static getNestedValue(json, path, defaultValue) {
        if (!json || typeof json !== 'object') {
            return defaultValue;
        }
        const keys = path.split('.');
        let current = json;
        for (const key of keys) {
            if (current === null || current === undefined) {
                return defaultValue;
            }
            if (typeof current !== 'object' || Array.isArray(current)) {
                return defaultValue;
            }
            current = current[key];
        }
        if (current === undefined || current === null) {
            return defaultValue;
        }
        return current;
    }
    /**
     * Check if a JSON value is empty (null, undefined, empty object, or empty array)
     */
    static isEmpty(json) {
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
    static isNonEmptyArray(json) {
        return Array.isArray(json) && json.length > 0;
    }
    /**
     * Check if a JSON value is a non-empty object
     */
    static isNonEmptyObject(json) {
        return (json !== null &&
            typeof json === 'object' &&
            !Array.isArray(json) &&
            Object.keys(json).length > 0);
    }
    /**
     * Safely get an array from JSON value
     */
    static toArray(json, defaultValue = []) {
        if (!Array.isArray(json)) {
            return defaultValue;
        }
        return json;
    }
    /**
     * Safely get an object from JSON value
     */
    static toObject(json, defaultValue) {
        if (json === null || typeof json !== 'object' || Array.isArray(json)) {
            return defaultValue;
        }
        return json;
    }
    /**
     * Merge two JSON objects (shallow merge)
     */
    static merge(base, updates) {
        const baseObj = this.toObject(base, {});
        return this.toJson({ ...baseObj, ...updates });
    }
    /**
     * Deep merge two JSON objects
     */
    static deepMerge(base, updates) {
        const baseObj = this.toObject(base, {});
        return this.toJson(this.deepMergeObjects(baseObj, updates));
    }
    static deepMergeObjects(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (this.isPlainObject(sourceValue) &&
                this.isPlainObject(targetValue)) {
                result[key] = this.deepMergeObjects(targetValue, sourceValue);
            }
            else if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
                // For arrays, replace with source (or implement deep array merge if needed)
                result[key] = sourceValue;
            }
            else {
                result[key] = sourceValue;
            }
        }
        return result;
    }
    static isPlainObject(value) {
        return (value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            Object.prototype.toString.call(value) === '[object Object]');
    }
}
exports.PrismaJsonHelper = PrismaJsonHelper;
//# sourceMappingURL=prisma-helper.js.map
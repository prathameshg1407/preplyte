"use strict";
// src/utils/json-parser.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonParser = exports.JsonParser = void 0;
const logger_1 = require("./logger");
const errors_1 = require("./errors");
const DEFAULT_OPTIONS = {
    maxLength: 100000,
    silent: false,
};
// =====================================================
// JSON PARSER CLASS
// =====================================================
class JsonParser {
    /**
     * Safely parse JSON with fallback handling
     * Attempts multiple extraction strategies for LLM responses
     */
    parse(content, context, options = {}) {
        const opts = { ...DEFAULT_OPTIONS, ...options };
        if (!content || typeof content !== 'string') {
            throw new errors_1.ValidationError(`Empty or invalid content for ${context}`);
        }
        if (content.length > opts.maxLength) {
            throw new errors_1.ValidationError(`Content exceeds maximum length (${opts.maxLength}) for ${context}`);
        }
        const trimmedContent = content.trim();
        // Strategy 1: Try direct parse first
        const directResult = this.tryParse(trimmedContent);
        if (directResult.success) {
            return directResult.data;
        }
        // Strategy 2: Try to extract JSON from markdown code blocks
        const extracted = this.extractJsonFromMarkdown(trimmedContent);
        if (extracted) {
            const extractedResult = this.tryParse(extracted);
            if (extractedResult.success) {
                return extractedResult.data;
            }
        }
        // Strategy 3: Try to find JSON object/array in the content
        const jsonMatch = this.findJsonInContent(trimmedContent);
        if (jsonMatch) {
            const matchResult = this.tryParse(jsonMatch);
            if (matchResult.success) {
                return matchResult.data;
            }
        }
        // All strategies failed
        if (!opts.silent) {
            logger_1.logger.error('[JsonParser] Failed to parse JSON', {
                context,
                contentPreview: trimmedContent.substring(0, 200),
                contentLength: trimmedContent.length,
            });
        }
        throw new errors_1.ValidationError(`Failed to parse JSON response for ${context}`);
    }
    /**
     * Safe parse that returns null instead of throwing
     */
    safeParse(content, context, options = {}) {
        try {
            return this.parse(content, context, { ...options, silent: true });
        }
        catch {
            return null;
        }
    }
    /**
     * Parse with a default value fallback
     */
    parseWithDefault(content, context, defaultValue, options = {}) {
        try {
            return this.parse(content, context, { ...options, silent: true });
        }
        catch {
            logger_1.logger.warn('[JsonParser] Using default value', { context });
            return defaultValue;
        }
    }
    /**
     * Validate parsed JSON against a schema/type guard
     */
    parseAndValidate(content, context, validator, options = {}) {
        const parsed = this.parse(content, context, options);
        if (!validator(parsed)) {
            throw new errors_1.ValidationError(`Invalid data structure for ${context}`);
        }
        return parsed;
    }
    // ===================================================
    // PRIVATE METHODS
    // ===================================================
    tryParse(content) {
        try {
            const data = JSON.parse(content);
            return { success: true, data };
        }
        catch {
            return { success: false };
        }
    }
    extractJsonFromMarkdown(content) {
        // Match ```json ... ``` or ``` ... ```
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
        const match = content.match(codeBlockRegex);
        if (match?.[1]) {
            return match[1].trim();
        }
        return null;
    }
    findJsonInContent(content) {
        // Find the first balanced JSON object
        const objectResult = this.findBalancedJson(content, '{', '}');
        if (objectResult) {
            return objectResult;
        }
        // Find the first balanced JSON array
        const arrayResult = this.findBalancedJson(content, '[', ']');
        if (arrayResult) {
            return arrayResult;
        }
        return null;
    }
    findBalancedJson(content, openChar, closeChar) {
        const startIndex = content.indexOf(openChar);
        if (startIndex === -1) {
            return null;
        }
        let depth = 0;
        let inString = false;
        let escapeNext = false;
        for (let i = startIndex; i < content.length; i++) {
            const char = content[i];
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === '\\' && inString) {
                escapeNext = true;
                continue;
            }
            if (char === '"') {
                inString = !inString;
                continue;
            }
            if (inString) {
                continue;
            }
            if (char === openChar) {
                depth++;
            }
            else if (char === closeChar) {
                depth--;
                if (depth === 0) {
                    return content.substring(startIndex, i + 1);
                }
            }
        }
        return null;
    }
}
exports.JsonParser = JsonParser;
// =====================================================
// SINGLETON INSTANCE
// =====================================================
exports.jsonParser = new JsonParser();
//# sourceMappingURL=json-parser.js.map
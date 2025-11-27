// src/utils/json-parser.ts

import { logger } from './logger';
import { ValidationError } from './errors';

// =====================================================
// TYPES
// =====================================================

interface ParseOptions {
  /** Maximum content length to process */
  maxLength?: number;
  /** Whether to log parse failures */
  silent?: boolean;
}

const DEFAULT_OPTIONS: Required<ParseOptions> = {
  maxLength: 100000,
  silent: false,
};

// =====================================================
// JSON PARSER CLASS
// =====================================================

export class JsonParser {
  /**
   * Safely parse JSON with fallback handling
   * Attempts multiple extraction strategies for LLM responses
   */
  parse<T>(content: string, context: string, options: ParseOptions = {}): T {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (!content || typeof content !== 'string') {
      throw new ValidationError(`Empty or invalid content for ${context}`);
    }

    if (content.length > opts.maxLength) {
      throw new ValidationError(
        `Content exceeds maximum length (${opts.maxLength}) for ${context}`
      );
    }

    const trimmedContent = content.trim();

    // Strategy 1: Try direct parse first
    const directResult = this.tryParse<T>(trimmedContent);
    if (directResult.success) {
      return directResult.data;
    }

    // Strategy 2: Try to extract JSON from markdown code blocks
    const extracted = this.extractJsonFromMarkdown(trimmedContent);
    if (extracted) {
      const extractedResult = this.tryParse<T>(extracted);
      if (extractedResult.success) {
        return extractedResult.data;
      }
    }

    // Strategy 3: Try to find JSON object/array in the content
    const jsonMatch = this.findJsonInContent(trimmedContent);
    if (jsonMatch) {
      const matchResult = this.tryParse<T>(jsonMatch);
      if (matchResult.success) {
        return matchResult.data;
      }
    }

    // All strategies failed
    if (!opts.silent) {
      logger.error('[JsonParser] Failed to parse JSON', {
        context,
        contentPreview: trimmedContent.substring(0, 200),
        contentLength: trimmedContent.length,
      });
    }

    throw new ValidationError(`Failed to parse JSON response for ${context}`);
  }

  /**
   * Safe parse that returns null instead of throwing
   */
  safeParse<T>(content: string, context: string, options: ParseOptions = {}): T | null {
    try {
      return this.parse<T>(content, context, { ...options, silent: true });
    } catch {
      return null;
    }
  }

  /**
   * Parse with a default value fallback
   */
  parseWithDefault<T>(
    content: string,
    context: string,
    defaultValue: T,
    options: ParseOptions = {}
  ): T {
    try {
      return this.parse<T>(content, context, { ...options, silent: true });
    } catch {
      logger.warn('[JsonParser] Using default value', { context });
      return defaultValue;
    }
  }

  /**
   * Validate parsed JSON against a schema/type guard
   */
  parseAndValidate<T>(
    content: string,
    context: string,
    validator: (data: unknown) => data is T,
    options: ParseOptions = {}
  ): T {
    const parsed = this.parse<unknown>(content, context, options);

    if (!validator(parsed)) {
      throw new ValidationError(`Invalid data structure for ${context}`);
    }

    return parsed;
  }

  // ===================================================
  // PRIVATE METHODS
  // ===================================================

  private tryParse<T>(content: string): { success: true; data: T } | { success: false } {
    try {
      const data = JSON.parse(content) as T;
      return { success: true, data };
    } catch {
      return { success: false };
    }
  }

  private extractJsonFromMarkdown(content: string): string | null {
    // Match ```json ... ``` or ``` ... ```
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);

    if (match?.[1]) {
      return match[1].trim();
    }

    return null;
  }

  private findJsonInContent(content: string): string | null {
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

  private findBalancedJson(
    content: string,
    openChar: string,
    closeChar: string
  ): string | null {
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
      } else if (char === closeChar) {
        depth--;
        if (depth === 0) {
          return content.substring(startIndex, i + 1);
        }
      }
    }

    return null;
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const jsonParser = new JsonParser();
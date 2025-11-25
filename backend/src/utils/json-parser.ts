// src/utils/json-parser.ts

import { logger } from './logger';
import { ValidationError } from '../lib/errors';

export class JsonParser {
  /**
   * Safely parse JSON with fallback handling
   */
  parse<T>(content: string, context: string): T {
    if (!content || typeof content !== 'string') {
      throw new ValidationError(`Empty or invalid content for ${context}`);
    }

    // Try direct parse first
    try {
      return JSON.parse(content) as T;
    } catch {
      // Continue to extraction methods
    }

    // Try to extract JSON from markdown code blocks
    const extracted = this.extractJsonFromMarkdown(content);
    if (extracted) {
      try {
        return JSON.parse(extracted) as T;
      } catch {
        // Continue to next method
      }
    }

    // Try to find JSON object/array in the content
    const jsonMatch = this.findJsonInContent(content);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch) as T;
      } catch {
        // Continue to error
      }
    }

    logger.error(`[JsonParser] Failed to parse JSON`, {
      context,
      contentPreview: content.substring(0, 200),
    });

    throw new ValidationError(`Failed to parse JSON response for ${context}`);
  }

  /**
   * Safe parse that returns null instead of throwing
   */
  safeParse<T>(content: string, context: string): T | null {
    try {
      return this.parse<T>(content, context);
    } catch {
      return null;
    }
  }

  /**
   * Parse with a default value fallback
   */
  parseWithDefault<T>(content: string, context: string, defaultValue: T): T {
    try {
      return this.parse<T>(content, context);
    } catch {
      logger.warn(`[JsonParser] Using default value for ${context}`);
      return defaultValue;
    }
  }

  private extractJsonFromMarkdown(content: string): string | null {
    // Match ```json ... ``` or ``` ... ```
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);
    return match ? match[1].trim() : null;
  }

  private findJsonInContent(content: string): string | null {
    // Find JSON object
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return objectMatch[0];
    }

    // Find JSON array
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return arrayMatch[0];
    }

    return null;
  }
}

// Singleton instance
export const jsonParser = new JsonParser();
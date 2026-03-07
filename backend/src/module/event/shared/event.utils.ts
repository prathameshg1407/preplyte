// backend/src/module/event/shared/event.utils.ts

import { nanoid } from 'nanoid';
import slugify from 'slugify';
import {
  ALLOWED_STATUS_TRANSITIONS,
  HACKATHON_CONSTANTS,
  ERROR_MESSAGES,
} from '../event.constants';
import { BadRequestError } from '../../../utils/errors';
import { logger } from '../../../utils/logger';

/**
 * =====================================================
 * STATUS VALIDATION
 * =====================================================
 */

export function validateStatusTransition<T extends string>(
  currentStatus: T,
  newStatus: T,
  entityType: keyof typeof ALLOWED_STATUS_TRANSITIONS
): void {
  const transitions = ALLOWED_STATUS_TRANSITIONS[entityType] as Record<T, T[]>;

  if (!transitions[currentStatus]) {
    throw new BadRequestError(`Invalid current status: ${currentStatus}`);
  }

  const allowedTransitions = transitions[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`
    );
  }
}

/**
 * =====================================================
 * SLUG GENERATION
 * =====================================================
 */

export function generateSlug(text: string, maxLength = 100): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  }).substring(0, maxLength);
}

export function generateUniqueSlug(text: string, suffix?: string): string {
  const baseSlug = generateSlug(text, 80);
  const uniqueSuffix = suffix || nanoid(6);
  return `${baseSlug}-${uniqueSuffix}`;
}

/**
 * =====================================================
 * INVITE CODE GENERATION
 * =====================================================
 */

export function generateInviteCode(length: number = HACKATHON_CONSTANTS.DEFAULT_TEAM_SIZE_MAX): string {
  const charset = HACKATHON_CONSTANTS.INVITE_CODE_CHARSET;
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }

  return code;
}

/**
 * =====================================================
 * DATE VALIDATION
 * =====================================================
 */

export interface DateRange {
  start: Date;
  end: Date;
}

export function validateDateRange(range: DateRange, fieldName = 'Date'): void {
  if (range.start >= range.end) {
    throw new BadRequestError(`${fieldName} end must be after start`);
  }
}

export function validateFutureDate(date: Date, fieldName = 'Date'): void {
  if (date <= new Date()) {
    throw new BadRequestError(`${fieldName} must be in the future`);
  }
}

export function validateDateSequence(dates: { date: Date; name: string }[]): void {
  for (let i = 0; i < dates.length - 1; i++) {
    if (dates[i].date >= dates[i + 1].date) {
      throw new BadRequestError(
        `${dates[i + 1].name} must be after ${dates[i].name}`
      );
    }
  }
}

export function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

export function hasDatePassed(date: Date): boolean {
  return date < new Date();
}

/**
 * =====================================================
 * ARRAY UTILITIES
 * =====================================================
 */

export function removeDuplicates<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function removeDuplicatesCaseInsensitive(array: string[]): string[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    const lower = item.toLowerCase();
    if (seen.has(lower)) {
      return false;
    }
    seen.add(lower);
    return true;
  });
}

/**
 * =====================================================
 * PAGINATION HELPERS
 * =====================================================
 */

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function calculatePagination(input: PaginationInput): PaginationResult {
  const page = Math.max(1, input.page);
  const limit = Math.max(1, Math.min(100, input.limit));
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
}

export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * =====================================================
 * SANITIZATION
 * =====================================================
 */

export function sanitizeString(input: string | null | undefined): string | null {
  if (!input) return null;
  return input.trim() || null;
}

export function sanitizeArray<T>(
  input: T[] | null | undefined,
  maxLength?: number
): T[] {
  if (!input || !Array.isArray(input)) return [];

  const cleaned = input.filter((item) => item !== null && item !== undefined);

  return maxLength ? cleaned.slice(0, maxLength) : cleaned;
}

/**
 * =====================================================
 * URL VALIDATION
 * =====================================================
 */

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateUrls(urls: string[], fieldName = 'URL'): void {
  urls.forEach((url, index) => {
    if (!isValidUrl(url)) {
      throw new BadRequestError(`Invalid ${fieldName} at position ${index + 1}: ${url}`);
    }
  });
}

/**
 * =====================================================
 * PERCENTAGE CALCULATION
 * =====================================================
 */

export function calculatePercentage(
  numerator: number,
  denominator: number,
  decimals = 2
): number {
  if (denominator === 0) return 0;
  const percentage = (numerator / denominator) * 100;
  return Math.round(percentage * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * =====================================================
 * NUMBER FORMATTING
 * =====================================================
 */

export function formatSalary(
  amount: number,
  currency: string = 'INR'
): string {
  if (currency === 'INR') {
    // Indian number format (lakhs/crores)
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * =====================================================
 * ERROR LOGGING
 * =====================================================
 */

export function logError(
  context: string,
  error: unknown,
  metadata?: Record<string, any>
): void {
  logger.error(`[${context}] Error occurred`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...metadata,
  });
}

/**
 * =====================================================
 * RETRY MECHANISM
 * =====================================================
 */

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        logger.warn(`Operation failed, retrying (${attempt}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * =====================================================
 * DEEP MERGE
 * =====================================================
 */

export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * =====================================================
 * OBJECT UTILITIES
 * =====================================================
 */

export function omitFields<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  fields: K[]
): Omit<T, K> {
  const result = { ...obj };
  fields.forEach((field) => delete result[field]);
  return result;
}

export function pickFields<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  fields: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  fields.forEach((field) => {
    if (field in obj) {
      result[field] = obj[field];
    }
  });
  return result;
}

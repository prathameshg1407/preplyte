// src/lib/api/services/institute-admin/api-utils.ts

import { AxiosError, AxiosResponse } from 'axios';
import { ApiSuccessResponse, ApiErrorDetail } from '@/types/admin.mockdrive.types';

// ============================================
// Custom Error Class
// ============================================

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: ApiErrorDetail[];
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static fromAxiosError(
    error: AxiosError<{
      error?: {
        code?: string;
        message?: string;
        details?: ApiErrorDetail[];
      };
      message?: string;
    }>
  ): ApiError {
    const response = error.response;
    const data = response?.data;
    const errorData = data?.error;

    const message =
      errorData?.message ||
      data?.message ||
      error.message ||
      'An unexpected error occurred';

    const code = errorData?.code || getErrorCodeFromStatus(response?.status);
    const status = response?.status || 500;
    const details = errorData?.details;

    return new ApiError(message, code, status, details);
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  getFieldError(field: string): string | undefined {
    return this.details?.find((d) => d.field === field)?.message;
  }

  getFieldErrors(): Record<string, string> {
    if (!this.details) return {};
    return this.details.reduce(
      (acc, detail) => {
        acc[detail.field] = detail.message;
        return acc;
      },
      {} as Record<string, string>
    );
  }
}

function getErrorCodeFromStatus(status?: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    default:
      return 'UNKNOWN_ERROR';
  }
}

// ============================================
// Response Handlers
// ============================================

export function handleResponse<T>(response: AxiosResponse<ApiSuccessResponse<T>>): T {
  if (!response.data.success) {
    throw new ApiError(
      response.data.message || 'Request failed',
      'REQUEST_FAILED',
      response.status
    );
  }
  return response.data.data;
}

export function handleError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof AxiosError) {
    throw ApiError.fromAxiosError(error);
  }

  if (error instanceof Error) {
    throw new ApiError(error.message, 'UNKNOWN_ERROR', 500);
  }

  throw new ApiError('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
}

// ============================================
// Request Helpers
// ============================================

export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        (acc as Record<string, unknown>)[key] = value;
      }
      return acc;
    },
    {} as Partial<T>
  );
}
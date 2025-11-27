// src/lib/api/error-handler.ts
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { ApiError, ValidationDetail } from '@/types/api.types';

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

interface ParsedError {
  code: ErrorCode;
  message: string;
  status: number;
  details?: ValidationDetail[];
}

interface ErrorResponseData {
  success: false;
  error?: ApiError;
  message?: string;
}

export function parseApiError(error: unknown): ParsedError {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const { response, code } = error;
    const data = response?.data as ErrorResponseData | undefined;

    // Structured backend error
    if (data?.error) {
      return {
        code: data.error.code as ErrorCode,
        message: data.error.message,
        status: response?.status ?? 500,
        details: data.error.details,
      };
    }

    // Legacy message format
    if (data?.message) {
      return {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: data.message,
        status: response?.status ?? 500,
      };
    }

    // Network error
    if (code === 'ERR_NETWORK') {
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }

    // Timeout
    if (code === 'ECONNABORTED') {
      return {
        code: ERROR_CODES.TIMEOUT_ERROR,
        message: 'Request timeout. Please try again.',
        status: 0,
      };
    }

    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message || 'An unexpected error occurred',
      status: response?.status ?? 500,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message,
      status: 500,
    };
  }

  return {
    code: ERROR_CODES.INTERNAL_ERROR,
    message: 'An unexpected error occurred',
    status: 500,
  };
}

export function getErrorMessage(error: unknown): string {
  const parsed = parseApiError(error);

  if (parsed.code === ERROR_CODES.VALIDATION_ERROR && parsed.details?.length) {
    return parsed.details.map((d) => d.message).join('. ');
  }

  return parsed.message;
}

export function showErrorToast(error: unknown): void {
  toast.error(getErrorMessage(error));
}

export function showSuccessToast(message: string): void {
  toast.success(message);
}

// Type guards
export const isUnauthorized = (error: unknown): boolean =>
  parseApiError(error).status === 401;

export const isNetworkError = (error: unknown): boolean =>
  parseApiError(error).code === ERROR_CODES.NETWORK_ERROR;

export const isValidationError = (error: unknown): boolean =>
  parseApiError(error).code === ERROR_CODES.VALIDATION_ERROR;
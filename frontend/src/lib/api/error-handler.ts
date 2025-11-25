// src/lib/api/error-handler.ts
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Match backend error response format
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
      code?: string;
    }>;
  };
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Error codes that match backend
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
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
} as const;

export const parseApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiErrorResponse;

    // Handle structured error response from backend
    if (response?.error) {
      return {
        code: response.error.code,
        message: response.error.message,
        status: error.response?.status || 500,
        details: response.error.details,
      };
    }

    // Handle legacy error format (if any)
    if (response && 'message' in response) {
      return {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: (response as any).message || 'An error occurred',
        status: error.response?.status || 500,
      };
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return {
        code: ERROR_CODES.TIMEOUT_ERROR,
        message: 'Request timeout. Please try again.',
        status: 0,
      };
    }

    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
    };
  }

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
};

export const handleApiError = (error: unknown): string => {
  const apiError = parseApiError(error);

  // Format validation errors
  if (apiError.code === ERROR_CODES.VALIDATION_ERROR && apiError.details?.length) {
    return apiError.details.map((d) => d.message).join('. ');
  }

  return apiError.message;
};

export const showErrorToast = (error: unknown): void => {
  const errorMessage = handleApiError(error);
  toast.error(errorMessage);
};

export const showSuccessToast = (message: string): void => {
  toast.success(message);
};

// Check if error is a specific type
export const isUnauthorizedError = (error: unknown): boolean => {
  const apiError = parseApiError(error);
  return apiError.code === ERROR_CODES.UNAUTHORIZED || apiError.status === 401;
};

export const isNetworkError = (error: unknown): boolean => {
  const apiError = parseApiError(error);
  return apiError.code === ERROR_CODES.NETWORK_ERROR;
};

export const isValidationError = (error: unknown): boolean => {
  const apiError = parseApiError(error);
  return apiError.code === ERROR_CODES.VALIDATION_ERROR;
};
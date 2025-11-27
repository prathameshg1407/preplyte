// src/lib/api/services/institute-admin/mockdrive.service.ts

import { AxiosError, AxiosResponse } from 'axios';
import { apiClient } from '../../axios-instance';
import { API_ENDPOINTS } from '../../endpoints';
import {
  CreateMockDriveInput,
  UpdateMockDriveInput,
  ListMockDrivesParams,
  MockDriveDetails,
  MockDriveListItem,
  MockDriveStats,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@/types/admin.mockdrive.types';

// ============================================
// Custom Error Class
// ============================================

export interface ApiErrorDetail {
  field: string;
  message: string;
  code?: string;
}

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

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Creates an ApiError from an Axios error response
   */
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

    // Determine the error message
    const message =
      errorData?.message ||
      data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Determine the error code
    const code = errorData?.code || getErrorCodeFromStatus(response?.status);

    // Get the status code
    const status = response?.status || 500;

    // Get validation details if present
    const details = errorData?.details;

    return new ApiError(message, code, status, details);
  }

  /**
   * Check if error is a specific type
   */
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

  /**
   * Get field-specific error message
   */
  getFieldError(field: string): string | undefined {
    return this.details?.find((d) => d.field === field)?.message;
  }

  /**
   * Get all field errors as a map
   */
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

/**
 * Get error code from HTTP status
 */
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
    case 502:
      return 'BAD_GATEWAY';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'UNKNOWN_ERROR';
  }
}

// ============================================
// Response Handlers
// ============================================

/**
 * Extract data from successful API response
 */
function handleResponse<T>(response: AxiosResponse<ApiSuccessResponse<T>>): T {
  if (!response.data.success) {
    throw new ApiError(
      response.data.message || 'Request failed',
      'REQUEST_FAILED',
      response.status
    );
  }
  return response.data.data;
}

/**
 * Handle and transform errors
 */
function handleError(error: unknown): never {
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

/**
 * Clean params by removing undefined/null values
 */
function cleanParams<T extends Record<string, unknown>>(
  params: T
): Partial<T> {
  return Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key as keyof T] = value as T[keyof T];
      }
      return acc;
    },
    {} as Partial<T>
  );
}

// ============================================
// Mock Drive Service
// ============================================

export const mockDriveService = {
  // ==========================================
  // Create Mock Drive
  // ==========================================
  async create(data: CreateMockDriveInput): Promise<MockDriveDetails> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<MockDriveDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVES,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // Get Mock Drive by ID
  // ==========================================
  async getById(id: string): Promise<MockDriveDetails> {
    if (!id) {
      throw new ApiError('Mock drive ID is required', 'VALIDATION_ERROR', 400);
    }

    try {
      const response = await apiClient.get<ApiSuccessResponse<MockDriveDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE(id)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // List Mock Drives
  // ==========================================
  async list(
    params: ListMockDrivesParams = {}
  ): Promise<PaginatedResponse<MockDriveListItem>> {
    try {
      const cleanedParams = cleanParams({
        page: params.page,
        limit: params.limit,
        status: params.status,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      });

      const response = await apiClient.get<
        ApiSuccessResponse<PaginatedResponse<MockDriveListItem>>
      >(API_ENDPOINTS.INSTITUTE.MOCK_DRIVES, {
        params: cleanedParams,
      });

      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // Update Mock Drive
  // ==========================================
  async update(
    id: string,
    data: UpdateMockDriveInput
  ): Promise<MockDriveDetails> {
    if (!id) {
      throw new ApiError('Mock drive ID is required', 'VALIDATION_ERROR', 400);
    }

    try {
      const response = await apiClient.put<ApiSuccessResponse<MockDriveDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE(id),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // Patch Mock Drive (Partial Update)
  // ==========================================
  async patch(
    id: string,
    data: Partial<UpdateMockDriveInput>
  ): Promise<MockDriveDetails> {
    if (!id) {
      throw new ApiError('Mock drive ID is required', 'VALIDATION_ERROR', 400);
    }

    try {
      const response = await apiClient.patch<ApiSuccessResponse<MockDriveDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE(id),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // Delete Mock Drive
  // ==========================================
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new ApiError('Mock drive ID is required', 'VALIDATION_ERROR', 400);
    }

    try {
      await apiClient.delete(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE(id));
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // Publish Mock Drive
  // ==========================================
  async publish(id: string): Promise<MockDriveDetails> {
    if (!id) {
      throw new ApiError('Mock drive ID is required', 'VALIDATION_ERROR', 400);
    }

    try {
      const response = await apiClient.post<ApiSuccessResponse<MockDriveDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_PUBLISH(id)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // Cancel Mock Drive
  // ==========================================
  async cancel(id: string): Promise<MockDriveDetails> {
    if (!id) {
      throw new ApiError('Mock drive ID is required', 'VALIDATION_ERROR', 400);
    }

    try {
      const response = await apiClient.post<ApiSuccessResponse<MockDriveDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_CANCEL(id)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // Duplicate Mock Drive
  // ==========================================
  async duplicate(id: string, title?: string): Promise<MockDriveDetails> {
    if (!id) {
      throw new ApiError('Mock drive ID is required', 'VALIDATION_ERROR', 400);
    }

    try {
      const response = await apiClient.post<ApiSuccessResponse<MockDriveDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_DUPLICATE(id),
        { title }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // Get Mock Drive Stats
  // ==========================================
  async getStats(id: string): Promise<MockDriveStats> {
    if (!id) {
      throw new ApiError('Mock drive ID is required', 'VALIDATION_ERROR', 400);
    }

    try {
      const response = await apiClient.get<ApiSuccessResponse<MockDriveStats>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_STATS(id)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ==========================================
  // Bulk Operations
  // ==========================================

  /**
   * Delete multiple mock drives
   */
  async bulkDelete(ids: string[]): Promise<{ deleted: number; failed: string[] }> {
    if (!ids.length) {
      throw new ApiError('At least one ID is required', 'VALIDATION_ERROR', 400);
    }

    const results = await Promise.allSettled(
      ids.map((id) => this.delete(id))
    );

    const failed: string[] = [];
    let deleted = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        deleted++;
      } else {
        failed.push(ids[index]);
      }
    });

    return { deleted, failed };
  },

  /**
   * Publish multiple mock drives
   */
  async bulkPublish(
    ids: string[]
  ): Promise<{ published: MockDriveDetails[]; failed: string[] }> {
    if (!ids.length) {
      throw new ApiError('At least one ID is required', 'VALIDATION_ERROR', 400);
    }

    const results = await Promise.allSettled(
      ids.map((id) => this.publish(id))
    );

    const published: MockDriveDetails[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        published.push(result.value);
      } else {
        failed.push(ids[index]);
      }
    });

    return { published, failed };
  },
};

// ============================================
// Type Exports
// ============================================

export type MockDriveService = typeof mockDriveService;
// src/types/api.types.ts

/**
 * Standard API Response wrapper - matches backend format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationDetail[];
}

export interface ValidationDetail {
  field: string;
  message: string;
  code?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListQueryParams extends PaginationParams {
  search?: string;
  filter?: Record<string, string | number | boolean>;
}
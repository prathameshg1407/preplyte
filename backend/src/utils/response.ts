import { Response } from 'express';

// ============================================
// Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

// ============================================
// Response Helpers
// ============================================

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  items: T[],
  meta: PaginationMeta,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T[]> = {
    success: true,
    data: items,
    meta,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: unknown
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details !== undefined) {
    response.error!.details = details;
  }

  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

export const sendAccepted = <T>(
  res: Response,
  data: T,
  message: string = 'Request accepted'
): Response => {
  return sendSuccess(res, data, message, 202);
};

// ============================================
// Pagination Helpers
// ============================================

export const createPaginationMeta = (
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

export const parsePaginationParams = (
  query: Record<string, unknown>,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): { page: number; limit: number; skip: number } => {
  const {
    page: defaultPage = 1,
    limit: defaultLimit = 10,
    maxLimit = 100,
  } = defaults;

  let page = parseInt(query.page as string, 10) || defaultPage;
  let limit = parseInt(query.limit as string, 10) || defaultLimit;

  // Ensure valid values
  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), maxLimit);

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// ============================================
// Sorting Helpers
// ============================================

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export const parseSortParams = (
  query: Record<string, unknown>,
  allowedFields: string[],
  defaultField: string = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
): SortParams => {
  const sortField = (query.sortBy as string) || defaultField;
  const sortOrder = ((query.sortOrder as string) || defaultOrder).toLowerCase();

  return {
    field: allowedFields.includes(sortField) ? sortField : defaultField,
    order: sortOrder === 'asc' ? 'asc' : 'desc',
  };
};
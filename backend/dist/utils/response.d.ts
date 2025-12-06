import { Response } from 'express';
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
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
export declare const sendPaginated: <T>(res: Response, items: T[], meta: PaginationMeta, message?: string, statusCode?: number) => Response;
export declare const sendError: (res: Response, code: string, message: string, statusCode?: number, details?: unknown) => Response;
export declare const sendCreated: <T>(res: Response, data: T, message?: string) => Response;
export declare const sendNoContent: (res: Response) => Response;
export declare const sendAccepted: <T>(res: Response, data: T, message?: string) => Response;
export declare const createPaginationMeta: (page: number, limit: number, totalItems: number) => PaginationMeta;
export declare const parsePaginationParams: (query: Record<string, unknown>, defaults?: {
    page?: number;
    limit?: number;
    maxLimit?: number;
}) => {
    page: number;
    limit: number;
    skip: number;
};
export interface SortParams {
    field: string;
    order: 'asc' | 'desc';
}
export declare const parseSortParams: (query: Record<string, unknown>, allowedFields: string[], defaultField?: string, defaultOrder?: "asc" | "desc") => SortParams;
//# sourceMappingURL=response.d.ts.map
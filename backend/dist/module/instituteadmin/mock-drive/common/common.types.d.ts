/**
 * Common types shared across mock drive modules
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
export type SortOrder = 'asc' | 'desc';
export interface SortParams<T extends string = string> {
    sortBy?: T;
    sortOrder?: SortOrder;
}
export declare class BaseError extends Error {
    code: string;
    statusCode: number;
    constructor(code: string, message: string, statusCode?: number);
    toJSON(): {
        name: string;
        code: string;
        message: string;
        statusCode: number;
    };
}
export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};
export type JsonObject = {
    [key: string]: JsonValue;
};
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
//# sourceMappingURL=common.types.d.ts.map
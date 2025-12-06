import { Request, Response, NextFunction } from 'express';
/**
 * Global error handler middleware
 */
export declare const errorHandler: (error: Error, req: Request, res: Response, _next: NextFunction) => void;
/**
 * 404 Not Found handler
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
/**
 * Async handler wrapper to catch errors in async route handlers
 */
export declare const asyncHandler: <T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map
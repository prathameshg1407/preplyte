// src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { isAppError } from '../utils/errors';  // Changed import path
import { logger } from '../utils/logger';

/**
 * Format Zod validation errors into a readable format
 */
const formatZodErrors = (error: ZodError) => {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
    code: e.code,
  }));
};

/**
 * Get request ID from request object safely
 */
const getRequestId = (req: Request): string => {
  return (req as any).requestId || 'unknown';
};

/**
 * Get user ID from request object safely
 */
const getUserId = (req: Request): string | undefined => {
  return (req as any).user?.id;
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
  res: Response,
  requestId: string
): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  switch (error.code) {
    case 'P2002': {
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `A record with this ${field} already exists`,
        },
        requestId,
      });
      break;
    }
    case 'P2025':
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
        requestId,
      });
      break;
    case 'P2003':
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REFERENCE',
          message: 'Invalid reference - related record not found',
        },
        requestId,
      });
      break;
    case 'P2014':
      res.status(400).json({
        success: false,
        error: {
          code: 'RELATION_VIOLATION',
          message: 'The change would violate a required relation',
        },
        requestId,
      });
      break;
    default:
      logger.error('Unhandled Prisma error', { code: error.code, meta: error.meta });
      res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: isProduction ? 'A database error occurred' : error.message,
        },
        requestId,
      });
  }
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = getRequestId(req);
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error with context
  const errorContext = {
    requestId,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: getUserId(req),
  };

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = formatZodErrors(error);
    logger.warn('Validation error', { ...errorContext, details });

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
      requestId,
    });
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn('Prisma error', { ...errorContext, code: error.code });
    handlePrismaError(error, res, requestId);
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    logger.warn('Prisma validation error', errorContext);
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided',
      },
      requestId,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error('Database connection error', { ...errorContext, message: error.message });
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection error',
      },
      requestId,
    });
    return;
  }

  // Handle AppError (our custom errors)
  if (isAppError(error)) {
    if (error.isOperational) {
      logger.warn('Operational error', {
        ...errorContext,
        code: error.code,
        message: error.message,
      });
    } else {
      logger.error('Non-operational error', {
        ...errorContext,
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
    }

    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && !isProduction ? { details: error.details } : {}),
      },
      requestId,
    });
    return;
  }

  // Handle SyntaxError (usually from JSON parsing)
  if (error instanceof SyntaxError && 'body' in error) {
    logger.warn('JSON parse error', errorContext);
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
      },
      requestId,
    });
    return;
  }

  // Handle unknown errors
  logger.error('Unhandled error', {
    ...errorContext,
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'An unexpected error occurred' : error.message,
      ...(isProduction ? {} : { stack: error.stack }),
    },
    requestId,
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = getRequestId(req);

  logger.warn('Route not found', {
    requestId,
    path: req.path,
    method: req.method,
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    requestId,
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { isAppError } from '../lib/errors';
import { logger } from '../utils/logger';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error with context
  logger.error('Error caught by handler', {
    error: err.message,
    name: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // Build base response
  const buildResponse = (
    code: string,
    message: string,
    details?: unknown
  ): ErrorResponse => {
    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
      },
    };

    if (details !== undefined) {
      response.error.details = details;
    }

    if (!isProduction && err.stack) {
      response.error.stack = err.stack;
    }

    return response;
  };

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    res.status(400).json(buildResponse('VALIDATION_ERROR', 'Validation failed', details));
    return;
  }

  // Handle custom AppError (and all subclasses)
  if (isAppError(err)) {
    res.status(err.statusCode).json(buildResponse(err.code, err.message, err.details));
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string; meta?: { target?: string[] } };

    switch (prismaError.code) {
      case 'P2002': {
        // Unique constraint violation
        const fields = prismaError.meta?.target?.join(', ') || 'field';
        res.status(409).json(
          buildResponse(
            'DUPLICATE_ENTRY',
            `A record with this ${fields} already exists`,
            { fields: prismaError.meta?.target }
          )
        );
        return;
      }
      case 'P2025': {
        // Record not found
        res.status(404).json(buildResponse('NOT_FOUND', 'Record not found'));
        return;
      }
      case 'P2003': {
        // Foreign key constraint violation
        res.status(400).json(
          buildResponse('INVALID_REFERENCE', 'Referenced record does not exist')
        );
        return;
      }
      case 'P2014': {
        // Required relation violation
        res.status(400).json(
          buildResponse('RELATION_VIOLATION', 'Required relation constraint violated')
        );
        return;
      }
    }
  }

  // Handle Prisma validation errors
  if (err.name === 'PrismaClientValidationError') {
    res.status(400).json(
      buildResponse(
        'DATABASE_VALIDATION_ERROR',
        isProduction ? 'Invalid data provided' : err.message
      )
    );
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json(buildResponse('INVALID_JSON', 'Invalid JSON in request body'));
    return;
  }

  // Handle JWT errors (if jose errors slip through)
  if (err.name === 'JWTExpired') {
    res.status(401).json(
      buildResponse('TOKEN_EXPIRED', 'Your session has expired. Please login again.')
    );
    return;
  }

  if (err.name === 'JWTClaimValidationFailed' || err.name === 'JWTInvalid') {
    res.status(401).json(buildResponse('INVALID_TOKEN', 'Invalid authentication token'));
    return;
  }

  // Default error response
  res.status(500).json(
    buildResponse(
      'INTERNAL_SERVER_ERROR',
      isProduction ? 'An unexpected error occurred' : err.message
    )
  );
};

// Async handler wrapper to catch async errors
export const asyncHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler for undefined routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
};
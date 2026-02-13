import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.slice(1).join('.'),
          message: err.message,
        }));

        logger.warn('Validation error', { 
          path: req.path,
          body: req.body,
          errors: details 
        });

        sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 400, details);
        return;
      }
      next(error);
    }
  };
};
// src/middleware/request-id.middleware.ts

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Use existing request ID from header or generate new one
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

const generateRequestId = (): string => {
  return `${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}`;
};
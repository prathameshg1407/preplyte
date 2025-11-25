import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { prisma } from '../lib/db';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

// Validate JWT_SECRET at startup
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    instituteId: string | null;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required. Please provide a valid token.', 401);
      return;
    }

    const token = authHeader.substring(7);

    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
        issuer: 'preplyte-api',
        audience: 'preplyte-client',
      });

      const user = await prisma.user.findUnique({
        where: { id: payload.sub as string },
        select: {
          id: true,
          email: true,
          role: true,
          instituteId: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        sendError(res, 'UNAUTHORIZED', 'User not found or inactive', 401);
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
      };

      next();
    } catch (jwtError) {
      if (jwtError instanceof jose.errors.JWTExpired) {
        sendError(res, 'TOKEN_EXPIRED', 'Your session has expired. Please login again.', 401);
        return;
      }
      if (jwtError instanceof jose.errors.JWTClaimValidationFailed) {
        sendError(res, 'UNAUTHORIZED', 'Invalid token claims', 401);
        return;
      }
      sendError(res, 'UNAUTHORIZED', 'Invalid token', 401);
      return;
    }
  } catch (error) {
    logger.error('Authentication error', error);
    sendError(res, 'UNAUTHORIZED', 'Authentication failed', 401);
    return;
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = authHeader.substring(7);
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: 'preplyte-api',
      audience: 'preplyte-client',
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: {
        id: true,
        email: true,
        role: true,
        instituteId: true,
        isActive: true,
      },
    });

    if (user?.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
      };
    }
  } catch (error) {
    // Silently continue without user - auth is optional
    logger.debug('Optional auth failed, continuing without user', error);
  }

  next();
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'FORBIDDEN', 'You do not have permission to perform this action', 403);
      return;
    }

    next();
  };
};

// Institute-specific authorization middleware
export const authorizeInstitute = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    return;
  }

  if (!req.user.instituteId) {
    sendError(res, 'FORBIDDEN', 'This action requires institute membership', 403);
    return;
  }

  next();
};
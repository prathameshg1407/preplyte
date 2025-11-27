import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { prisma } from '../lib/db';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

// ============================================
// Configuration
// ============================================

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

// ============================================
// Types
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  instituteId: string | null;
  tokenVersion: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// User select fields for consistent queries
const userSelectFields = {
  id: true,
  email: true,
  role: true,
  instituteId: true,
  isActive: true,
  tokenVersion: true,
} as const;

// ============================================
// Authentication Middleware
// ============================================

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      sendError(
        res,
        'UNAUTHORIZED',
        'Authentication required. Please provide a valid token.',
        401
      );
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      sendError(res, 'UNAUTHORIZED', 'Token is required', 401);
      return;
    }

    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
        issuer: 'preplyte-api',
        audience: 'preplyte-client',
      });

      const userId = payload.sub as string;
      const tokenVersion = (payload.tokenVersion as number) || 0;

      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: userSelectFields,
      });

      if (!user) {
        sendError(res, 'UNAUTHORIZED', 'User not found', 401);
        return;
      }

      if (!user.isActive) {
        sendError(res, 'UNAUTHORIZED', 'Account is inactive', 401);
        return;
      }

      // Check token version for logout-all functionality
      if (user.tokenVersion !== tokenVersion) {
        sendError(res, 'UNAUTHORIZED', 'Session has been revoked. Please login again.', 401);
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        tokenVersion: user.tokenVersion,
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

// ============================================
// Optional Authentication Middleware
// ============================================

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
    
    if (!token) {
      next();
      return;
    }

    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: 'preplyte-api',
      audience: 'preplyte-client',
    });

    const userId = payload.sub as string;
    const tokenVersion = (payload.tokenVersion as number) || 0;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelectFields,
    });

    if (user?.isActive && user.tokenVersion === tokenVersion) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        tokenVersion: user.tokenVersion,
      };
    }
  } catch (error) {
    // Silently continue without user - auth is optional
    logger.debug('Optional auth failed, continuing without user');
  }

  next();
};

// ============================================
// Authorization Middleware
// ============================================

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

// ============================================
// Institute Authorization Middleware
// ============================================

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

// ============================================
// Institute Admin Authorization Middleware
// ============================================

export const authorizeInstituteAdmin = (
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

  if (!['ADMIN', 'INSTITUTE_ADMIN'].includes(req.user.role)) {
    sendError(res, 'FORBIDDEN', 'This action requires admin privileges', 403);
    return;
  }

  next();
};

// ============================================
// Resource Owner Authorization Middleware
// ============================================

export const authorizeOwnerOrAdmin = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const resourceUserId = req.params[userIdParam];

    // Allow if user is admin or owner of the resource
    if (req.user.role === 'ADMIN' || req.user.id === resourceUserId) {
      next();
      return;
    }

    sendError(res, 'FORBIDDEN', 'You do not have permission to access this resource', 403);
  };
};
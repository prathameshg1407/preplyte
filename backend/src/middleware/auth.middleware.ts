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
const JWT_ISSUER = 'preplyte-api';
const JWT_AUDIENCE = 'preplyte-client';

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

interface JWTPayload extends jose.JWTPayload {
  sub: string;
  role: string;
  instituteId: string | null;
  tokenVersion: number;
}

const USER_SELECT = {
  id: true,
  email: true,
  role: true,
  instituteId: true,
  isActive: true,
  tokenVersion: true,
} as const;

type UserSelectResult = {
  id: string;
  email: string;
  role: string;
  instituteId: string | null;
  isActive: boolean;
  tokenVersion: number;
};

// ============================================
// Helper Functions
// ============================================

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token || null;
}

function isValidJWTPayload(payload: jose.JWTPayload): payload is JWTPayload {
  return (
    typeof payload.sub === 'string' &&
    payload.sub.length > 0 &&
    typeof payload.tokenVersion === 'number'
  );
}

function mapUserToAuthUser(user: UserSelectResult): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    instituteId: user.instituteId,
    tokenVersion: user.tokenVersion,
  };
}

interface VerifyResult {
  user?: AuthUser;
  error?: {
    code: string;
    message: string;
    status: number;
  };
}

async function verifyTokenAndGetUser(token: string): Promise<VerifyResult> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (!isValidJWTPayload(payload)) {
      return {
        error: { code: 'UNAUTHORIZED', message: 'Invalid token payload', status: 401 },
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: USER_SELECT,
    });

    if (!user) {
      return {
        error: { code: 'UNAUTHORIZED', message: 'User not found', status: 401 },
      };
    }

    if (!user.isActive) {
      return {
        error: { code: 'UNAUTHORIZED', message: 'Account is inactive', status: 401 },
      };
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return {
        error: {
          code: 'TOKEN_REVOKED',
          message: 'Session has been revoked. Please login again.',
          status: 401,
        },
      };
    }

    return { user: mapUserToAuthUser(user) };
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      return {
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please login again.',
          status: 401,
        },
      };
    }
    if (error instanceof jose.errors.JWTClaimValidationFailed) {
      return {
        error: { code: 'UNAUTHORIZED', message: 'Invalid token claims', status: 401 },
      };
    }
    return {
      error: { code: 'UNAUTHORIZED', message: 'Invalid token', status: 401 },
    };
  }
}

// ============================================
// Authentication Middleware
// ============================================

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const result = await verifyTokenAndGetUser(token);

    if (result.error) {
      sendError(res, result.error.code, result.error.message, result.error.status);
      return;
    }

    req.user = result.user;
    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    sendError(res, 'UNAUTHORIZED', 'Authentication failed', 401);
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
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (token) {
      const result = await verifyTokenAndGetUser(token);
      if (result.user) {
        req.user = result.user;
      }
    }
  } catch {
    // Continue without user for optional auth
  }

  next();
};

// ============================================
// Authorization Middleware
// ============================================

type AllowedRole = 'PLATFORM_ADMIN' | 'INSTITUTE_ADMIN' | 'USER';

export const authorize = (...allowedRoles: AllowedRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role as AllowedRole)) {
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

const INSTITUTE_ADMIN_ROLES: AllowedRole[] = ['PLATFORM_ADMIN', 'INSTITUTE_ADMIN'];

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

  if (!INSTITUTE_ADMIN_ROLES.includes(req.user.role as AllowedRole)) {
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

    if (!resourceUserId) {
      sendError(res, 'BAD_REQUEST', `Missing parameter: ${userIdParam}`, 400);
      return;
    }

    const isAdmin = req.user.role === 'PLATFORM_ADMIN';
    const isOwner = req.user.id === resourceUserId;

    if (isAdmin || isOwner) {
      next();
      return;
    }

    sendError(res, 'FORBIDDEN', 'You do not have permission to access this resource', 403);
  };
};
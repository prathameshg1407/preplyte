"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeOwnerOrAdmin = exports.authorizeInstituteAdmin = exports.authorizeInstitute = exports.authorize = exports.optionalAuth = exports.authenticate = void 0;
const jose = __importStar(require("jose"));
const db_1 = require("../lib/db");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
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
const USER_SELECT = {
    id: true,
    email: true,
    role: true,
    instituteId: true,
    isActive: true,
    tokenVersion: true,
};
// ============================================
// Helper Functions
// ============================================
function extractBearerToken(authHeader) {
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.slice(7).trim();
    return token || null;
}
function isValidJWTPayload(payload) {
    return (typeof payload.sub === 'string' &&
        payload.sub.length > 0 &&
        typeof payload.tokenVersion === 'number');
}
function mapUserToAuthUser(user) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        tokenVersion: user.tokenVersion,
    };
}
async function verifyTokenAndGetUser(token) {
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
        const user = await db_1.prisma.user.findUnique({
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
    }
    catch (error) {
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
const authenticate = async (req, res, next) => {
    try {
        const token = extractBearerToken(req.headers.authorization);
        if (!token) {
            (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
            return;
        }
        const result = await verifyTokenAndGetUser(token);
        if (result.error) {
            (0, response_1.sendError)(res, result.error.code, result.error.message, result.error.status);
            return;
        }
        req.user = result.user;
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error', { error });
        (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication failed', 401);
    }
};
exports.authenticate = authenticate;
// ============================================
// Optional Authentication Middleware
// ============================================
const optionalAuth = async (req, _res, next) => {
    try {
        const token = extractBearerToken(req.headers.authorization);
        if (token) {
            const result = await verifyTokenAndGetUser(token);
            if (result.user) {
                req.user = result.user;
            }
        }
    }
    catch {
        // Continue without user for optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            (0, response_1.sendError)(res, 'FORBIDDEN', 'You do not have permission to perform this action', 403);
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// ============================================
// Institute Authorization Middleware
// ============================================
const authorizeInstitute = (req, res, next) => {
    if (!req.user) {
        (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
        return;
    }
    if (!req.user.instituteId) {
        (0, response_1.sendError)(res, 'FORBIDDEN', 'This action requires institute membership', 403);
        return;
    }
    next();
};
exports.authorizeInstitute = authorizeInstitute;
// ============================================
// Institute Admin Authorization Middleware
// ============================================
const INSTITUTE_ADMIN_ROLES = ['PLATFORM_ADMIN', 'INSTITUTE_ADMIN'];
const authorizeInstituteAdmin = (req, res, next) => {
    if (!req.user) {
        (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
        return;
    }
    if (!req.user.instituteId) {
        (0, response_1.sendError)(res, 'FORBIDDEN', 'This action requires institute membership', 403);
        return;
    }
    if (!INSTITUTE_ADMIN_ROLES.includes(req.user.role)) {
        (0, response_1.sendError)(res, 'FORBIDDEN', 'This action requires admin privileges', 403);
        return;
    }
    next();
};
exports.authorizeInstituteAdmin = authorizeInstituteAdmin;
// ============================================
// Resource Owner Authorization Middleware
// ============================================
const authorizeOwnerOrAdmin = (userIdParam = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
            return;
        }
        const resourceUserId = req.params[userIdParam];
        if (!resourceUserId) {
            (0, response_1.sendError)(res, 'BAD_REQUEST', `Missing parameter: ${userIdParam}`, 400);
            return;
        }
        const isAdmin = req.user.role === 'PLATFORM_ADMIN';
        const isOwner = req.user.id === resourceUserId;
        if (isAdmin || isOwner) {
            next();
            return;
        }
        (0, response_1.sendError)(res, 'FORBIDDEN', 'You do not have permission to access this resource', 403);
    };
};
exports.authorizeOwnerOrAdmin = authorizeOwnerOrAdmin;
//# sourceMappingURL=auth.middleware.js.map
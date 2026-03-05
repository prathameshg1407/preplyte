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
exports.googleAuthCallback = exports.verifyToken = exports.me = exports.logoutAll = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
// ============================================
// Validation Schemas
// ============================================
const registerSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Invalid email address')
        .transform((email) => email.toLowerCase().trim()),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name too long')
        .trim()
        .optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Invalid email address')
        .transform((email) => email.toLowerCase().trim()),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
const logoutSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().optional(),
});
// ============================================
// Helper Functions
// ============================================
function handleValidationError(res, error) {
    const details = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
    }));
    (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
}
// ============================================
// Controller Functions
// ============================================
const register = async (req, res, next) => {
    try {
        const parseResult = registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            handleValidationError(res, parseResult.error);
            return;
        }
        const user = await auth_service_1.authService.register(parseResult.data);
        (0, response_1.sendSuccess)(res, user, 'User registered successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            handleValidationError(res, parseResult.error);
            return;
        }
        const result = await auth_service_1.authService.login(parseResult.data);
        (0, response_1.sendSuccess)(res, result, 'Login successful');
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const parseResult = refreshTokenSchema.safeParse(req.body);
        if (!parseResult.success) {
            handleValidationError(res, parseResult.error);
            return;
        }
        const result = await auth_service_1.authService.refreshToken(parseResult.data.refreshToken);
        (0, response_1.sendSuccess)(res, result, 'Token refreshed successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
            return;
        }
        const parseResult = logoutSchema.safeParse(req.body);
        if (!parseResult.success) {
            handleValidationError(res, parseResult.error);
            return;
        }
        const { refreshToken } = parseResult.data;
        if (refreshToken) {
            await auth_service_1.authService.logout(req.user.id, refreshToken);
        }
        (0, response_1.sendSuccess)(res, null, 'Logout successful');
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const logoutAll = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
            return;
        }
        await auth_service_1.authService.logoutAll(req.user.id);
        (0, response_1.sendSuccess)(res, null, 'Logged out from all devices');
    }
    catch (error) {
        next(error);
    }
};
exports.logoutAll = logoutAll;
const me = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
            return;
        }
        const user = await auth_service_1.authService.getUser(req.user.id);
        (0, response_1.sendSuccess)(res, user);
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
const verifyToken = async (req, res, _next) => {
    if (!req.user) {
        (0, response_1.sendError)(res, 'UNAUTHORIZED', 'Authentication required', 401);
        return;
    }
    (0, response_1.sendSuccess)(res, { valid: true, user: req.user }, 'Token is valid');
};
exports.verifyToken = verifyToken;
// ============================================
// Google OAuth Controllers
// ============================================
const googleAuthCallback = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'OAUTH_ERROR', 'Google authentication failed', 401);
            return;
        }
        const { handleGoogleCallback } = await Promise.resolve().then(() => __importStar(require('./google-oauth.service')));
        const result = await handleGoogleCallback(req.user);
        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        next(error);
    }
};
exports.googleAuthCallback = googleAuthCallback;
//# sourceMappingURL=auth.controller.js.map
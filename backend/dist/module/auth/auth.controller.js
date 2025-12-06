"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.me = exports.logoutAll = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
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
//# sourceMappingURL=auth.controller.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
exports.authRoutes = router;
// ============================================
// Rate Limiter Factory
// ============================================
const createRateLimiter = (windowMs, max, message) => (0, express_rate_limit_1.default)({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMITED',
            message,
        },
    },
});
// ============================================
// Rate Limiters
// ============================================
const authLimiter = createRateLimiter(15 * 60 * 1000, // 15 minutes
10, 'Too many login attempts. Please try again later.');
const registerLimiter = createRateLimiter(60 * 60 * 1000, // 1 hour
5, 'Too many registration attempts. Please try again later.');
const refreshLimiter = createRateLimiter(15 * 60 * 1000, // 15 minutes
30, 'Too many token refresh attempts.');
const generalLimiter = createRateLimiter(60 * 1000, // 1 minute
60, 'Too many requests. Please slow down.');
// ============================================
// Public Routes
// ============================================
router.post('/register', registerLimiter, auth_controller_1.register);
router.post('/login', authLimiter, auth_controller_1.login);
router.post('/refresh', refreshLimiter, auth_controller_1.refreshToken);
// ============================================
// Protected Routes
// ============================================
router.post('/logout', auth_middleware_1.authenticate, generalLimiter, auth_controller_1.logout);
router.post('/logout-all', auth_middleware_1.authenticate, generalLimiter, auth_controller_1.logoutAll);
router.get('/me', auth_middleware_1.authenticate, generalLimiter, auth_controller_1.me);
router.get('/verify', auth_middleware_1.authenticate, generalLimiter, auth_controller_1.verifyToken);
//# sourceMappingURL=auth.routes.js.map
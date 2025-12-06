"use strict";
// src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = require("express-rate-limit");
// Route Imports
const auth_routes_1 = require("./module/auth/auth.routes");
const practice_routes_1 = __importDefault(require("./module/practice/practice.routes"));
const admin_routes_1 = __importDefault(require("./module/admin/admin.routes"));
const profile_1 = require("./module/profile");
const mock_drive_1 = require("./module/instituteadmin/mock-drive");
const mock_drive_2 = require("./module/mock-drive");
const dashboard_1 = require("./module/dashboard");
// Middleware & Utils
const error_middleware_1 = require("./middleware/error.middleware");
const request_id_middleware_1 = require("./middleware/request-id.middleware");
const logger_1 = require("./utils/logger");
const errors_1 = require("./utils/errors");
const db_1 = require("./lib/db");
// =====================================================
// APP INITIALIZATION
// =====================================================
const app = (0, express_1.default)();
// =====================================================
// CONFIGURATION
// =====================================================
const config = {
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    corsOrigins: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? ['http://localhost:3000'],
    bodyLimit: process.env.BODY_LIMIT || '5mb',
    rateLimits: {
        general: {
            windowMs: 15 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_GENERAL || '100', 10),
        },
        auth: {
            windowMs: 15 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_AUTH || '10', 10),
        },
        codeExecution: {
            windowMs: 1 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_CODE || '30', 10),
        },
        admin: {
            windowMs: 15 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_ADMIN || '200', 10),
        },
        profile: {
            windowMs: 15 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_PROFILE || '50', 10),
        },
        upload: {
            windowMs: 60 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_UPLOAD || '10', 10),
        },
        mockDrive: {
            windowMs: 15 * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_MOCK_DRIVE || '100', 10),
        },
    },
};
exports.config = config;
// =====================================================
// 1. TRUST PROXY
// =====================================================
app.set('trust proxy', config.isProduction ? 1 : false);
// =====================================================
// 2. SECURITY MIDDLEWARE
// =====================================================
app.use((0, helmet_1.default)({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
// =====================================================
// 3. CORS CONFIGURATION
// =====================================================
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
            callback(null, true);
        }
        else {
            logger_1.logger.warn(`CORS blocked origin: ${origin}`);
            callback(new errors_1.AppError('CORS_ERROR', 'Not allowed by CORS', 403));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Client-Version'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,
    optionsSuccessStatus: 204,
}));
// =====================================================
// 4. REQUEST PROCESSING MIDDLEWARE
// =====================================================
app.use(request_id_middleware_1.requestIdMiddleware);
if (!config.isTest) {
    app.use((0, morgan_1.default)(config.isProduction ? 'combined' : 'dev', {
        stream: {
            write: (message) => {
                logger_1.logger.info(message.trim());
            },
        },
        // Skip logging for health checks and WebSocket upgrade attempts
        skip: (req) => req.path === '/health' || req.path.startsWith('/ws/'),
    }));
}
app.use((0, compression_1.default)({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
}));
app.use(express_1.default.json({ limit: config.bodyLimit }));
app.use(express_1.default.urlencoded({ extended: true, limit: config.bodyLimit }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
// =====================================================
// 5. RATE LIMITERS
// =====================================================
const createRateLimiter = (windowMs, max, message) => {
    return (0, express_rate_limit_1.rateLimit)({
        windowMs,
        max,
        message: {
            success: false,
            error: {
                code: 'RATE_LIMITED',
                message,
            },
        },
        standardHeaders: true,
        legacyHeaders: false,
        // Skip rate limiting for tests and WebSocket paths
        skip: (req) => config.isTest || req.path.startsWith('/ws/'),
        keyGenerator: (req) => {
            return (req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                req.ip ||
                'unknown');
        },
        handler: (req, res) => {
            logger_1.logger.warn('Rate limit exceeded', {
                ip: req.ip,
                path: req.path,
                method: req.method,
            });
            res.status(429).json({
                success: false,
                error: {
                    code: 'RATE_LIMITED',
                    message,
                },
            });
        },
    });
};
const generalLimiter = createRateLimiter(config.rateLimits.general.windowMs, config.rateLimits.general.max, 'Too many requests from this IP. Please try again later.');
const authLimiter = createRateLimiter(config.rateLimits.auth.windowMs, config.rateLimits.auth.max, 'Too many authentication attempts. Please try again later.');
const codeExecutionLimiter = createRateLimiter(config.rateLimits.codeExecution.windowMs, config.rateLimits.codeExecution.max, 'Too many code executions. Please wait before trying again.');
const adminLimiter = createRateLimiter(config.rateLimits.admin.windowMs, config.rateLimits.admin.max, 'Too many admin requests. Please try again later.');
const profileLimiter = createRateLimiter(config.rateLimits.profile.windowMs, config.rateLimits.profile.max, 'Too many profile requests. Please try again later.');
const uploadLimiter = createRateLimiter(config.rateLimits.upload.windowMs, config.rateLimits.upload.max, 'Too many file uploads. Please try again later.');
const mockDriveLimiter = createRateLimiter(config.rateLimits.mockDrive.windowMs, config.rateLimits.mockDrive.max, 'Too many mock drive requests. Please try again later.');
// Apply general limiter to all API routes
app.use('/api', generalLimiter);
// =====================================================
// 6. HEALTH CHECK ROUTES
// =====================================================
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: config.env,
        version: process.env.npm_package_version || '1.0.0',
    });
});
app.get('/ready', async (_req, res) => {
    try {
        await db_1.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            success: true,
            status: 'ready',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
            },
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            status: 'not_ready',
            timestamp: new Date().toISOString(),
            services: {
                database: 'disconnected',
            },
        });
    }
});
app.get('/api', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Practice Platform API',
        version: process.env.npm_package_version || '1.0.0',
        documentation: '/api/docs',
        health: '/health',
    });
});
// =====================================================
// 7. API ROUTES
// =====================================================
// Auth routes with specific rate limiter
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', auth_routes_1.authRoutes);
// Profile routes with specific rate limiters
app.use('/api/profile/resumes', uploadLimiter);
app.use('/api/profile', profileLimiter, profile_1.profileRoutes);
// Institute admin mock drive routes
app.use('/api/institute/mock-drive', mock_drive_1.mockDriveRoutes);
// Student mock drive routes
app.use('/api/mock-drives', mockDriveLimiter, (0, mock_drive_2.createMockDriveRoutes)(db_1.prisma));
// Practice routes - mounted at /api/practice
// Includes: /api/practice/aptitude, /api/practice/machine, /api/practice/interview
app.use('/api/practice', practice_routes_1.default);
// Code execution rate limiting
app.use('/api/practice/machine/sessions/:sessionId/questions/:questionId/run', codeExecutionLimiter);
app.use('/api/practice/machine/sessions/:sessionId/questions/:questionId/submit', codeExecutionLimiter);
// Mock drive code execution rate limiting
app.use('/api/mock-drives/:driveId/modules/:moduleId/machine/submit', codeExecutionLimiter);
// Admin routes with specific rate limiter
app.use('/api/admin', adminLimiter, admin_routes_1.default);
app.use('/api/dashboard', dashboard_1.dashboardRoutes);
// =====================================================
// 8. ERROR HANDLING
// =====================================================
// Note: Don't handle /ws/ paths in Express - they're handled by WebSocket upgrade
app.use((req, res, next) => {
    // WebSocket upgrade requests shouldn't reach here, but if they do, skip them
    if (req.headers.upgrade === 'websocket') {
        return next();
    }
    (0, error_middleware_1.notFoundHandler)(req, res);
});
app.use(error_middleware_1.errorHandler);
// =====================================================
// EXPORT
// =====================================================
exports.default = app;
//# sourceMappingURL=app.js.map
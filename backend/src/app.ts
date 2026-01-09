// src/app.ts

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';

// Route Imports
import { authRoutes } from './module/auth/auth.routes';
import practiceRoutes from './module/practice/practice.routes';
import adminRoutes from './module/admin/admin.routes';
import { profileRoutes } from './module/profile';
import { mockDriveRoutes } from './module/instituteadmin/mock-drive';
import { departmentRoutes } from './module/instituteadmin/department';
import { createMockDriveRoutes } from './module/mock-drive';
import { dashboardRoutes } from './module/dashboard';

// Middleware & Utils
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { logger } from './utils/logger';
import { AppError } from './utils/errors';
import { prisma } from './lib/db';

// =====================================================
// APP INITIALIZATION
// =====================================================

const app: Application = express();

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
    instituteAdmin: {
      windowMs: 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_INSTITUTE_ADMIN || '150', 10),
    },
  },
};

// =====================================================
// 1. TRUST PROXY
// =====================================================

app.set('trust proxy', config.isProduction ? 1 : false);

// =====================================================
// 2. SECURITY MIDDLEWARE
// =====================================================

app.use(
  helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// =====================================================
// 3. CORS CONFIGURATION
// =====================================================

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new AppError('CORS_ERROR', 'Not allowed by CORS', 403));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Client-Version'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,
    optionsSuccessStatus: 204,
  })
);

// =====================================================
// 4. REQUEST PROCESSING MIDDLEWARE
// =====================================================

app.use(requestIdMiddleware);

if (!config.isTest) {
  app.use(
    morgan(config.isProduction ? 'combined' : 'dev', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        },
      },
      skip: (req) => req.path === '/health' || req.path.startsWith('/ws/'),
    })
  );
}

app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// =====================================================
// 5. RATE LIMITERS
// =====================================================

const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string
): RateLimitRequestHandler => {
  return rateLimit({
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
    skip: (req) => config.isTest || req.path.startsWith('/ws/'),
    keyGenerator: (req) => {
      return (
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.ip ||
        'unknown'
      );
    },
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
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

const generalLimiter = createRateLimiter(
  config.rateLimits.general.windowMs,
  config.rateLimits.general.max,
  'Too many requests from this IP. Please try again later.'
);

const authLimiter = createRateLimiter(
  config.rateLimits.auth.windowMs,
  config.rateLimits.auth.max,
  'Too many authentication attempts. Please try again later.'
);

const codeExecutionLimiter = createRateLimiter(
  config.rateLimits.codeExecution.windowMs,
  config.rateLimits.codeExecution.max,
  'Too many code executions. Please wait before trying again.'
);

const adminLimiter = createRateLimiter(
  config.rateLimits.admin.windowMs,
  config.rateLimits.admin.max,
  'Too many admin requests. Please try again later.'
);

const profileLimiter = createRateLimiter(
  config.rateLimits.profile.windowMs,
  config.rateLimits.profile.max,
  'Too many profile requests. Please try again later.'
);

const uploadLimiter = createRateLimiter(
  config.rateLimits.upload.windowMs,
  config.rateLimits.upload.max,
  'Too many file uploads. Please try again later.'
);

const mockDriveLimiter = createRateLimiter(
  config.rateLimits.mockDrive.windowMs,
  config.rateLimits.mockDrive.max,
  'Too many mock drive requests. Please try again later.'
);

const instituteAdminLimiter = createRateLimiter(
  config.rateLimits.instituteAdmin.windowMs,
  config.rateLimits.instituteAdmin.max,
  'Too many institute admin requests. Please try again later.'
);

// Apply general limiter to all API routes
app.use('/api', generalLimiter);

// =====================================================
// 6. HEALTH CHECK ROUTES
// =====================================================

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.env,
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
      },
    });
  } catch (error) {
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

app.get('/api', (_req: Request, res: Response) => {
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
app.use('/api/auth', authRoutes);

// Profile routes with specific rate limiters
app.use('/api/profile/resumes', uploadLimiter);
app.use('/api/profile', profileLimiter, profileRoutes);

// =====================================================
// INSTITUTE ADMIN ROUTES
// =====================================================

// Apply institute admin rate limiter to all institute routes
app.use('/api/institute', instituteAdminLimiter);

// Department management
app.use('/api/institute/departments', departmentRoutes);

// Mock drive management (for institute admins)
app.use('/api/institute/mock-drives', mockDriveRoutes);

// Student management

// =====================================================
// STUDENT ROUTES
// =====================================================

// Student mock drive routes (discovery, attempt, results)
app.use('/api/mock-drives', mockDriveLimiter, createMockDriveRoutes(prisma));

// Practice routes - mounted at /api/practice
// Includes: /api/practice/aptitude, /api/practice/machine, /api/practice/interview
app.use('/api/practice', practiceRoutes);

// Code execution rate limiting
app.use(
  '/api/practice/machine/sessions/:sessionId/questions/:questionId/run',
  codeExecutionLimiter
);
app.use(
  '/api/practice/machine/sessions/:sessionId/questions/:questionId/submit',
  codeExecutionLimiter
);

// Mock drive code execution rate limiting
app.use(
  '/api/mock-drives/:driveId/modules/:moduleId/machine/submit',
  codeExecutionLimiter
);

// =====================================================
// PLATFORM ADMIN ROUTES
// =====================================================

// Admin routes with specific rate limiter
app.use('/api/admin', adminLimiter, adminRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// =====================================================
// 8. ERROR HANDLING
// =====================================================

app.use((req, res, next) => {
  if (req.headers.upgrade === 'websocket') {
    return next();
  }
  notFoundHandler(req, res);
});

app.use(errorHandler);

// =====================================================
// EXPORT
// =====================================================

export default app;
export { config };
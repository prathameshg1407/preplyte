// src/app.ts

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Route Imports
import { authRoutes } from './module/auth/auth.routes';
import practiceRoutes from './module/practice/practice.routes';
// Utils
import { logger } from './utils/logger';

const app: Application = express();

// =====================================================
// 1. SECURITY & UTILITY MIDDLEWARE
// =====================================================

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Compress response bodies
app.use(compression());

// Parse JSON bodies (increased limit for code submissions)
app.use(express.json({ limit: '1mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Parse Cookies
app.use(cookieParser());

// =====================================================
// 2. RATE LIMITING
// =====================================================

// General API Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// Stricter rate limiting for code execution endpoints
const codeExecutionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 code executions per minute
  message: {
    success: false,
    message: 'Too many code executions. Please wait before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// Auth rate limiting (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// Apply general limiter to all API routes
app.use('/api', generalLimiter);

// Apply stricter limiter to code execution routes
app.use('/api/machine/sessions/:sessionId/questions/:questionId/run', codeExecutionLimiter);
app.use('/api/machine/sessions/:sessionId/questions/:questionId/submit', codeExecutionLimiter);

// Apply auth limiter
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// =====================================================
// 3. HEALTH CHECK
// =====================================================

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Info endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Practice Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      aptitude: '/api/aptitude',
      machine: '/api/machine',
      languages: '/api/languages',
      config: '/api/config',
      enums: '/api/enums',
    },
    documentation: '/api/docs',
  });
});

// =====================================================
// 4. API ROUTES
// =====================================================

// Auth Routes
app.use('/api/auth', authRoutes);

// Practice Routes (includes aptitude, machine, languages, config, enums)
app.use('/api', practiceRoutes);

// =====================================================
// 5. ERROR HANDLING
// =====================================================

// 404 Handler (Route Not Found)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: _req.originalUrl,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  // Log error
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Determine error message
  let message = err.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    message = 'Invalid or expired token';
  } else if (err.code === 'P2002') {
    // Prisma unique constraint error
    message = 'A record with this data already exists';
  } else if (err.code === 'P2025') {
    // Prisma record not found
    message = 'Record not found';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  });
});

export default app;
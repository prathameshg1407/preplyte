import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  logoutAll,
  me,
  refreshToken,
  verifyToken,
} from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// ============================================
// Rate Limiter Factory
// ============================================

const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string
) =>
  rateLimit({
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

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10,
  'Too many login attempts. Please try again later.'
);

const registerLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5,
  'Too many registration attempts. Please try again later.'
);

const refreshLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  30,
  'Too many token refresh attempts.'
);

const generalLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  60,
  'Too many requests. Please slow down.'
);

// ============================================
// Public Routes
// ============================================

router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshLimiter, refreshToken);

// ============================================
// Protected Routes
// ============================================

router.post('/logout', authenticate, generalLimiter, logout);
router.post('/logout-all', authenticate, generalLimiter, logoutAll);
router.get('/me', authenticate, generalLimiter, me);
router.get('/verify', authenticate, generalLimiter, verifyToken);

export { router as authRoutes };
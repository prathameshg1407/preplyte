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
// Rate Limiters
// ============================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many attempts. Please try again later.',
    },
  },
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many registration attempts. Please try again later.',
    },
  },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many token refresh attempts.',
    },
  },
});

// ============================================
// Public Routes
// ============================================

router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshLimiter, refreshToken);

// ============================================
// Protected Routes
// ============================================

router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, me);
router.get('/verify', authenticate, verifyToken);

export { router as authRoutes };
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
  googleAuthCallback,
  sendEmailOTP,
  verifyEmailOTP,
} from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { passport } from './google-oauth.service';

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

const otpLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many OTP requests. Please try again later.'
);

// ============================================
// Public Routes
// ============================================

router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshLimiter, refreshToken);

// Email verification routes
router.post('/send-otp', otpLimiter, sendEmailOTP);
router.post('/verify-otp', otpLimiter, verifyEmailOTP);

// Google OAuth Routes
router.get(
  '/google',
  authLimiter,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL || 'http://localhost:3000/login?error=oauth_failed',
    session: false 
  }),
  googleAuthCallback
);

// ============================================
// Protected Routes
// ============================================

router.post('/logout', authenticate, generalLimiter, logout);
router.post('/logout-all', authenticate, generalLimiter, logoutAll);
router.get('/me', authenticate, generalLimiter, me);
router.get('/verify', authenticate, generalLimiter, verifyToken);

export { router as authRoutes };
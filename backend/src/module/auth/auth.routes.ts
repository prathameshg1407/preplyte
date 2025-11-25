import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many attempts, please try again later',
    },
  },
  keyGenerator: (req) => {
    // Use IP + email for more granular rate limiting
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  },
});

// Less strict rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many registration attempts, please try again later',
    },
  },
});

// Public routes
router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export { router as authRoutes };
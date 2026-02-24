import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';

// ============================================
// Validation Schemas
// ============================================

const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((email) => email.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .trim()
    .optional(),
});

const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((email) => email.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

const sendOTPSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((email) => email.toLowerCase().trim()),
});

const verifyOTPSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((email) => email.toLowerCase().trim()),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

// ============================================
// Type Exports
// ============================================

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

// ============================================
// Helper Functions
// ============================================

function handleValidationError(res: Response, error: z.ZodError): void {
  const details = error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
    code: e.code,
  }));
  sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
}

// ============================================
// Controller Functions
// ============================================

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      handleValidationError(res, parseResult.error);
      return;
    }

    const user = await authService.register(parseResult.data);
    sendSuccess(res, user, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      handleValidationError(res, parseResult.error);
      return;
    }

    const result = await authService.login(parseResult.data);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = refreshTokenSchema.safeParse(req.body);
    if (!parseResult.success) {
      handleValidationError(res, parseResult.error);
      return;
    }

    const result = await authService.refreshToken(parseResult.data.refreshToken);
    sendSuccess(res, result, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const parseResult = logoutSchema.safeParse(req.body);
    if (!parseResult.success) {
      handleValidationError(res, parseResult.error);
      return;
    }

    const { refreshToken } = parseResult.data;
    if (refreshToken) {
      await authService.logout(req.user.id, refreshToken);
    }

    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    await authService.logoutAll(req.user.id);
    sendSuccess(res, null, 'Logged out from all devices');
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    const user = await authService.getUser(req.user.id);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    return;
  }

  sendSuccess(res, { valid: true, user: req.user }, 'Token is valid');
};

// ============================================
// Email Verification Controllers
// ============================================

export const sendEmailOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = sendOTPSchema.safeParse(req.body);
    if (!parseResult.success) {
      handleValidationError(res, parseResult.error);
      return;
    }

    await authService.sendEmailVerificationOTP(parseResult.data.email);
    sendSuccess(res, null, 'Verification code sent to your email');
  } catch (error) {
    next(error);
  }
};

export const verifyEmailOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = verifyOTPSchema.safeParse(req.body);
    if (!parseResult.success) {
      handleValidationError(res, parseResult.error);
      return;
    }

    const verified = await authService.verifyEmailOTP(
      parseResult.data.email,
      parseResult.data.otp
    );

    sendSuccess(res, { verified }, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Google OAuth Controllers
// ============================================

export const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'OAUTH_ERROR', 'Google authentication failed', 401);
      return;
    }

    const { handleGoogleCallback } = await import('./google-oauth.service');
    const result = await handleGoogleCallback(req.user);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

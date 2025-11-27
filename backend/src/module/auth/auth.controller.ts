import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { sendSuccess } from '../../utils/response';

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
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================
// Type Exports
// ============================================

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

// ============================================
// Controller Functions
// ============================================

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);
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
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
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
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await authService.refreshToken(refreshToken);
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
    const { refreshToken } = logoutSchema.parse(req.body);
    await authService.logout(req.user!.id, refreshToken);
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
    await authService.logoutAll(req.user!.id);
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
    const user = await authService.getUser(req.user!.id);
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
  sendSuccess(res, { valid: true, user: req.user }, 'Token is valid');
};
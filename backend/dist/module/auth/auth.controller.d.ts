import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
declare const registerSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
}>;
declare const loginSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logout: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const logoutAll: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const me: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyToken: (req: AuthenticatedRequest, res: Response, _next: NextFunction) => Promise<void>;
export declare const googleAuthCallback: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=auth.controller.d.ts.map
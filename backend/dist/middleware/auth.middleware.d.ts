import { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    id: string;
    email: string;
    role: string;
    instituteId: string | null;
    tokenVersion: number;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
type AllowedRole = 'PLATFORM_ADMIN' | 'INSTITUTE_ADMIN' | 'USER';
export declare const authorize: (...allowedRoles: AllowedRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authorizeInstitute: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authorizeInstituteAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authorizeOwnerOrAdmin: (userIdParam?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map
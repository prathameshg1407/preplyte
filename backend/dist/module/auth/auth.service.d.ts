import { RegisterDto, LoginDto } from './auth.controller';
declare class AuthService {
    register(data: RegisterDto): Promise<{
        institute: {
            name: string;
            id: string;
            domain: string;
        } | null;
        email: string;
        name: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
        instituteId: string | null;
    }>;
    login(data: LoginDto): Promise<{
        user: {
            institute: {
                name: string;
                id: string;
                domain: string;
                isActive: boolean;
            } | null;
            email: string;
            name: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            role: import("@prisma/client").$Enums.UserRole;
            lastLoginAt: Date | null;
            instituteId: string | null;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    refreshToken(token: string): Promise<{
        user: {
            institute: {
                name: string;
                id: string;
                domain: string;
                isActive: boolean;
            } | null;
            email: string;
            name: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            role: import("@prisma/client").$Enums.UserRole;
            lastLoginAt: Date | null;
            instituteId: string | null;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    logout(userId: string, refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    getUser(userId: string): Promise<{
        institute: {
            name: string;
            id: string;
            domain: string;
        } | null;
        email: string;
        name: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
        lastLoginAt: Date | null;
        instituteId: string | null;
    }>;
    cleanupExpiredTokens(): Promise<number>;
    private generateTokens;
    private hashToken;
    private parseExpiry;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map
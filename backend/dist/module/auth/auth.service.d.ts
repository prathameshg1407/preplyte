import { RegisterDto, LoginDto } from './auth.controller';
declare class AuthService {
    register(data: RegisterDto): Promise<{
        institute: {
            id: string;
            domain: string;
            name: string;
        } | null;
        email: string;
        id: string;
        name: string | null;
        isActive: boolean;
        createdAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
        instituteId: string | null;
        lastLoginAt: Date | null;
    }>;
    login(data: LoginDto): Promise<{
        user: {
            institute: {
                id: string;
                domain: string;
                name: string;
                isActive: boolean;
            } | null;
            email: string;
            id: string;
            name: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            role: import("@prisma/client").$Enums.UserRole;
            instituteId: string | null;
            googleId: string | null;
            provider: string | null;
            avatar: string | null;
            lastLoginAt: Date | null;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    refreshToken(token: string): Promise<{
        user: {
            institute: {
                id: string;
                domain: string;
                name: string;
                isActive: boolean;
            } | null;
            email: string;
            id: string;
            name: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            role: import("@prisma/client").$Enums.UserRole;
            instituteId: string | null;
            googleId: string | null;
            provider: string | null;
            avatar: string | null;
            lastLoginAt: Date | null;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    logout(userId: string, refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    getUser(userId: string): Promise<{
        institute: {
            id: string;
            domain: string;
            name: string;
        } | null;
        email: string;
        id: string;
        name: string | null;
        isActive: boolean;
        createdAt: Date;
        role: import("@prisma/client").$Enums.UserRole;
        instituteId: string | null;
        lastLoginAt: Date | null;
    }>;
    cleanupExpiredTokens(): Promise<number>;
    private generateTokens;
    private hashToken;
    private parseExpiry;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map
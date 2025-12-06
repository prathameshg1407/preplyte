"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jose_1 = require("jose");
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const db_1 = require("../../lib/db");
const errors_1 = require("../../utils/errors");
const logger_1 = require("../../utils/logger");
// ============================================
// Configuration
// ============================================
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET must be defined in environment variables');
}
const JWT_SECRET = new TextEncoder().encode(jwtSecret);
const REFRESH_SECRET = new TextEncoder().encode(jwtSecret + '_refresh');
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const BCRYPT_ROUNDS = 12;
const JWT_ISSUER = 'preplyte-api';
const JWT_AUDIENCE = 'preplyte-client';
// ============================================
// Types
// ============================================
const USER_SELECT = {
    id: true,
    email: true,
    name: true,
    role: true,
    instituteId: true,
    isActive: true,
    createdAt: true,
    lastLoginAt: true,
    institute: {
        select: {
            id: true,
            name: true,
            domain: true,
        },
    },
};
// ============================================
// Auth Service
// ============================================
class AuthService {
    async register(data) {
        const { email, password, name } = data;
        const domain = email.split('@')[1];
        if (!domain) {
            throw new errors_1.ValidationError('Invalid email format');
        }
        const institute = await db_1.prisma.institute.findUnique({
            where: { domain },
            select: { id: true, isActive: true, name: true },
        });
        if (institute && !institute.isActive) {
            throw new errors_1.InstituteInactiveError(institute.name);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
        try {
            const user = await db_1.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || null,
                    role: 'USER',
                    instituteId: institute?.id || null,
                    tokenVersion: 0,
                },
                select: USER_SELECT,
            });
            logger_1.logger.info('User registered', { userId: user.id, email: user.email });
            return user;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new errors_1.ConflictError('User with this email already exists');
                }
            }
            throw error;
        }
    }
    async login(data) {
        const { email, password } = data;
        const user = await db_1.prisma.user.findUnique({
            where: { email },
            include: {
                institute: {
                    select: { id: true, name: true, domain: true, isActive: true },
                },
            },
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        if (!user.isActive) {
            throw new errors_1.UnauthorizedError('Account is inactive');
        }
        if (user.institute && !user.institute.isActive) {
            throw new errors_1.InstituteInactiveError(user.institute.name);
        }
        const { accessToken, refreshToken } = await this.generateTokens({
            id: user.id,
            role: user.role,
            instituteId: user.instituteId,
            tokenVersion: user.tokenVersion,
        });
        await Promise.all([
            db_1.prisma.refreshToken.create({
                data: {
                    token: this.hashToken(refreshToken),
                    userId: user.id,
                    expiresAt: new Date(Date.now() + this.parseExpiry(REFRESH_TOKEN_EXPIRY)),
                },
            }),
            db_1.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            }),
        ]);
        logger_1.logger.info('User logged in', { userId: user.id });
        const { password: _, tokenVersion: __, ...safeUser } = user;
        return {
            user: safeUser,
            accessToken,
            refreshToken,
            expiresIn: ACCESS_TOKEN_EXPIRY,
        };
    }
    async refreshToken(token) {
        try {
            const { payload } = await (0, jose_1.jwtVerify)(token, REFRESH_SECRET, {
                issuer: JWT_ISSUER,
                audience: JWT_AUDIENCE,
            });
            const userId = payload.sub;
            const tokenVersion = payload.tokenVersion || 0;
            const tokenHash = this.hashToken(token);
            const storedToken = await db_1.prisma.refreshToken.findFirst({
                where: {
                    token: tokenHash,
                    userId,
                },
            });
            // Token reuse detection
            if (storedToken?.revokedAt) {
                await this.logoutAll(userId);
                logger_1.logger.warn('Refresh token reuse detected', { userId });
                throw new errors_1.UnauthorizedError('Token reuse detected. All sessions revoked.');
            }
            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
            }
            const user = await db_1.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    institute: {
                        select: { id: true, name: true, domain: true, isActive: true },
                    },
                },
            });
            if (!user?.isActive) {
                throw new errors_1.UnauthorizedError('Account is inactive');
            }
            if (user.tokenVersion !== tokenVersion) {
                throw new errors_1.UnauthorizedError('Session has been revoked');
            }
            if (user.institute && !user.institute.isActive) {
                throw new errors_1.InstituteInactiveError(user.institute.name);
            }
            const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens({
                id: user.id,
                role: user.role,
                instituteId: user.instituteId,
                tokenVersion: user.tokenVersion,
            });
            // Rotate refresh token
            await Promise.all([
                db_1.prisma.refreshToken.update({
                    where: { id: storedToken.id },
                    data: { revokedAt: new Date() },
                }),
                db_1.prisma.refreshToken.create({
                    data: {
                        token: this.hashToken(newRefreshToken),
                        userId: user.id,
                        expiresAt: new Date(Date.now() + this.parseExpiry(REFRESH_TOKEN_EXPIRY)),
                    },
                }),
            ]);
            const { password: _, tokenVersion: __, ...safeUser } = user;
            return {
                user: safeUser,
                accessToken,
                refreshToken: newRefreshToken,
                expiresIn: ACCESS_TOKEN_EXPIRY,
            };
        }
        catch (error) {
            if (error instanceof errors_1.UnauthorizedError || error instanceof errors_1.InstituteInactiveError) {
                throw error;
            }
            logger_1.logger.error('Refresh token error', { error });
            throw new errors_1.UnauthorizedError('Invalid refresh token');
        }
    }
    async logout(userId, refreshToken) {
        await db_1.prisma.refreshToken.updateMany({
            where: {
                token: this.hashToken(refreshToken),
                userId,
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });
        logger_1.logger.info('User logged out', { userId });
    }
    async logoutAll(userId) {
        await Promise.all([
            db_1.prisma.user.update({
                where: { id: userId },
                data: { tokenVersion: { increment: 1 } },
            }),
            db_1.prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
        ]);
        logger_1.logger.info('User logged out from all devices', { userId });
    }
    async getUser(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: USER_SELECT,
        });
        if (!user) {
            throw new errors_1.NotFoundError('User');
        }
        return user;
    }
    async cleanupExpiredTokens() {
        const result = await db_1.prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    {
                        revokedAt: {
                            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        },
                    },
                ],
            },
        });
        logger_1.logger.info('Cleaned up expired tokens', { count: result.count });
        return result.count;
    }
    // ============================================
    // Private Helpers
    // ============================================
    async generateTokens(payload) {
        const [accessToken, refreshToken] = await Promise.all([
            new jose_1.SignJWT({
                role: payload.role,
                instituteId: payload.instituteId,
                tokenVersion: payload.tokenVersion,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setSubject(payload.id)
                .setIssuedAt()
                .setExpirationTime(ACCESS_TOKEN_EXPIRY)
                .setIssuer(JWT_ISSUER)
                .setAudience(JWT_AUDIENCE)
                .sign(JWT_SECRET),
            new jose_1.SignJWT({ tokenVersion: payload.tokenVersion })
                .setProtectedHeader({ alg: 'HS256' })
                .setSubject(payload.id)
                .setIssuedAt()
                .setExpirationTime(REFRESH_TOKEN_EXPIRY)
                .setIssuer(JWT_ISSUER)
                .setAudience(JWT_AUDIENCE)
                .sign(REFRESH_SECRET),
        ]);
        return { accessToken, refreshToken };
    }
    hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
    parseExpiry(expiry) {
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match)
            return 7 * 24 * 60 * 60 * 1000; // Default 7 days
        const value = parseInt(match[1], 10);
        const multipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        return value * (multipliers[match[2]] || multipliers.d);
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map
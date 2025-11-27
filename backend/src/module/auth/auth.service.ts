import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { RegisterDto, LoginDto } from './auth.controller';
import { prisma } from '../../lib/db';
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  InstituteInactiveError,
} from '../../utils/errors';
import { logger } from '../../utils/logger';

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
} as const;

interface TokenPayload {
  id: string;
  role: string;
  instituteId: string | null;
  tokenVersion: number;
}

// ============================================
// Auth Service
// ============================================

class AuthService {
  async register(data: RegisterDto) {
    const { email, password, name } = data;

    const domain = email.split('@')[1];
    if (!domain) {
      throw new ValidationError('Invalid email format');
    }

    const institute = await prisma.institute.findUnique({
      where: { domain },
      select: { id: true, isActive: true, name: true },
    });

    if (institute && !institute.isActive) {
      throw new InstituteInactiveError(institute.name);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    try {
      const user = await prisma.user.create({
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

      logger.info('User registered', { userId: user.id, email: user.email });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('User with this email already exists');
        }
      }
      throw error;
    }
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        institute: {
          select: { id: true, name: true, domain: true, isActive: true },
        },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    if (user.institute && !user.institute.isActive) {
      throw new InstituteInactiveError(user.institute.name);
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      id: user.id,
      role: user.role,
      instituteId: user.instituteId,
      tokenVersion: user.tokenVersion,
    });

    await Promise.all([
      prisma.refreshToken.create({
        data: {
          token: this.hashToken(refreshToken),
          userId: user.id,
          expiresAt: new Date(Date.now() + this.parseExpiry(REFRESH_TOKEN_EXPIRY)),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    logger.info('User logged in', { userId: user.id });

    const { password: _, tokenVersion: __, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    };
  }

  async refreshToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, REFRESH_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      const userId = payload.sub as string;
      const tokenVersion = (payload.tokenVersion as number) || 0;
      const tokenHash = this.hashToken(token);

      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: tokenHash,
          userId,
        },
      });

      // Token reuse detection
      if (storedToken?.revokedAt) {
        await this.logoutAll(userId);
        logger.warn('Refresh token reuse detected', { userId });
        throw new UnauthorizedError('Token reuse detected. All sessions revoked.');
      }

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          institute: {
            select: { id: true, name: true, domain: true, isActive: true },
          },
        },
      });

      if (!user?.isActive) {
        throw new UnauthorizedError('Account is inactive');
      }

      if (user.tokenVersion !== tokenVersion) {
        throw new UnauthorizedError('Session has been revoked');
      }

      if (user.institute && !user.institute.isActive) {
        throw new InstituteInactiveError(user.institute.name);
      }

      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens({
        id: user.id,
        role: user.role,
        instituteId: user.instituteId,
        tokenVersion: user.tokenVersion,
      });

      // Rotate refresh token
      await Promise.all([
        prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        }),
        prisma.refreshToken.create({
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
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof InstituteInactiveError) {
        throw error;
      }
      logger.error('Refresh token error', { error });
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: {
        token: this.hashToken(refreshToken),
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    logger.info('User logged out', { userId });
  }

  async logoutAll(userId: string) {
    await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    logger.info('User logged out from all devices', { userId });
  }

  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
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
    logger.info('Cleaned up expired tokens', { count: result.count });
    return result.count;
  }

  // ============================================
  // Private Helpers
  // ============================================

  private async generateTokens(payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      new SignJWT({
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

      new SignJWT({ tokenVersion: payload.tokenVersion })
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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (multipliers[match[2]] || multipliers.d);
  }
}

export const authService = new AuthService();
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { RegisterDto, LoginDto } from './auth.controller';
import { prisma } from '../../lib/db';
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from '../../lib/errors';
import { logger } from '../../utils/logger';

// Validate JWT_SECRET at startup
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

const ACCESS_TOKEN_EXPIRY = '24h';
const BCRYPT_ROUNDS = 12;

export class AuthService {
  async register(data: RegisterDto) {
    const { email, password, name } = data;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Extract domain and find institute
    const domain = email.split('@')[1];

    if (!domain) {
      throw new ValidationError('Invalid email format');
    }

    const institute = await prisma.institute.findUnique({
      where: { domain },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'USER',
        instituteId: institute?.id || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        instituteId: true,
        isActive: true,
        createdAt: true,
        institute: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    logger.info(`New user registered: ${user.email}`, {
      userId: user.id,
      instituteId: user.instituteId,
    });

    return user;
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    // Find user with institute
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        institute: {
          select: {
            id: true,
            name: true,
            domain: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      // Use same error message to prevent user enumeration
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      logger.warn(`Failed login attempt for user: ${email}`);
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive. Please contact support.');
    }

    // Check if institute is active (if user belongs to one)
    if (user.institute && !user.institute.isActive) {
      throw new UnauthorizedError('Institute is inactive. Please contact support.');
    }

    // Generate JWT token
    const token = await new SignJWT({
      role: user.role,
      instituteId: user.instituteId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .setIssuer('preplyte-api')
      .setAudience('preplyte-client')
      .sign(JWT_SECRET);

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`User logged in: ${user.email}`, {
      userId: user.id,
      instituteId: user.instituteId,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      expiresIn: ACCESS_TOKEN_EXPIRY,
      context: user.instituteId ? 'INSTITUTE' : 'PLATFORM',
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
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
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
      },
      select: {
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
      },
    });

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user: ${userId}`);

    return { success: true };
  }
}

export const authService = new AuthService();
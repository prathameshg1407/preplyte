import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import passport from 'passport';
import crypto from 'crypto';
import { prisma } from '../../lib/db';
import { logger } from '../../utils/logger';
import { SignJWT } from 'jose';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback';

// Log OAuth configuration status on startup
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  logger.info('Google OAuth is configured and enabled');
} else {
  logger.warn('Google OAuth is NOT configured - Google sign-in will not work');
  logger.warn('To enable Google OAuth, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
  logger.warn('See backend/GOOGLE_OAUTH_SETUP.md for setup instructions');
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

const JWT_SECRET = new TextEncoder().encode(jwtSecret);
const REFRESH_SECRET = new TextEncoder().encode(jwtSecret + '_refresh');

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

const JWT_ISSUER = 'preplyte-api';
const JWT_AUDIENCE = 'preplyte-client';

// Configure Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await handleGoogleAuth(profile);
          done(null, user);
        } catch (error) {
          logger.error('Google OAuth error', { error });
          done(error as Error, undefined);
        }
      }
    )
  );
} else {
  logger.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

async function handleGoogleAuth(profile: Profile) {
  const email = profile.emails?.[0]?.value;
  const googleId = profile.id;
  const name = profile.displayName;
  const avatar = profile.photos?.[0]?.value;

  if (!email) {
    throw new Error('No email found in Google profile');
  }

  const domain = email.split('@')[1];
  if (!domain) {
    throw new Error('Invalid email format');
  }

  // Find institute by domain
  const institute = await prisma.institute.findUnique({
    where: { domain },
    select: { id: true, isActive: true, name: true },
  });

  // Check if user exists by googleId or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId }, { email }],
    },
    include: {
      institute: {
        select: { id: true, name: true, domain: true, isActive: true },
      },
    },
  });

  if (user) {
    // Update existing user with Google info if not already set
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          provider: 'google',
          avatar: avatar || user.avatar,
          name: name || user.name,
          lastLoginAt: new Date(),
        },
        include: {
          institute: {
            select: { id: true, name: true, domain: true, isActive: true },
          },
        },
      });
    } else {
      // Just update last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
        include: {
          institute: {
            select: { id: true, name: true, domain: true, isActive: true },
          },
        },
      });
    }
  } else {
    // Create new user
    user = await prisma.user.create({
      data: {
        email,
        googleId,
        provider: 'google',
        name,
        avatar,
        role: 'USER',
        instituteId: institute?.id || null,
        tokenVersion: 0,
      },
      include: {
        institute: {
          select: { id: true, name: true, domain: true, isActive: true },
        },
      },
    });

    logger.info('New user created via Google OAuth', { userId: user.id, email });
  }

  if (!user.isActive) {
    throw new Error('Account is inactive');
  }

  if (user.institute && !user.institute.isActive) {
    throw new Error(`Institute ${user.institute.name} is inactive`);
  }

  return user;
}

async function generateTokens(payload: {
  id: string;
  role: string;
  instituteId: string | null;
  tokenVersion: number;
}) {
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

function parseExpiry(expiry: string): number {
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

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function handleGoogleCallback(user: any) {
  const { accessToken, refreshToken } = await generateTokens({
    id: user.id,
    role: user.role,
    instituteId: user.instituteId,
    tokenVersion: user.tokenVersion,
  });

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + parseExpiry(REFRESH_TOKEN_EXPIRY)),
    },
  });

  const { password: _, tokenVersion: __, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY,
  };
}

export { passport };

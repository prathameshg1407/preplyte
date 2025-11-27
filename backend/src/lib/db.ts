import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// ============================================
// Configuration
// ============================================

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// ============================================
// Prisma Client Setup
// ============================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientOptions = {
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { emit: 'event' as const, level: 'query' as const },
          { emit: 'stdout' as const, level: 'error' as const },
          { emit: 'stdout' as const, level: 'warn' as const },
        ]
      : [{ emit: 'stdout' as const, level: 'error' as const }],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

// ============================================
// Query Logging (Development)
// ============================================

if (process.env.NODE_ENV === 'development') {
  (prisma.$on as any)('query', (e: any) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// ============================================
// Connection Management
// ============================================

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database connection failed', error);
    return false;
  }
};

// ============================================
// Graceful Shutdown
// ============================================

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Closing database connection...`);
  await prisma.$disconnect();
  logger.info('Database connection closed');
};

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await shutdown('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown('SIGTERM');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught Exception', error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  logger.error('Unhandled Rejection', reason);
  await prisma.$disconnect();
  process.exit(1);
});
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Ensure env exists
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

// Create Prisma client instance (v5 style - no adapter needed for standard PostgreSQL)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handler
const shutdown = async () => {
  await prisma.$disconnect();
};

process.on('beforeExit', shutdown);
process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});
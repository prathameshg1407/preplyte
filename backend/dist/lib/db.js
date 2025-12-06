"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseConnection = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
// ============================================
// Configuration
// ============================================
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}
// ============================================
// Prisma Client Setup
// ============================================
const globalForPrisma = globalThis;
const prismaClientOptions = {
    log: process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
        ]
        : [{ emit: 'stdout', level: 'error' }],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
};
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient(prismaClientOptions);
// ============================================
// Query Logging (Development)
// ============================================
if (process.env.NODE_ENV === 'development') {
    exports.prisma.$on('query', (e) => {
        logger_1.logger.debug(`Query: ${e.query}`);
        logger_1.logger.debug(`Params: ${e.params}`);
        logger_1.logger.debug(`Duration: ${e.duration}ms`);
    });
}
// ============================================
// Connection Management
// ============================================
// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
// Connection health check
const checkDatabaseConnection = async () => {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        logger_1.logger.error('Database connection failed', error);
        return false;
    }
};
exports.checkDatabaseConnection = checkDatabaseConnection;
// ============================================
// Graceful Shutdown
// ============================================
const shutdown = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Closing database connection...`);
    await exports.prisma.$disconnect();
    logger_1.logger.info('Database connection closed');
};
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
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
    logger_1.logger.error('Uncaught Exception', error);
    await exports.prisma.$disconnect();
    process.exit(1);
});
process.on('unhandledRejection', async (reason) => {
    logger_1.logger.error('Unhandled Rejection', reason);
    await exports.prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=db.js.map
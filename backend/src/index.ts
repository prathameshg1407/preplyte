// src/server.ts

import 'dotenv/config';
import http from 'http';
import app, { config } from './app';
import { prisma, checkDatabaseConnection } from './lib/db';
import { logger } from './utils/logger';

// =====================================================
// CONFIGURATION
// =====================================================

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT || '10000', 10);

// =====================================================
// SERVER SETUP
// =====================================================

const server = http.createServer(app);

// Keep-alive settings for better connection handling
server.keepAliveTimeout = 65000; // Slightly higher than typical ALB timeout (60s)
server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout

// =====================================================
// STARTUP
// =====================================================

async function bootstrap(): Promise<void> {
  try {
    logger.info('Starting server...', {
      environment: config.env,
      port: PORT,
      host: HOST,
    });

    // 1. Check Database Connection
    logger.info('Checking database connection...');
    const isDbConnected = await checkDatabaseConnection();
    
    if (!isDbConnected) {
      throw new Error('Failed to connect to database');
    }
    
    logger.info('✅ Database connected successfully');

    // 2. Start Server
    await new Promise<void>((resolve, reject) => {
      server.listen(PORT, HOST, () => {
        resolve();
      });
      server.once('error', reject);
    });

    logger.info(`🚀 Server running`, {
      environment: config.env,
      port: PORT,
      host: HOST,
      health: `http://localhost:${PORT}/health`,
      api: `http://localhost:${PORT}/api`,
    });

    // 3. Setup Graceful Shutdown
    setupGracefulShutdown();

  } catch (error) {
    logger.error('❌ Failed to start server', error);
    await cleanup();
    process.exit(1);
  }
}

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

let isShuttingDown = false;

async function cleanup(): Promise<void> {
  logger.info('Cleaning up resources...');
  
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error disconnecting database', error);
  }
}

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Set a timeout to force shutdown
  const forceShutdownTimeout = setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  try {
    // 1. Stop accepting new connections
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          logger.info('HTTP server closed');
          resolve();
        }
      });
    });

    // 2. Wait for existing connections to close (with timeout)
    // Note: This is handled by server.close() for keep-alive connections
    
    // 3. Cleanup resources
    await cleanup();

    clearTimeout(forceShutdownTimeout);
    logger.info('Graceful shutdown completed');
    process.exit(0);

  } catch (error) {
    clearTimeout(forceShutdownTimeout);
    logger.error('Error during graceful shutdown', error);
    process.exit(1);
  }
}

function setupGracefulShutdown(): void {
  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    // In production, attempt graceful shutdown
    if (config.isProduction) {
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    } else {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason: unknown, _promise: Promise<unknown>) => {
    logger.error('Unhandled Rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    
    // In production, log but don't exit (unless critical)
    if (!config.isProduction) {
      process.exit(1);
    }
  });

  // Handle process warnings
  process.on('warning', (warning: Error) => {
    logger.warn('Process Warning', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
    });
  });
}

// =====================================================
// START SERVER
// =====================================================

bootstrap();

// =====================================================
// EXPORTS (for testing)
// =====================================================

export { server, gracefulShutdown };
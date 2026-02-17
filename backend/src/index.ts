// src/index.ts

import app, { config } from './app';
import { createServer } from 'http';
import { logger } from './utils/logger';
import { prisma } from './lib/db';
import { interviewGateway } from './module/practice/interview';
import { startTokenCleanup, stopTokenCleanup } from './lib/token-cleanup';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  logger.info('Starting server...', {
    environment: config.env,
    port: PORT,
    host: HOST,
  });

  try {
    // Check database connection
    logger.info('Checking database connection...');
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connected successfully');

    // Create HTTP server from Express app
    const httpServer = createServer(app);

    // Initialize WebSocket gateway BEFORE starting the server
    // This registers the 'upgrade' event handler
    interviewGateway.initialize(httpServer);

    // Start the HTTP server
    httpServer.listen(PORT, HOST, () => {
      logger.info('🚀 Server running', {
        environment: config.env,
        port: PORT,
        host: HOST,
        health: `http://localhost:${PORT}/health`,
        api: `http://localhost:${PORT}/api`,
        websocket: `ws://localhost:${PORT}/ws/interview/:sessionId`,
      });

      // Start token cleanup scheduler
      startTokenCleanup();
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Stop token cleanup scheduler
      stopTokenCleanup();

      // Shutdown WebSocket gateway first
      interviewGateway.shutdown();

      httpServer.close(async () => {
        logger.info('HTTP server closed');

        try {
          await prisma.$disconnect();
          logger.info('Database connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
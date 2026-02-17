// lib/token-cleanup.ts
import { authService } from '../module/auth/auth.service';
import { logger } from '../utils/logger';

/**
 * Token Cleanup Service
 * 
 * Periodically cleans up expired and revoked refresh tokens from the database.
 * This helps maintain database performance and security.
 */

const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Performs token cleanup
 */
async function performCleanup(): Promise<void> {
  try {
    logger.info('Starting token cleanup job');
    const count = await authService.cleanupExpiredTokens();
    logger.info('Token cleanup completed', { tokensRemoved: count });
  } catch (error) {
    logger.error('Token cleanup failed', { error });
  }
}

/**
 * Starts the token cleanup scheduler
 */
export function startTokenCleanup(): void {
  if (cleanupTimer) {
    logger.warn('Token cleanup already running');
    return;
  }

  logger.info('Starting token cleanup scheduler', {
    intervalHours: CLEANUP_INTERVAL / (60 * 60 * 1000),
  });

  // Run immediately on startup
  performCleanup();

  // Schedule periodic cleanup
  cleanupTimer = setInterval(performCleanup, CLEANUP_INTERVAL);
}

/**
 * Stops the token cleanup scheduler
 */
export function stopTokenCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    logger.info('Token cleanup scheduler stopped');
  }
}

/**
 * Manually trigger token cleanup
 */
export async function triggerCleanup(): Promise<number> {
  return await authService.cleanupExpiredTokens();
}

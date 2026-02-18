// src/module/leaderboard/leaderboard.routes.ts

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getLeaderboard,
  getLeaderboardConfig,
  getMyScores,
  getMyDetailedStats,
} from './leaderboard.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/leaderboard/config
 * Get leaderboard configuration (available categories and scopes)
 * Returns: categories, scopes (institute scope hidden for individual users)
 */
router.get('/config', getLeaderboardConfig);

/**
 * GET /api/leaderboard/my-scores
 * Get current user's scores breakdown by category
 * Returns: { lms, aptitude, coding, aiInterview, mockDrive, overall }
 */
router.get('/my-scores', getMyScores);

/**
 * GET /api/leaderboard/my-stats
 * Get current user's detailed statistics with activity counts
 * Returns: breakdown + detailed stats per category
 */
router.get('/my-stats', getMyDetailedStats);

/**
 * GET /api/leaderboard
 * Get leaderboard with filters
 * Query params:
 *   - scope: 'global' | 'institute' (default: 'global')
 *   - category: 'overall' | 'lms' | 'aptitude' | 'coding' | 'ai_interview' | 'mock_drive' (default: 'overall')
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 100)
 */
router.get('/', getLeaderboard);

export const leaderboardRoutes = router;
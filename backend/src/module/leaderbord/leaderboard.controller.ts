// src/module/leaderboard/leaderboard.controller.ts

import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';
import { sendSuccess } from '../../utils/response';
import { leaderboardService } from './leaderboard.service';
import { leaderboardQuerySchema } from './leaderboard.validation';
import { LeaderboardFilters } from './leaderboard.types';
import { BadRequestError } from '../../utils/errors';
import { ERROR_MESSAGES } from './leaderboard.constants';

// =====================================================
// GET LEADERBOARD
// =====================================================

export const getLeaderboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  // Parse and validate query params
  const validatedQuery = leaderboardQuerySchema.parse(req.query);

  // Check if institute scope is requested but user has no institute
  if (validatedQuery.scope === 'institute' && !user.instituteId) {
    throw new BadRequestError(ERROR_MESSAGES.INSTITUTE_REQUIRED);
  }

  const filters: LeaderboardFilters = {
    scope: validatedQuery.scope,
    category: validatedQuery.category,
    page: validatedQuery.page,
    limit: validatedQuery.limit,
    userId: user.id,
    instituteId: user.instituteId,
  };

  const leaderboard = await leaderboardService.getLeaderboard(filters);

  sendSuccess(res, leaderboard, 'Leaderboard fetched successfully');
});

// =====================================================
// GET LEADERBOARD CONFIG
// =====================================================

export const getLeaderboardConfig = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;

    const config = leaderboardService.getConfig(user.instituteId);

    sendSuccess(res, config, 'Leaderboard configuration fetched successfully');
  }
);

// =====================================================
// GET MY SCORES BREAKDOWN
// =====================================================

export const getMyScores = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const scores = await leaderboardService.getUserScoreBreakdown(user.id);

  sendSuccess(res, scores, 'User scores fetched successfully');
});

// =====================================================
// GET MY DETAILED STATS
// =====================================================

export const getMyDetailedStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const stats = await leaderboardService.getUserDetailedStats(user.id);

  sendSuccess(res, stats, 'User detailed stats fetched successfully');
});
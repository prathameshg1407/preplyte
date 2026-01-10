// src/module/mock-drive/leaderboard/leaderboard.controller.ts

import { Response, NextFunction } from 'express';
import { LeaderboardService } from './leaderboard.service';
import { sendSuccess } from '../../../utils/response';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

interface LeaderboardQueryParams {
  page?: string;
  limit?: string;
  batchId?: string;
  departmentId?: string;
}

interface MyRankQueryParams {
  batchId?: string;
}

interface DriveIdParams {
  driveId: string;
}

export class LeaderboardController {
  constructor(private service: LeaderboardService) {}

  getLeaderboard = async (
    req: AuthenticatedRequest & { params: DriveIdParams; query: LeaderboardQueryParams },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const { driveId } = req.params;
      const { page, limit, batchId, departmentId } = req.query;

      const result = await this.service.getLeaderboard(
        userId,
        driveId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        { batchId, departmentId }
      );

      sendSuccess(res, result, 'Leaderboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getMyRank = async (
    req: AuthenticatedRequest & { params: DriveIdParams; query: MyRankQueryParams },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const { driveId } = req.params;
      const { batchId } = req.query;

      const result = await this.service.getMyRank(userId, driveId, batchId);

      sendSuccess(res, result, 'Rank retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
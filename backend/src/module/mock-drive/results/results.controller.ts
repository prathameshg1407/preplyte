// src/module/mock-drive/results/results.controller.ts

import { Response, NextFunction } from 'express';
import { ResultsService } from './results.service';
import { sendSuccess } from '../../../utils/response';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

interface DriveIdParams {
  driveId: string;
}

export class ResultsController {
  constructor(private service: ResultsService) {}

  getResultOverview = async (
    req: AuthenticatedRequest & { params: DriveIdParams },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const { driveId } = req.params;

      const result = await this.service.getResultOverview(userId, driveId);

      sendSuccess(res, result, 'Result overview retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getDetailedReport = async (
    req: AuthenticatedRequest & { params: DriveIdParams },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const { driveId } = req.params;

      const result = await this.service.getDetailedReport(userId, driveId);

      sendSuccess(res, result, 'Detailed report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
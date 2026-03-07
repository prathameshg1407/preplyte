// src/modules/instituteadmin/institute-analytics.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { instituteAnalyticsService } from './institute-analytics.service';
import { sendSuccess, sendError } from '../../utils/response';
import { logger } from '../../utils/logger';

class InstituteAnalyticsController {
  constructor() {
    this.getAnalytics = this.getAnalytics.bind(this);
  }

  async getAnalytics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const instituteId = req.user?.instituteId;

      if (!instituteId) {
        sendError(res, 'FORBIDDEN', 'Institute membership required', 403);
        return;
      }

      const analytics = await instituteAnalyticsService.getInstituteAnalytics(instituteId);
      sendSuccess(res, analytics, 'Institute analytics retrieved successfully');
    } catch (error) {
      logger.error('Institute analytics controller error', error);
      next(error);
    }
  }
}

export const instituteAnalyticsController = new InstituteAnalyticsController();

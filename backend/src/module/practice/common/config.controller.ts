import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { configService } from './config.service';
import { sendSuccess } from '../../../utils/response';

export class ConfigController {
  /**
   * GET /api/config/time-limits
   */
  getTimeLimits(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = configService.getTimeLimits();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const configController = new ConfigController();
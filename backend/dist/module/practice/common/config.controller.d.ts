import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
export declare class ConfigController {
    /**
     * GET /api/config/time-limits
     */
    getTimeLimits(_req: AuthenticatedRequest, res: Response, next: NextFunction): void;
}
export declare const configController: ConfigController;
//# sourceMappingURL=config.controller.d.ts.map
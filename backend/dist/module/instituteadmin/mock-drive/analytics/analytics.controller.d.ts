import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
export declare class AnalyticsController {
    getFullAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getScoreDistribution(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getModulePerformance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getBatchComparison(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTimeAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private verifyAccess;
    private handleError;
}
export declare const analyticsController: AnalyticsController;
//# sourceMappingURL=analytics.controller.d.ts.map
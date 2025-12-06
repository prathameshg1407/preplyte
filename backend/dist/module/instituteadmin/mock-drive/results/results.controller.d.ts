import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
export declare class ResultsController {
    listResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getDetailedResult(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    calculateRankings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    exportResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    generateAllReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private getInstituteId;
    private handleError;
}
export declare const resultsController: ResultsController;
//# sourceMappingURL=results.controller.d.ts.map
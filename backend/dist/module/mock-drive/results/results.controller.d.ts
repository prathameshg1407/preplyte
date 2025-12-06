import { Response, NextFunction } from 'express';
import { ResultsService } from './results.service';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
interface DriveIdParams {
    driveId: string;
}
export declare class ResultsController {
    private service;
    constructor(service: ResultsService);
    getResultOverview: (req: AuthenticatedRequest & {
        params: DriveIdParams;
    }, res: Response, next: NextFunction) => Promise<void>;
    getDetailedReport: (req: AuthenticatedRequest & {
        params: DriveIdParams;
    }, res: Response, next: NextFunction) => Promise<void>;
}
export {};
//# sourceMappingURL=results.controller.d.ts.map
import { Response, NextFunction } from 'express';
import { LeaderboardService } from './leaderboard.service';
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
export declare class LeaderboardController {
    private service;
    constructor(service: LeaderboardService);
    getLeaderboard: (req: AuthenticatedRequest & {
        params: DriveIdParams;
        query: LeaderboardQueryParams;
    }, res: Response, next: NextFunction) => Promise<void>;
    getMyRank: (req: AuthenticatedRequest & {
        params: DriveIdParams;
        query: MyRankQueryParams;
    }, res: Response, next: NextFunction) => Promise<void>;
}
export {};
//# sourceMappingURL=leaderboard.controller.d.ts.map
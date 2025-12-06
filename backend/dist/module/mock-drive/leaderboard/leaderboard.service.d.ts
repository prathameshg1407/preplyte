import { PrismaClient } from '@prisma/client';
import { LeaderboardResponse, MyRankResponse, LeaderboardFilters } from './leaderboard.types';
export declare class LeaderboardService {
    private prisma;
    constructor(prisma: PrismaClient);
    getLeaderboard(userId: string, driveId: string, page?: number, limit?: number, filters?: LeaderboardFilters): Promise<LeaderboardResponse>;
    getMyRank(userId: string, driveId: string, batchId?: string): Promise<MyRankResponse>;
}
//# sourceMappingURL=leaderboard.service.d.ts.map
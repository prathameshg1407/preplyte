import { MockDriveModuleType } from '@prisma/client';
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    studentName: string;
    studentId: string | null;
    departmentId: string | null;
    totalScore: number;
    percentageScore: number;
    moduleScores: Array<{
        moduleType: MockDriveModuleType;
        moduleName: string;
        score: number;
        maxScore: number;
        percentage: number;
    }>;
    completedAt: Date | null;
    isCurrentUser: boolean;
}
export interface LeaderboardResponse {
    entries: LeaderboardEntry[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    currentUserRank: {
        rank: number;
        percentile: number;
    } | null;
    stats: {
        totalParticipants: number;
        averageScore: number;
        highestScore: number;
        lowestScore: number;
    };
}
export interface MyRankResponse {
    rank: number;
    totalParticipants: number;
    percentile: number;
    score: number;
    percentageScore: number;
    aboveAverage: boolean;
    nearbyEntries: LeaderboardEntry[];
}
export interface LeaderboardFilters {
    batchId?: string;
    departmentId?: string;
}
//# sourceMappingURL=leaderboard.types.d.ts.map
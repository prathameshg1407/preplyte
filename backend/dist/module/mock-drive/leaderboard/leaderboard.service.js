"use strict";
// src/module/mock-drive/leaderboard/leaderboard.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const errors_1 = require("../../../utils/errors");
const mockdrive_constants_1 = require("../shared/mockdrive.constants");
class LeaderboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLeaderboard(userId, driveId, page = 1, limit = mockdrive_constants_1.MOCKDRIVE_CONSTANTS.DEFAULT_PAGE_SIZE, filters) {
        // Check if user is registered
        const registration = await this.prisma.mockDriveRegistration.findUnique({
            where: {
                mockDriveId_userId: { mockDriveId: driveId, userId },
            },
        });
        if (!registration) {
            throw new errors_1.ForbiddenError('Not registered for this mock drive');
        }
        // Check if leaderboard is visible
        const drive = await this.prisma.mockDrive.findUnique({
            where: { id: driveId },
            select: { showLeaderboard: true, status: true },
        });
        if (!drive) {
            throw new errors_1.NotFoundError('Mock drive');
        }
        if (!drive.showLeaderboard) {
            throw new errors_1.ForbiddenError('Leaderboard is not available for this mock drive');
        }
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            mockDriveId: driveId,
            batchId: filters?.batchId || registration.batchId,
        };
        if (filters?.departmentId) {
            where.departmentId = filters.departmentId;
        }
        // Get total count
        const total = await this.prisma.mockDriveLeaderboard.count({ where });
        // Get entries
        const entries = await this.prisma.mockDriveLeaderboard.findMany({
            where,
            orderBy: [{ rank: 'asc' }],
            skip,
            take: limit,
        });
        // Get current user's entry
        const currentUserEntry = await this.prisma.mockDriveLeaderboard.findFirst({
            where: {
                mockDriveId: driveId,
                userId,
                batchId: filters?.batchId || registration.batchId,
            },
        });
        // Calculate stats
        const allScores = await this.prisma.mockDriveLeaderboard.findMany({
            where,
            select: { percentageScore: true },
        });
        const scores = allScores.map((e) => e.percentageScore);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const leaderboardEntries = entries.map((entry) => ({
            rank: entry.rank,
            userId: entry.userId,
            studentName: entry.studentName,
            studentId: entry.studentId,
            departmentId: entry.departmentId,
            totalScore: entry.totalScore,
            percentageScore: entry.percentageScore,
            moduleScores: entry.moduleScores || [],
            completedAt: entry.completedAt,
            isCurrentUser: entry.userId === userId,
        }));
        let currentUserRank = null;
        if (currentUserEntry) {
            const belowCount = scores.filter((s) => s < currentUserEntry.percentageScore).length;
            const percentile = scores.length > 0 ? (belowCount / scores.length) * 100 : 0;
            currentUserRank = {
                rank: currentUserEntry.rank,
                percentile,
            };
        }
        return {
            entries: leaderboardEntries,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            currentUserRank,
            stats: {
                totalParticipants: total,
                averageScore: avgScore,
                highestScore: scores.length > 0 ? Math.max(...scores) : 0,
                lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
            },
        };
    }
    async getMyRank(userId, driveId, batchId) {
        // Get user's registration to get batch
        const registration = await this.prisma.mockDriveRegistration.findUnique({
            where: {
                mockDriveId_userId: { mockDriveId: driveId, userId },
            },
        });
        if (!registration) {
            throw new errors_1.ForbiddenError('Not registered for this mock drive');
        }
        const targetBatchId = batchId || registration.batchId;
        // Get user's entry
        const userEntry = await this.prisma.mockDriveLeaderboard.findFirst({
            where: {
                mockDriveId: driveId,
                userId,
                batchId: targetBatchId,
            },
        });
        if (!userEntry) {
            throw new errors_1.NotFoundError('Leaderboard entry. You have not completed this mock drive yet');
        }
        // Get total participants and scores
        const allEntries = await this.prisma.mockDriveLeaderboard.findMany({
            where: {
                mockDriveId: driveId,
                batchId: targetBatchId,
            },
            orderBy: { rank: 'asc' },
        });
        const scores = allEntries.map((e) => e.percentageScore);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const belowCount = scores.filter((s) => s < userEntry.percentageScore).length;
        const percentile = scores.length > 0 ? (belowCount / scores.length) * 100 : 0;
        // Get nearby entries (2 above, user, 2 below)
        const userIndex = allEntries.findIndex((e) => e.userId === userId);
        const startIndex = Math.max(0, userIndex - 2);
        const endIndex = Math.min(allEntries.length, userIndex + 3);
        const nearbyEntries = allEntries
            .slice(startIndex, endIndex)
            .map((entry) => ({
            rank: entry.rank,
            userId: entry.userId,
            studentName: entry.studentName,
            studentId: entry.studentId,
            departmentId: entry.departmentId,
            totalScore: entry.totalScore,
            percentageScore: entry.percentageScore,
            moduleScores: entry.moduleScores || [],
            completedAt: entry.completedAt,
            isCurrentUser: entry.userId === userId,
        }));
        return {
            rank: userEntry.rank,
            totalParticipants: allEntries.length,
            percentile,
            score: userEntry.totalScore,
            percentageScore: userEntry.percentageScore,
            aboveAverage: userEntry.percentageScore > avgScore,
            nearbyEntries,
        };
    }
}
exports.LeaderboardService = LeaderboardService;
//# sourceMappingURL=leaderboard.service.js.map
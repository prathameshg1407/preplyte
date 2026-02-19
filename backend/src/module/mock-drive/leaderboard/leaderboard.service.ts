// src/module/mock-drive/leaderboard/leaderboard.service.ts

import { PrismaClient, Prisma } from '@prisma/client';
import {
  NotFoundError,
  ForbiddenError,
} from '../../../utils/errors';
import {
  LeaderboardEntry,
  LeaderboardResponse,
  MyRankResponse,
  LeaderboardFilters,
} from './leaderboard.types';
import { MOCKDRIVE_CONSTANTS } from '../shared/mockdrive.constants';

export class LeaderboardService {
  constructor(private prisma: PrismaClient) {}

  async getLeaderboard(
    userId: string,
    driveId: string,
    page: number = 1,
    limit: number = MOCKDRIVE_CONSTANTS.DEFAULT_PAGE_SIZE,
    filters?: LeaderboardFilters
  ): Promise<LeaderboardResponse> {
    // Check if user is registered
    const registration = await this.prisma.mockDriveRegistration.findUnique({
      where: {
        mockDriveId_userId: { mockDriveId: driveId, userId },
      },
    });

    if (!registration) {
      throw new ForbiddenError('Not registered for this mock drive');
    }

    // Check if leaderboard is visible
    const drive = await this.prisma.mockDrive.findUnique({
      where: { id: driveId },
      select: { showLeaderboard: true, status: true },
    });

    if (!drive) {
      throw new NotFoundError('Mock drive');
    }

    if (!drive.showLeaderboard) {
      throw new ForbiddenError('Leaderboard is not available for this mock drive');
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.MockDriveLeaderboardWhereInput = {
      mockDriveId: driveId,
      batchId: filters?.batchId || registration.batchId,
    };

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }

    // Get total count
    const total = await this.prisma.mockDriveLeaderboard.count({ where });

    // Get entries with department names
    const entries = await this.prisma.mockDriveLeaderboard.findMany({
      where,
      orderBy: [{ rank: 'asc' }],
      skip,
      take: limit,
      include: {
        user: {
          select: {
            profile: {
              select: {
                department: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
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

    const leaderboardEntries: LeaderboardEntry[] = entries.map((entry) => ({
      rank: entry.rank,
      userId: entry.userId,
      studentName: entry.studentName,
      studentId: entry.studentId,
      departmentId: entry.departmentId,
      departmentName: (entry as any).user?.profile?.department?.name || null,
      totalScore: entry.totalScore,
      percentageScore: entry.percentageScore,
      moduleScores: (entry.moduleScores as any[]) || [],
      completedAt: entry.completedAt,
      isCurrentUser: entry.userId === userId,
    }));

    let currentUserRank: { rank: number; percentile: number } | null = null;
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

  async getMyRank(
    userId: string,
    driveId: string,
    batchId?: string
  ): Promise<MyRankResponse> {
    // Get user's registration to get batch
    const registration = await this.prisma.mockDriveRegistration.findUnique({
      where: {
        mockDriveId_userId: { mockDriveId: driveId, userId },
      },
    });

    if (!registration) {
      throw new ForbiddenError('Not registered for this mock drive');
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
      throw new NotFoundError('Leaderboard entry. You have not completed this mock drive yet');
    }

    // Get total participants and scores with department names
    const allEntries = await this.prisma.mockDriveLeaderboard.findMany({
      where: {
        mockDriveId: driveId,
        batchId: targetBatchId,
      },
      orderBy: { rank: 'asc' },
      include: {
        user: {
          select: {
            profile: {
              select: {
                department: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const scores = allEntries.map((e) => e.percentageScore);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const belowCount = scores.filter((s) => s < userEntry.percentageScore).length;
    const percentile = scores.length > 0 ? (belowCount / scores.length) * 100 : 0;

    // Get nearby entries (2 above, user, 2 below)
    const userIndex = allEntries.findIndex((e) => e.userId === userId);
    const startIndex = Math.max(0, userIndex - 2);
    const endIndex = Math.min(allEntries.length, userIndex + 3);

    const nearbyEntries: LeaderboardEntry[] = allEntries
      .slice(startIndex, endIndex)
      .map((entry) => ({
        rank: entry.rank,
        userId: entry.userId,
        studentName: entry.studentName,
        studentId: entry.studentId,
        departmentId: entry.departmentId,
        departmentName: (entry as any).user?.profile?.department?.name || null,
        totalScore: entry.totalScore,
        percentageScore: entry.percentageScore,
        moduleScores: (entry.moduleScores as any[]) || [],
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
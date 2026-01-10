// src/modules/instituteadmin/mock-drive/analytics/analytics.service.ts

import {
  MockDriveAttemptStatus,
  MockDriveBatchStatus,
  MockDriveModuleAttemptStatus,
} from '@prisma/client';
import { prisma } from '../../../../lib/db';
import {
  AnalyticsOverview,
  AnalyticsQuery,
  ScoreDistribution,
  ScoreRange,
  ModulePerformance,
  ModuleStats,
  BatchComparison,
  TimeAnalysis,
  OverallTimeStats,
  ModuleTimeStats,
  CompletionTrend,
  DepartmentBreakdown,
  CourseYearBreakdown,
  FullAnalytics,
} from './analytics.types';
import {
  MockDriveNotFoundError,
  MockDriveAccessDeniedError,
} from '../mockdrive.types';

// ============================================
// Constants
// ============================================

const DEFAULT_SCORE_RANGES: ScoreRange[] = [
  { label: '0-20%', min: 0, max: 20, count: 0, percentage: 0 },
  { label: '21-40%', min: 21, max: 40, count: 0, percentage: 0 },
  { label: '41-60%', min: 41, max: 60, count: 0, percentage: 0 },
  { label: '61-80%', min: 61, max: 80, count: 0, percentage: 0 },
  { label: '81-100%', min: 81, max: 100, count: 0, percentage: 0 },
];

const MODULE_ATTEMPT_COMPLETED_STATUSES = [
  MockDriveModuleAttemptStatus.COMPLETED,
  MockDriveModuleAttemptStatus.TIMED_OUT,
];

// ============================================
// Service Class
// ============================================

export class AnalyticsService {
  // ==========================================
  // Get Full Analytics
  // ==========================================

  async getFullAnalytics(
    mockDriveId: string,
    instituteId: string,
    query?: AnalyticsQuery
  ): Promise<FullAnalytics> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const batchId = query?.batchId;

    const [
      overview,
      scoreDistribution,
      modulePerformance,
      batchComparison,
      timeAnalysis,
      completionTrend,
      departmentBreakdown,
      courseYearBreakdown,
    ] = await Promise.all([
      this.getOverview(mockDriveId, batchId),
      this.getScoreDistribution(mockDriveId, batchId),
      this.getModulePerformance(mockDriveId, batchId),
      this.getBatchComparison(mockDriveId),
      this.getTimeAnalysis(mockDriveId, batchId),
      this.getCompletionTrend(mockDriveId, batchId, query?.startDate, query?.endDate),
      this.getDepartmentBreakdown(mockDriveId, batchId),
      this.getCourseYearBreakdown(mockDriveId, batchId),
    ]);

    return {
      overview,
      scoreDistribution,
      modulePerformance,
      batchComparison,
      timeAnalysis,
      completionTrend,
      departmentBreakdown,
      courseYearBreakdown,
    };
  }

  // ==========================================
  // Get Overview
  // ==========================================

  async getOverview(
    mockDriveId: string,
    batchId?: string
  ): Promise<AnalyticsOverview> {
    const attemptWhere = this.buildAttemptWhere(mockDriveId, batchId);

    const [registrationStats, attemptStats, batchStats, scoreStats, medianScore] =
      await Promise.all([
        prisma.mockDriveRegistration.groupBy({
          by: ['status'],
          where: { mockDriveId },
          _count: { id: true },
        }),
        prisma.mockDriveAttempt.groupBy({
          by: ['status'],
          where: attemptWhere,
          _count: { id: true },
        }),
        prisma.mockDriveBatch.groupBy({
          by: ['status'],
          where: { mockDriveId },
          _count: { id: true },
        }),
        prisma.mockDriveAttempt.aggregate({
          where: {
            ...attemptWhere,
            status: MockDriveAttemptStatus.COMPLETED,
          },
          _avg: { totalScore: true },
          _max: { totalScore: true },
          _min: { totalScore: true },
        }),
        this.getMedianScore(mockDriveId, batchId),
      ]);

    const regMap = this.toCountMap(registrationStats);
    const attemptMap = this.toCountMap(attemptStats);
    const batchMap = this.toCountMap(batchStats);

    const totalRegistered = this.sumCounts(registrationStats);
    const totalStarted = this.sumCounts(attemptStats);
    const totalCompleted = attemptMap.get(MockDriveAttemptStatus.COMPLETED) ?? 0;

    return {
      registrations: {
        total: totalRegistered,
        approved: regMap.get('APPROVED') ?? 0,
        pending: regMap.get('PENDING') ?? 0,
        rejected: regMap.get('REJECTED') ?? 0,
      },
      participation: {
        totalRegistered: regMap.get('APPROVED') ?? 0,
        totalStarted,
        totalCompleted,
        completionRate: this.calculateRate(totalCompleted, totalStarted),
      },
      scores: {
        average: scoreStats._avg.totalScore,
        highest: scoreStats._max.totalScore,
        lowest: scoreStats._min.totalScore,
        median: medianScore,
      },
      batches: {
        total: this.sumCounts(batchStats),
        completed: batchMap.get(MockDriveBatchStatus.COMPLETED) ?? 0,
        inProgress: batchMap.get(MockDriveBatchStatus.IN_PROGRESS) ?? 0,
        scheduled:
          (batchMap.get(MockDriveBatchStatus.CREATED) ?? 0) +
          (batchMap.get(MockDriveBatchStatus.SCHEDULED) ?? 0),
      },
    };
  }

  // ==========================================
  // Get Score Distribution
  // ==========================================

  async getScoreDistribution(
    mockDriveId: string,
    batchId?: string,
    bucketSize: number = 20
  ): Promise<ScoreDistribution> {
    const attempts = await prisma.mockDriveAttempt.findMany({
      where: {
        ...this.buildAttemptWhere(mockDriveId, batchId),
        status: MockDriveAttemptStatus.COMPLETED,
        percentageScore: { not: null },
      },
      select: { percentageScore: true },
    });

    const ranges = this.createScoreRanges(bucketSize);
    const total = attempts.length;

    for (const attempt of attempts) {
      const score = attempt.percentageScore ?? 0;
      const range = ranges.find((r) => score >= r.min && score <= r.max);
      if (range) range.count++;
    }

    for (const range of ranges) {
      range.percentage = this.calculateRate(range.count, total);
    }

    return { ranges, totalStudents: total };
  }

  // ==========================================
  // Get Module Performance
  // ==========================================

  async getModulePerformance(
    mockDriveId: string,
    batchId?: string
  ): Promise<ModulePerformance[]> {
    const modules = await prisma.mockDriveModule.findMany({
      where: { mockDriveId, isActive: true },
      orderBy: { order: 'asc' },
    });

    const performances = await Promise.all(
      modules.map(async (module) => {
        const moduleAttemptWhere = this.buildModuleAttemptWhere(module.id, batchId);

        const [moduleAttempts, totalExpectedAttempts] = await Promise.all([
          prisma.mockDriveModuleAttempt.findMany({
            where: {
              ...moduleAttemptWhere,
              status: { in: MODULE_ATTEMPT_COMPLETED_STATUSES },
            },
            select: {
              score: true,
              maxScore: true,
              percentage: true,
              isPassed: true,
              timeSpentSeconds: true,
            },
          }),
          prisma.mockDriveModuleAttempt.count({
            where: moduleAttemptWhere,
          }),
        ]);

        const stats = this.calculateModuleStats(moduleAttempts);
        stats.completionRate = this.calculateRate(
          moduleAttempts.length,
          totalExpectedAttempts
        );

        const scoreDistribution = this.calculateModuleScoreDistribution(
          moduleAttempts.map((a) => a.percentage ?? 0)
        );

        return {
          moduleId: module.id,
          moduleName: module.name ?? `Module ${module.order}`,
          moduleType: module.moduleType,
          order: module.order,
          stats,
          scoreDistribution,
        };
      })
    );

    return performances;
  }

  // ==========================================
  // Get Batch Comparison
  // ==========================================

  async getBatchComparison(mockDriveId: string): Promise<BatchComparison[]> {
    const batches = await prisma.mockDriveBatch.findMany({
      where: { mockDriveId },
      orderBy: { batchNumber: 'asc' },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    const comparisons = await Promise.all(
      batches.map(async (batch) => {
        const completedWhere = {
          batchId: batch.id,
          status: MockDriveAttemptStatus.COMPLETED,
        };

        const [attemptStats, passedCount] = await Promise.all([
          prisma.mockDriveAttempt.aggregate({
            where: completedWhere,
            _count: { id: true },
            _avg: { totalScore: true, percentageScore: true },
            _max: { totalScore: true },
            _min: { totalScore: true },
          }),
          prisma.mockDriveAttempt.count({
            where: { ...completedWhere, isPassed: true },
          }),
        ]);

        return {
          batchId: batch.id,
          batchName: batch.name,
          batchNumber: batch.batchNumber,
          totalStudents: batch._count.registrations,
          completedStudents: attemptStats._count.id,
          averageScore: attemptStats._avg.totalScore,
          averagePercentage: attemptStats._avg.percentageScore,
          highestScore: attemptStats._max.totalScore,
          lowestScore: attemptStats._min.totalScore,
          passRate: this.calculatePercentageNullable(passedCount, attemptStats._count.id),
        };
      })
    );

    return comparisons;
  }

  // ==========================================
  // Get Time Analysis
  // ==========================================

  async getTimeAnalysis(
    mockDriveId: string,
    batchId?: string
  ): Promise<TimeAnalysis> {
    const completedAttempts = await prisma.mockDriveAttempt.findMany({
      where: {
        ...this.buildAttemptWhere(mockDriveId, batchId),
        status: MockDriveAttemptStatus.COMPLETED,
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    const durations = completedAttempts
      .filter((a) => a.startedAt && a.completedAt)
      .map((a) =>
        Math.floor((a.completedAt!.getTime() - a.startedAt!.getTime()) / 1000)
      );

    const overall: OverallTimeStats = {
      averageDuration: this.calculateAverage(durations),
      minDuration: durations.length > 0 ? Math.min(...durations) : null,
      maxDuration: durations.length > 0 ? Math.max(...durations) : null,
    };

    const modules = await prisma.mockDriveModule.findMany({
      where: { mockDriveId, isActive: true },
      orderBy: { order: 'asc' },
    });

    const byModule: ModuleTimeStats[] = await Promise.all(
      modules.map(async (module) => {
        const moduleAttempts = await prisma.mockDriveModuleAttempt.aggregate({
          where: {
            ...this.buildModuleAttemptWhere(module.id, batchId),
            status: { in: MODULE_ATTEMPT_COMPLETED_STATUSES },
          },
          _avg: { timeSpentSeconds: true },
        });

        const avgTime = moduleAttempts._avg.timeSpentSeconds;
        const timeLimitSeconds = module.timeLimit * 60;

        return {
          moduleId: module.id,
          moduleName: module.name ?? `Module ${module.order}`,
          moduleType: module.moduleType,
          timeLimit: module.timeLimit,
          averageTimeUsed: avgTime,
          averageTimeUsedPercentage:
            avgTime !== null ? (avgTime / timeLimitSeconds) * 100 : null,
        };
      })
    );

    return { overall, byModule };
  }

  // ==========================================
  // Get Completion Trend
  // ==========================================

  async getCompletionTrend(
    mockDriveId: string,
    batchId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CompletionTrend[]> {
    const completedAtWhere = this.buildDateRangeWhere(startDate, endDate);

    const completedAttempts = await prisma.mockDriveAttempt.findMany({
      where: {
        ...this.buildAttemptWhere(mockDriveId, batchId),
        status: MockDriveAttemptStatus.COMPLETED,
        completedAt: completedAtWhere,
      },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    });

    if (completedAttempts.length === 0) {
      return [];
    }

    const dateMap = new Map<string, number>();

    for (const attempt of completedAttempts) {
      if (attempt.completedAt) {
        const dateStr = attempt.completedAt.toISOString().split('T')[0];
        dateMap.set(dateStr, (dateMap.get(dateStr) ?? 0) + 1);
      }
    }

    const trend: CompletionTrend[] = [];
    let cumulative = 0;

    for (const date of Array.from(dateMap.keys()).sort()) {
      const count = dateMap.get(date)!;
      cumulative += count;
      trend.push({ date, completed: count, cumulative });
    }

    return trend;
  }

  // ==========================================
  // Get Department Breakdown
  // ==========================================

  async getDepartmentBreakdown(
    mockDriveId: string,
    batchId?: string
  ): Promise<DepartmentBreakdown[]> {
    const attempts = await prisma.mockDriveAttempt.findMany({
      where: this.buildAttemptWhere(mockDriveId, batchId),
      include: {
        user: {
          include: {
            profile: { select: { departmentId: true } },
          },
        },
      },
    });

    const departmentMap = this.groupAttemptsByField(
      attempts,
      (a) => a.user.profile?.departmentId ?? 'Unknown'
    );

    return Array.from(departmentMap.entries())
      .map(([departmentId, stats]) => ({
        departmentId,
        totalStudents: stats.total,
        completedStudents: stats.completed,
        averageScore: this.calculateAverage(stats.scores),
        passRate: this.calculatePercentageNullable(stats.passed, stats.completed),
      }))
      .sort((a, b) => b.totalStudents - a.totalStudents);
  }

  // ==========================================
  // Get Course Year Breakdown
  // ==========================================

  async getCourseYearBreakdown(
    mockDriveId: string,
    batchId?: string
  ): Promise<CourseYearBreakdown[]> {
    const attempts = await prisma.mockDriveAttempt.findMany({
      where: this.buildAttemptWhere(mockDriveId, batchId),
      include: {
        user: {
          include: {
            profile: { select: { courseYear: true } },
          },
        },
      },
    });

    const yearMap = this.groupAttemptsByField(
      attempts,
      (a) => a.user.profile?.courseYear ?? 'Unknown'
    );

    return Array.from(yearMap.entries())
      .map(([courseYear, stats]) => ({
        courseYear,
        totalStudents: stats.total,
        completedStudents: stats.completed,
        averageScore: this.calculateAverage(stats.scores),
        passRate: this.calculatePercentageNullable(stats.passed, stats.completed),
      }))
      .sort((a, b) => a.courseYear.localeCompare(b.courseYear));
  }

  // ==========================================
  // Private Helper Methods - Query Builders
  // ==========================================

  private buildAttemptWhere(mockDriveId: string, batchId?: string) {
    return {
      mockDriveId,
      ...(batchId && { batchId }),
    };
  }

  private buildModuleAttemptWhere(moduleId: string, batchId?: string) {
    return {
      moduleId,
      ...(batchId && { attempt: { batchId } }),
    };
  }

  private buildDateRangeWhere(startDate?: Date, endDate?: Date) {
    return {
      not: null,
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };
  }

  // ==========================================
  // Private Helper Methods - Calculations
  // ==========================================

  /**
   * Returns a percentage (0-100), always returns a number (0 if no data)
   * Use for fields that should never be null (completionRate, percentage in ranges)
   */
  private calculateRate(numerator: number, denominator: number): number {
    return denominator > 0 ? (numerator / denominator) * 100 : 0;
  }

  /**
   * Returns a percentage (0-100) or null if no data
   * Use for optional percentage fields (passRate, averagePercentage)
   */
  private calculatePercentageNullable(
    numerator: number,
    denominator: number
  ): number | null {
    return denominator > 0 ? (numerator / denominator) * 100 : null;
  }

  /**
   * Returns average or null if no values
   */
  private calculateAverage(values: number[]): number | null {
    return values.length > 0
      ? values.reduce((sum, v) => sum + v, 0) / values.length
      : null;
  }

  private toCountMap<T extends { status: string; _count: { id: number } }>(
    stats: T[]
  ): Map<string, number> {
    return new Map(stats.map((s) => [s.status, s._count.id]));
  }

  private sumCounts<T extends { _count: { id: number } }>(stats: T[]): number {
    return stats.reduce((sum, s) => sum + s._count.id, 0);
  }

  // ==========================================
  // Private Helper Methods - Data Processing
  // ==========================================

  private groupAttemptsByField<
    T extends {
      status: MockDriveAttemptStatus;
      totalScore: number | null;
      isPassed: boolean | null;
    }
  >(
    attempts: T[],
    getField: (attempt: T) => string
  ): Map<string, { total: number; completed: number; scores: number[]; passed: number }> {
    const map = new Map<
      string,
      { total: number; completed: number; scores: number[]; passed: number }
    >();

    for (const attempt of attempts) {
      const field = getField(attempt);

      if (!map.has(field)) {
        map.set(field, { total: 0, completed: 0, scores: [], passed: 0 });
      }

      const stats = map.get(field)!;
      stats.total++;

      if (attempt.status === MockDriveAttemptStatus.COMPLETED) {
        stats.completed++;
        if (attempt.totalScore !== null) {
          stats.scores.push(attempt.totalScore);
        }
        if (attempt.isPassed) {
          stats.passed++;
        }
      }
    }

    return map;
  }

  // ==========================================
  // Private Helper Methods - Access Control
  // ==========================================

  private async verifyMockDriveAccess(
    mockDriveId: string,
    instituteId: string
  ): Promise<void> {
    const mockDrive = await prisma.mockDrive.findUnique({
      where: { id: mockDriveId },
      select: { id: true, instituteId: true },
    });

    if (!mockDrive) {
      throw new MockDriveNotFoundError(mockDriveId);
    }

    if (mockDrive.instituteId !== instituteId) {
      throw new MockDriveAccessDeniedError();
    }
  }

  // ==========================================
  // Private Helper Methods - Score Calculations
  // ==========================================

  private async getMedianScore(
    mockDriveId: string,
    batchId?: string
  ): Promise<number | null> {
    const scores = await prisma.mockDriveAttempt.findMany({
      where: {
        ...this.buildAttemptWhere(mockDriveId, batchId),
        status: MockDriveAttemptStatus.COMPLETED,
        totalScore: { not: null },
      },
      select: { totalScore: true },
      orderBy: { totalScore: 'asc' },
    });

    if (scores.length === 0) return null;

    const mid = Math.floor(scores.length / 2);

    if (scores.length % 2 === 0) {
      return (
        ((scores[mid - 1].totalScore ?? 0) + (scores[mid].totalScore ?? 0)) / 2
      );
    }

    return scores[mid].totalScore;
  }

  private createScoreRanges(bucketSize: number): ScoreRange[] {
    const ranges: ScoreRange[] = [];
    let start = 0;

    while (start < 100) {
      const end = Math.min(start + bucketSize - 1, 100);
      ranges.push({
        label: `${start}-${end}%`,
        min: start,
        max: end,
        count: 0,
        percentage: 0,
      });
      start = end + 1;
    }

    return ranges;
  }

  private calculateModuleStats(
    moduleAttempts: Array<{
      score: number | null;
      maxScore: number | null;
      percentage: number | null;
      isPassed: boolean | null;
      timeSpentSeconds: number;
    }>
  ): ModuleStats {
    const totalAttempts = moduleAttempts.length;
    const completedWithScore = moduleAttempts.filter((a) => a.score !== null);

    const scores = completedWithScore.map((a) => a.score ?? 0);
    const percentages = completedWithScore.map((a) => a.percentage ?? 0);
    const times = moduleAttempts.map((a) => a.timeSpentSeconds);

    const passedCount = moduleAttempts.filter((a) => a.isPassed).length;

    return {
      averageScore: this.calculateAverage(scores),
      averagePercentage: this.calculateAverage(percentages),
      averageTimeSpent: this.calculateAverage(times),
      passRate: this.calculatePercentageNullable(passedCount, totalAttempts),
      completionRate: 0, // Will be set by caller
    };
  }

  private calculateModuleScoreDistribution(percentages: number[]): ScoreRange[] {
    const ranges = DEFAULT_SCORE_RANGES.map((r) => ({ ...r }));
    const total = percentages.length;

    for (const score of percentages) {
      const range = ranges.find((r) => score >= r.min && score <= r.max);
      if (range) range.count++;
    }

    for (const range of ranges) {
      range.percentage = this.calculateRate(range.count, total);
    }

    return ranges;
  }
}

// ============================================
// Export Singleton Instance
// ============================================

export const analyticsService = new AnalyticsService();
// src/modules/instituteadmin/mock-drive/results/results.service.ts

import { MockDriveAttemptStatus, Prisma } from '@prisma/client';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import {
  ListResultsQuery,
  PaginatedResults,
  DetailedResult,
  RankingEntry,
  ResultStatistics,
  ExportOptions,
  ExportResult,
  ResultListItem,
  ModuleResultSummary,
  MockDriveNotFoundError,
  AccessDeniedError,
  ResultNotFoundError,
  ResultsError,
} from './results.types';

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const CSV_BOM = '\uFEFF';

// ============================================
// Service
// ============================================

export class ResultsService {
  // ==========================================
  // List Results
  // ==========================================

  async listResults(
    mockDriveId: string,
    instituteId: string,
    query: ListResultsQuery
  ): Promise<PaginatedResults> {
    await this.verifyAccess(mockDriveId, instituteId);

    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      batchId,
      status,
      search,
      sortBy = 'rank',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.MockDriveAttemptWhereInput = {
      mockDriveId,
      ...(batchId && { batchId }),
      ...(status && { status }),
      ...(search && {
        user: {
          OR: [
            { profile: { fullName: { contains: search, mode: 'insensitive' } } },
            { profile: { studentId: { contains: search, mode: 'insensitive' } } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [attempts, total] = await Promise.all([
      prisma.mockDriveAttempt.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { include: { profile: true } },
          batch: { select: { id: true, name: true } },
        },
      }),
      prisma.mockDriveAttempt.count({ where }),
    ]);

    const data: ResultListItem[] = attempts.map((a) => ({
      attemptId: a.id,
      userId: a.userId,
      studentName: a.user.profile?.fullName ?? a.user.name ?? 'Unknown',
      studentId: a.user.profile?.studentId ?? null,
      department: a.user.profile?.department ?? null,
      batchName: a.batch?.name ?? null,
      status: a.status,
      totalScore: a.totalScore,
      percentageScore: a.percentageScore,
      rank: a.rank,
      isPassed: a.isPassed,
      completedAt: a.completedAt,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // Get Detailed Result
  // ==========================================

  async getDetailedResult(
    mockDriveId: string,
    attemptId: string,
    instituteId: string
  ): Promise<DetailedResult> {
    await this.verifyAccess(mockDriveId, instituteId);

    const attempt = await prisma.mockDriveAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: { include: { profile: true } },
        batch: { select: { id: true, name: true } },
        moduleAttempts: {
          include: { module: { select: { id: true, name: true, moduleType: true, order: true } } },
          orderBy: { module: { order: 'asc' } },
        },
        report: {
          select: {
            performanceSummary: true,
            strengths: true,
            weaknesses: true,
            recommendations: true,
          },
        },
      },
    });

    if (!attempt || attempt.mockDriveId !== mockDriveId) {
      throw new ResultNotFoundError(attemptId);
    }

    const modules: ModuleResultSummary[] = attempt.moduleAttempts.map((ma) => ({
      moduleId: ma.moduleId,
      moduleName: ma.module.name ?? `Module ${ma.module.order}`,
      moduleType: ma.module.moduleType,
      score: ma.score,
      maxScore: ma.maxScore,
      percentage: ma.percentage,
      isPassed: ma.isPassed,
      timeSpentSeconds: ma.timeSpentSeconds,
    }));

    return {
      attemptId: attempt.id,
      mockDriveId: attempt.mockDriveId,
      student: {
        userId: attempt.userId,
        name: attempt.user.profile?.fullName ?? attempt.user.name ?? 'Unknown',
        email: attempt.user.email,
        studentId: attempt.user.profile?.studentId ?? null,
        department: attempt.user.profile?.department ?? null,
      },
      batch: attempt.batch ? { id: attempt.batch.id, name: attempt.batch.name } : null,
      status: attempt.status,
      totalScore: attempt.totalScore,
      percentageScore: attempt.percentageScore,
      rank: attempt.rank,
      isPassed: attempt.isPassed,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      modules,
      report: attempt.report,
    };
  }

  // ==========================================
  // Get Statistics
  // ==========================================

  async getStatistics(
    mockDriveId: string,
    instituteId: string,
    batchId?: string
  ): Promise<ResultStatistics> {
    await this.verifyAccess(mockDriveId, instituteId);

    const baseWhere: Prisma.MockDriveAttemptWhereInput = {
      mockDriveId,
      ...(batchId && { batchId }),
    };

    const completedWhere = { ...baseWhere, status: MockDriveAttemptStatus.COMPLETED };

    const [total, completed, passed, scores] = await Promise.all([
      prisma.mockDriveAttempt.count({ where: baseWhere }),
      prisma.mockDriveAttempt.count({ where: completedWhere }),
      prisma.mockDriveAttempt.count({ where: { ...completedWhere, isPassed: true } }),
      prisma.mockDriveAttempt.aggregate({
        where: completedWhere,
        _avg: { totalScore: true },
        _max: { totalScore: true },
        _min: { totalScore: true },
      }),
    ]);

    return {
      total,
      completed,
      passed,
      failed: completed - passed,
      avgScore: scores._avg.totalScore,
      highScore: scores._max.totalScore,
      lowScore: scores._min.totalScore,
      passRate: completed > 0 ? (passed / completed) * 100 : null,
    };
  }

  // ==========================================
  // Calculate Rankings
  // ==========================================

  async calculateRankings(
    mockDriveId: string,
    instituteId: string,
    batchId?: string
  ): Promise<RankingEntry[]> {
    await this.verifyAccess(mockDriveId, instituteId);

    const attempts = await prisma.mockDriveAttempt.findMany({
      where: {
        mockDriveId,
        status: MockDriveAttemptStatus.COMPLETED,
        ...(batchId && { batchId }),
      },
      orderBy: [{ totalScore: 'desc' }, { completedAt: 'asc' }],
      include: { user: { include: { profile: true } } },
    });

    if (attempts.length === 0) return [];

    // Calculate ranks (same score = same rank)
    const rankings: RankingEntry[] = [];
    let currentRank = 0;
    let prevScore: number | null = null;

    for (let i = 0; i < attempts.length; i++) {
      const a = attempts[i];
      const score = a.totalScore ?? 0;

      if (score !== prevScore) {
        currentRank = i + 1;
      }

      rankings.push({
        attemptId: a.id,
        userId: a.userId,
        studentName: a.user.profile?.fullName ?? a.user.name ?? 'Unknown',
        rank: currentRank,
        totalScore: score,
        percentageScore: a.percentageScore ?? 0,
      });

      prevScore = score;
    }

    // Update ranks in database
    await prisma.$transaction(
      rankings.map((r) =>
        prisma.mockDriveAttempt.update({
          where: { id: r.attemptId },
          data: { rank: r.rank },
        })
      )
    );

    logger.info('Rankings calculated', { mockDriveId, batchId, count: rankings.length });

    return rankings;
  }

  // ==========================================
  // Export Results
  // ==========================================

  async exportResults(
    mockDriveId: string,
    instituteId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    await this.verifyAccess(mockDriveId, instituteId);

    const [mockDrive, attempts] = await Promise.all([
      prisma.mockDrive.findUnique({
        where: { id: mockDriveId },
        select: { title: true },
      }),
      prisma.mockDriveAttempt.findMany({
        where: {
          mockDriveId,
          ...(options.batchId && { batchId: options.batchId }),
        },
        orderBy: { rank: 'asc' },
        include: {
          user: { include: { profile: true } },
          batch: { select: { name: true } },
        },
      }),
    ]);

    if (attempts.length === 0) {
      throw new ResultsError('NO_DATA', 'No results to export', 400);
    }

    const rows = attempts.map((a) => ({
      Rank: a.rank ?? 'N/A',
      'Student Name': a.user.profile?.fullName ?? a.user.name ?? 'Unknown',
      'Student ID': a.user.profile?.studentId ?? 'N/A',
      Email: a.user.email,
      Department: a.user.profile?.department ?? 'N/A',
      Batch: a.batch?.name ?? 'N/A',
      Status: a.status,
      'Total Score': a.totalScore ?? 0,
      'Percentage (%)': a.percentageScore?.toFixed(2) ?? '0.00',
      Result: a.isPassed ? 'PASSED' : 'FAILED',
      'Completed At': a.completedAt?.toISOString() ?? 'N/A',
    }));

    const title = this.sanitizeFilename(mockDrive?.title ?? 'results');
    const date = new Date().toISOString().split('T')[0];

    if (options.format === 'json') {
      return {
        filename: `${title}-${date}.json`,
        data: JSON.stringify(rows, null, 2),
        contentType: 'application/json',
      };
    }

    return {
      filename: `${title}-${date}.csv`,
      data: this.toCSV(rows),
      contentType: 'text/csv; charset=utf-8',
    };
  }

  // ==========================================
  // Generate Report for Attempt
  // ==========================================

  async generateReport(
    mockDriveId: string,
    attemptId: string,
    instituteId: string
  ): Promise<void> {
    await this.verifyAccess(mockDriveId, instituteId);

    const attempt = await prisma.mockDriveAttempt.findUnique({
      where: { id: attemptId },
      include: {
        mockDrive: { select: { title: true } },
        moduleAttempts: {
          include: { module: { select: { name: true, moduleType: true, order: true } } },
        },
        report: { select: { id: true } },
      },
    });

    if (!attempt || attempt.mockDriveId !== mockDriveId) {
      throw new ResultNotFoundError(attemptId);
    }

    if (attempt.status !== MockDriveAttemptStatus.COMPLETED) {
      throw new ResultsError('NOT_COMPLETED', 'Cannot generate report for incomplete attempt', 400);
    }

    if (attempt.report) {
      return; // Already exists
    }

    // Analyze performance
    const modules = attempt.moduleAttempts.map((ma) => ({
      name: ma.module.name ?? `Module ${ma.module.order}`,
      type: ma.module.moduleType,
      percentage: ma.percentage ?? 0,
    }));

    const strengths = modules
      .filter((m) => m.percentage >= 70)
      .map((m) => `Strong performance in ${m.name} (${m.percentage.toFixed(0)}%)`);

    const weaknesses = modules
      .filter((m) => m.percentage < 50)
      .map((m) => `Needs improvement in ${m.name} (${m.percentage.toFixed(0)}%)`);

    const recommendations = this.generateRecommendations(modules);

    const score = attempt.percentageScore?.toFixed(1) ?? '0';
    const status = attempt.isPassed ? 'passed' : 'did not pass';
    const performanceSummary = `You completed "${attempt.mockDrive.title}" with ${score}% and ${status} the assessment.`;

    // Create module feedback JSON
    const moduleFeedback = attempt.moduleAttempts.map((ma) => ({
      moduleId: ma.moduleId,
      moduleName: ma.module.name ?? `Module ${ma.module.order}`,
      moduleType: ma.module.moduleType,
      score: ma.score,
      maxScore: ma.maxScore,
      percentage: ma.percentage,
      feedback: this.getModuleFeedback(ma.percentage ?? 0),
      recommendations: [],
    }));

    await prisma.mockDriveReport.create({
      data: {
        attemptId,
        overallScore: attempt.totalScore ?? 0,
        overallPercentage: attempt.percentageScore ?? 0,
        overallRank: attempt.rank,
        performanceSummary,
        strengths,
        weaknesses,
        moduleFeedback,
        recommendations,
      },
    });

    logger.info('Report generated', { attemptId });
  }

  // ==========================================
  // Generate All Reports (Bulk)
  // ==========================================

  async generateAllReports(
    mockDriveId: string,
    instituteId: string
  ): Promise<{ generated: number; skipped: number; failed: number }> {
    await this.verifyAccess(mockDriveId, instituteId);

    const attempts = await prisma.mockDriveAttempt.findMany({
      where: {
        mockDriveId,
        status: MockDriveAttemptStatus.COMPLETED,
        report: null,
      },
      select: { id: true },
    });

    let generated = 0;
    let failed = 0;

    for (const attempt of attempts) {
      try {
        await this.generateReport(mockDriveId, attempt.id, instituteId);
        generated++;
      } catch (error) {
        logger.error('Failed to generate report', { attemptId: attempt.id, error });
        failed++;
      }
    }

    const skipped = await prisma.mockDriveReport.count({
      where: { attempt: { mockDriveId } },
    });

    return { generated, skipped: skipped - generated, failed };
  }

  // ==========================================
  // Private Helpers
  // ==========================================

  private async verifyAccess(mockDriveId: string, instituteId: string): Promise<void> {
    const mockDrive = await prisma.mockDrive.findUnique({
      where: { id: mockDriveId },
      select: { instituteId: true },
    });

    if (!mockDrive) {
      throw new MockDriveNotFoundError(mockDriveId);
    }

    if (mockDrive.instituteId !== instituteId) {
      throw new AccessDeniedError();
    }
  }

  private buildOrderBy(
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Prisma.MockDriveAttemptOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'studentName':
        return [{ user: { profile: { fullName: sortOrder } } }];
      case 'totalScore':
        return [{ totalScore: sortOrder }];
      case 'completedAt':
        return [{ completedAt: sortOrder }];
      case 'rank':
      default:
        return [{ rank: { sort: sortOrder, nulls: 'last' } }, { totalScore: 'desc' }];
    }
  }

  private generateRecommendations(
    modules: Array<{ name: string; type: string; percentage: number }>
  ): string[] {
    const recs = new Set<string>();

    for (const m of modules) {
      if (m.percentage >= 60) continue;

      switch (m.type) {
        case 'APTITUDE':
          recs.add('Practice quantitative and logical reasoning questions daily');
          break;
        case 'MACHINE_CODING':
          recs.add('Solve data structures and algorithms problems regularly');
          break;
        case 'AI_INTERVIEW':
          recs.add('Practice mock interviews and work on communication skills');
          break;
      }
    }

    return Array.from(recs);
  }

  private getModuleFeedback(percentage: number): string {
    if (percentage >= 80) return 'Excellent performance!';
    if (percentage >= 60) return 'Good performance. Keep it up!';
    if (percentage >= 40) return 'Average performance. Room for improvement.';
    return 'Needs significant improvement. Focus on fundamentals.';
  }

  private sanitizeFilename(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
      .slice(0, 30);
  }

  private toCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';

    const escape = (val: unknown): string => {
      if (val == null) return '';
      const str = String(val);
      return /[,"\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => escape(row[h])).join(','));

    return CSV_BOM + [headers.join(','), ...rows].join('\n');
  }
}

export const resultsService = new ResultsService();
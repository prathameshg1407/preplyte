// src/modules/instituteadmin/institute-analytics.service.ts

import { prisma } from '../../lib/db';
import { MockDriveAttemptStatus, AiInterviewSessionStatus } from '@prisma/client';

// ============================================
// Types
// ============================================

export interface InstituteAnalyticsSummary {
  totalStudents: number;
  totalMockDrives: number;
  totalRegistrations: number;
  totalAptitudeSessions: number;
  totalCodingSessions: number;
  totalAiInterviewSessions: number;
  overallAvgScore: number | null;
  overallCompletionRate: number;
}

export interface MonthlyDriveData {
  month: string; // "YYYY-MM"
  label: string; // "Jan 2025"
  drives: number;
  registrations: number;
  completions: number;
}

export interface ScoreBucket {
  label: string;
  count: number;
  percentage: number;
}

export interface ScoreDistribution {
  buckets: ScoreBucket[];
  totalStudents: number;
}

export interface DepartmentPerformance {
  departmentId: string;
  departmentName: string;
  totalStudents: number;
  aptitudeSessions: number;
  codingSessions: number;
  aiInterviewSessions: number;
  mockDriveAttempts: number;
  avgMockDriveScore: number | null;
}

export interface TopPerformer {
  userId: string;
  name: string;
  studentId: string | null;
  departmentId: string | null;
  avgScore: number | null;
  completedDrives: number;
  aptitudeSessions: number;
  codingSessions: number;
  aiInterviewSessions: number;
}

export interface DriveComparison {
  driveId: string;
  driveName: string;
  status: string;
  totalStudents: number;
  completedStudents: number;
  avgScore: number | null;
  completionRate: number;
  createdAt: string;
}

export interface PracticeModuleStats {
  aptitude: {
    totalSessions: number;
    completedSessions: number;
    avgAccuracy: number | null;
    sessionsThisMonth: number;
    byDifficulty: { difficulty: string; count: number; avgScore: number | null }[];
  };
  coding: {
    totalSessions: number;
    completedSessions: number;
    avgSolveRate: number | null;
    sessionsThisMonth: number;
    byDifficulty: { difficulty: string; count: number; avgSolved: number | null }[];
  };
  aiInterview: {
    totalSessions: number;
    completedSessions: number;
    avgScore: number | null;
    sessionsThisMonth: number;
    byDifficulty: { difficulty: string; count: number; avgScore: number | null }[];
  };
}

export interface InstituteAnalytics {
  summary: InstituteAnalyticsSummary;
  drivesOverTime: MonthlyDriveData[];
  scoreDistribution: ScoreDistribution;
  departmentPerformance: DepartmentPerformance[];
  topPerformers: TopPerformer[];
  driveComparison: DriveComparison[];
  practiceStats: PracticeModuleStats;
}

// ============================================
// Service Class
// ============================================

export class InstituteAnalyticsService {

  async getInstituteAnalytics(instituteId: string): Promise<InstituteAnalytics> {
    const [
      summary,
      drivesOverTime,
      scoreDistribution,
      departmentPerformance,
      topPerformers,
      driveComparison,
      practiceStats,
    ] = await Promise.all([
      this.getSummary(instituteId),
      this.getDrivesOverTime(instituteId),
      this.getScoreDistribution(instituteId),
      this.getDepartmentPerformance(instituteId),
      this.getTopPerformers(instituteId),
      this.getDriveComparison(instituteId),
      this.getPracticeModuleStats(instituteId),
    ]);

    return {
      summary,
      drivesOverTime,
      scoreDistribution,
      departmentPerformance,
      topPerformers,
      driveComparison,
      practiceStats,
    };
  }

  // ==========================================
  // Summary
  // ==========================================

  private async getSummary(instituteId: string): Promise<InstituteAnalyticsSummary> {
    const instituteMemberIds = await this.getInstituteUserIds(instituteId);

    const [
      totalStudents,
      totalMockDrives,
      totalRegistrations,
      totalAptitudeSessions,
      totalCodingSessions,
      totalAiInterviewSessions,
      scoreStats,
      completionStats,
    ] = await Promise.all([
      prisma.user.count({ where: { instituteId, role: 'USER', isActive: true } }),
      prisma.mockDrive.count({ where: { instituteId } }),
      prisma.mockDriveRegistration.count({
        where: { mockDrive: { instituteId } },
      }),
      prisma.aptitudePracticeSession.count({
        where: { userId: { in: instituteMemberIds } },
      }),
      prisma.machinePracticeSession.count({
        where: { userId: { in: instituteMemberIds } },
      }),
      prisma.aiInterviewSession.count({
        where: { userId: { in: instituteMemberIds } },
      }),
      prisma.mockDriveAttempt.aggregate({
        where: {
          mockDrive: { instituteId },
          status: MockDriveAttemptStatus.COMPLETED,
        },
        _avg: { percentageScore: true },
      }),
      prisma.mockDriveAttempt.groupBy({
        by: ['status'],
        where: { mockDrive: { instituteId } },
        _count: { id: true },
      }),
    ]);

    const totalStarted = completionStats.reduce((sum, s) => sum + s._count.id, 0);
    const completed = completionStats.find(s => s.status === MockDriveAttemptStatus.COMPLETED)?._count.id ?? 0;

    return {
      totalStudents,
      totalMockDrives,
      totalRegistrations,
      totalAptitudeSessions,
      totalCodingSessions,
      totalAiInterviewSessions,
      overallAvgScore: scoreStats._avg.percentageScore ?? null,
      overallCompletionRate: totalStarted > 0 ? (completed / totalStarted) * 100 : 0,
    };
  }

  // ==========================================
  // Drives Over Time (last 12 months)
  // ==========================================

  private async getDrivesOverTime(instituteId: string): Promise<MonthlyDriveData[]> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const [drives, registrations, completions] = await Promise.all([
      prisma.mockDrive.findMany({
        where: { instituteId, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.mockDriveRegistration.findMany({
        where: { mockDrive: { instituteId }, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.mockDriveAttempt.findMany({
        where: {
          mockDrive: { instituteId },
          status: MockDriveAttemptStatus.COMPLETED,
          completedAt: { gte: startDate, not: null },
        },
        select: { completedAt: true },
      }),
    ]);

    const months: MonthlyDriveData[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push({ month: key, label, drives: 0, registrations: 0, completions: 0 });
    }

    const toKey = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    drives.forEach(d => {
      const m = months.find(m => m.month === toKey(d.createdAt));
      if (m) m.drives++;
    });
    registrations.forEach(r => {
      const m = months.find(m => m.month === toKey(r.createdAt));
      if (m) m.registrations++;
    });
    completions.forEach(c => {
      if (c.completedAt) {
        const m = months.find(m => m.month === toKey(c.completedAt!));
        if (m) m.completions++;
      }
    });

    return months;
  }

  // ==========================================
  // Score Distribution (mock drives)
  // ==========================================

  private async getScoreDistribution(instituteId: string): Promise<ScoreDistribution> {
    const attempts = await prisma.mockDriveAttempt.findMany({
      where: {
        mockDrive: { instituteId },
        status: MockDriveAttemptStatus.COMPLETED,
        percentageScore: { not: null },
      },
      select: { percentageScore: true },
    });

    const buckets: ScoreBucket[] = [
      { label: '0–20%', count: 0, percentage: 0 },
      { label: '21–40%', count: 0, percentage: 0 },
      { label: '41–60%', count: 0, percentage: 0 },
      { label: '61–80%', count: 0, percentage: 0 },
      { label: '81–100%', count: 0, percentage: 0 },
    ];

    const ranges = [
      { min: 0, max: 20 },
      { min: 21, max: 40 },
      { min: 41, max: 60 },
      { min: 61, max: 80 },
      { min: 81, max: 100 },
    ];

    const total = attempts.length;
    for (const a of attempts) {
      const score = a.percentageScore ?? 0;
      const idx = ranges.findIndex(r => score >= r.min && score <= r.max);
      if (idx >= 0) buckets[idx].count++;
    }
    buckets.forEach(b => {
      b.percentage = total > 0 ? (b.count / total) * 100 : 0;
    });

    return { buckets, totalStudents: total };
  }

  // ==========================================
  // Department Performance
  // ==========================================

  private async getDepartmentPerformance(instituteId: string): Promise<DepartmentPerformance[]> {
    const departments = await prisma.department.findMany({
      where: { instituteId, isActive: true },
      select: { id: true, name: true, students: { select: { userId: true } } },
    });

    return Promise.all(
      departments.map(async (dept) => {
        const userIds = dept.students.map(s => s.userId);
        if (userIds.length === 0) {
          return {
            departmentId: dept.id,
            departmentName: dept.name,
            totalStudents: 0,
            aptitudeSessions: 0,
            codingSessions: 0,
            aiInterviewSessions: 0,
            mockDriveAttempts: 0,
            avgMockDriveScore: null,
          };
        }

        const [aptitude, coding, aiInterview, driveAttempts, scoreAgg] = await Promise.all([
          prisma.aptitudePracticeSession.count({ where: { userId: { in: userIds } } }),
          prisma.machinePracticeSession.count({ where: { userId: { in: userIds } } }),
          prisma.aiInterviewSession.count({ where: { userId: { in: userIds } } }),
          prisma.mockDriveAttempt.count({ where: { userId: { in: userIds } } }),
          prisma.mockDriveAttempt.aggregate({
            where: { userId: { in: userIds }, status: MockDriveAttemptStatus.COMPLETED },
            _avg: { percentageScore: true },
          }),
        ]);

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          totalStudents: userIds.length,
          aptitudeSessions: aptitude,
          codingSessions: coding,
          aiInterviewSessions: aiInterview,
          mockDriveAttempts: driveAttempts,
          avgMockDriveScore: scoreAgg._avg.percentageScore ?? null,
        };
      })
    );
  }

  // ==========================================
  // Top Performers
  // ==========================================

  private async getTopPerformers(instituteId: string): Promise<TopPerformer[]> {
    const instituteMemberIds = await this.getInstituteUserIds(instituteId);
    if (instituteMemberIds.length === 0) return [];

    const completedAttempts = await prisma.mockDriveAttempt.findMany({
      where: {
        userId: { in: instituteMemberIds },
        status: MockDriveAttemptStatus.COMPLETED,
      },
      select: { userId: true, percentageScore: true },
    });

    const [aptitudeCounts, codingCounts, aiInterviewCounts, users] = await Promise.all([
      prisma.aptitudePracticeSession.groupBy({
        by: ['userId'],
        where: { userId: { in: instituteMemberIds } },
        _count: { id: true },
      }),
      prisma.machinePracticeSession.groupBy({
        by: ['userId'],
        where: { userId: { in: instituteMemberIds } },
        _count: { id: true },
      }),
      prisma.aiInterviewSession.groupBy({
        by: ['userId'],
        where: { userId: { in: instituteMemberIds } },
        _count: { id: true },
      }),
      prisma.user.findMany({
        where: { id: { in: instituteMemberIds } },
        select: {
          id: true,
          name: true,
          profile: { select: { studentId: true, departmentId: true } },
        },
      }),
    ]);

    // Aggregate scores per user
    const userScores = new Map<string, { total: number; count: number }>();
    for (const a of completedAttempts) {
      if (a.percentageScore !== null) {
        const existing = userScores.get(a.userId) ?? { total: 0, count: 0 };
        existing.total += a.percentageScore;
        existing.count++;
        userScores.set(a.userId, existing);
      }
    }

    const driveCompletionCount = new Map<string, number>();
    for (const a of completedAttempts) {
      driveCompletionCount.set(a.userId, (driveCompletionCount.get(a.userId) ?? 0) + 1);
    }

    const aptitudeMap = new Map(aptitudeCounts.map(r => [r.userId, r._count.id]));
    const codingMap = new Map(codingCounts.map(r => [r.userId, r._count.id]));
    const aiMap = new Map(aiInterviewCounts.map(r => [r.userId, r._count.id]));

    const performers: TopPerformer[] = users.map(u => {
      const scores = userScores.get(u.id);
      return {
        userId: u.id,
        name: u.name ?? 'Unknown',
        studentId: u.profile?.studentId ?? null,
        departmentId: u.profile?.departmentId ?? null,
        avgScore: scores ? scores.total / scores.count : null,
        completedDrives: driveCompletionCount.get(u.id) ?? 0,
        aptitudeSessions: aptitudeMap.get(u.id) ?? 0,
        codingSessions: codingMap.get(u.id) ?? 0,
        aiInterviewSessions: aiMap.get(u.id) ?? 0,
      };
    });

    // Sort by avgScore desc, then by total activity
    return performers
      .sort((a, b) => {
        if (a.avgScore !== null && b.avgScore !== null) return b.avgScore - a.avgScore;
        if (a.avgScore !== null) return -1;
        if (b.avgScore !== null) return 1;
        const aTot = a.aptitudeSessions + a.codingSessions + a.aiInterviewSessions;
        const bTot = b.aptitudeSessions + b.codingSessions + b.aiInterviewSessions;
        return bTot - aTot;
      })
      .slice(0, 10);
  }

  // ==========================================
  // Drive Comparison
  // ==========================================

  private async getDriveComparison(instituteId: string): Promise<DriveComparison[]> {
    const drives = await prisma.mockDrive.findMany({
      where: { instituteId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, status: true, createdAt: true },
    });

    return Promise.all(
      drives.map(async (drive) => {
        const [total, completed, scoreAgg] = await Promise.all([
          prisma.mockDriveAttempt.count({ where: { mockDriveId: drive.id } }),
          prisma.mockDriveAttempt.count({
            where: { mockDriveId: drive.id, status: MockDriveAttemptStatus.COMPLETED },
          }),
          prisma.mockDriveAttempt.aggregate({
            where: { mockDriveId: drive.id, status: MockDriveAttemptStatus.COMPLETED },
            _avg: { percentageScore: true },
          }),
        ]);

        return {
          driveId: drive.id,
          driveName: drive.title,
          status: drive.status,
          totalStudents: total,
          completedStudents: completed,
          avgScore: scoreAgg._avg.percentageScore ?? null,
          completionRate: total > 0 ? (completed / total) * 100 : 0,
          createdAt: drive.createdAt.toISOString(),
        };
      })
    );
  }

  // ==========================================
  // Practice Module Stats
  // ==========================================

  private async getPracticeModuleStats(instituteId: string): Promise<PracticeModuleStats> {
    const instituteMemberIds = await this.getInstituteUserIds(instituteId);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    if (instituteMemberIds.length === 0) {
      return this.emptyPracticeStats();
    }

    const [
      aptitudeSessions,
      aptitudeThisMonth,
      aptitudeByDiff,
      codingSessions,
      codingThisMonth,
      codingByDiff,
      aiSessions,
      aiThisMonth,
      aiByDiff,
      aiCompletedFeedback,
    ] = await Promise.all([
      // Aptitude
      prisma.aptitudePracticeSession.findMany({
        where: { userId: { in: instituteMemberIds } },
        select: { completedAt: true, totalCorrect: true, numberOfQuestions: true, difficulty: true },
      }),
      prisma.aptitudePracticeSession.count({
        where: { userId: { in: instituteMemberIds }, createdAt: { gte: monthStart } },
      }),
      prisma.aptitudePracticeSession.groupBy({
        by: ['difficulty'],
        where: { userId: { in: instituteMemberIds } },
        _count: { id: true },
        _avg: { totalCorrect: true },
      }),

      // Coding
      prisma.machinePracticeSession.findMany({
        where: { userId: { in: instituteMemberIds } },
        select: { completedAt: true, totalSolved: true, numberOfQuestions: true, difficulty: true },
      }),
      prisma.machinePracticeSession.count({
        where: { userId: { in: instituteMemberIds }, createdAt: { gte: monthStart } },
      }),
      prisma.machinePracticeSession.groupBy({
        by: ['difficulty'],
        where: { userId: { in: instituteMemberIds } },
        _count: { id: true },
        _avg: { totalSolved: true },
      }),

      // AI Interview
      prisma.aiInterviewSession.findMany({
        where: { userId: { in: instituteMemberIds } },
        select: { status: true, difficulty: true, createdAt: true },
      }),
      prisma.aiInterviewSession.count({
        where: { userId: { in: instituteMemberIds }, createdAt: { gte: monthStart } },
      }),
      prisma.aiInterviewSession.groupBy({
        by: ['difficulty'],
        where: { userId: { in: instituteMemberIds } },
        _count: { id: true },
      }),
      // Get feedback scores for completed AI sessions
      prisma.aiInterviewFeedback.aggregate({
        where: { userId: { in: instituteMemberIds } },
        _avg: { overallScore: true },
      }),
    ]);

    const aptitudeCompleted = aptitudeSessions.filter(s => s.completedAt !== null);
    const aptitudeAccuracies = aptitudeCompleted
      .filter(s => s.totalCorrect !== null && s.numberOfQuestions > 0)
      .map(s => ((s.totalCorrect ?? 0) / s.numberOfQuestions) * 100);
    const avgAptitudeAccuracy = aptitudeAccuracies.length > 0
      ? aptitudeAccuracies.reduce((a, b) => a + b, 0) / aptitudeAccuracies.length
      : null;

    const codingCompleted = codingSessions.filter(s => s.completedAt !== null);
    const codingSolveRates = codingCompleted
      .filter(s => s.totalSolved !== null && s.numberOfQuestions > 0)
      .map(s => ((s.totalSolved ?? 0) / s.numberOfQuestions) * 100);
    const avgCodingSolveRate = codingSolveRates.length > 0
      ? codingSolveRates.reduce((a, b) => a + b, 0) / codingSolveRates.length
      : null;

    const aiCompleted = aiSessions.filter(s => s.status === AiInterviewSessionStatus.COMPLETED);

    // Build AI feedback by difficulty (need to join with feedback)
    const aiFeedbackByDiff = await prisma.aiInterviewFeedback.findMany({
      where: { userId: { in: instituteMemberIds } },
      select: {
        overallScore: true,
        session: { select: { difficulty: true } },
      },
    });

    const aiDiffMap = new Map<string, { count: number; totalScore: number; feedbackCount: number }>();
    for (const s of aiSessions) {
      const key = s.difficulty;
      if (!aiDiffMap.has(key)) aiDiffMap.set(key, { count: 0, totalScore: 0, feedbackCount: 0 });
      aiDiffMap.get(key)!.count++;
    }
    for (const f of aiFeedbackByDiff) {
      const key = f.session.difficulty;
      const entry = aiDiffMap.get(key);
      if (entry) {
        entry.totalScore += Number(f.overallScore);
        entry.feedbackCount++;
      }
    }

    return {
      aptitude: {
        totalSessions: aptitudeSessions.length,
        completedSessions: aptitudeCompleted.length,
        avgAccuracy: avgAptitudeAccuracy,
        sessionsThisMonth: aptitudeThisMonth,
        byDifficulty: aptitudeByDiff.map(d => ({
          difficulty: d.difficulty,
          count: d._count.id,
          avgScore: d._avg.totalCorrect ?? null,
        })),
      },
      coding: {
        totalSessions: codingSessions.length,
        completedSessions: codingCompleted.length,
        avgSolveRate: avgCodingSolveRate,
        sessionsThisMonth: codingThisMonth,
        byDifficulty: codingByDiff.map(d => ({
          difficulty: d.difficulty,
          count: d._count.id,
          avgSolved: d._avg.totalSolved ?? null,
        })),
      },
      aiInterview: {
        totalSessions: aiSessions.length,
        completedSessions: aiCompleted.length,
        avgScore: aiCompletedFeedback._avg.overallScore
          ? Number(aiCompletedFeedback._avg.overallScore)
          : null,
        sessionsThisMonth: aiThisMonth,
        byDifficulty: Array.from(aiDiffMap.entries()).map(([difficulty, stats]) => ({
          difficulty,
          count: stats.count,
          avgScore: stats.feedbackCount > 0 ? stats.totalScore / stats.feedbackCount : null,
        })),
      },
    };
  }

  // ==========================================
  // Helpers
  // ==========================================

  private async getInstituteUserIds(instituteId: string): Promise<string[]> {
    const users = await prisma.user.findMany({
      where: { instituteId, role: 'USER' },
      select: { id: true },
    });
    return users.map(u => u.id);
  }

  private emptyPracticeStats(): PracticeModuleStats {
    const empty = {
      totalSessions: 0, completedSessions: 0, sessionsThisMonth: 0, byDifficulty: []
    };
    return {
      aptitude: { ...empty, avgAccuracy: null },
      coding: { ...empty, avgSolveRate: null },
      aiInterview: { ...empty, avgScore: null },
    };
  }
}

// ============================================
// Singleton Export
// ============================================

export const instituteAnalyticsService = new InstituteAnalyticsService();

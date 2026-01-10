// src/module/dashboard/dashboard.service.ts

import { prisma } from '../../lib/db';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import {
  StudentDashboardResponse,
  StudentDashboardStats,
  RecentTest,
  UpcomingDrive,
  InstituteAdminDashboardResponse,
  InstituteAdminDashboardStats,
  RecentDrive,
  TopPerformer,
  PlatformAdminDashboardResponse,
  PlatformOverviewStats,
  PlatformSessionStats,
  PlatformPerformanceStats,
  PlatformTrends,
  TrendDataPoint,
  RecentInstitute,
} from './dashboard.types';
import { DASHBOARD_LIMITS, getDateRanges } from './dashboard.constants';
import { MockDriveStatus, MockDriveRegistrationStatus } from '@prisma/client';

// =====================================================
// SERVICE CLASS
// =====================================================

class DashboardService {
  // =================================================
  // STUDENT DASHBOARD
  // =================================================

  async getStudentDashboard(userId: string): Promise<StudentDashboardResponse> {
    logger.debug('[DashboardService] Fetching student dashboard', { userId });

    const [stats, recentTests, upcomingTests] = await Promise.all([
      this.getStudentStats(userId),
      this.getStudentRecentTests(userId),
      this.getStudentUpcomingDrives(userId),
    ]);

    return {
      stats,
      recentTests,
      upcomingTests,
    };
  }

  private async getStudentStats(userId: string): Promise<StudentDashboardStats> {
    const [
      aptitudeSessions,
      machineSessions,
      interviewSessions,
    ] = await Promise.all([
      prisma.aptitudePracticeSession.findMany({
        where: { userId },
        select: {
          completedAt: true,
          totalScore: true,
          numberOfQuestions: true,
        },
      }),
      prisma.machinePracticeSession.findMany({
        where: { userId },
        select: {
          completedAt: true,
          totalSolved: true,
          numberOfQuestions: true,
        },
      }),
      prisma.aiInterviewSession.findMany({
        where: { userId },
        select: {
          status: true,
          feedback: {
            select: { overallScore: true },
          },
        },
      }),
    ]);

    // Calculate aptitude stats
    const completedAptitude = aptitudeSessions.filter((s) => s.completedAt);
    const aptitudeScores = completedAptitude
      .filter((s) => s.totalScore !== null && s.numberOfQuestions > 0)
      .map((s) => (s.totalScore! / s.numberOfQuestions) * 100);

    // Calculate machine stats
    const completedMachine = machineSessions.filter((s) => s.completedAt);
    const totalProblems = machineSessions.reduce((sum, s) => sum + s.numberOfQuestions, 0);
    const problemsSolved = completedMachine.reduce((sum, s) => sum + (s.totalSolved || 0), 0);

    // Calculate interview stats
    const completedInterviews = interviewSessions.filter((s) => s.status === 'COMPLETED');
    const interviewScores = completedInterviews
      .filter((s) => s.feedback?.overallScore)
      .map((s) => Number(s.feedback!.overallScore));

    // Calculate overall score
    const allScores = [...aptitudeScores, ...interviewScores];
    const overallScore = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

    return {
      testsCompleted: completedAptitude.length,
      totalTests: aptitudeSessions.length || 50, // Default target
      interviewsCompleted: completedInterviews.length,
      totalInterviews: interviewSessions.length || 15, // Default target
      problemsSolved,
      totalProblems: totalProblems || 300, // Default target
      overallScore,
    };
  }

  private async getStudentRecentTests(userId: string): Promise<RecentTest[]> {
    const [aptitudeSessions, machineSessions, interviewSessions] = await Promise.all([
      prisma.aptitudePracticeSession.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        take: DASHBOARD_LIMITS.RECENT_TESTS,
        select: {
          id: true,
          difficulty: true,
          totalScore: true,
          numberOfQuestions: true,
          completedAt: true,
          questionTypes: true,
        },
      }),
      prisma.machinePracticeSession.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: 'desc' },
        take: DASHBOARD_LIMITS.RECENT_TESTS,
        select: {
          id: true,
          difficulty: true,
          totalSolved: true,
          numberOfQuestions: true,
          completedAt: true,
        },
      }),
      prisma.aiInterviewSession.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: DASHBOARD_LIMITS.RECENT_TESTS,
        select: {
          id: true,
          difficulty: true,
          jobTitle: true,
          completedAt: true,
          feedback: {
            select: { overallScore: true },
          },
        },
      }),
    ]);

    const tests: RecentTest[] = [];

    // Map aptitude sessions
    aptitudeSessions.forEach((session) => {
      tests.push({
        id: session.id,
        title: `Aptitude Test - ${session.difficulty}`,
        type: 'APTITUDE',
        score: session.totalScore || 0,
        total: session.numberOfQuestions,
        date: session.completedAt!.toISOString(),
        status: 'Completed',
      });
    });

    // Map machine sessions
    machineSessions.forEach((session) => {
      tests.push({
        id: session.id,
        title: `Coding Challenge - ${session.difficulty}`,
        type: 'MACHINE',
        score: session.totalSolved || 0,
        total: session.numberOfQuestions,
        date: session.completedAt!.toISOString(),
        status: 'Completed',
      });
    });

    // Map interview sessions
    interviewSessions.forEach((session) => {
      tests.push({
        id: session.id,
        title: session.jobTitle || `AI Interview - ${session.difficulty}`,
        type: 'INTERVIEW',
        score: session.feedback ? Number(session.feedback.overallScore) : 0,
        total: 100,
        date: session.completedAt!.toISOString(),
        status: 'Completed',
      });
    });

    // Sort by date and return top N
    return tests
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, DASHBOARD_LIMITS.RECENT_TESTS);
  }

  private async getStudentUpcomingDrives(userId: string): Promise<UpcomingDrive[]> {
    const now = new Date();

    // Get user's approved registrations for upcoming drives
    const registrations = await prisma.mockDriveRegistration.findMany({
      where: {
        userId,
        status: MockDriveRegistrationStatus.APPROVED,
        mockDrive: {
          status: {
            in: [
              MockDriveStatus.PUBLISHED,
              MockDriveStatus.REGISTRATION_OPEN,
              MockDriveStatus.REGISTRATION_CLOSED,
            ],
          },
          driveStartDate: { gt: now },
        },
      },
      include: {
        mockDrive: {
          include: {
            modules: {
              where: { isActive: true },
              select: { id: true, timeLimit: true },
            },
          },
        },
      },
      orderBy: { mockDrive: { driveStartDate: 'asc' } },
      take: DASHBOARD_LIMITS.UPCOMING_TESTS,
    });

    return registrations.map((reg) => {
      const drive = reg.mockDrive;
      const totalDuration = drive.modules.reduce((sum, m) => sum + m.timeLimit, 0);

      return {
        id: drive.id,
        title: drive.title,
        date: drive.driveStartDate?.toISOString() || '',
        duration: `${totalDuration} min`,
        difficulty: 'Mixed', // Could be derived from modules
        status: drive.status,
        moduleCount: drive.modules.length,
      };
    });
  }

  // =================================================
  // INSTITUTE ADMIN DASHBOARD
  // =================================================

  async getInstituteAdminDashboard(
    userId: string,
    instituteId: string
  ): Promise<InstituteAdminDashboardResponse> {
    logger.debug('[DashboardService] Fetching institute admin dashboard', {
      userId,
      instituteId,
    });

    // Verify user belongs to this institute
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { instituteId: true, role: true },
    });

    if (!user || user.instituteId !== instituteId) {
      throw new ForbiddenError('Access denied to this institute');
    }

    const [stats, recentDrives, topPerformers] = await Promise.all([
      this.getInstituteStats(instituteId),
      this.getInstituteRecentDrives(instituteId),
      this.getInstituteTopPerformers(instituteId),
    ]);

    return {
      stats,
      recentDrives,
      topPerformers,
    };
  }

  private async getInstituteStats(instituteId: string): Promise<InstituteAdminDashboardStats> {
    const { startOfThisMonth, startOfLastMonth, endOfLastMonth } = getDateRanges();

    // Get all drives for this institute
    const drives = await prisma.mockDrive.findMany({
      where: { instituteId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        driveStartDate: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    const now = new Date();

    // Calculate drive stats
    const totalDrives = drives.length;
    const drivesThisMonth = drives.filter(
      (d) => d.createdAt >= startOfThisMonth
    ).length;
    const activeDrives = drives.filter(
      (d) => d.status === MockDriveStatus.IN_PROGRESS
    ).length;
    const upcomingDrives = drives.filter(
      (d) =>
        d.driveStartDate &&
        d.driveStartDate > now &&
        d.status !== MockDriveStatus.CANCELLED
    ).length;

    // Get registration stats
    const driveIds = drives.map((d) => d.id);
    
    const [totalRegistrations, registrationsThisMonth] = await Promise.all([
      prisma.mockDriveRegistration.count({
        where: { mockDriveId: { in: driveIds } },
      }),
      prisma.mockDriveRegistration.count({
        where: {
          mockDriveId: { in: driveIds },
          registeredAt: { gte: startOfThisMonth },
        },
      }),
    ]);

    // Get average scores
    const [currentMonthAttempts, lastMonthAttempts] = await Promise.all([
      prisma.mockDriveAttempt.findMany({
        where: {
          mockDriveId: { in: driveIds },
          completedAt: { gte: startOfThisMonth },
          percentageScore: { not: null },
        },
        select: { percentageScore: true },
      }),
      prisma.mockDriveAttempt.findMany({
        where: {
          mockDriveId: { in: driveIds },
          completedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
          percentageScore: { not: null },
        },
        select: { percentageScore: true },
      }),
    ]);

    const avgScoreThisMonth = currentMonthAttempts.length > 0
      ? currentMonthAttempts.reduce((sum, a) => sum + (a.percentageScore || 0), 0) /
        currentMonthAttempts.length
      : 0;

    const avgScoreLastMonth = lastMonthAttempts.length > 0
      ? lastMonthAttempts.reduce((sum, a) => sum + (a.percentageScore || 0), 0) /
        lastMonthAttempts.length
      : 0;

    const scoreChange = avgScoreThisMonth - avgScoreLastMonth;

    return {
      totalDrives,
      drivesThisMonth,
      activeDrives,
      upcomingDrives,
      totalRegistrations,
      registrationsThisMonth,
      avgScore: Math.round(avgScoreThisMonth * 10) / 10,
      scoreChange: Math.round(scoreChange * 10) / 10,
    };
  }

  private async getInstituteRecentDrives(instituteId: string): Promise<RecentDrive[]> {
    const drives = await prisma.mockDrive.findMany({
      where: { instituteId },
      orderBy: { createdAt: 'desc' },
      take: DASHBOARD_LIMITS.RECENT_DRIVES,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            attempts: true,
          },
        },
      },
    });

    return drives.map((drive) => ({
      id: drive.id,
      title: drive.title,
      status: drive.status,
      registrationCount: drive._count.registrations,
      attemptCount: drive._count.attempts,
      createdAt: drive.createdAt.toISOString(),
    }));
  }

  private async getInstituteTopPerformers(instituteId: string): Promise<TopPerformer[]> {
    // Get drive IDs for this institute
    const drives = await prisma.mockDrive.findMany({
      where: { instituteId },
      select: { id: true },
    });

    const driveIds = drives.map((d) => d.id);

    if (driveIds.length === 0) {
      return [];
    }

    // Get top performers from leaderboard
    const leaderboardEntries = await prisma.mockDriveLeaderboard.findMany({
      where: {
        mockDriveId: { in: driveIds },
        batchId: null, // Overall leaderboard
      },
      orderBy: { percentageScore: 'desc' },
      take: DASHBOARD_LIMITS.TOP_PERFORMERS * 2, // Get more to aggregate
      select: {
        userId: true,
        studentName: true,
        studentId: true,
        departmentId: true,
        percentageScore: true,
      },
    });

    // Aggregate by user
    const userScores = new Map<string, {
      userId: string;
      studentName: string;
      studentId: string | null;
      departmentId: string | null;
      scores: number[];
    }>();

    leaderboardEntries.forEach((entry) => {
      if (!userScores.has(entry.userId)) {
        userScores.set(entry.userId, {
          userId: entry.userId,
          studentName: entry.studentName,
          studentId: entry.studentId,
          departmentId: entry.departmentId,
          scores: [],
        });
      }
      userScores.get(entry.userId)!.scores.push(entry.percentageScore);
    });

    // Calculate averages and sort
    const performers: TopPerformer[] = Array.from(userScores.values())
      .map((user) => ({
        userId: user.userId,
        studentName: user.studentName,
        studentId: user.studentId,
        departmentId: user.departmentId,
        avgScore: Math.round(
          (user.scores.reduce((a, b) => a + b, 0) / user.scores.length) * 10
        ) / 10,
        completedDrives: user.scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, DASHBOARD_LIMITS.TOP_PERFORMERS);

    return performers;
  }

  // =================================================
  // PLATFORM ADMIN DASHBOARD
  // =================================================

  async getPlatformAdminDashboard(): Promise<PlatformAdminDashboardResponse> {
    logger.debug('[DashboardService] Fetching platform admin dashboard');

    const [overview, sessions, performance, trends, recentInstitutes] = await Promise.all([
      this.getPlatformOverview(),
      this.getPlatformSessionStats(),
      this.getPlatformPerformance(),
      this.getPlatformTrends(),
      this.getPlatformRecentInstitutes(),
    ]);

    return {
      overview,
      sessions,
      performance,
      trends,
      recentInstitutes,
    };
  }

  private async getPlatformOverview(): Promise<PlatformOverviewStats> {
    const [
      totalInstitutes,
      activeInstitutes,
      userCounts,
    ] = await Promise.all([
      prisma.institute.count(),
      prisma.institute.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ['role', 'isActive'],
        _count: true,
      }),
    ]);

    let totalUsers = 0;
    let activeUsers = 0;
    let totalStudents = 0;
    let totalInstituteAdmins = 0;

    userCounts.forEach((group) => {
      totalUsers += group._count;
      if (group.isActive) {
        activeUsers += group._count;
      }
      if (group.role === 'USER') {
        totalStudents += group._count;
      }
      if (group.role === 'INSTITUTE_ADMIN') {
        totalInstituteAdmins += group._count;
      }
    });

    return {
      totalInstitutes,
      activeInstitutes,
      totalUsers,
      activeUsers,
      totalStudents,
      totalInstituteAdmins,
    };
  }

  private async getPlatformSessionStats(): Promise<PlatformSessionStats> {
    const [aptitude, machine, interview] = await Promise.all([
      prisma.aptitudePracticeSession.aggregate({
        _count: true,
      }),
      prisma.machinePracticeSession.aggregate({
        _count: true,
      }),
      prisma.aiInterviewSession.aggregate({
        _count: true,
      }),
    ]);

    const [completedAptitude, completedMachine, completedInterview] = await Promise.all([
      prisma.aptitudePracticeSession.count({
        where: { completedAt: { not: null } },
      }),
      prisma.machinePracticeSession.count({
        where: { completedAt: { not: null } },
      }),
      prisma.aiInterviewSession.count({
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      totalAptitudeSessions: aptitude._count,
      completedAptitudeSessions: completedAptitude,
      totalMachineSessions: machine._count,
      completedMachineSessions: completedMachine,
      totalInterviewSessions: interview._count,
      completedInterviewSessions: completedInterview,
    };
  }

  private async getPlatformPerformance(): Promise<PlatformPerformanceStats> {
    // Get average scores for each type
    const [aptitudeAvg, machineAvg, interviewAvg] = await Promise.all([
      this.calculateAptitudeAverage(),
      this.calculateMachineAverage(),
      this.calculateInterviewAverage(),
    ]);

    return {
      avgAptitudeScore: aptitudeAvg,
      avgMachineScore: machineAvg,
      avgInterviewScore: interviewAvg,
    };
  }

  private async calculateAptitudeAverage(): Promise<number> {
    const sessions = await prisma.aptitudePracticeSession.findMany({
      where: {
        completedAt: { not: null },
        totalScore: { not: null },
        numberOfQuestions: { gt: 0 },
      },
      select: {
        totalScore: true,
        numberOfQuestions: true,
      },
      take: 1000, // Limit for performance
      orderBy: { completedAt: 'desc' },
    });

    if (sessions.length === 0) return 0;

    const percentages = sessions.map(
      (s) => (s.totalScore! / s.numberOfQuestions) * 100
    );

    return Math.round(
      (percentages.reduce((a, b) => a + b, 0) / percentages.length) * 10
    ) / 10;
  }

  private async calculateMachineAverage(): Promise<number> {
    const sessions = await prisma.machinePracticeSession.findMany({
      where: {
        completedAt: { not: null },
        totalSolved: { not: null },
        numberOfQuestions: { gt: 0 },
      },
      select: {
        totalSolved: true,
        numberOfQuestions: true,
      },
      take: 1000,
      orderBy: { completedAt: 'desc' },
    });

    if (sessions.length === 0) return 0;

    const percentages = sessions.map(
      (s) => (s.totalSolved! / s.numberOfQuestions) * 100
    );

    return Math.round(
      (percentages.reduce((a, b) => a + b, 0) / percentages.length) * 10
    ) / 10;
  }

  private async calculateInterviewAverage(): Promise<number> {
    const feedbacks = await prisma.aiInterviewFeedback.findMany({
      select: { overallScore: true },
      take: 1000,
      orderBy: { createdAt: 'desc' },
    });

    if (feedbacks.length === 0) return 0;

    const scores = feedbacks.map((f) => Number(f.overallScore));

    return Math.round(
      (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
    ) / 10;
  }

  private async getPlatformTrends(): Promise<PlatformTrends> {
    const { last30Days } = getDateRanges();

    // Get user registrations trend
    const userRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: last30Days },
      },
      _count: true,
    });

    // Get session activity trend
    const aptitudeTrend = await prisma.aptitudePracticeSession.groupBy({
      by: ['startedAt'],
      where: {
        startedAt: { gte: last30Days },
      },
      _count: true,
    });

    const machineTrend = await prisma.machinePracticeSession.groupBy({
      by: ['startedAt'],
      where: {
        startedAt: { gte: last30Days },
      },
      _count: true,
    });

    const interviewTrend = await prisma.aiInterviewSession.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: last30Days },
      },
      _count: true,
    });

    // Aggregate trends by date
    const userTrend = this.aggregateTrendByDate(
      userRegistrations.map((r) => ({
        date: r.createdAt,
        count: r._count,
      }))
    );

    const sessionTrend = this.aggregateTrendByDate([
      ...aptitudeTrend.map((r) => ({ date: r.startedAt, count: r._count })),
      ...machineTrend.map((r) => ({ date: r.startedAt, count: r._count })),
      ...interviewTrend.map((r) => ({ date: r.createdAt, count: r._count })),
    ]);

    return {
      userRegistrations: userTrend,
      sessionActivity: sessionTrend,
    };
  }

  private aggregateTrendByDate(
    data: Array<{ date: Date; count: number }>
  ): TrendDataPoint[] {
    const dateMap = new Map<string, number>();

    data.forEach((item) => {
      const dateStr = item.date.toISOString().split('T')[0];
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + item.count);
    });

    // Fill in missing dates
    const { last30Days } = getDateRanges();
    const result: TrendDataPoint[] = [];
    const current = new Date(last30Days);
    const now = new Date();

    while (current <= now) {
      const dateStr = current.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: dateMap.get(dateStr) || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  private async getPlatformRecentInstitutes(): Promise<RecentInstitute[]> {
    const institutes = await prisma.institute.findMany({
      orderBy: { createdAt: 'desc' },
      take: DASHBOARD_LIMITS.RECENT_DRIVES,
      select: {
        id: true,
        name: true,
        domain: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    return institutes.map((inst) => ({
      id: inst.id,
      name: inst.name,
      domain: inst.domain,
      isActive: inst.isActive,
      userCount: inst._count.users,
      createdAt: inst.createdAt.toISOString(),
    }));
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const dashboardService = new DashboardService();
export { DashboardService };
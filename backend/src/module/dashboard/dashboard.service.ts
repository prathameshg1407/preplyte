// src/module/dashboard/dashboard.service.ts

import { prisma } from '../../lib/db';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors';
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
  LmsDashboardData,
  LmsDashboardStats,
  LmsEnrollmentSummary,
  LmsRecentActivity,
  RecommendedCourse,
} from './dashboard.types';
import { DASHBOARD_LIMITS, getDateRanges } from './dashboard.constants';
import {
  MockDriveStatus,
  MockDriveRegistrationStatus,
  LmsEnrollmentStatus,
  LmsModuleStatus,
  LmsTopicStatus,
  LmsTestAttemptStatus,
  LmsCourseStatus,
} from '@prisma/client';

// =====================================================
// SERVICE CLASS
// =====================================================

class DashboardService {
  // =================================================
  // STUDENT DASHBOARD
  // =================================================

  async getStudentDashboard(userId: string): Promise<StudentDashboardResponse> {
    logger.debug('[DashboardService] Fetching student dashboard', { userId });

    const [stats, recentTests, upcomingTests, lmsData] = await Promise.all([
      this.getStudentStats(userId),
      this.getStudentRecentTests(userId),
      this.getStudentUpcomingDrives(userId),
      this.getStudentLmsData(userId),
    ]);

    return {
      stats,
      recentTests,
      upcomingTests,
      lms: lmsData,
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
  // LMS DASHBOARD DATA
  // =================================================

  private async getStudentLmsData(userId: string): Promise<LmsDashboardData> {
    const [stats, enrollments, recentActivity, recommendedCourses] = await Promise.all([
      this.getLmsStats(userId),
      this.getLmsEnrollments(userId),
      this.getLmsRecentActivity(userId),
      this.getRecommendedCourses(userId),
    ]);

    return {
      stats,
      enrollments,
      recentActivity,
      recommendedCourses,
    };
  }

  private async getLmsStats(userId: string): Promise<LmsDashboardStats> {
    // Get all enrollments
    const enrollments = await prisma.lmsEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            totalHours: true,
            totalPoints: true,
          },
        },
      },
    });

    const totalEnrollments = enrollments.length;
    const completedCourses = enrollments.filter(
      (e) => e.status === LmsEnrollmentStatus.COMPLETED
    ).length;
    const inProgressCourses = enrollments.filter(
      (e) => e.status === LmsEnrollmentStatus.ACTIVE
    ).length;

    const totalPointsEarned = enrollments.reduce(
      (sum, e) => sum + e.totalPointsEarned,
      0
    );

    // Calculate total learning hours based on progress
    const totalLearningHours = enrollments.reduce((sum, e) => {
      const courseHours = e.course.totalHours || 0;
      const progress = e.progressPercent / 100;
      return sum + (courseHours * progress);
    }, 0);

    const certificatesEarned = enrollments.filter(
      (e) => e.certificateUrl !== null
    ).length;

    // Calculate average progress for active enrollments
    const activeEnrollments = enrollments.filter(
      (e) => e.status === LmsEnrollmentStatus.ACTIVE
    );
    const averageProgress = activeEnrollments.length > 0
      ? Math.round(
        activeEnrollments.reduce((sum, e) => sum + e.progressPercent, 0) /
        activeEnrollments.length
      )
      : 0;

    // Get module tests passed
    const moduleProgress = await prisma.lmsModuleProgress.count({
      where: {
        userId,
        testPassed: true,
      },
    });

    // Get final tests passed
    const finalTestsPassed = enrollments.filter(
      (e) => e.finalTestPassed
    ).length;

    return {
      totalEnrollments,
      completedCourses,
      inProgressCourses,
      totalPointsEarned,
      totalLearningHours: Math.round(totalLearningHours * 10) / 10,
      certificatesEarned,
      averageProgress,
      moduleTestsPassed: moduleProgress,
      finalTestsPassed,
    };
  }

  private async getLmsEnrollments(userId: string): Promise<{
    inProgress: LmsEnrollmentSummary[];
    completed: LmsEnrollmentSummary[];
    all: LmsEnrollmentSummary[];
  }> {
    const enrollments = await prisma.lmsEnrollment.findMany({
      where: { userId },
      orderBy: { lastAccessedAt: 'desc' },
      include: {
        course: {
          include: {
            category: {
              select: { name: true },
            },
          },
        },
      },
    });

    const mapEnrollment = (enrollment: any): LmsEnrollmentSummary => ({
      id: enrollment.id,
      courseId: enrollment.courseId,
      courseTitle: enrollment.course.title,
      courseSlug: enrollment.course.slug,
      courseThumbnail: enrollment.course.thumbnailUrl,
      courseCategory: enrollment.course.category?.name || 'Uncategorized',
      courseDifficulty: enrollment.course.difficulty,
      courseInstructor: enrollment.course.instructor,
      status: enrollment.status,
      progressPercent: enrollment.progressPercent,
      completedModules: enrollment.completedModules,
      totalModules: enrollment.course.totalModules,
      completedTopics: enrollment.completedTopics,
      totalTopics: enrollment.course.totalTopics,
      totalPointsEarned: enrollment.totalPointsEarned,
      courseTotalPoints: enrollment.course.totalPoints,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      lastAccessedAt: enrollment.lastAccessedAt?.toISOString() || null,
      completedAt: enrollment.completedAt?.toISOString() || null,
      certificateUrl: enrollment.certificateUrl,
      finalTestPassed: enrollment.finalTestPassed,
      finalTestScore: enrollment.finalTestScore,
    });

    const allEnrollments = enrollments.map(mapEnrollment);

    const inProgress = allEnrollments.filter(
      (e) => e.status === LmsEnrollmentStatus.ACTIVE
    );

    const completed = allEnrollments.filter(
      (e) => e.status === LmsEnrollmentStatus.COMPLETED
    );

    return {
      inProgress,
      completed,
      all: allEnrollments,
    };
  }

  private async getLmsRecentActivity(userId: string): Promise<LmsRecentActivity[]> {
    const activities: LmsRecentActivity[] = [];
    const { last30Days } = getDateRanges();

    // Get recent enrollments
    const recentEnrollments = await prisma.lmsEnrollment.findMany({
      where: {
        userId,
        enrolledAt: { gte: last30Days },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
      include: {
        course: {
          select: { title: true, slug: true },
        },
      },
    });

    recentEnrollments.forEach((enrollment) => {
      activities.push({
        id: `enroll-${enrollment.id}`,
        type: 'ENROLLMENT',
        title: 'Enrolled in Course',
        description: `You enrolled in "${enrollment.course.title}"`,
        courseSlug: enrollment.course.slug,
        courseTitle: enrollment.course.title,
        timestamp: enrollment.enrolledAt.toISOString(),
      });
    });

    // Get recent module completions
    const recentModuleCompletions = await prisma.lmsModuleProgress.findMany({
      where: {
        userId,
        status: LmsModuleStatus.COMPLETED,
        completedAt: { gte: last30Days },
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: {
        module: {
          include: {
            course: {
              select: { title: true, slug: true },
            },
          },
        },
      },
    });

    recentModuleCompletions.forEach((progress) => {
      activities.push({
        id: `module-${progress.id}`,
        type: 'MODULE_COMPLETED',
        title: 'Module Completed',
        description: `Completed "${progress.module.title}"`,
        courseSlug: progress.module.course.slug,
        courseTitle: progress.module.course.title,
        timestamp: progress.completedAt!.toISOString(),
        metadata: {
          moduleName: progress.module.title,
          points: progress.pointsEarned,
        },
      });
    });

    // Get recent test completions
    const recentTestAttempts = await prisma.lmsTestAttempt.findMany({
      where: {
        userId,
        status: LmsTestAttemptStatus.COMPLETED,
        isPassed: true,
        completedAt: { gte: last30Days },
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: {
        moduleTest: {
          include: {
            module: {
              include: {
                course: {
                  select: { title: true, slug: true },
                },
              },
            },
          },
        },
        finalTest: {
          include: {
            course: {
              select: { title: true, slug: true },
            },
          },
        },
      },
    });

    recentTestAttempts.forEach((attempt) => {
      const course = attempt.moduleTest?.module.course || attempt.finalTest?.course;
      if (course) {
        activities.push({
          id: `test-${attempt.id}`,
          type: 'TEST_PASSED',
          title: attempt.finalTest ? 'Final Test Passed' : 'Module Test Passed',
          description: `Scored ${Math.round(attempt.score)}% on ${attempt.finalTest ? 'final assessment' : 'module test'
            }`,
          courseSlug: course.slug,
          courseTitle: course.title,
          timestamp: attempt.completedAt!.toISOString(),
          metadata: {
            score: Math.round(attempt.score),
            points: attempt.pointsEarned,
          },
        });
      }
    });

    // Get recent course completions
    const recentCompletions = await prisma.lmsEnrollment.findMany({
      where: {
        userId,
        status: LmsEnrollmentStatus.COMPLETED,
        completedAt: { gte: last30Days },
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: {
        course: {
          select: { title: true, slug: true },
        },
      },
    });

    recentCompletions.forEach((enrollment) => {
      activities.push({
        id: `complete-${enrollment.id}`,
        type: 'COURSE_COMPLETED',
        title: 'Course Completed',
        description: `Completed "${enrollment.course.title}"`,
        courseSlug: enrollment.course.slug,
        courseTitle: enrollment.course.title,
        timestamp: enrollment.completedAt!.toISOString(),
      });

      if (enrollment.certificateUrl) {
        activities.push({
          id: `cert-${enrollment.id}`,
          type: 'CERTIFICATE_EARNED',
          title: 'Certificate Earned',
          description: `Earned certificate for "${enrollment.course.title}"`,
          courseSlug: enrollment.course.slug,
          courseTitle: enrollment.course.title,
          timestamp: enrollment.completedAt!.toISOString(),
        });
      }
    });

    // Sort by timestamp and return top activities
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  private async getRecommendedCourses(userId: string): Promise<RecommendedCourse[]> {
    // Get user's enrolled course IDs
    const enrolledCourseIds = await prisma.lmsEnrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });

    const enrolledIds = enrolledCourseIds.map((e) => e.courseId);

    // Get popular courses that user hasn't enrolled in
    const recommendedCourses = await prisma.lmsCourse.findMany({
      where: {
        id: { notIn: enrolledIds },
        status: LmsCourseStatus.PUBLISHED,
        isActive: true,
      },
      orderBy: [
        { enrollments: { _count: 'desc' } },
        { averageRating: 'desc' },
      ],
      take: 5,
      include: {
        category: {
          select: { name: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return recommendedCourses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      thumbnailUrl: course.thumbnailUrl,
      difficulty: course.difficulty,
      totalHours: course.totalHours,
      totalModules: course.totalModules,
      enrollmentCount: course._count.enrollments,
      averageRating: course.averageRating,
      category: course.category?.name || 'Uncategorized',
    }));
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

  async getStudentDashboardForAdmin(
    adminUserId: string,
    studentUserId: string,
    instituteId: string
  ): Promise<any> {
    logger.debug('[DashboardService] Fetching student dashboard for admin', {
      adminUserId,
      studentUserId,
      instituteId,
    });

    // Verify student belongs to this institute
    const studentUser = await prisma.user.findUnique({
      where: { id: studentUserId },
      select: {
        id: true,
        email: true,
        name: true,
        instituteId: true,
        role: true,
        profile: {
          include: {
            department: true
          }
        }
      },
    });

    if (!studentUser || studentUser.instituteId !== instituteId) {
      throw new ForbiddenError('Student does not belong to your institute');
    }

    if (studentUser.role !== 'USER') {
      throw new BadRequestError('Target user is not a student');
    }

    const dashboard = await this.getStudentDashboard(studentUserId);

    return {
      profile: {
        id: studentUser.id,
        email: studentUser.email,
        name: studentUser.name,
        ...studentUser.profile,
      },
      dashboard,
    };
  }

  async getStudentDashboardForPlatformAdmin(
    adminUserId: string,
    studentUserId: string
  ): Promise<any> {
    logger.debug('[DashboardService] Fetching student dashboard for platform admin', {
      adminUserId,
      studentUserId,
    });

    // Get student details
    const studentUser = await prisma.user.findUnique({
      where: { id: studentUserId },
      select: {
        id: true,
        email: true,
        name: true,
        instituteId: true,
        role: true,
        profile: {
          include: {
            department: true
          }
        }
      },
    });

    if (!studentUser) {
      throw new NotFoundError('Student not found');
    }

    if (studentUser.role !== 'USER') {
      throw new BadRequestError('Target user is not a student');
    }

    const dashboard = await this.getStudentDashboard(studentUserId);

    return {
      profile: {
        id: studentUser.id,
        email: studentUser.email,
        name: studentUser.name,
        ...studentUser.profile,
      },
      dashboard,
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
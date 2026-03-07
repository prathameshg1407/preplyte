// src/module/dashboard/dashboard.types.ts

import { LmsEnrollmentStatus, DifficultyLevel } from '@prisma/client';

// =====================================================
// STUDENT DASHBOARD TYPES
// =====================================================

export interface StudentDashboardStats {
  testsCompleted: number;
  totalTests: number;
  interviewsCompleted: number;
  totalInterviews: number;
  problemsSolved: number;
  totalProblems: number;
  overallScore: number;
}

export interface RecentTest {
  id: string;
  title: string;
  type: "APTITUDE" | "MACHINE" | "INTERVIEW";
  score: number;
  total: number;
  date: string;
  status: "Completed" | "In Progress" | "Expired";
}

export interface DashboardAppliedOpportunity {
  id: string;
  title: string;
  companyName: string;
  type: "JOB" | "INTERNSHIP";
  status: string;
  appliedAt: string;
}

export interface DashboardHackathonRegistration {
  id: string;
  title: string;
  status: string;
  registrationDate: string;
  role: "LEADER" | "MEMBER" | "INDIVIDUAL";
}

export interface UpcomingDrive {
  id: string;
  title: string;
  date: string;
  duration: string;
  difficulty: string;
  status: string;
  moduleCount: number;
}

// =====================================================
// LMS DASHBOARD TYPES
// =====================================================

export interface LmsEnrollmentSummary {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseThumbnail: string | null;
  courseCategory: string;
  courseDifficulty: DifficultyLevel;
  courseInstructor: string | null;
  status: LmsEnrollmentStatus;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  completedTopics: number;
  totalTopics: number;
  totalPointsEarned: number;
  courseTotalPoints: number;
  enrolledAt: string;
  lastAccessedAt: string | null;
  completedAt: string | null;
  certificateUrl: string | null;
  finalTestPassed: boolean;
  finalTestScore: number | null;
}

export interface LmsDashboardStats {
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  totalPointsEarned: number;
  totalLearningHours: number;
  certificatesEarned: number;
  averageProgress: number;
  moduleTestsPassed: number;
  finalTestsPassed: number;
}

export interface LmsRecentActivity {
  id: string;
  type: 'ENROLLMENT' | 'MODULE_COMPLETED' | 'TOPIC_COMPLETED' | 'TEST_PASSED' | 'COURSE_COMPLETED' | 'CERTIFICATE_EARNED';
  title: string;
  description: string;
  courseSlug: string;
  courseTitle: string;
  timestamp: string;
  metadata?: {
    score?: number;
    points?: number;
    moduleName?: string;
    topicName?: string;
  };
}

export interface LmsDashboardData {
  stats: LmsDashboardStats;
  enrollments: {
    inProgress: LmsEnrollmentSummary[];
    completed: LmsEnrollmentSummary[];
    all: LmsEnrollmentSummary[];
  };
  recentActivity: LmsRecentActivity[];
  recommendedCourses: RecommendedCourse[];
}

export interface RecommendedCourse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  difficulty: DifficultyLevel;
  totalHours: number;
  totalModules: number;
  enrollmentCount: number;
  averageRating: number;
  category: string;
}

// =====================================================
// COMBINED STUDENT DASHBOARD RESPONSE
// =====================================================

export interface StudentDashboardResponse {
  stats: StudentDashboardStats;
  recentTests: RecentTest[];
  upcomingTests: UpcomingDrive[];
  lms: LmsDashboardData;
  appliedOpportunities: DashboardAppliedOpportunity[];
  hackathonRegistrations: DashboardHackathonRegistration[];
}

// =====================================================
// INSTITUTE ADMIN DASHBOARD TYPES
// =====================================================

export interface InstituteAdminDashboardStats {
  totalDrives: number;
  drivesThisMonth: number;
  activeDrives: number;
  upcomingDrives: number;
  totalRegistrations: number;
  registrationsThisMonth: number;
  avgScore: number;
  scoreChange: number;
}

export interface RecentDrive {
  id: string;
  title: string;
  status: string;
  registrationCount: number;
  attemptCount: number;
  createdAt: string;
}

export interface TopPerformer {
  userId: string;
  studentName: string;
  studentId: string | null;
  departmentId: string | null;
  avgScore: number;
  completedDrives: number;
}

export interface InstituteAdminDashboardResponse {
  stats: InstituteAdminDashboardStats;
  recentDrives: RecentDrive[];
  topPerformers: TopPerformer[];
}

export interface AdminViewStudentDashboardResponse {
  profile: {
    id: string;
    email: string;
    name: string | null;
    fullName?: string;
    studentId?: string;
    resumeUrl?: string | null;
    resumeName?: string | null;
    skills?: string[];
    departmentId?: string;
    department?: {
      id: string;
      name: string;
      code: string | null;
    };
    courseYear?: string;
    numberOfBacklogs?: number;
    marks10?: number | null;
    marks12?: number | null;
    cgpaSemesters?: number[];
    averageCgpa?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
  };
  dashboard: StudentDashboardResponse;
}

// =====================================================
// PLATFORM ADMIN DASHBOARD TYPES
// =====================================================

export interface PlatformOverviewStats {
  totalInstitutes: number;
  activeInstitutes: number;
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalInstituteAdmins: number;
}

export interface PlatformSessionStats {
  totalAptitudeSessions: number;
  completedAptitudeSessions: number;
  totalMachineSessions: number;
  completedMachineSessions: number;
  totalInterviewSessions: number;
  completedInterviewSessions: number;
}

export interface PlatformPerformanceStats {
  avgAptitudeScore: number;
  avgMachineScore: number;
  avgInterviewScore: number;
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface PlatformTrends {
  userRegistrations: TrendDataPoint[];
  sessionActivity: TrendDataPoint[];
}

export interface RecentInstitute {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
}

export interface PlatformAdminDashboardResponse {
  overview: PlatformOverviewStats;
  sessions: PlatformSessionStats;
  performance: PlatformPerformanceStats;
  trends: PlatformTrends;
  recentInstitutes: RecentInstitute[];
}

// =====================================================
// QUERY TYPES
// =====================================================

export interface DashboardQueryParams {
  period?:
    | "this_month"
    | "last_month"
    | "this_week"
    | "last_7_days"
    | "last_30_days";
}

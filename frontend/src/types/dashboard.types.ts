// src/types/dashboard.types.ts

import { DifficultyLevel, LmsEnrollmentStatus } from './lms.types';

// =====================================================
// PRACTICE STATS
// =====================================================

export interface DashboardStats {
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
    type: 'APTITUDE' | 'MACHINE' | 'INTERVIEW';
    score: number;
    total: number;
    date: string;
    status: string;
}

export interface UpcomingTest {
    id: string;
    title: string;
    date: string;
    duration: string;
    difficulty: string;
    status: string;
    moduleCount: number;
}

// =====================================================
// JOBS & HACKATHONS (Prathamesh's Additions)
// =====================================================

export interface DashboardAppliedOpportunity {
    id: string;
    title: string;
    companyName: string;
    type: 'JOB' | 'INTERNSHIP';
    status: string;
    appliedAt: string;
}

export interface DashboardHackathonRegistration {
    id: string;
    title: string;
    status: string;
    registrationDate: string;
    role: 'LEADER' | 'MEMBER' | 'INDIVIDUAL';
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

// =====================================================
// COMBINED DASHBOARD RESPONSE
// =====================================================

export interface StudentDashboardData {
    stats: DashboardStats;
    recentTests: RecentTest[];
    upcomingTests: UpcomingTest[];
    lms: LmsDashboardData;
    // Added these two lines:
    appliedOpportunities: DashboardAppliedOpportunity[];
    hackathonRegistrations: DashboardHackathonRegistration[];
}

export interface AdminViewStudentDashboardData {
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
        createdAt?: string;
        updatedAt?: string;
    };
    dashboard: StudentDashboardData;
}
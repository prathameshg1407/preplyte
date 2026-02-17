// backend/src/module/admin/lms/analytics/analytics.types.ts

export interface LmsAnalyticsOverview {
    totalCategories: number;
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalModules: number;
    totalTopics: number;
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    totalRevenue: number;
}

export interface CoursePerformance {
    courseId: string;
    courseTitle: string;
    enrollments: number;
    completionRate: number;
    averageProgress: number;
    averageTestScore: number;
}

export interface EnrollmentTrend {
    date: string;
    enrollments: number;
    completions: number;
}

export interface TopCourse {
    id: string;
    title: string;
    enrollments: number;
    revenue: number;
}

export interface CategoryStat {
    categoryId: string;
    categoryName: string;
    courses: number;
    enrollments: number;
}

export interface LmsFullAnalytics {
    overview: LmsAnalyticsOverview;
    coursePerformance: CoursePerformance[];
    enrollmentTrends: EnrollmentTrend[];
    topCourses: TopCourse[];
    categoryStats: CategoryStat[];
}

export interface AnalyticsFilters {
    startDate?: Date;
    endDate?: Date;
    categoryId?: string;
    courseId?: string;
}

export interface CourseAnalytics {
    courseId: string;
    enrollmentsByDate: {
        date: string;
        count: number;
    }[];
    moduleCompletionRates: {
        moduleId: string;
        moduleTitle: string;
        completionRate: number;
    }[];
    testPerformance: {
        testId: string;
        testTitle: string;
        averageScore: number;
        passRate: number;
        attemptCount: number;
    }[];
    studentProgress: {
        notStarted: number;
        inProgress: number;
        completed: number;
    };
}

export interface EnrollmentStats {
    total: number;
    thisWeek: number;
    thisMonth: number;
    growth: number; // Percentage growth from last month
}

export interface RevenueStats {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byCourse: {
        courseId: string;
        courseTitle: string;
        revenue: number;
    }[];
}
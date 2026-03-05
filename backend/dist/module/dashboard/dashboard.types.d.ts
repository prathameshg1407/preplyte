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
export interface StudentDashboardResponse {
    stats: StudentDashboardStats;
    recentTests: RecentTest[];
    upcomingTests: UpcomingDrive[];
    appliedOpportunities: DashboardAppliedOpportunity[];
    hackathonRegistrations: DashboardHackathonRegistration[];
}
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
export interface DashboardQueryParams {
    period?: "this_month" | "last_month" | "this_week" | "last_7_days" | "last_30_days";
}
//# sourceMappingURL=dashboard.types.d.ts.map
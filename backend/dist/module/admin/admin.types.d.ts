import { UserRole } from '@prisma/client';
export interface PaginationParams {
    page?: number;
    limit?: number;
}
export interface SortParams<T extends string = string> {
    sortBy?: T;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface DateRange {
    startDate: Date;
    endDate: Date;
}
export interface InstituteProfileInput {
    logoUrl?: string | null;
    location?: string | null;
}
export interface CreateInstituteInput {
    name: string;
    domain: string;
    isActive?: boolean;
    profile?: InstituteProfileInput;
}
export interface UpdateInstituteInput {
    name?: string;
    domain?: string;
    isActive?: boolean;
    profile?: InstituteProfileInput;
}
export interface InstituteFilters extends PaginationParams, SortParams<'name' | 'createdAt' | 'totalStudents'> {
    search?: string;
    isActive?: boolean;
}
export interface InstituteWithStats {
    id: string;
    name: string;
    domain: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    profile: {
        logoUrl: string | null;
        location: string | null;
    } | null;
    _count: {
        users: number;
    };
}
export interface InstituteStats {
    totalUsers: number;
    activeUsers: number;
    totalAptitudeSessions: number;
    completedAptitudeSessions: number;
    avgAptitudeScore: number;
    totalMachineSessions: number;
    completedMachineSessions: number;
    avgMachineScore: number;
    totalInterviewSessions: number;
    completedInterviewSessions: number;
    avgInterviewScore: number;
}
export interface CreateUserInput {
    email: string;
    password: string;
    name?: string;
    role?: UserRole;
    instituteId?: string;
    isActive?: boolean;
}
export interface UpdateUserInput {
    email?: string;
    password?: string;
    name?: string | null;
    role?: UserRole;
    instituteId?: string | null;
    isActive?: boolean;
}
export interface UserFilters extends PaginationParams, SortParams<'name' | 'email' | 'createdAt' | 'lastLoginAt'> {
    search?: string;
    role?: UserRole;
    instituteId?: string;
    isActive?: boolean;
    hasProfile?: boolean;
}
export interface StudentFilters extends PaginationParams, SortParams<'name' | 'email' | 'createdAt' | 'averageCgpa'> {
    search?: string;
    departmentId?: string;
    courseYear?: string;
    isActive?: boolean;
}
export interface UserWithDetails {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    isActive: boolean;
    instituteId: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    institute?: {
        id: string;
        name: string;
        domain: string;
    } | null;
    profile?: {
        fullName: string;
        studentId: string;
        departmentId: string;
        courseYear: string;
        averageCgpa: number | null;
        skills: string[];
    } | null;
    _count?: {
        aptitudeSessions: number;
        machineSessions: number;
        aiInterviewSessions: number;
        resumes: number;
    };
}
export interface UserStats {
    totalAptitudeSessions: number;
    completedAptitudeSessions: number;
    avgAptitudeScore: number;
    totalMachineSessions: number;
    completedMachineSessions: number;
    avgMachineScore: number;
    totalInterviewSessions: number;
    completedInterviewSessions: number;
    avgInterviewScore: number;
}
export interface TrendData {
    date: string;
    count: number;
}
export interface PlatformAnalytics {
    overview: {
        totalInstitutes: number;
        activeInstitutes: number;
        totalUsers: number;
        activeUsers: number;
        totalStudents: number;
        totalInstituteAdmins: number;
    };
    sessions: {
        totalAptitudeSessions: number;
        completedAptitudeSessions: number;
        totalMachineSessions: number;
        completedMachineSessions: number;
        totalInterviewSessions: number;
        completedInterviewSessions: number;
    };
    performance: {
        avgAptitudeScore: number;
        avgMachineScore: number;
        avgInterviewScore: number;
    };
    trends: {
        userRegistrations: TrendData[];
        sessionActivity: TrendData[];
    };
}
export type ReportFormat = 'json' | 'csv';
export interface ReportFilters {
    startDate?: string;
    endDate?: string;
    instituteId?: string;
    format?: ReportFormat;
}
export interface InstituteReportItem {
    id: string;
    name: string;
    domain: string;
    isActive: boolean;
    location: string | null;
    totalStudents: number;
    totalAdmins: number;
    totalSessions: number;
    avgScore: number;
    createdAt: Date;
}
export interface UserReportItem {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    isActive: boolean;
    instituteName: string | null;
    totalSessions: number;
    avgScore: number;
    lastLoginAt: Date | null;
    createdAt: Date;
}
export interface ActivityItem {
    date: string;
    newUsers: number;
    aptitudeSessions: number;
    machineSessions: number;
    interviewSessions: number;
    totalSessions: number;
}
export interface InstituteReport {
    institutes: InstituteReportItem[];
    generatedAt: Date;
    totalCount: number;
}
export interface UserReport {
    users: UserReportItem[];
    generatedAt: Date;
    totalCount: number;
}
export interface ActivityReport {
    activities: ActivityItem[];
    summary: {
        totalNewUsers: number;
        totalSessions: number;
        avgDailySessions: number;
    };
    generatedAt: Date;
}
export interface SessionStats {
    total: number;
    completed: number;
    avgScore: number;
}
//# sourceMappingURL=admin.types.d.ts.map
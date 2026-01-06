// src/types/admin.types.ts

// =====================================================
// INSTITUTE TYPES
// =====================================================

export interface InstituteProfile {
  logoUrl: string | null;
  location: string | null;
  totalStudents: number;
}

export interface Institute {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: InstituteProfile | null;
  _count: {
    users: number;
  };
}

export interface InstituteStats {
  totalUsers: number;
  activeUsers: number;
  totalAptitudeSessions: number;
  completedAptitudeSessions: number;
  totalMachineSessions: number;
  completedMachineSessions: number;
  totalInterviewSessions: number;
  completedInterviewSessions: number;
  avgAptitudeScore: number;
  avgMachineScore: number;
  avgInterviewScore: number;
}

export interface CreateInstituteInput {
  name: string;
  domain: string;
  isActive?: boolean;
  profile?: {
    logoUrl?: string;
    location?: string;
  };
}

export interface UpdateInstituteInput {
  name?: string;
  domain?: string;
  isActive?: boolean;
  profile?: {
    logoUrl?: string | null;
    location?: string | null;
  };
}

export interface InstituteFilters {
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'totalStudents';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =====================================================
// USER TYPES
// =====================================================

export type UserRole = 'PLATFORM_ADMIN' | 'INSTITUTE_ADMIN' | 'USER';

export interface UserProfile {
  fullName: string;
  studentId: string;
  department: string;
  courseYear: string;
  numberOfBacklogs: number;
  averageCgpa: number | null;
  skills: string[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  instituteId: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  institute?: {
    id: string;
    name: string;
    domain: string;
  } | null;
  profile?: UserProfile | null;
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
  name?: string;
  role?: UserRole;
  instituteId?: string | null;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  instituteId?: string;
  isActive?: boolean;
  hasProfile?: boolean;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface InstituteStudentFilters {
  search?: string;
  department?: string;
  courseYear?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'email' | 'createdAt' | 'averageCgpa';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

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

// =====================================================
// REPORT TYPES
// =====================================================

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  instituteId?: string;
  format?: 'json' | 'csv';
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
  createdAt: string;
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
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ActivityReportItem {
  date: string;
  newUsers: number;
  aptitudeSessions: number;
  machineSessions: number;
  interviewSessions: number;
  totalSessions: number;
}

export interface InstituteReport {
  institutes: InstituteReportItem[];
  generatedAt: string;
  totalCount: number;
}

export interface UserReport {
  users: UserReportItem[];
  generatedAt: string;
  totalCount: number;
}

export interface ActivityReport {
  activities: ActivityReportItem[];
  summary: {
    totalNewUsers: number;
    totalSessions: number;
    avgDailySessions: number;
  };
  generatedAt: string;
}

// =====================================================
// PAGINATION TYPES
// =====================================================

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
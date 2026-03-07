// src/lib/hooks/institute-admin/use-institute-analytics.ts

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-instance';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

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
  month: string;
  label: string;
  drives: number;
  registrations: number;
  completions: number;
}

export interface ScoreBucket {
  label: string;
  count: number;
  percentage: number;
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
  scoreDistribution: { buckets: ScoreBucket[]; totalStudents: number };
  departmentPerformance: DepartmentPerformance[];
  topPerformers: TopPerformer[];
  driveComparison: DriveComparison[];
  practiceStats: PracticeModuleStats;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useInstituteAnalytics() {
  return useQuery<InstituteAnalytics>({
    queryKey: ['institute-analytics'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<InstituteAnalytics>>(
        API_ENDPOINTS.INSTITUTE.ANALYTICS
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

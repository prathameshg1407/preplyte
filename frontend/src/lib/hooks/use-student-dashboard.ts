// src/lib/hooks/use-student-dashboard.ts

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api/services/dashboard.service';
import type { StudentDashboardData } from '@/types/dashboard.types';

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  student: () => [...dashboardQueryKeys.all, 'student'] as const,
};

export function useStudentDashboard() {
  return useQuery<StudentDashboardData>({
    queryKey: dashboardQueryKeys.student(),
    queryFn: dashboardService.getStudentDashboard,
    // Only fetch when user is authenticated
    enabled: typeof window !== 'undefined',
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
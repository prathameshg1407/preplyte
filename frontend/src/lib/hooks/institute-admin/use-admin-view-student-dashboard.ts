// src/lib/hooks/institute-admin/use-admin-view-student-dashboard.ts

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api/services/dashboard.service';
import type { AdminViewStudentDashboardData } from '@/types/dashboard.types';

export const adminDashboardQueryKeys = {
    all: ['admin-dashboard'] as const,
    student: (id: string) => [...adminDashboardQueryKeys.all, 'student', id] as const,
};

export function useAdminViewStudentDashboard(id: string) {
    return useQuery<AdminViewStudentDashboardData>({
        queryKey: adminDashboardQueryKeys.student(id),
        queryFn: () => dashboardService.getStudentDashboardForAdmin(id),
        enabled: !!id,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

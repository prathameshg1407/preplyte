import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api/services/dashboard.service';
// Assuming AdminViewStudentDashboardData is the return type
import type { AdminViewStudentDashboardData } from '@/types/dashboard.types';

export const platformAdminDashboardQueryKeys = {
    all: ['platform-admin-dashboard'] as const,
    student: (id: string) => [...platformAdminDashboardQueryKeys.all, 'student', id] as const,
};

export function usePlatformAdminViewStudentDashboard(id: string) {
    return useQuery<AdminViewStudentDashboardData>({
        queryKey: platformAdminDashboardQueryKeys.student(id),
        queryFn: () => dashboardService.getStudentDashboardForPlatformAdmin(id),
        enabled: !!id,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

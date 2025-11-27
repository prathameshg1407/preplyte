import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios-instance';

interface DashboardStats {
  totalDrives: number;
  drivesThisMonth: number;
  activeDrives: number;
  upcomingDrives: number;
  totalRegistrations: number;
  registrationsThisMonth: number;
  avgScore: number;
  scoreChange: number;
}

interface RecentDrive {
  id: string;
  title: string;
  status: string;
  registrationCount: number;
  attemptCount: number;
  createdAt: string;
}

interface TopPerformer {
  userId: string;
  studentName: string;
  studentId: string | null;
  department: string | null;
  avgScore: number;
  completedDrives: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentDrives: RecentDrive[];
  topPerformers: TopPerformer[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useInstituteAdminDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['institute-admin-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardData>>(
        '/api/dashboard/institute-admin'
      );
      return response.data.data;
    },
  });
}
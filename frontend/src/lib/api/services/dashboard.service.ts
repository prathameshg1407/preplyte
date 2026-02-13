// src/lib/api/services/dashboard.service.ts

import { apiClient } from '../axios-instance';
import type { StudentDashboardData } from '@/types/dashboard.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const dashboardService = {
  /**
   * Get student dashboard data including LMS statistics
   */
  getStudentDashboard: async (): Promise<StudentDashboardData> => {
    const response = await apiClient.get<ApiResponse<StudentDashboardData>>(
      '/api/dashboard/student'
    );
    return response.data.data;
  },
};
// src/lib/api/services/dashboard.service.ts

import { apiClient } from '../axios-instance';
import type { StudentDashboardData, AdminViewStudentDashboardData } from '@/types/dashboard.types';

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

  /**
   * Get specific student dashboard data for institute admin
   */
  getStudentDashboardForAdmin: async (id: string): Promise<AdminViewStudentDashboardData> => {
    const response = await apiClient.get<ApiResponse<AdminViewStudentDashboardData>>(
      `/api/dashboard/student/${id}`
    );
    return response.data.data;
  },

  /**
   * Get specific student dashboard data for platform admin
   */
  getStudentDashboardForPlatformAdmin: async (id: string): Promise<AdminViewStudentDashboardData> => {
    const response = await apiClient.get<ApiResponse<AdminViewStudentDashboardData>>(
      `/api/dashboard/platform-admin/student/${id}`
    );
    return response.data.data;
  },
};
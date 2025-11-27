// src/lib/api/services/mock-drive/results.service.ts

import { apiClient } from '@/lib/api/axios-instance';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ResultOverview, DetailedReport } from '@/types/mockdrive.types';

export const resultsService = {
  /**
   * Get the result overview for a completed mock drive
   */
  getResultOverview: async (driveId: string): Promise<ResultOverview> => {
    const response = await apiClient.get(API_ENDPOINTS.MOCK_DRIVES.RESULT(driveId));
    return response.data.data;
  },

  /**
   * Get the detailed report for a completed mock drive
   */
  getDetailedReport: async (driveId: string): Promise<DetailedReport> => {
    const response = await apiClient.get(API_ENDPOINTS.MOCK_DRIVES.REPORT(driveId));
    return response.data.data;
  },
};
// src/lib/api/services/mock-drive/leaderboard.service.ts

import { apiClient } from '@/lib/api/axios-instance';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { LeaderboardResponse, MyRankResponse } from '@/types/mockdrive.types';

export interface LeaderboardParams {
  page?: number;
  limit?: number;
  batchId?: string;
  department?: string;
}

export const leaderboardService = {
  /**
   * Get the leaderboard for a mock drive
   */
  getLeaderboard: async (
    driveId: string,
    params?: LeaderboardParams
  ): Promise<LeaderboardResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page) {
      searchParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      searchParams.set('limit', params.limit.toString());
    }
    if (params?.batchId) {
      searchParams.set('batchId', params.batchId);
    }
    if (params?.department) {
      searchParams.set('department', params.department);
    }

    const queryString = searchParams.toString();
    const baseUrl = API_ENDPOINTS.MOCK_DRIVES.LEADERBOARD(driveId);
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const response = await apiClient.get(url);
    return response.data.data;
  },

  /**
   * Get the current user's rank in the leaderboard
   */
  getMyRank: async (driveId: string, batchId?: string): Promise<MyRankResponse> => {
    const searchParams = new URLSearchParams();

    if (batchId) {
      searchParams.set('batchId', batchId);
    }

    const queryString = searchParams.toString();
    const baseUrl = API_ENDPOINTS.MOCK_DRIVES.MY_RANK(driveId);
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const response = await apiClient.get(url);
    return response.data.data;
  },
};
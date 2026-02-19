// src/lib/api/services/leaderboard.service.ts

import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';
import type {
  LeaderboardResponse,
  LeaderboardConfigResponse,
  ScoreBreakdown,
  UserDetailedStats,
  LeaderboardQuery,
} from '@/types/leaderboard.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const leaderboardService = {
  /**
   * Get leaderboard configuration
   */
  getConfig: async (): Promise<LeaderboardConfigResponse> => {
    const response = await apiClient.get<ApiResponse<LeaderboardConfigResponse>>(
      API_ENDPOINTS.LEADERBOARD.CONFIG
    );
    return response.data.data;
  },

  /**
   * Get leaderboard with filters
   */
  getLeaderboard: async (params: LeaderboardQuery = {}): Promise<LeaderboardResponse> => {
    const response = await apiClient.get<ApiResponse<LeaderboardResponse>>(
      API_ENDPOINTS.LEADERBOARD.LIST,
      {
        params: {
          scope: params.scope || 'global',
          category: params.category || 'overall',
          page: params.page || 1,
          limit: params.limit || 20,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Get current user's score breakdown
   */
  getMyScores: async (): Promise<ScoreBreakdown> => {
    const response = await apiClient.get<ApiResponse<ScoreBreakdown>>(
      API_ENDPOINTS.LEADERBOARD.MY_SCORES
    );
    return response.data.data;
  },

  /**
   * Get current user's detailed stats
   */
  getMyDetailedStats: async (): Promise<UserDetailedStats> => {
    const response = await apiClient.get<ApiResponse<UserDetailedStats>>(
      API_ENDPOINTS.LEADERBOARD.MY_STATS
    );
    return response.data.data;
  },
};
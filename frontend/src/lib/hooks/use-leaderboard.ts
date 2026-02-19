// src/lib/hooks/use-leaderboard.ts

import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/lib/api/services/leaderboard.service';
import type {
  LeaderboardResponse,
  LeaderboardConfigResponse,
  ScoreBreakdown,
  UserDetailedStats,
  LeaderboardQuery,
} from '@/types/leaderboard.types';

// =====================================================
// QUERY KEYS
// =====================================================

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  config: () => [...leaderboardKeys.all, 'config'] as const,
  list: (params: LeaderboardQuery) => [...leaderboardKeys.all, 'list', params] as const,
  myScores: () => [...leaderboardKeys.all, 'my-scores'] as const,
  myStats: () => [...leaderboardKeys.all, 'my-stats'] as const,
};

// =====================================================
// HOOKS
// =====================================================

/**
 * Get leaderboard configuration
 */
export function useLeaderboardConfig() {
  return useQuery<LeaderboardConfigResponse>({
    queryKey: leaderboardKeys.config(),
    queryFn: leaderboardService.getConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get leaderboard with filters
 */
export function useLeaderboard(params: LeaderboardQuery = {}) {
  return useQuery<LeaderboardResponse>({
    queryKey: leaderboardKeys.list(params),
    queryFn: () => leaderboardService.getLeaderboard(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get current user's score breakdown
 */
export function useMyScores() {
  return useQuery<ScoreBreakdown>({
    queryKey: leaderboardKeys.myScores(),
    queryFn: leaderboardService.getMyScores,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get current user's detailed stats
 */
export function useMyDetailedStats() {
  return useQuery<UserDetailedStats>({
    queryKey: leaderboardKeys.myStats(),
    queryFn: leaderboardService.getMyDetailedStats,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
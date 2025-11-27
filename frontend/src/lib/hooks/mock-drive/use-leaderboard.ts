// src/lib/hooks/mock-drive/use-leaderboard.ts

import { useQuery } from '@tanstack/react-query';
import {
  leaderboardService,
  LeaderboardParams,
} from '@/lib/api/services/mock-drive/leaderboard.service';
import { LeaderboardResponse, MyRankResponse } from '@/types/mockdrive.types';

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  list: (driveId: string, params?: LeaderboardParams) =>
    [...leaderboardKeys.all, driveId, params] as const,
  myRank: (driveId: string, batchId?: string) =>
    [...leaderboardKeys.all, 'my-rank', driveId, batchId] as const,
};

export function useLeaderboard(
  driveId: string,
  params?: LeaderboardParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: leaderboardKeys.list(driveId, params),
    queryFn: () => leaderboardService.getLeaderboard(driveId, params),
    enabled: options?.enabled !== false && !!driveId,
  });
}

export function useMyRank(driveId: string, batchId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: leaderboardKeys.myRank(driveId, batchId),
    queryFn: () => leaderboardService.getMyRank(driveId, batchId),
    enabled: options?.enabled !== false && !!driveId,
  });
}
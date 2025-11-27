// src/lib/hooks/mock-drive/use-attempt-result.ts

import { useQuery } from '@tanstack/react-query';
import { resultsService } from '@/lib/api/services/mock-drive/results.service';
import { ResultOverview, DetailedReport } from '@/types/mockdrive.types';

export const resultKeys = {
  all: ['results'] as const,
  overview: (driveId: string) => [...resultKeys.all, 'overview', driveId] as const,
  report: (driveId: string) => [...resultKeys.all, 'report', driveId] as const,
};

export function useResultOverview(driveId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: resultKeys.overview(driveId),
    queryFn: () => resultsService.getResultOverview(driveId),
    enabled: options?.enabled !== false && !!driveId,
  });
}

export function useDetailedReport(driveId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: resultKeys.report(driveId),
    queryFn: () => resultsService.getDetailedReport(driveId),
    enabled: options?.enabled !== false && !!driveId,
  });
}
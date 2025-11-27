// src/lib/hooks/institute-admin/use-mockdrive-analytics.ts

'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

import { mockDriveAnalyticsService } from '@/lib/api/services/institute-admin/mockdrive-analytics.service';
import { analyticsKeys } from './query-keys';

import type {
  FullAnalytics,
  AnalyticsOverview,
  ScoreDistribution,
  ModulePerformance,
  BatchComparison,
  TimeAnalysis,
  AnalyticsQueryParams,
} from '@/types/admin.mockdrive.types';

// ============================================
// Types
// ============================================

interface UseAnalyticsOptions {
  enabled?: boolean;
  staleTime?: number;
}

// ============================================
// Full Analytics Hook
// ============================================

export function useFullAnalytics(
  mockDriveId: string | undefined | null,
  params: AnalyticsQueryParams = {},
  options: UseAnalyticsOptions = {}
) {
  const { enabled = true, staleTime = 60 * 1000 } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: analyticsKeys.full(mockDriveId ?? '', params),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveAnalyticsService.getFullAnalytics(mockDriveId, params);
    },
    enabled: isEnabled,
    staleTime,
  });
}

// ============================================
// Analytics Overview Hook
// ============================================

export function useAnalyticsOverview(
  mockDriveId: string | undefined | null,
  batchId?: string,
  options: UseAnalyticsOptions = {}
) {
  const { enabled = true, staleTime = 30 * 1000 } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: analyticsKeys.overview(mockDriveId ?? '', batchId),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveAnalyticsService.getOverview(mockDriveId, batchId);
    },
    enabled: isEnabled,
    staleTime,
  });
}

// ============================================
// Score Distribution Hook
// ============================================

export function useScoreDistribution(
  mockDriveId: string | undefined | null,
  batchId?: string,
  options: UseAnalyticsOptions = {}
) {
  const { enabled = true, staleTime = 30 * 1000 } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: analyticsKeys.scoreDistribution(mockDriveId ?? '', batchId),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveAnalyticsService.getScoreDistribution(mockDriveId, batchId);
    },
    enabled: isEnabled,
    staleTime,
  });
}

// ============================================
// Module Performance Hook
// ============================================

export function useModulePerformance(
  mockDriveId: string | undefined | null,
  batchId?: string,
  options: UseAnalyticsOptions = {}
) {
  const { enabled = true, staleTime = 30 * 1000 } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: analyticsKeys.modulePerformance(mockDriveId ?? '', batchId),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveAnalyticsService.getModulePerformance(mockDriveId, batchId);
    },
    enabled: isEnabled,
    staleTime,
  });
}

// ============================================
// Batch Comparison Hook
// ============================================

export function useBatchComparison(
  mockDriveId: string | undefined | null,
  options: UseAnalyticsOptions = {}
) {
  const { enabled = true, staleTime = 30 * 1000 } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: analyticsKeys.batchComparison(mockDriveId ?? ''),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveAnalyticsService.getBatchComparison(mockDriveId);
    },
    enabled: isEnabled,
    staleTime,
  });
}

// ============================================
// Time Analysis Hook
// ============================================

export function useTimeAnalysis(
  mockDriveId: string | undefined | null,
  batchId?: string,
  options: UseAnalyticsOptions = {}
) {
  const { enabled = true, staleTime = 30 * 1000 } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: analyticsKeys.timeAnalysis(mockDriveId ?? '', batchId),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveAnalyticsService.getTimeAnalysis(mockDriveId, batchId);
    },
    enabled: isEnabled,
    staleTime,
  });
}

// ============================================
// Combined Analytics Dashboard Hook
// ============================================

export function useAnalyticsDashboard(mockDriveId: string | undefined | null) {
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(undefined);

  const fullAnalyticsQuery = useFullAnalytics(mockDriveId, { batchId: selectedBatchId });

  // Individual queries for more granular control
  const overviewQuery = useAnalyticsOverview(mockDriveId, selectedBatchId, {
    enabled: !fullAnalyticsQuery.data,
  });
  const scoreDistributionQuery = useScoreDistribution(mockDriveId, selectedBatchId, {
    enabled: !fullAnalyticsQuery.data,
  });
  const modulePerformanceQuery = useModulePerformance(mockDriveId, selectedBatchId, {
    enabled: !fullAnalyticsQuery.data,
  });
  const batchComparisonQuery = useBatchComparison(mockDriveId, {
    enabled: !fullAnalyticsQuery.data && !selectedBatchId,
  });
  const timeAnalysisQuery = useTimeAnalysis(mockDriveId, selectedBatchId, {
    enabled: !fullAnalyticsQuery.data,
  });

  const selectBatch = useCallback((batchId: string | undefined) => {
    setSelectedBatchId(batchId);
  }, []);

  const clearBatchFilter = useCallback(() => {
    setSelectedBatchId(undefined);
  }, []);

  // Use full analytics if available, otherwise use individual queries
  const analytics = fullAnalyticsQuery.data;

  return {
    // Full analytics (preferred)
    analytics,
    isLoading: fullAnalyticsQuery.isLoading,
    isError: fullAnalyticsQuery.isError,
    error: fullAnalyticsQuery.error,

    // Individual data (fallback)
    overview: analytics?.overview ?? overviewQuery.data,
    scoreDistribution: analytics?.scoreDistribution ?? scoreDistributionQuery.data,
    modulePerformance: analytics?.modulePerformance ?? modulePerformanceQuery.data,
    batchComparison: analytics?.batchComparison ?? batchComparisonQuery.data,
    timeAnalysis: analytics?.timeAnalysis ?? timeAnalysisQuery.data,
    completionTrend: analytics?.completionTrend,
    departmentBreakdown: analytics?.departmentBreakdown,
    courseYearBreakdown: analytics?.courseYearBreakdown,

    // Batch filter
    selectedBatchId,
    selectBatch,
    clearBatchFilter,

    // Loading states for individual sections
    isLoadingOverview: overviewQuery.isLoading,
    isLoadingScoreDistribution: scoreDistributionQuery.isLoading,
    isLoadingModulePerformance: modulePerformanceQuery.isLoading,
    isLoadingBatchComparison: batchComparisonQuery.isLoading,
    isLoadingTimeAnalysis: timeAnalysisQuery.isLoading,

    // Refetch
    refetch: fullAnalyticsQuery.refetch,
  };
}
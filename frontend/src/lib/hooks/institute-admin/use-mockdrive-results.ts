// src/lib/hooks/institute-admin/use-mockdrive-results.ts

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

import { mockDriveResultsService } from '@/lib/api/services/institute-admin/mockdrive-results.service';
import { ApiError } from '@/lib/api/services/institute-admin/api-utils';
import { resultsKeys } from './query-keys';

import type {
  ResultListItem,
  DetailedResult,
  RankingEntry,
  ResultStatistics,
  ListResultsParams,
  ExportResultsParams,
  MockDriveAttemptStatus,
} from '@/types/admin.mockdrive.types';

// ============================================
// Types
// ============================================

interface UseResultsOptions {
  enabled?: boolean;
}

// ============================================
// List Results Hook
// ============================================

export function useResults(
  mockDriveId: string | undefined | null,
  params: ListResultsParams = {},
  options: UseResultsOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: resultsKeys.list(mockDriveId ?? '', params),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveResultsService.listResults(mockDriveId, params);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ============================================
// Result Detail Hook
// ============================================

export function useResultDetail(
  mockDriveId: string | undefined | null,
  attemptId: string | undefined | null,
  options: UseResultsOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId && !!attemptId;

  return useQuery({
    queryKey: resultsKeys.detail(mockDriveId ?? '', attemptId ?? ''),
    queryFn: async () => {
      if (!mockDriveId || !attemptId) {
        throw new Error('Mock drive ID and attempt ID are required');
      }
      return mockDriveResultsService.getDetailedResult(mockDriveId, attemptId);
    },
    enabled: isEnabled,
    staleTime: 60 * 1000,
  });
}

// ============================================
// Result Statistics Hook
// ============================================

export function useResultStatistics(
  mockDriveId: string | undefined | null,
  batchId?: string,
  options: UseResultsOptions = {}
) {
  const { enabled = true } = options;
  const isEnabled = enabled && !!mockDriveId;

  return useQuery({
    queryKey: resultsKeys.statistics(mockDriveId ?? '', batchId),
    queryFn: async () => {
      if (!mockDriveId) throw new Error('Mock drive ID is required');
      return mockDriveResultsService.getStatistics(mockDriveId, batchId);
    },
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

// ============================================
// Calculate Rankings Hook
// ============================================

export function useCalculateRankings(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (batchId?: string) =>
      mockDriveResultsService.calculateRankings(mockDriveId, batchId),
    onSuccess: (rankings) => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.all(mockDriveId) });
      toast({
        title: 'Success',
        description: `Rankings calculated for ${rankings.length} students`,
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error calculating rankings',
        description: error.message,
      });
    },
  });
}

// ============================================
// Export Results Hook
// ============================================

export function useExportResults(mockDriveId: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: ExportResultsParams) => {
      const blob = await mockDriveResultsService.exportResults(mockDriveId, params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const extension = params.format === 'json' ? 'json' : 'csv';
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `results-${timestamp}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Results exported successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error exporting results',
        description: error.message,
      });
    },
  });
}

// ============================================
// Generate Report Hook
// ============================================

export function useGenerateReport(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (attemptId: string) =>
      mockDriveResultsService.generateReport(mockDriveId, attemptId),
    onSuccess: (_, attemptId) => {
      queryClient.invalidateQueries({
        queryKey: resultsKeys.detail(mockDriveId, attemptId),
      });
      toast({
        title: 'Success',
        description: 'Report generated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error generating report',
        description: error.message,
      });
    },
  });
}

// ============================================
// Generate All Reports Hook
// ============================================

export function useGenerateAllReports(mockDriveId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => mockDriveResultsService.generateAllReports(mockDriveId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: resultsKeys.all(mockDriveId) });
      toast({
        title: 'Reports Generated',
        description: `${result.generated} generated, ${result.skipped} skipped, ${result.failed} failed`,
      });
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: 'Error generating reports',
        description: error.message,
      });
    },
  });
}

// ============================================
// Combined Results Page Hook
// ============================================

const DEFAULT_PARAMS: ListResultsParams = {
  page: 1,
  limit: 20,
  sortBy: 'rank',
  sortOrder: 'asc',
};

export function useResultsPage(mockDriveId: string | undefined | null) {
  const [params, setParams] = useState<ListResultsParams>(DEFAULT_PARAMS);

  const resultsQuery = useResults(mockDriveId, params);
  const statisticsQuery = useResultStatistics(mockDriveId, params.batchId);

  const calculateRankingsMutation = useCalculateRankings(mockDriveId ?? '');
  const exportMutation = useExportResults(mockDriveId ?? '');
  const generateReportMutation = useGenerateReport(mockDriveId ?? '');
  const generateAllReportsMutation = useGenerateAllReports(mockDriveId ?? '');

  // Param setters
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      page: 1,
    }));
  }, []);

  const setStatus = useCallback((status: MockDriveAttemptStatus | undefined) => {
    setParams((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setBatchId = useCallback((batchId: string | undefined) => {
    setParams((prev) => ({ ...prev, batchId, page: 1 }));
  }, []);

  const setSorting = useCallback(
    (
      sortBy: ListResultsParams['sortBy'],
      sortOrder: ListResultsParams['sortOrder']
    ) => {
      setParams((prev) => ({ ...prev, sortBy, sortOrder }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  const isAnyMutationPending = useMemo(
    () =>
      calculateRankingsMutation.isPending ||
      exportMutation.isPending ||
      generateReportMutation.isPending ||
      generateAllReportsMutation.isPending,
    [
      calculateRankingsMutation.isPending,
      exportMutation.isPending,
      generateReportMutation.isPending,
      generateAllReportsMutation.isPending,
    ]
  );

  const pagination = useMemo(() => {
    const data = resultsQuery.data;
    if (!data?.pagination) {
      return {
        currentPage: params.page ?? 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
    return {
      currentPage: data.pagination.page,
      totalPages: data.pagination.totalPages,
      totalItems: data.pagination.total,
      hasNextPage: data.pagination.hasNext,
      hasPrevPage: data.pagination.hasPrevious,
    };
  }, [resultsQuery.data, params.page]);

  return {
    // Data
    results: resultsQuery.data?.data ?? [],
    statistics: statisticsQuery.data,
    pagination,
    isLoading: resultsQuery.isLoading,
    isFetching: resultsQuery.isFetching,
    isLoadingStatistics: statisticsQuery.isLoading,
    isError: resultsQuery.isError,
    error: resultsQuery.error,

    // Params
    params,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    setBatchId,
    setSorting,
    resetFilters,

    // Mutations - wrapped to allow optional calling
    calculateRankings: (batchId?: string) => calculateRankingsMutation.mutate(batchId),
    calculateRankingsAsync: (batchId?: string) => calculateRankingsMutation.mutateAsync(batchId),
    exportResults: exportMutation.mutate,
    exportResultsAsync: exportMutation.mutateAsync,
    generateReport: generateReportMutation.mutate,
    generateReportAsync: generateReportMutation.mutateAsync,
    generateAllReports: () => generateAllReportsMutation.mutate(),
    generateAllReportsAsync: () => generateAllReportsMutation.mutateAsync(),

    // States
    isCalculatingRankings: calculateRankingsMutation.isPending,
    isExporting: exportMutation.isPending,
    isGeneratingReport: generateReportMutation.isPending,
    isGeneratingAllReports: generateAllReportsMutation.isPending,
    isAnyMutationPending,

    // Refetch
    refetch: resultsQuery.refetch,
    refetchStatistics: statisticsQuery.refetch,
  };
}

// ============================================
// Result Detail Page Hook
// ============================================

export function useResultDetailPage(
  mockDriveId: string | undefined | null,
  attemptId: string | undefined | null
) {
  const detailQuery = useResultDetail(mockDriveId, attemptId);
  const generateReportMutation = useGenerateReport(mockDriveId ?? '');

  return {
    // Data
    result: detailQuery.data,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    error: detailQuery.error,

    // Actions
    generateReport: () => attemptId && generateReportMutation.mutate(attemptId),

    // States
    isGeneratingReport: generateReportMutation.isPending,
    hasReport: !!detailQuery.data?.report,

    // Refetch
    refetch: detailQuery.refetch,
  };
}
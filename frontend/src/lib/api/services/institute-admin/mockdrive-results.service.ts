// src/lib/api/services/institute-admin/mockdrive-results.service.ts

import { apiClient } from '../../axios-instance';
import { API_ENDPOINTS } from '../../endpoints';
import { handleResponse, handleError, cleanParams } from './api-utils';
import {
  ResultListItem,
  DetailedResult,
  RankingEntry,
  ResultStatistics,
  ListResultsParams,
  ExportResultsParams,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@/types/admin.mockdrive.types';

export const mockDriveResultsService = {
  /**
   * List results
   */
  async listResults(
    mockDriveId: string,
    params: ListResultsParams = {}
  ): Promise<PaginatedResponse<ResultListItem>> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<ResultListItem>>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_RESULTS(mockDriveId),
        { params: cleanParams(params) }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get detailed result
   */
  async getDetailedResult(
    mockDriveId: string,
    attemptId: string
  ): Promise<DetailedResult> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<DetailedResult>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_RESULT_DETAIL(mockDriveId, attemptId)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get statistics
   */
  async getStatistics(
    mockDriveId: string,
    batchId?: string
  ): Promise<ResultStatistics> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<ResultStatistics>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_RESULTS(mockDriveId)}/statistics`,
        { params: batchId ? { batchId } : {} }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Calculate rankings
   */
  async calculateRankings(
    mockDriveId: string,
    batchId?: string
  ): Promise<RankingEntry[]> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<RankingEntry[]>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_RESULTS(mockDriveId)}/calculate-rankings`,
        {},
        { params: batchId ? { batchId } : {} }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Export results
   */
  async exportResults(
    mockDriveId: string,
    params: ExportResultsParams
  ): Promise<Blob> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_RESULTS_EXPORT(mockDriveId),
        {
          params: cleanParams(params),
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Generate report for a single attempt
   */
  async generateReport(mockDriveId: string, attemptId: string): Promise<void> {
    try {
      await apiClient.post(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_RESULT_DETAIL(mockDriveId, attemptId)}/generate-report`
      );
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Generate all reports
   */
  async generateAllReports(
    mockDriveId: string
  ): Promise<{ generated: number; skipped: number; failed: number }> {
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<{ generated: number; skipped: number; failed: number }>
      >(`${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_RESULTS(mockDriveId)}/generate-reports`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
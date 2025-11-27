// src/lib/api/services/institute-admin/mockdrive-analytics.service.ts

import { apiClient } from '../../axios-instance';
import { API_ENDPOINTS } from '../../endpoints';
import { handleResponse, handleError, cleanParams } from './api-utils';
import {
  FullAnalytics,
  AnalyticsOverview,
  ScoreDistribution,
  ModulePerformance,
  BatchComparison,
  TimeAnalysis,
  AnalyticsQueryParams,
  ApiSuccessResponse,
} from '@/types/admin.mockdrive.types';

export const mockDriveAnalyticsService = {
  /**
   * Get full analytics
   */
  async getFullAnalytics(
    mockDriveId: string,
    params: AnalyticsQueryParams = {}
  ): Promise<FullAnalytics> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<FullAnalytics>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ANALYTICS(mockDriveId),
        { params: cleanParams(params) }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get analytics overview
   */
  async getOverview(
    mockDriveId: string,
    batchId?: string
  ): Promise<AnalyticsOverview> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<AnalyticsOverview>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ANALYTICS(mockDriveId)}/overview`,
        { params: batchId ? { batchId } : {} }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get score distribution
   */
  async getScoreDistribution(
    mockDriveId: string,
    batchId?: string
  ): Promise<ScoreDistribution> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<ScoreDistribution>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ANALYTICS(mockDriveId)}/score-distribution`,
        { params: batchId ? { batchId } : {} }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get module performance
   */
  async getModulePerformance(
    mockDriveId: string,
    batchId?: string
  ): Promise<ModulePerformance[]> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<ModulePerformance[]>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ANALYTICS(mockDriveId)}/module-performance`,
        { params: batchId ? { batchId } : {} }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get batch comparison
   */
  async getBatchComparison(mockDriveId: string): Promise<BatchComparison[]> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<BatchComparison[]>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ANALYTICS(mockDriveId)}/batch-comparison`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get time analysis
   */
  async getTimeAnalysis(
    mockDriveId: string,
    batchId?: string
  ): Promise<TimeAnalysis> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<TimeAnalysis>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ANALYTICS(mockDriveId)}/time-analysis`,
        { params: batchId ? { batchId } : {} }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
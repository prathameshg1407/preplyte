// src/lib/api/services/institute-admin/mockdrive-eligibility.service.ts

import { apiClient } from '../../axios-instance';
import { API_ENDPOINTS } from '../../endpoints';
import { handleResponse, handleError } from './api-utils';
import {
  EligibilityCriteria,
  EligibilityCheckResult,
  EligibleStudent,
  EligibilitySummary,
  SetEligibilityInput,
  ListEligibleStudentsParams,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@/types/admin.mockdrive.types';

export const mockDriveEligibilityService = {
  /**
   * Set eligibility criteria
   */
  async setEligibility(
    mockDriveId: string,
    data: SetEligibilityInput
  ): Promise<EligibilityCriteria> {
    try {
      const response = await apiClient.put<ApiSuccessResponse<EligibilityCriteria>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ELIGIBILITY(mockDriveId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get eligibility criteria
   */
  async getEligibility(mockDriveId: string): Promise<EligibilityCriteria | null> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<EligibilityCriteria | null>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ELIGIBILITY(mockDriveId)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update eligibility criteria
   */
  async updateEligibility(
    mockDriveId: string,
    data: Partial<SetEligibilityInput>
  ): Promise<EligibilityCriteria> {
    try {
      const response = await apiClient.patch<ApiSuccessResponse<EligibilityCriteria>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ELIGIBILITY(mockDriveId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete eligibility criteria
   */
  async deleteEligibility(mockDriveId: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ELIGIBILITY(mockDriveId));
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Check student eligibility
   */
  async checkStudentEligibility(
    mockDriveId: string,
    userId: string
  ): Promise<EligibilityCheckResult> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<EligibilityCheckResult>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ELIGIBILITY(mockDriveId)}/check/${userId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get eligible students
   */
  async getEligibleStudents(
    mockDriveId: string,
    params: ListEligibleStudentsParams = {}
  ): Promise<PaginatedResponse<EligibleStudent>> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<EligibleStudent>>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ELIGIBILITY(mockDriveId)}/students`,
        { params }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get eligibility summary
   */
  async getEligibilitySummary(mockDriveId: string): Promise<EligibilitySummary> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<EligibilitySummary>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_ELIGIBILITY(mockDriveId)}/summary`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
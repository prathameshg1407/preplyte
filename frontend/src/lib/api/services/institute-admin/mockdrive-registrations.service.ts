// src/lib/api/services/institute-admin/mockdrive-registrations.service.ts

import { apiClient } from '../../axios-instance';
import { API_ENDPOINTS } from '../../endpoints';
import { handleResponse, handleError, cleanParams } from './api-utils';
import {
  RegistrationDetails,
  RegistrationListItem,
  RegistrationSummary,
  BulkUpdateResult,
  UpdateRegistrationInput,
  BulkUpdateRegistrationInput,
  ListRegistrationsParams,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@/types/admin.mockdrive.types';

interface PaginatedRegistrationsResponse extends PaginatedResponse<RegistrationListItem> {
  summary: RegistrationSummary;
}

export const mockDriveRegistrationsService = {
  /**
   * List registrations
   */
  async listRegistrations(
    mockDriveId: string,
    params: ListRegistrationsParams = {}
  ): Promise<PaginatedRegistrationsResponse> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<PaginatedRegistrationsResponse>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_REGISTRATIONS(mockDriveId),
        { params: cleanParams(params) }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get registration by ID
   */
  async getRegistration(
    mockDriveId: string,
    registrationId: string
  ): Promise<RegistrationDetails> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<RegistrationDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_REGISTRATION(mockDriveId, registrationId)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update registration status
   */
  async updateRegistration(
    mockDriveId: string,
    registrationId: string,
    data: UpdateRegistrationInput
  ): Promise<RegistrationDetails> {
    try {
      const response = await apiClient.put<ApiSuccessResponse<RegistrationDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_REGISTRATION(mockDriveId, registrationId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Bulk update registrations
   */
  async bulkUpdateRegistrations(
    mockDriveId: string,
    data: BulkUpdateRegistrationInput
  ): Promise<BulkUpdateResult> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<BulkUpdateResult>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_REGISTRATIONS_BULK(mockDriveId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Approve all pending registrations
   */
  async approveAllPending(
    mockDriveId: string
  ): Promise<{ approved: number; skipped: number }> {
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<{ approved: number; skipped: number }>
      >(`${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_REGISTRATIONS(mockDriveId)}/approve-all`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get registration summary
   */
  async getRegistrationSummary(mockDriveId: string): Promise<RegistrationSummary> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<RegistrationSummary>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_REGISTRATIONS(mockDriveId)}/summary`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Export registrations
   */
  async exportRegistrations(
    mockDriveId: string,
    status?: string
  ): Promise<RegistrationDetails[]> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<RegistrationDetails[]>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_REGISTRATIONS(mockDriveId)}/export`,
        { params: status ? { status } : {} }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
// src/lib/api/services/institute-admin/mockdrive-batches.service.ts

import { apiClient } from '../../axios-instance';
import { API_ENDPOINTS } from '../../endpoints';
import { handleResponse, handleError, cleanParams } from './api-utils';
import {
  BatchDetails,
  BatchListItem,
  BatchStudent,
  AssignResult,
  UnassignResult,
  CreateBatchInput,
  UpdateBatchInput,
  AutoCreateBatchesInput,
  AssignStudentsInput,
  ListBatchesParams,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@/types/admin.mockdrive.types';

export const mockDriveBatchesService = {
  /**
   * Create a new batch
   */
  async createBatch(mockDriveId: string, data: CreateBatchInput): Promise<BatchDetails> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<BatchDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCHES(mockDriveId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * List batches
   */
  async listBatches(
    mockDriveId: string,
    params: ListBatchesParams = {}
  ): Promise<PaginatedResponse<BatchListItem>> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<BatchListItem>>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCHES(mockDriveId),
        { params: cleanParams(params) }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get batch by ID
   */
  async getBatch(mockDriveId: string, batchId: string): Promise<BatchDetails> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<BatchDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCH(mockDriveId, batchId)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update batch
   */
  async updateBatch(
    mockDriveId: string,
    batchId: string,
    data: UpdateBatchInput
  ): Promise<BatchDetails> {
    try {
      const response = await apiClient.put<ApiSuccessResponse<BatchDetails>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCH(mockDriveId, batchId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete batch
   */
  async deleteBatch(mockDriveId: string, batchId: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCH(mockDriveId, batchId));
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Auto-create batches
   */
  async autoCreateBatches(
    mockDriveId: string,
    data: AutoCreateBatchesInput
  ): Promise<BatchDetails[]> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<BatchDetails[]>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCHES_AUTO_CREATE(mockDriveId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get batch students
   */
  async getBatchStudents(mockDriveId: string, batchId: string): Promise<BatchStudent[]> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<BatchStudent[]>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCH(mockDriveId, batchId)}/students`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Assign students to batch
   */
  async assignStudents(
    mockDriveId: string,
    batchId: string,
    data: AssignStudentsInput
  ): Promise<AssignResult> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<AssignResult>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCH(mockDriveId, batchId)}/assign`,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Unassign students from batch
   */
  async unassignStudents(
    mockDriveId: string,
    batchId: string,
    registrationIds: string[]
  ): Promise<UnassignResult> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<UnassignResult>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCH(mockDriveId, batchId)}/unassign`,
        { registrationIds }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Start batch
   */
  async startBatch(mockDriveId: string, batchId: string): Promise<BatchDetails> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<BatchDetails>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCH(mockDriveId, batchId)}/start`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Complete batch
   */
  async completeBatch(mockDriveId: string, batchId: string): Promise<BatchDetails> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<BatchDetails>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_BATCH(mockDriveId, batchId)}/complete`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
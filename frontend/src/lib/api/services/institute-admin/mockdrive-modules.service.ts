// src/lib/api/services/institute-admin/mockdrive-modules.service.ts

import { AxiosResponse } from 'axios';
import { apiClient } from '../../axios-instance';
import { API_ENDPOINTS } from '../../endpoints';
import { handleResponse, handleError } from './api-utils';
import {
  MockDriveModule,
  ModuleWithAvailability,
  ModulesSummary,
  CreateModuleInput,
  UpdateModuleInput,
  ReorderModulesInput,
  ListModulesParams,
  ApiSuccessResponse,
} from '@/types/admin.mockdrive.types';

export const mockDriveModulesService = {
  /**
   * Add a new module to a mock drive
   */
  async addModule(mockDriveId: string, data: CreateModuleInput): Promise<MockDriveModule> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<MockDriveModule>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULES(mockDriveId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get all modules for a mock drive
   */
  async getModules(
    mockDriveId: string,
    params: ListModulesParams = {}
  ): Promise<MockDriveModule[] | ModuleWithAvailability[]> {
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<MockDriveModule[] | ModuleWithAvailability[]>
      >(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULES(mockDriveId), { params });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get modules summary with validation
   */
  async getModulesSummary(mockDriveId: string): Promise<ModulesSummary> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<ModulesSummary>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULES(mockDriveId)}/summary`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get a single module
   */
  async getModule(mockDriveId: string, moduleId: string): Promise<ModuleWithAvailability> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<ModuleWithAvailability>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULE(mockDriveId, moduleId)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update a module
   */
  async updateModule(
    mockDriveId: string,
    moduleId: string,
    data: UpdateModuleInput
  ): Promise<MockDriveModule> {
    try {
      const response = await apiClient.put<ApiSuccessResponse<MockDriveModule>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULE(mockDriveId, moduleId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete a module
   */
  async deleteModule(mockDriveId: string, moduleId: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULE(mockDriveId, moduleId));
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reorder modules
   */
  async reorderModules(
    mockDriveId: string,
    data: ReorderModulesInput
  ): Promise<MockDriveModule[]> {
    try {
      const response = await apiClient.put<ApiSuccessResponse<MockDriveModule[]>>(
        API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULES_REORDER(mockDriveId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Duplicate a module
   */
  async duplicateModule(mockDriveId: string, moduleId: string): Promise<MockDriveModule> {
    try {
      const response = await apiClient.post<ApiSuccessResponse<MockDriveModule>>(
        `${API_ENDPOINTS.INSTITUTE.MOCK_DRIVE_MODULE(mockDriveId, moduleId)}/duplicate`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};
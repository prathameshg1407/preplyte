// src/lib/api/services/mock-drive/discovery.service.ts

import { apiClient } from '@/lib/api/axios-instance';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  MockDriveListItem,
  MockDriveDetail,
  EligibilityCheckResponse,
  RegistrationResponse,
  MyRegistration,
  MockDriveStatus,
  PaginationResponse,
} from '@/types/mockdrive.types';

export interface DiscoveryListParams {
  page?: number;
  limit?: number;
  status?: MockDriveStatus[];
  instituteId?: string;
  search?: string;
  registrationOpen?: boolean;
}

export interface DiscoveryListResponse {
  drives: MockDriveListItem[];
  pagination: PaginationResponse;
}

export const discoveryService = {
  /**
   * List available mock drives with optional filters
   */
  listDrives: async (params?: DiscoveryListParams): Promise<DiscoveryListResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page) {
      searchParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      searchParams.set('limit', params.limit.toString());
    }
    if (params?.status && params.status.length > 0) {
      // Backend expects comma-separated status values based on validation schema
      searchParams.set('status', params.status.join(','));
    }
    if (params?.instituteId) {
      searchParams.set('instituteId', params.instituteId);
    }
    if (params?.search) {
      searchParams.set('search', params.search);
    }
    if (params?.registrationOpen) {
      searchParams.set('registrationOpen', 'true');
    }

    const queryString = searchParams.toString();
    const url = queryString
      ? `${API_ENDPOINTS.MOCK_DRIVES.LIST}?${queryString}`
      : API_ENDPOINTS.MOCK_DRIVES.LIST;

    const response = await apiClient.get(url);
    return response.data.data;
  },

  /**
   * Get detailed information about a specific mock drive
   */
  getDriveDetails: async (driveId: string): Promise<MockDriveDetail> => {
    const response = await apiClient.get(API_ENDPOINTS.MOCK_DRIVES.DETAIL(driveId));
    return response.data.data;
  },

  /**
   * Check user's eligibility for a mock drive
   */
  checkEligibility: async (driveId: string): Promise<EligibilityCheckResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.MOCK_DRIVES.ELIGIBILITY(driveId));
    return response.data.data;
  },

  /**
   * Register for a mock drive
   */
  register: async (driveId: string): Promise<RegistrationResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.MOCK_DRIVES.REGISTER(driveId));
    return response.data.data;
  },

  /**
   * Withdraw registration from a mock drive
   */
  withdrawRegistration: async (driveId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.MOCK_DRIVES.REGISTER(driveId));
  },

  /**
   * Get all registrations for the current user
   */
  getMyRegistrations: async (): Promise<{ registrations: MyRegistration[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.MOCK_DRIVES.MY_REGISTRATIONS);
    return response.data.data;
  },
};
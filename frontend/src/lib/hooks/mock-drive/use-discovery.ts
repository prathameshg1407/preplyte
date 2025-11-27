// src/lib/hooks/mock-drive/use-discovery.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  discoveryService,
  DiscoveryListParams,
  DiscoveryListResponse,
} from '@/lib/api/services/mock-drive/discovery.service';
import { toast } from 'sonner';
import {
  MockDriveDetail,
  EligibilityCheckResponse,
  RegistrationResponse,
  MyRegistration,
} from '@/types/mockdrive.types';

export const mockDriveKeys = {
  all: ['mock-drives'] as const,
  lists: () => [...mockDriveKeys.all, 'list'] as const,
  list: (params?: DiscoveryListParams) => [...mockDriveKeys.lists(), params] as const,
  details: () => [...mockDriveKeys.all, 'detail'] as const,
  detail: (id: string) => [...mockDriveKeys.details(), id] as const,
  eligibility: (id: string) => [...mockDriveKeys.all, 'eligibility', id] as const,
  myRegistrations: () => [...mockDriveKeys.all, 'my-registrations'] as const,
};

export function useMockDriveList(params?: DiscoveryListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mockDriveKeys.list(params),
    queryFn: () => discoveryService.listDrives(params),
    enabled: options?.enabled !== false,
  });
}

export function useMockDriveDetail(driveId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mockDriveKeys.detail(driveId),
    queryFn: () => discoveryService.getDriveDetails(driveId),
    enabled: options?.enabled !== false && !!driveId,
  });
}

export function useEligibilityCheck(driveId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mockDriveKeys.eligibility(driveId),
    queryFn: () => discoveryService.checkEligibility(driveId),
    enabled: options?.enabled !== false && !!driveId,
  });
}

export function useMyRegistrations(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mockDriveKeys.myRegistrations(),
    queryFn: () => discoveryService.getMyRegistrations(),
    enabled: options?.enabled !== false,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (driveId: string) => discoveryService.register(driveId),
    onSuccess: (data: RegistrationResponse, driveId) => {
      toast.success('Registration successful!');
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.detail(driveId) });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.eligibility(driveId) });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.myRegistrations() });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    },
  });
}

export function useWithdrawRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (driveId: string) => discoveryService.withdrawRegistration(driveId),
    onSuccess: (_, driveId) => {
      toast.success('Registration withdrawn');
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.detail(driveId) });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.eligibility(driveId) });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.myRegistrations() });
      queryClient.invalidateQueries({ queryKey: mockDriveKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to withdraw registration';
      toast.error(message);
    },
  });
}
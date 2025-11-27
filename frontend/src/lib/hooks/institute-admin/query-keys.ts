// src/lib/hooks/institute-admin/query-keys.ts

import type {
  ListMockDrivesParams,
  ListModulesParams,
  ListRegistrationsParams,
  ListBatchesParams,
  ListResultsParams,
  ListEligibleStudentsParams,
  AnalyticsQueryParams,
} from '@/types/admin.mockdrive.types';

// ============================================
// Mock Drive Keys
// ============================================

export const mockDriveKeys = {
  all: ['mockDrives'] as const,
  
  lists: () => [...mockDriveKeys.all, 'list'] as const,
  list: (params: ListMockDrivesParams = {}) => 
    [...mockDriveKeys.lists(), params] as const,
  
  details: () => [...mockDriveKeys.all, 'detail'] as const,
  detail: (id: string) => [...mockDriveKeys.details(), id] as const,
  
  stats: (id: string) => [...mockDriveKeys.all, 'stats', id] as const,
};

// ============================================
// Module Keys
// ============================================

export const moduleKeys = {
  all: (mockDriveId: string) => 
    ['mockDrives', mockDriveId, 'modules'] as const,
  
  list: (mockDriveId: string, params: ListModulesParams = {}) =>
    [...moduleKeys.all(mockDriveId), 'list', params] as const,
  
  summary: (mockDriveId: string) =>
    [...moduleKeys.all(mockDriveId), 'summary'] as const,
  
  detail: (mockDriveId: string, moduleId: string) =>
    [...moduleKeys.all(mockDriveId), 'detail', moduleId] as const,
};

// ============================================
// Eligibility Keys
// ============================================

export const eligibilityKeys = {
  all: (mockDriveId: string) => 
    ['mockDrives', mockDriveId, 'eligibility'] as const,
  
  criteria: (mockDriveId: string) =>
    [...eligibilityKeys.all(mockDriveId), 'criteria'] as const,
  
  students: (mockDriveId: string, params: ListEligibleStudentsParams = {}) =>
    [...eligibilityKeys.all(mockDriveId), 'students', params] as const,
  
  summary: (mockDriveId: string) =>
    [...eligibilityKeys.all(mockDriveId), 'summary'] as const,
  
  check: (mockDriveId: string, userId: string) =>
    [...eligibilityKeys.all(mockDriveId), 'check', userId] as const,
};

// ============================================
// Registration Keys
// ============================================

export const registrationKeys = {
  all: (mockDriveId: string) => 
    ['mockDrives', mockDriveId, 'registrations'] as const,
  
  list: (mockDriveId: string, params: ListRegistrationsParams = {}) =>
    [...registrationKeys.all(mockDriveId), 'list', params] as const,
  
  detail: (mockDriveId: string, registrationId: string) =>
    [...registrationKeys.all(mockDriveId), 'detail', registrationId] as const,
  
  summary: (mockDriveId: string) =>
    [...registrationKeys.all(mockDriveId), 'summary'] as const,
};

// ============================================
// Batch Keys
// ============================================

export const batchKeys = {
  all: (mockDriveId: string) => 
    ['mockDrives', mockDriveId, 'batches'] as const,
  
  list: (mockDriveId: string, params: ListBatchesParams = {}) =>
    [...batchKeys.all(mockDriveId), 'list', params] as const,
  
  detail: (mockDriveId: string, batchId: string) =>
    [...batchKeys.all(mockDriveId), 'detail', batchId] as const,
  
  students: (mockDriveId: string, batchId: string) =>
    [...batchKeys.all(mockDriveId), batchId, 'students'] as const,
};

// ============================================
// Analytics Keys
// ============================================

export const analyticsKeys = {
  all: (mockDriveId: string) => 
    ['mockDrives', mockDriveId, 'analytics'] as const,
  
  full: (mockDriveId: string, params: AnalyticsQueryParams = {}) =>
    [...analyticsKeys.all(mockDriveId), 'full', params] as const,
  
  overview: (mockDriveId: string, batchId?: string) =>
    [...analyticsKeys.all(mockDriveId), 'overview', { batchId }] as const,
  
  scoreDistribution: (mockDriveId: string, batchId?: string) =>
    [...analyticsKeys.all(mockDriveId), 'scoreDistribution', { batchId }] as const,
  
  modulePerformance: (mockDriveId: string, batchId?: string) =>
    [...analyticsKeys.all(mockDriveId), 'modulePerformance', { batchId }] as const,
  
  batchComparison: (mockDriveId: string) =>
    [...analyticsKeys.all(mockDriveId), 'batchComparison'] as const,
  
  timeAnalysis: (mockDriveId: string, batchId?: string) =>
    [...analyticsKeys.all(mockDriveId), 'timeAnalysis', { batchId }] as const,
};

// ============================================
// Results Keys
// ============================================

export const resultsKeys = {
  all: (mockDriveId: string) => 
    ['mockDrives', mockDriveId, 'results'] as const,
  
  list: (mockDriveId: string, params: ListResultsParams = {}) =>
    [...resultsKeys.all(mockDriveId), 'list', params] as const,
  
  detail: (mockDriveId: string, attemptId: string) =>
    [...resultsKeys.all(mockDriveId), 'detail', attemptId] as const,
  
  statistics: (mockDriveId: string, batchId?: string) =>
    [...resultsKeys.all(mockDriveId), 'statistics', { batchId }] as const,
  
  rankings: (mockDriveId: string, batchId?: string) =>
    [...resultsKeys.all(mockDriveId), 'rankings', { batchId }] as const,
};
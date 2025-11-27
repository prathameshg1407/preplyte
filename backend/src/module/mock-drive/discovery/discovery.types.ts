// src/module/mock-drive/discovery/discovery.types.ts

import { 
  MockDriveStatus, 
  MockDriveRegistrationStatus,
  MockDriveBatchStatus,
  MockDriveModuleType 
} from '@prisma/client';

// Import from shared types - use this everywhere
import { EligibilityCheckResult } from '../shared/mockdrive.shared-types';

// Re-export for convenience
export type { EligibilityCheckResult };

// ============================================
// Request/Query Types
// ============================================

export interface DiscoveryListFilters {
  status?: MockDriveStatus[];
  instituteId?: string;
  search?: string;
  registrationOpen?: boolean;
}

export interface DiscoveryListParams {
  page?: number;
  limit?: number;
  filters?: DiscoveryListFilters;
}

// ============================================
// Response Types
// ============================================

export interface BatchInfo {
  id: string;
  name: string;
  scheduledStartTime: Date | null;
  scheduledEndTime: Date | null;
}

export interface DriveListItem {
  id: string;
  title: string;
  description: string | null;
  status: MockDriveStatus;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  driveStartDate: Date | null;
  driveEndDate: Date | null;
  moduleCount: number;
  registrationCount: number;
  institute: {
    id: string;
    name: string;
  } | null;
  isRegistered: boolean;
  registrationStatus: MockDriveRegistrationStatus | null;
  batchInfo: BatchInfo | null;
}

export interface DiscoveryListResponse {
  drives: DriveListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Use EligibilityCheckResult from shared types
export interface EligibilityCheckResponse {
  mockDriveId: string;
  eligibility: EligibilityCheckResult;  // ✅ Use shared type
  canRegister: boolean;
  registrationStatus: MockDriveRegistrationStatus | null;
  reason?: string;
}

export interface RegistrationResponse {
  registrationId: string;
  mockDriveId: string;
  status: MockDriveRegistrationStatus;
  registeredAt: Date;
  eligibilityCheckResult: EligibilityCheckResult;  // ✅ Use shared type
}

export interface MyRegistrationBatch {
  id: string;
  name: string;
  scheduledStartTime: Date | null;
  scheduledEndTime: Date | null;
  status: MockDriveBatchStatus;
}

export interface MyRegistrationItem {
  id: string;
  mockDriveId: string;
  status: MockDriveRegistrationStatus;
  registeredAt: Date;
  mockDrive: DriveListItem;
  batch: MyRegistrationBatch | null;
}

export interface MyRegistrationsResponse {
  registrations: MyRegistrationItem[];
}

// ============================================
// Display Types
// ============================================

export interface ModuleInfo {
  id: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string | null;
  timeLimit: number;
  weightage: number;
  instructions: string | null;
}

export interface EligibilityCriteriaDisplay {
  minCgpa: number | null;
  maxCgpa: number | null;
  minMarks10: number | null;
  minMarks12: number | null;
  allowedDepartments: string[];
  allowedCourseYears: string[];
  requiredSkills: string[];
  maxBacklogs: number | null;
}
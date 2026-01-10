// src/modules/instituteadmin/mock-drive/mockdrive.types.ts

import { MockDriveStatus, MockDriveModuleType } from '@prisma/client';
import { BaseError } from './common/common.types';
import { 
  ModuleConfig, 
  ModuleResponse,
  AptitudeModuleConfig,
  MachineCodingModuleConfig,
  AiInterviewModuleConfig 
} from './modules/modules.types';

// Re-export module config types for convenience
export type { 
  ModuleConfig, 
  AptitudeModuleConfig, 
  MachineCodingModuleConfig, 
  AiInterviewModuleConfig 
};

// ============================================
// Proctoring Settings
// ============================================

export interface ProctoringSettings {
  detectTabSwitch: boolean;
  maxTabSwitches: number;
  requireFullscreen: boolean;
  detectCopyPaste: boolean;
  webcamRequired: boolean;
  screenshareRequired: boolean;
}

// ============================================
// Request DTOs
// ============================================

export interface CreateMockDriveDTO {
  title: string;
  description?: string | null;
  instructions?: string | null;
  registrationStartDate?: Date | null;
  registrationEndDate?: Date | null;
  maxRegistrations?: number | null;
  driveStartDate?: Date | null;
  driveEndDate?: Date | null;
  allowLateSubmission?: boolean;
  showLeaderboard?: boolean;
  showResultsImmediately?: boolean;
  resultsReleaseDate?: Date | null;
  shuffleQuestions?: boolean;
  enableProctoring?: boolean;
  proctoringSettings?: ProctoringSettings | null;
}

export interface UpdateMockDriveDTO extends Partial<CreateMockDriveDTO> {
  status?: MockDriveStatus;
}

// ============================================
// Query Parameters
// ============================================

export type MockDriveSortField = 'createdAt' | 'title' | 'driveStartDate' | 'registrationEndDate';

export interface ListMockDrivesQuery {
  page?: number;
  limit?: number;
  status?: MockDriveStatus;
  search?: string;
  sortBy?: MockDriveSortField;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Response Types
// ============================================

export interface MockDriveListItem {
  id: string;
  title: string;
  status: MockDriveStatus;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  driveStartDate: Date | null;
  driveEndDate: Date | null;
  totalRegistrations: number;
  totalBatches: number;
  totalModules: number;
  createdAt: Date;
}

export interface EligibilityCriteriaResponse {
  id: string;
  minCgpa: number | null;
  maxCgpa: number | null;
  minMarks10: number | null;
  minMarks12: number | null;
  allowedDepartmentIds: string[];
  allowedCourseYears: string[];
  requiredSkills: string[];
  maxBacklogs: number | null;
  customRules: Record<string, unknown> | null;
}

export interface MockDriveStats {
  totalRegistrations: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
  totalBatches: number;
  completedAttempts: number;
  inProgressAttempts: number;
  averageScore: number | null;
}

export interface MockDriveDetails {
  id: string;
  instituteId: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: MockDriveStatus;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  maxRegistrations: number | null;
  driveStartDate: Date | null;
  driveEndDate: Date | null;
  allowLateSubmission: boolean;
  showLeaderboard: boolean;
  showResultsImmediately: boolean;
  resultsReleaseDate: Date | null;
  shuffleQuestions: boolean;
  enableProctoring: boolean;
  proctoringSettings: ProctoringSettings | null;
  questionsGenerated: boolean;
  questionsGeneratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  eligibilityCriteria: EligibilityCriteriaResponse | null;
  modules: ModuleResponse[];
  stats: MockDriveStats;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export type PaginatedMockDrives = PaginatedResponse<MockDriveListItem>;

// ============================================
// Publish Validation Types
// ============================================

export interface PublishValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================
// Error Classes
// ============================================

export class MockDriveError extends BaseError {
  constructor(
    message: string,
    code: string = 'MOCK_DRIVE_ERROR',
    statusCode: number = 400
  ) {
    super(code, message, statusCode);
  }
}

export class MockDriveNotFoundError extends MockDriveError {
  constructor(mockDriveId: string) {
    super(`Mock drive with ID ${mockDriveId} not found`, 'MOCK_DRIVE_NOT_FOUND', 404);
  }
}

export class MockDriveAccessDeniedError extends MockDriveError {
  constructor() {
    super('You do not have access to this mock drive', 'ACCESS_DENIED', 403);
  }
}

export class MockDriveInvalidStatusError extends MockDriveError {
  constructor(currentStatus: string, action: string) {
    super(
      `Cannot ${action} mock drive with status: ${currentStatus}`,
      'INVALID_STATUS',
      400
    );
  }
}

export class MockDrivePublishError extends MockDriveError {
  constructor(reason: string) {
    super(`Cannot publish mock drive: ${reason}`, 'PUBLISH_ERROR', 400);
  }
}

export class MockDriveValidationError extends MockDriveError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}



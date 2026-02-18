// src/modules/instituteadmin/mock-drive/registration/registration.types.ts

import { MockDriveRegistrationStatus } from '@prisma/client';

// ============================================
// DTOs
// ============================================

export interface UpdateRegistrationDTO {
  status: MockDriveRegistrationStatus;
  adminNotes?: string | null;
}

export interface BulkUpdateRegistrationDTO {
  registrationIds: string[];
  status: MockDriveRegistrationStatus;
  adminNotes?: string | null;
}

// ============================================
// Query Types
// ============================================

export interface ListRegistrationsQuery {
  page?: number;
  limit?: number;
  status?: MockDriveRegistrationStatus;
  batchId?: string;
  hasBatch?: boolean;
  search?: string;
  sortBy?: 'registeredAt' | 'studentName' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Response Types
// ============================================

export interface RegistrationDetails {
  id: string;
  mockDriveId: string;
  userId: string;
  status: MockDriveRegistrationStatus;
  eligibilityCheckResult: EligibilityCheckResultData | null;
  adminNotes: string | null;
  batchId: string | null;
  batchName: string | null;
  registeredAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  student: StudentInfo;
}

export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  studentId: string | null;
  departmentId: string | null;
  departmentName?: string | null;
  courseYear: string | null;
  averageCgpa: number | null;
  marks10: number | null;
  marks12: number | null;
  skills: string[];
}

export interface EligibilityCheckResultData {
  isEligible: boolean;
  checks: Array<{
    criterion: string;
    passed: boolean;
    required: string;
    actual: string;
  }>;
}

export interface RegistrationListItem {
  id: string;
  userId: string;
  status: MockDriveRegistrationStatus;
  studentName: string;
  studentId: string | null;
  departmentId: string | null;
  departmentName?: string | null;
  courseYear: string | null;
  averageCgpa: number | null;
  batchId: string | null;
  batchName: string | null;
  registeredAt: Date;
  isEligible: boolean | null;
}

export interface PaginatedRegistrations {
  data: RegistrationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  summary: RegistrationSummary;
}

export interface RegistrationSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
  withBatch: number;
  withoutBatch: number;
}

export interface BulkUpdateResult {
  success: number;
  failed: number;
  failedIds: string[];
}

// ============================================
// Error Classes
// ============================================

export class RegistrationError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'RegistrationError';
  }
}

export class RegistrationNotFoundError extends RegistrationError {
  constructor(registrationId: string) {
    super('REGISTRATION_NOT_FOUND', `Registration not found: ${registrationId}`, 404);
  }
}

export class RegistrationStatusError extends RegistrationError {
  constructor(status: MockDriveRegistrationStatus, action: string) {
    super(
      'REGISTRATION_INVALID_STATUS',
      `Cannot ${action} registration with status: ${status}`,
      400
    );
  }
}

export class RegistrationAlreadyExistsError extends RegistrationError {
  constructor() {
    super('REGISTRATION_ALREADY_EXISTS', 'User is already registered for this mock drive', 409);
  }
}
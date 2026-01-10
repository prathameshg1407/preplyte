// src/modules/instituteadmin/mock-drive/eligibility/eligibility.types.ts

import { JsonValue } from '@prisma/client/runtime/library';

// ============================================
// Custom Rule Types
// ============================================

export type CustomRuleOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'less_than' 
  | 'greater_than_or_equals' 
  | 'less_than_or_equals'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in';

export interface CustomRule {
  field: string;
  operator: CustomRuleOperator;
  value: string | number | boolean | string[] | number[];
}

export interface CustomRulesConfig {
  rules: CustomRule[];
  matchType: 'all' | 'any'; // AND vs OR
}

// ============================================
// DTOs
// ============================================

export interface SetEligibilityDTO {
  minCgpa?: number | null;
  maxCgpa?: number | null;
  minMarks10?: number | null;
  minMarks12?: number | null;
  allowedDepartmentIds?: string[];
  allowedCourseYears?: string[];
  requiredSkills?: string[];
  maxBacklogs?: number | null;
  customRules?: CustomRulesConfig | null;
}

export interface UpdateEligibilityDTO extends Partial<SetEligibilityDTO> {}

// ============================================
// Response Types
// ============================================

export interface EligibilityDetails {
  id: string;
  mockDriveId: string;
  minCgpa: number | null;
  maxCgpa: number | null;
  minMarks10: number | null;
  minMarks12: number | null;
  allowedDepartmentIds: string[];
  allowedCourseYears: string[];
  requiredSkills: string[];
  maxBacklogs: number | null;
  customRules: CustomRulesConfig | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EligibilityCheckResult {
  isEligible: boolean;
  checks: EligibilityCheck[];
  summary: {
    passed: number;
    failed: number;
    total: number;
  };
}

export interface EligibilityCheck {
  criterion: string;
  passed: boolean;
  required: string;
  actual: string;
  details?: string;
}

export interface EligibleStudentsQuery {
  page?: number;
  limit?: number;
  departmentId?: string;
  courseYear?: string;
  search?: string;
}

export interface EligibleStudent {
  id: string;
  userId: string;
  fullName: string;
  studentId: string;
  departmentId: string;
  courseYear: string;
  averageCgpa: number | null;
  marks10: number | null;
  marks12: number | null;
  skills: string[];
  isRegistered: boolean;
  registrationStatus?: string;
}

export interface PaginatedEligibleStudents {
  data: EligibleStudent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ============================================
// Error Classes
// ============================================

export class EligibilityError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'EligibilityError';
  }
}

export class EligibilityNotFoundError extends EligibilityError {
  constructor(mockDriveId: string) {
    super(
      'ELIGIBILITY_NOT_FOUND',
      `Eligibility criteria not found for mock drive: ${mockDriveId}`,
      404
    );
  }
}

export class EligibilityValidationError extends EligibilityError {
  constructor(message: string) {
    super('ELIGIBILITY_VALIDATION_ERROR', message, 400);
  }
}
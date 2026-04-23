// src/modules/instituteadmin/mock-drive/results/results.types.ts

import { MockDriveAttemptStatus, MockDriveModuleType } from '@prisma/client';

// ============================================
// Query Types
// ============================================

export interface ListResultsQuery {
  page?: number;
  limit?: number;
  batchId?: string;
  status?: MockDriveAttemptStatus;
  search?: string;
  sortBy?: 'rank' | 'totalScore' | 'completedAt' | 'studentName';
  sortOrder?: 'asc' | 'desc';
}

export interface ExportOptions {
  format: 'csv' | 'json';
  batchId?: string;
}

// ============================================
// Response Types
// ============================================

export interface ResultListItem {
  attemptId: string;
  userId: string;
  studentName: string;
  studentId: string | null;
  departmentId: string | null;
  batchName: string | null;
  status: MockDriveAttemptStatus;
  totalScore: number | null;
  percentageScore: number | null;
  rank: number | null;
  isPassed: boolean | null;
  completedAt: Date | null;
  terminationReason?: string | null;
  remarks?: string | null;
}

export interface PaginatedResults {
  data: ResultListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ModuleResultSummary {
  moduleId: string;
  moduleName: string;
  moduleType: MockDriveModuleType;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  isPassed: boolean | null;
  timeSpentSeconds: number;
}

export interface DetailedResult {
  attemptId: string;
  mockDriveId: string;
  student: {
    userId: string;
    name: string;
    email: string;
    studentId: string | null;
    departmentId: string | null;
  };
  batch: {
    id: string;
    name: string;
  } | null;
  status: MockDriveAttemptStatus;
  totalScore: number | null;
  percentageScore: number | null;
  rank: number | null;
  isPassed: boolean | null;
  startedAt: Date | null;
  completedAt: Date | null;
  terminationReason?: string | null;
  remarks?: string | null;
  modules: ModuleResultSummary[];
  report: {
    performanceSummary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null;
}

export interface RankingEntry {
  attemptId: string;
  userId: string;
  studentName: string;
  rank: number;
  totalScore: number;
  percentageScore: number;
}

export interface ResultStatistics {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  avgScore: number | null;
  highScore: number | null;
  lowScore: number | null;
  passRate: number | null;
}

export interface ExportResult {
  filename: string;
  data: string;
  contentType: string;
}

// ============================================
// Errors
// ============================================

export class ResultsError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ResultsError';
  }
}

export class MockDriveNotFoundError extends ResultsError {
  constructor(id: string) {
    super('MOCK_DRIVE_NOT_FOUND', `Mock drive not found: ${id}`, 404);
  }
}

export class AccessDeniedError extends ResultsError {
  constructor() {
    super('ACCESS_DENIED', 'You do not have access to this mock drive', 403);
  }
}

export class ResultNotFoundError extends ResultsError {
  constructor(attemptId: string) {
    super('RESULT_NOT_FOUND', `Result not found: ${attemptId}`, 404);
  }
}
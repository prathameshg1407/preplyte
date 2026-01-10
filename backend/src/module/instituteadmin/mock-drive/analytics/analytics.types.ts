// src/modules/instituteadmin/mock-drive/analytics/analytics.types.ts

import { MockDriveModuleType } from '@prisma/client';
import { BaseError } from '../common/common.types';

// ============================================
// Overview Types
// ============================================

export interface RegistrationStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface ParticipationStats {
  totalRegistered: number;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number; // Always 0 if no data, not null
}

export interface ScoreStats {
  average: number | null;
  highest: number | null;
  lowest: number | null;
  median: number | null;
}

export interface BatchStats {
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
}

export interface AnalyticsOverview {
  registrations: RegistrationStats;
  participation: ParticipationStats;
  scores: ScoreStats;
  batches: BatchStats;
}

// ============================================
// Score Distribution Types
// ============================================

export interface ScoreRange {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number; // Always 0 if no data, not null
}

export interface ScoreDistribution {
  ranges: ScoreRange[];
  totalStudents: number;
}

// ============================================
// Module Performance Types
// ============================================

export interface ModuleStats {
  averageScore: number | null;
  averagePercentage: number | null;
  averageTimeSpent: number | null;
  passRate: number | null;
  completionRate: number; // Always 0 if no data, not null
}

export interface ModulePerformance {
  moduleId: string;
  moduleName: string;
  moduleType: MockDriveModuleType;
  order: number;
  stats: ModuleStats;
  scoreDistribution: ScoreRange[];
}

// ============================================
// Batch Comparison Types
// ============================================

export interface BatchComparison {
  batchId: string;
  batchName: string;
  batchNumber: number;
  totalStudents: number;
  completedStudents: number;
  averageScore: number | null;
  averagePercentage: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  passRate: number | null;
}

// ============================================
// Time Analysis Types
// ============================================

export interface OverallTimeStats {
  averageDuration: number | null;
  minDuration: number | null;
  maxDuration: number | null;
}

export interface ModuleTimeStats {
  moduleId: string;
  moduleName: string;
  moduleType: MockDriveModuleType;
  timeLimit: number;
  averageTimeUsed: number | null;
  averageTimeUsedPercentage: number | null;
}

export interface TimeAnalysis {
  overall: OverallTimeStats;
  byModule: ModuleTimeStats[];
}

// ============================================
// Question Analysis Types
// ============================================

export interface QuestionStats {
  questionId: string;
  questionText: string;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  totalAttempts: number;
  correctRate: number;
  averageTimeSpent: number | null;
}

export interface QuestionAnalysis {
  totalQuestions: number;
  questions: QuestionStats[];
}

// ============================================
// Completion Trend Types
// ============================================

export interface CompletionTrend {
  date: string;
  completed: number;
  cumulative: number;
}

// ============================================
// Department/Year Breakdown Types
// ============================================

export interface DepartmentBreakdown {
  departmentId: string;
  totalStudents: number;
  completedStudents: number;
  averageScore: number | null;
  passRate: number | null;
}

export interface CourseYearBreakdown {
  courseYear: string;
  totalStudents: number;
  completedStudents: number;
  averageScore: number | null;
  passRate: number | null;
}

// ============================================
// Full Analytics Response
// ============================================

export interface FullAnalytics {
  overview: AnalyticsOverview;
  scoreDistribution: ScoreDistribution;
  modulePerformance: ModulePerformance[];
  batchComparison: BatchComparison[];
  timeAnalysis: TimeAnalysis;
  completionTrend: CompletionTrend[];
  departmentBreakdown: DepartmentBreakdown[];
  courseYearBreakdown: CourseYearBreakdown[];
}

// ============================================
// Query Types
// ============================================

export interface AnalyticsQuery {
  batchId?: string;
  startDate?: Date;
  endDate?: Date;
}

// ============================================
// Error Classes
// ============================================

export class AnalyticsError extends BaseError {
  constructor(
    code: string = 'ANALYTICS_ERROR',
    message: string,
    statusCode: number = 400
  ) {
    super(code, message, statusCode);
  }
}

export class InsufficientDataError extends AnalyticsError {
  constructor(message: string = 'Insufficient data for analytics') {
    super('INSUFFICIENT_DATA', message, 400);
  }
}
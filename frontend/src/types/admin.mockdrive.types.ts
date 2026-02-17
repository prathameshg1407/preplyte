// src/types/mockdrive.types.ts

// ============================================
// Enums (Aligned with Prisma)
// ============================================

export enum MockDriveStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MockDriveModuleType {
  APTITUDE = 'APTITUDE',
  MACHINE_CODING = 'MACHINE_CODING',
  AI_INTERVIEW = 'AI_INTERVIEW',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum QuestionType {
  QUANTITATIVE = 'QUANTITATIVE',
  VERBAL = 'VERBAL',
  LOGICAL = 'LOGICAL',
}

export enum AiInterviewDifficulty {
  ENTRY = 'ENTRY',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
}

export enum MockDriveRegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum MockDriveBatchStatus {
  CREATED = 'CREATED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MockDriveAttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  TIMED_OUT = 'TIMED_OUT',
  ABANDONED = 'ABANDONED',
}

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
// Module Configuration Types
// ============================================

export interface AptitudeModuleConfig {
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: number;
  negativeMarking: number;
}

export interface MachineCodingModuleConfig {
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  allowedLanguages: string[];
  partialScoring: boolean;
  maxScorePerQuestion: number;
}

export interface AiInterviewModuleConfig {
  difficulty: AiInterviewDifficulty;
  jobTitle: string;
  companyName?: string | null;
  focusAreas: string[];
  targetQuestions: number;
}

export type ModuleConfig =
  | AptitudeModuleConfig
  | MachineCodingModuleConfig
  | AiInterviewModuleConfig;

// ============================================
// Type Guards
// ============================================

export function isAptitudeConfig(config: ModuleConfig): config is AptitudeModuleConfig {
  return 'questionTypes' in config && 'marksPerQuestion' in config;
}

export function isMachineCodingConfig(config: ModuleConfig): config is MachineCodingModuleConfig {
  return 'allowedLanguages' in config && 'partialScoring' in config;
}

export function isAiInterviewConfig(config: ModuleConfig): config is AiInterviewModuleConfig {
  return 'jobTitle' in config && 'focusAreas' in config;
}

// ============================================
// Eligibility Types
// ============================================

export interface CustomRule {
  field: string;
  operator: CustomRuleOperator;
  value: string | number | boolean | string[] | number[];
}

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

export interface CustomRulesConfig {
  rules: CustomRule[];
  matchType: 'all' | 'any';
}

export interface EligibilityCriteria {
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
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityCheck {
  criterion: string;
  passed: boolean;
  required: string;
  actual: string;
  details?: string;
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

export interface EligibleStudent {
  id: string;
  userId: string;
  fullName: string;
  studentId: string;
  departmentId: string;
  departmentName?: string;
  courseYear: string;
  numberOfBacklogs: number;
  averageCgpa: number | null;
  marks10: number | null;
  marks12: number | null;
  skills: string[];
  isRegistered: boolean;
  registrationStatus?: MockDriveRegistrationStatus;
}

export interface EligibilitySummary {
  totalEligible: number;
  totalRegistered: number;
  byDepartment: Record<string, number>;
  byCourseYear: Record<string, number>;
}

// ============================================
// Module Types
// ============================================

export interface MockDriveModule {
  id: string;
  mockDriveId: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string | null;
  timeLimit: number;
  weightage: number;
  config: ModuleConfig;
  passingScore: number | null;
  instructions: string | null;
  isActive: boolean;
  questionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleWithAvailability extends MockDriveModule {
  availableQuestions: number;
  requiredQuestions: number;
  hasEnoughQuestions: boolean;
}

export interface ModuleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ModulesSummary {
  totalModules: number;
  activeModules: number;
  totalWeightage: number;
  totalTimeLimit: number;
  modules: MockDriveModule[];
  validation: ModuleValidation;
}

// ============================================
// Registration Types
// ============================================

export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  studentId: string | null;
  departmentId: string | null;
  courseYear: string | null;
  numberOfBacklogs: number | null;
  averageCgpa: number | null;
  marks10: number | null;
  marks12: number | null;
  skills: string[];
}

export interface RegistrationDetails {
  id: string;
  mockDriveId: string;
  userId: string;
  status: MockDriveRegistrationStatus;
  eligibilityCheckResult: EligibilityCheckResult | null;
  adminNotes: string | null;
  batchId: string | null;
  batchName: string | null;
  registeredAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  student: StudentInfo;
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
  numberOfBacklogs: number | null;
  averageCgpa: number | null;
  batchId: string | null;
  batchName: string | null;
  registeredAt: string;
  isEligible: boolean | null;
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
// Batch Types
// ============================================

export interface BatchStats {
  totalAssigned: number;
  totalStarted: number;
  totalCompleted: number;
  totalInProgress: number;
  averageScore: number | null;
}

export interface BatchDetails {
  id: string;
  mockDriveId: string;
  name: string;
  batchNumber: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: MockDriveBatchStatus;
  maxCapacity: number | null;
  isAutoGenerated: boolean;
  notes: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  createdAt: string;
  updatedAt: string;
  stats: BatchStats;
}

export interface BatchListItem {
  id: string;
  name: string;
  batchNumber: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: MockDriveBatchStatus;
  maxCapacity: number | null;
  assignedCount: number;
  completedCount: number;
  inProgressCount: number;
}

export interface BatchStudent {
  registrationId: string;
  userId: string;
  studentName: string;
  studentId: string;
  departmentId: string;
  departmentName?: string;
  courseYear: string;
  numberOfBacklogs: number;
  registrationStatus: MockDriveRegistrationStatus;
  attemptStatus: MockDriveAttemptStatus | null;
  attemptScore: number | null;
}

export interface AssignResult {
  assigned: number;
  failed: string[];
}

export interface UnassignResult {
  unassigned: number;
}

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsOverview {
  registrations: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  participation: {
    totalRegistered: number;
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
  };
  scores: {
    average: number | null;
    highest: number | null;
    lowest: number | null;
    median: number | null;
  };
  batches: {
    total: number;
    completed: number;
    inProgress: number;
    scheduled: number;
  };
}

export interface ScoreRange {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface ScoreDistribution {
  ranges: ScoreRange[];
  totalStudents: number;
}

export interface ModuleStats {
  averageScore: number | null;
  averagePercentage: number | null;
  averageTimeSpent: number | null;
  passRate: number | null;
  completionRate: number;
}

export interface ModulePerformance {
  moduleId: string;
  moduleName: string;
  moduleType: MockDriveModuleType;
  order: number;
  stats: ModuleStats;
  scoreDistribution: ScoreRange[];
}

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

export interface TimeAnalysis {
  overall: {
    averageDuration: number | null;
    minDuration: number | null;
    maxDuration: number | null;
  };
  byModule: Array<{
    moduleId: string;
    moduleName: string;
    moduleType: MockDriveModuleType;
    timeLimit: number;
    averageTimeUsed: number | null;
    averageTimeUsedPercentage: number | null;
  }>;
}

export interface CompletionTrend {
  date: string;
  completed: number;
  cumulative: number;
}

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
// Results Types
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
  completedAt: string | null;
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
  startedAt: string | null;
  completedAt: string | null;
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

// ============================================
// Mock Drive Core Types
// ============================================

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

export interface MockDriveListItem {
  id: string;
  title: string;
  status: MockDriveStatus;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  driveStartDate: string | null;
  driveEndDate: string | null;
  totalRegistrations: number;
  totalBatches: number;
  totalModules: number;
  createdAt: string;
}

export interface MockDriveDetails {
  id: string;
  instituteId: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: MockDriveStatus;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  maxRegistrations: number | null;
  driveStartDate: string | null;
  driveEndDate: string | null;
  allowLateSubmission: boolean;
  showLeaderboard: boolean;
  showResultsImmediately: boolean;
  resultsReleaseDate: string | null;
  shuffleQuestions: boolean;
  enableProctoring: boolean;
  proctoringSettings: ProctoringSettings | null;
  questionsGenerated: boolean;
  questionsGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
  eligibilityCriteria: EligibilityCriteria | null;
  modules: MockDriveModule[];
  stats: MockDriveStats;
}

// ============================================
// Input/Request Types
// ============================================

export interface CreateMockDriveInput {
  title: string;
  description?: string | null;
  instructions?: string | null;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  maxRegistrations?: number | null;
  driveStartDate?: string | null;
  driveEndDate?: string | null;
  allowLateSubmission?: boolean;
  showLeaderboard?: boolean;
  showResultsImmediately?: boolean;
  resultsReleaseDate?: string | null;
  shuffleQuestions?: boolean;
  enableProctoring?: boolean;
  proctoringSettings?: ProctoringSettings | null;
}

export interface UpdateMockDriveInput extends Partial<CreateMockDriveInput> {
  status?: MockDriveStatus;
}

export interface CreateModuleInput {
  moduleType: MockDriveModuleType;
  order: number;
  name?: string | null;
  timeLimit: number;
  weightage: number;
  config: ModuleConfig;
  passingScore?: number | null;
  instructions?: string | null;
}

export interface UpdateModuleInput {
  order?: number;
  name?: string | null;
  timeLimit?: number;
  weightage?: number;
  config?: ModuleConfig;
  passingScore?: number | null;
  instructions?: string | null;
  isActive?: boolean;
}

export interface ReorderModulesInput {
  modules: Array<{ moduleId: string; order: number }>;
}

export interface SetEligibilityInput {
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

export interface UpdateRegistrationInput {
  status: MockDriveRegistrationStatus;
  adminNotes?: string | null;
}

export interface BulkUpdateRegistrationInput {
  registrationIds: string[];
  status: MockDriveRegistrationStatus.APPROVED | MockDriveRegistrationStatus.REJECTED;
  adminNotes?: string | null;
}

export interface CreateBatchInput {
  name: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  maxCapacity?: number | null;
  notes?: string | null;
}

export interface UpdateBatchInput {
  name?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  maxCapacity?: number | null;
  notes?: string | null;
  status?: MockDriveBatchStatus;
}

export interface AutoCreateBatchesInput {
  batchSize: number;
  startTime: string;
  intervalMinutes: number;
  prefix?: string;
}

export interface AssignStudentsInput {
  registrationIds: string[];
}

// ============================================
// Query Parameter Types
// ============================================

export interface ListMockDrivesParams {
  page?: number;
  limit?: number;
  status?: MockDriveStatus;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'driveStartDate' | 'registrationEndDate';
  sortOrder?: 'asc' | 'desc';
}

export interface ListModulesParams {
  includeInactive?: boolean;
  checkAvailability?: boolean;
}

export interface ListRegistrationsParams {
  page?: number;
  limit?: number;
  status?: MockDriveRegistrationStatus;
  batchId?: string;
  hasBatch?: boolean;
  search?: string;
  sortBy?: 'registeredAt' | 'studentName' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ListBatchesParams {
  page?: number;
  limit?: number;
  status?: MockDriveBatchStatus;
  sortBy?: 'scheduledStartTime' | 'batchNumber' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListEligibleStudentsParams {
  page?: number;
  limit?: number;
  departmentId?: string;
  courseYear?: string;
  search?: string;
}

export interface ListResultsParams {
  page?: number;
  limit?: number;
  batchId?: string;
  status?: MockDriveAttemptStatus;
  search?: string;
  sortBy?: 'rank' | 'totalScore' | 'completedAt' | 'studentName';
  sortOrder?: 'asc' | 'desc';
}

export interface AnalyticsQueryParams {
  batchId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExportResultsParams {
  format: 'csv' | 'json';
  batchId?: string;
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

// For backward compatibility with existing code
export interface LegacyPaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================
// API Response Wrapper Types
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Status Helpers
// ============================================

export interface StatusConfig {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  description: string;
  icon?: string;
}

export const MOCK_DRIVE_STATUS_CONFIG: Record<MockDriveStatus, StatusConfig> = {
  [MockDriveStatus.DRAFT]: {
    label: 'Draft',
    color: 'default',
    description: 'Mock drive is being configured',
    icon: 'file-edit',
  },
  [MockDriveStatus.PUBLISHED]: {
    label: 'Published',
    color: 'primary',
    description: 'Mock drive is published and visible',
    icon: 'globe',
  },
  [MockDriveStatus.REGISTRATION_OPEN]: {
    label: 'Registration Open',
    color: 'success',
    description: 'Students can register',
    icon: 'user-plus',
  },
  [MockDriveStatus.REGISTRATION_CLOSED]: {
    label: 'Registration Closed',
    color: 'warning',
    description: 'Registration period has ended',
    icon: 'user-x',
  },
  [MockDriveStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'primary',
    description: 'Mock drive is currently active',
    icon: 'play-circle',
  },
  [MockDriveStatus.COMPLETED]: {
    label: 'Completed',
    color: 'success',
    description: 'Mock drive has been completed',
    icon: 'check-circle',
  },
  [MockDriveStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'danger',
    description: 'Mock drive has been cancelled',
    icon: 'x-circle',
  },
};

export const BATCH_STATUS_CONFIG: Record<MockDriveBatchStatus, StatusConfig> = {
  [MockDriveBatchStatus.CREATED]: {
    label: 'Created',
    color: 'default',
    description: 'Batch has been created',
  },
  [MockDriveBatchStatus.SCHEDULED]: {
    label: 'Scheduled',
    color: 'primary',
    description: 'Batch is scheduled',
  },
  [MockDriveBatchStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'warning',
    description: 'Batch is currently active',
  },
  [MockDriveBatchStatus.COMPLETED]: {
    label: 'Completed',
    color: 'success',
    description: 'Batch has been completed',
  },
  [MockDriveBatchStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'danger',
    description: 'Batch has been cancelled',
  },
};

export const REGISTRATION_STATUS_CONFIG: Record<MockDriveRegistrationStatus, StatusConfig> = {
  [MockDriveRegistrationStatus.PENDING]: {
    label: 'Pending',
    color: 'warning',
    description: 'Awaiting review',
  },
  [MockDriveRegistrationStatus.APPROVED]: {
    label: 'Approved',
    color: 'success',
    description: 'Registration approved',
  },
  [MockDriveRegistrationStatus.REJECTED]: {
    label: 'Rejected',
    color: 'danger',
    description: 'Registration rejected',
  },
  [MockDriveRegistrationStatus.WITHDRAWN]: {
    label: 'Withdrawn',
    color: 'default',
    description: 'Student withdrew',
  },
};

export const MODULE_TYPE_CONFIG: Record<MockDriveModuleType, { label: string; icon: string; color: string }> = {
  [MockDriveModuleType.APTITUDE]: {
    label: 'Aptitude Test',
    icon: 'brain',
    color: 'blue',
  },
  [MockDriveModuleType.MACHINE_CODING]: {
    label: 'Machine Coding',
    icon: 'code',
    color: 'green',
  },
  [MockDriveModuleType.AI_INTERVIEW]: {
    label: 'AI Interview',
    icon: 'message-square',
    color: 'purple',
  },
};

// ============================================
// Permission Helpers
// ============================================

export interface MockDrivePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canCancel: boolean;
  canDuplicate: boolean;
  canManageRegistrations: boolean;
  canManageBatches: boolean;
  canViewResults: boolean;
  canExport: boolean;
}

export function getMockDrivePermissions(status: MockDriveStatus): MockDrivePermissions {
  const base: MockDrivePermissions = {
    canEdit: false,
    canDelete: false,
    canPublish: false,
    canCancel: false,
    canDuplicate: true,
    canManageRegistrations: false,
    canManageBatches: false,
    canViewResults: false,
    canExport: true,
  };

  switch (status) {
    case MockDriveStatus.DRAFT:
      return {
        ...base,
        canEdit: true,
        canDelete: true,
        canPublish: true,
      };
    case MockDriveStatus.PUBLISHED:
      return {
        ...base,
        canEdit: true,
        canCancel: true,
      };
    case MockDriveStatus.REGISTRATION_OPEN:
      return {
        ...base,
        canEdit: true,
        canCancel: true,
        canManageRegistrations: true,
        canManageBatches: true,
      };
    case MockDriveStatus.REGISTRATION_CLOSED:
      return {
        ...base,
        canCancel: true,
        canManageRegistrations: true,
        canManageBatches: true,
      };
    case MockDriveStatus.IN_PROGRESS:
      return {
        ...base,
        canCancel: true,
        canManageBatches: true,
        canViewResults: true,
      };
    case MockDriveStatus.COMPLETED:
      return {
        ...base,
        canViewResults: true,
      };
    case MockDriveStatus.CANCELLED:
      return base;
    default:
      return base;
  }
}
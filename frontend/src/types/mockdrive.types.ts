// src/types/mockdrive.types.ts

// ============================================
// Enums (matching Prisma schema)
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

export enum MockDriveAttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  TIMED_OUT = 'TIMED_OUT',
  ABANDONED = 'ABANDONED',
}

export enum MockDriveModuleAttemptStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  TIMED_OUT = 'TIMED_OUT',
  SKIPPED = 'SKIPPED',
}

export enum MockDriveRegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum QuestionType {
  NUMERICAL = 'NUMERICAL',
  VERBAL = 'VERBAL',
  LOGICAL = 'LOGICAL',
  DATA_INTERPRETATION = 'DATA_INTERPRETATION',
  TECHNICAL = 'TECHNICAL',
  GENERAL_KNOWLEDGE = 'GENERAL_KNOWLEDGE',
}

export enum AiInterviewDifficulty {
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  MID_LEVEL = 'MID_LEVEL',
  SENIOR_LEVEL = 'SENIOR_LEVEL',
}

export enum AiInterviewQuestionCategory {
  INTRODUCTION = 'INTRODUCTION',
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  SITUATIONAL = 'SITUATIONAL',
  PROJECT = 'PROJECT',
  PROBLEM_SOLVING = 'PROBLEM_SOLVING',
  CLOSING = 'CLOSING',
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  ACCEPTED = 'ACCEPTED',
  WRONG_ANSWER = 'WRONG_ANSWER',
  TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  COMPILATION_ERROR = 'COMPILATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// ============================================
// Discovery Types
// ============================================

export interface MockDriveListItem {
  id: string;
  title: string;
  description: string | null;
  status: MockDriveStatus;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  driveStartDate: string | null;
  driveEndDate: string | null;
  moduleCount: number;
  registrationCount: number;
  institute: {
    id: string;
    name: string;
  };
  isRegistered: boolean;
  registrationStatus: MockDriveRegistrationStatus | null;
  batchInfo: {
    id: string;
    name: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
  } | null;
}

export interface MockDriveDetail extends Omit<MockDriveListItem, 'moduleCount'> {
  instructions: string | null;
  modules: ModuleInfo[];
  eligibilityCriteria: EligibilityCriteria | null;
  totalTimeLimit: number;
}

export interface ModuleInfo {
  id: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string | null;
  timeLimit: number;
  weightage: number;
  instructions: string | null;
}

export interface EligibilityCriteria {
  minCgpa: number | null;
  maxCgpa: number | null;
  minMarks10: number | null;
  minMarks12: number | null;
  allowedDepartments: string[];
  allowedCourseYears: string[];
  requiredSkills: string[];
  maxBacklogs: number | null;
}

export interface EligibilityCheck {
  criterion: string;
  passed: boolean;
  details: string;
  value?: string | number;
  required?: string | number;
}

export interface EligibilityCheckResult {
  isEligible: boolean;
  checks: EligibilityCheck[];
}

export interface EligibilityCheckResponse {
  mockDriveId: string;
  eligibility: EligibilityCheckResult;
  canRegister: boolean;
  registrationStatus: MockDriveRegistrationStatus | null;
  reason?: string;
}

export interface RegistrationResponse {
  registrationId: string;
  mockDriveId: string;
  status: MockDriveRegistrationStatus;
  registeredAt: string;
  eligibilityCheckResult: EligibilityCheckResult;
}

export interface MyRegistration {
  id: string;
  mockDriveId: string;
  status: MockDriveRegistrationStatus;
  registeredAt: string;
  mockDrive: MockDriveListItem;
  batch: {
    id: string;
    name: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    status: string;
  } | null;
}

export interface MyRegistrationsResponse {
  registrations: MyRegistration[];
}

export interface DiscoveryFilters {
  status?: MockDriveStatus[];
  instituteId?: string;
  search?: string;
  registrationOpen?: boolean;
}

export interface DiscoveryListParams {
  page?: number;
  limit?: number;
  filters?: DiscoveryFilters;
}

export interface DiscoveryListResponse {
  drives: MockDriveListItem[];
  pagination: PaginationResponse;
}

// ============================================
// Attempt Types
// ============================================

export interface AttemptState {
  attemptId: string;
  status: MockDriveAttemptStatus;
  currentModuleOrder: number;
  startedAt: string | null;
  modules: ModuleAttemptState[];
}

export interface ModuleAttemptState {
  moduleId: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string | null;
  status: MockDriveModuleAttemptStatus;
  timeLimit: number;
  startedAt: string | null;
  expiresAt: string | null;
  timeSpentSeconds: number;
}

export interface CurrentModuleState {
  moduleAttemptId: string;
  moduleId: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string | null;
  status: MockDriveModuleAttemptStatus;
  timeLimit: number;
  instructions: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  timeRemainingSeconds: number;
  config: ModuleConfig;
  data: Partial<ModuleData> | null;
}

export interface StartAttemptResponse {
  attemptId: string;
  status: MockDriveAttemptStatus;
  currentModule: CurrentModuleState | null;
  modules: ModuleAttemptState[];
}

export interface GetAttemptResponse {
  attempt: AttemptState;
  currentModule: CurrentModuleState | null;
}

export interface StartModuleResponse {
  moduleAttemptId: string;
  status: MockDriveModuleAttemptStatus;
  startedAt: string;
  expiresAt: string;
  timeRemainingSeconds: number;
  moduleType: MockDriveModuleType;
  config: ModuleConfig;
  data: Partial<ModuleData>;
  instructions: string | null;
}

export interface SubmitModuleResponse {
  moduleAttemptId: string;
  status: MockDriveModuleAttemptStatus;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  nextModule: CurrentModuleState | null;
  isLastModule: boolean;
  attemptCompleted: boolean;
}

// ✅ FIXED: Merged with additional fields
export interface ModuleActionResponse {
  success: boolean;
  updatedData: Partial<ModuleData>;
  timeRemainingSeconds: number;
  message?: string;
}

export interface CompleteAttemptResponse {
  attemptId: string;
  status: MockDriveAttemptStatus;
  totalScore: number;
  percentageScore: number;
  moduleScores: Array<{
    moduleId: string;
    moduleName: string | null;
    moduleType: MockDriveModuleType;
    score: number;
    maxScore: number;
    percentage: number;
    isPassed: boolean;
  }>;
}

// ✅ NEW: Module state response
export interface ModuleStateResponse {
  attempt: AttemptState;
  module: ModuleAttemptState | null;
  currentModule: CurrentModuleState | null;
}

// ============================================
// Module Config Types
// ============================================

export interface AptitudeModuleConfig {
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: number;
  negativeMarking: number;
}

export interface MachineModuleConfig {
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  allowedLanguages: string[];
  partialScoring: boolean;
  maxScorePerQuestion: number;
}

export interface AiInterviewModuleConfig {
  difficulty: AiInterviewDifficulty;
  jobTitle: string;
  companyName?: string;
  focusAreas: string[];
  targetQuestions: number;
}

export type ModuleConfig = AptitudeModuleConfig | MachineModuleConfig | AiInterviewModuleConfig;

// ============================================
// Module Data Types (Stored in moduleData JSON)
// ============================================

// Aptitude Module Data
// ✅ FIXED: Merged with isMarkedForReview field
export interface AptitudeQuestionAttempt {
  questionId: string;
  aptitudeQuestionId: string;
  displayOrder: number;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
  answeredAt: string | null;
}

export interface AptitudeModuleSummary {
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  marksObtained: number;
  negativeMarks: number;
  finalScore: number;
  maxScore: number;
}

export interface AptitudeModuleData {
  questions: AptitudeQuestionAttempt[];
  summary?: AptitudeModuleSummary;
}

// Machine Coding Module Data
export interface MachineSubmissionData {
  id: string;
  code: string;
  languageId: number;
  languageName: string;
  status: SubmissionStatus;
  testCasesPassed: number;
  testCasesTotal: number;
  executionTime: number | null;
  memoryUsed: number | null;
  stdout: string | null;
  stderr: string | null;
  compileError: string | null;
  submittedAt: string;
}

export interface MachineQuestionAttempt {
  questionId: string;
  machineQuestionId: string;
  displayOrder: number;
  submissions: MachineSubmissionData[];
  bestSubmissionId: string | null;
  bestScore: number;
  isSolved: boolean;
}

export interface MachineModuleSummary {
  totalQuestions: number;
  totalSolved: number;
  totalPartial: number;
  totalUnattempted: number;
  totalScore: number;
  maxScore: number;
}

// ✅ NEW: Run result for machine coding
export interface MachineRunResult {
  stdout: string | null;
  stderr: string | null;
  executionTime: number | null;
}

// ✅ FIXED: Merged with _runResult field
export interface MachineModuleData {
  questions: MachineQuestionAttempt[];
  summary?: MachineModuleSummary;
  _runResult?: MachineRunResult;
}

// AI Interview Module Data
export interface AiInterviewConfig {
  resumeId: string;
  resumeUrl: string;
  jobTitle: string;
  companyName: string | null;
  difficulty: AiInterviewDifficulty;
  focusAreas: string[];
  targetQuestions: number;
}

export interface ConversationMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export interface ResponseScores {
  relevance: number;
  clarity: number;
  depth: number;
  technicalAccuracy: number | null;
  overall: number;
}

export interface InterviewResponseData {
  id: string;
  questionIndex: number;
  category: AiInterviewQuestionCategory;
  question: string;
  answer: string;
  isFollowup: boolean;
  scores: ResponseScores;
  feedback: string;
  timeTakenSeconds: number;
  answeredAt: string;
}

export interface CategoryScore {
  score: number;
  count: number;
}

export interface InterviewModuleSummary {
  totalQuestions: number;
  questionsAnswered: number;
  overallScore: number;
  maxScore: number;
  categoryScores: Record<AiInterviewQuestionCategory, CategoryScore>;
  keyStrengths: string[];
  areasForImprovement: string[];
  overallFeedback: string;
}

export interface AiInterviewModuleData {
  config: AiInterviewConfig;
  conversation: ConversationMessage[];
  responses: InterviewResponseData[];
  summary?: InterviewModuleSummary;
}

export type ModuleData = AptitudeModuleData | MachineModuleData | AiInterviewModuleData;

// ============================================
// Action Payloads
// ============================================

export interface AptitudeAnswerPayload {
  questionId: string;
  selectedOptionId: string;
  timeSpent?: number;
}

export interface AptitudeClearPayload {
  questionId: string;
}

// ✅ NEW: Mark for review payload
export interface AptitudeMarkReviewPayload {
  questionId: string;
  isMarked: boolean;
}

export interface MachineSubmitPayload {
  questionId: string;
  code: string;
  languageId: number;
}

// ✅ NEW: Run code payload
export interface MachineRunPayload {
  questionId: string;
  code: string;
  languageId: number;
  customInput?: string;
}

export interface InterviewRespondPayload {
  answer: string;
  timeTaken?: number;
}

export interface InterviewSkipPayload {
  reason?: string;
}

// ============================================
// Results Types
// ============================================

export interface ResultOverview {
  attemptId: string;
  mockDriveId: string;
  mockDriveTitle: string;
  status: MockDriveAttemptStatus;
  startedAt: string | null;
  completedAt: string | null;
  totalScore: number | null;
  percentageScore: number | null;
  rank: number | null;
  totalParticipants: number;
  isPassed: boolean;
  moduleScores: ModuleScoreDetail[];
}

export interface ModuleScoreDetail {
  moduleId: string;
  moduleName: string | null;
  moduleType: MockDriveModuleType;
  order: number;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  status: string;
}

export interface DetailedReport {
  overview: ResultOverview;
  moduleReports: ModuleReport[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  overallFeedback: string;
  comparisonStats: ComparisonStats;
}

export interface ModuleReport {
  moduleId: string;
  moduleName: string | null;
  moduleType: MockDriveModuleType;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpentSeconds: number;
  detailedAnalysis: AptitudeAnalysis | MachineAnalysis | InterviewAnalysis | null;
  feedback: string;
  recommendations: string[];
}

export interface ComparisonStats {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  percentile: number;
  rankInBatch: number;
  totalInBatch: number;
  rankOverall: number;
  totalOverall: number;
}

export interface AptitudeAnalysis {
  totalQuestions: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number;
  questionTypeAnalysis: Array<{
    type: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  timeAnalysis: {
    averageTimePerQuestion: number;
    fastestQuestion: number;
    slowestQuestion: number;
  };
}

export interface MachineAnalysis {
  totalQuestions: number;
  solved: number;
  partial: number;
  unattempted: number;
  totalSubmissions: number;
  languagesUsed: string[];
  questionAnalysis: Array<{
    questionId: string;
    title: string;
    solved: boolean;
    bestScore: number;
    maxScore: number;
    submissionCount: number;
  }>;
}

export interface InterviewAnalysis {
  totalQuestions: number;
  answered: number;
  skipped: number;
  overallScore: number;
  categoryScores: Record<string, { score: number; count: number }>;
  communicationScore: number;
  technicalScore: number;
  keyStrengths: string[];
  areasForImprovement: string[];
}

// ============================================
// Leaderboard Types
// ============================================

export interface ModuleScore {
  moduleId: string;
  moduleType: MockDriveModuleType;
  moduleName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  studentName: string;
  studentId: string | null;
  department: string | null;
  totalScore: number;
  percentageScore: number;
  moduleScores: Array<{
    moduleType: MockDriveModuleType;
    moduleName: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
  completedAt: string | null;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pagination: PaginationResponse;
  currentUserRank: {
    rank: number;
    percentile: number;
  } | null;
  stats: {
    totalParticipants: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
}

export interface MyRankResponse {
  rank: number;
  totalParticipants: number;
  percentile: number;
  score: number;
  percentageScore: number;
  aboveAverage: boolean;
  nearbyEntries: LeaderboardEntry[];
}

export interface LeaderboardFilters {
  batchId?: string;
  department?: string;
}

// ============================================
// Constants (matching backend)
// ============================================

export const MOCKDRIVE_CONSTANTS = {
  // Time buffers
  AUTO_SUBMIT_WARNING_MINUTES: 5,
  GRACE_PERIOD_SECONDS: 30,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,

  // Scoring
  APTITUDE_DEFAULT_MARKS_PER_QUESTION: 1,
  APTITUDE_DEFAULT_NEGATIVE_MARKING: 0.25,
  MACHINE_MAX_SCORE_PER_QUESTION: 100,
  AI_INTERVIEW_MAX_SCORE: 100,

  // Module transitions
  MODULE_TRANSITION_DELAY_MS: 3000,

  // Proctoring
  MAX_TAB_SWITCHES_WARNING: 3,
  MAX_TAB_SWITCHES_TERMINATE: 5,
} as const;

export const MODULE_TYPE_LABELS: Record<MockDriveModuleType, string> = {
  [MockDriveModuleType.APTITUDE]: 'Aptitude Test',
  [MockDriveModuleType.MACHINE_CODING]: 'Machine Coding',
  [MockDriveModuleType.AI_INTERVIEW]: 'AI Interview',
};

export const ATTEMPT_STATUS_LABELS: Record<MockDriveAttemptStatus, string> = {
  [MockDriveAttemptStatus.NOT_STARTED]: 'Not Started',
  [MockDriveAttemptStatus.IN_PROGRESS]: 'In Progress',
  [MockDriveAttemptStatus.COMPLETED]: 'Completed',
  [MockDriveAttemptStatus.TIMED_OUT]: 'Timed Out',
  [MockDriveAttemptStatus.ABANDONED]: 'Abandoned',
};

export const MODULE_ATTEMPT_STATUS_LABELS: Record<MockDriveModuleAttemptStatus, string> = {
  [MockDriveModuleAttemptStatus.LOCKED]: 'Locked',
  [MockDriveModuleAttemptStatus.AVAILABLE]: 'Available',
  [MockDriveModuleAttemptStatus.IN_PROGRESS]: 'In Progress',
  [MockDriveModuleAttemptStatus.COMPLETED]: 'Completed',
  [MockDriveModuleAttemptStatus.TIMED_OUT]: 'Timed Out',
  [MockDriveModuleAttemptStatus.SKIPPED]: 'Skipped',
};

export const REGISTRATION_STATUS_LABELS: Record<MockDriveRegistrationStatus, string> = {
  [MockDriveRegistrationStatus.PENDING]: 'Pending',
  [MockDriveRegistrationStatus.APPROVED]: 'Approved',
  [MockDriveRegistrationStatus.REJECTED]: 'Rejected',
  [MockDriveRegistrationStatus.WITHDRAWN]: 'Withdrawn',
};

export const DRIVE_STATUS_LABELS: Record<MockDriveStatus, string> = {
  [MockDriveStatus.DRAFT]: 'Draft',
  [MockDriveStatus.PUBLISHED]: 'Published',
  [MockDriveStatus.REGISTRATION_OPEN]: 'Registration Open',
  [MockDriveStatus.REGISTRATION_CLOSED]: 'Registration Closed',
  [MockDriveStatus.IN_PROGRESS]: 'In Progress',
  [MockDriveStatus.COMPLETED]: 'Completed',
  [MockDriveStatus.CANCELLED]: 'Cancelled',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: 'Easy',
  [DifficultyLevel.MEDIUM]: 'Medium',
  [DifficultyLevel.HARD]: 'Hard',
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.NUMERICAL]: 'Numerical',
  [QuestionType.VERBAL]: 'Verbal',
  [QuestionType.LOGICAL]: 'Logical',
  [QuestionType.DATA_INTERPRETATION]: 'Data Interpretation',
  [QuestionType.TECHNICAL]: 'Technical',
  [QuestionType.GENERAL_KNOWLEDGE]: 'General Knowledge',
};

export const INTERVIEW_DIFFICULTY_LABELS: Record<AiInterviewDifficulty, string> = {
  [AiInterviewDifficulty.ENTRY_LEVEL]: 'Entry Level',
  [AiInterviewDifficulty.MID_LEVEL]: 'Mid Level',
  [AiInterviewDifficulty.SENIOR_LEVEL]: 'Senior Level',
};

export const INTERVIEW_CATEGORY_LABELS: Record<AiInterviewQuestionCategory, string> = {
  [AiInterviewQuestionCategory.INTRODUCTION]: 'Introduction',
  [AiInterviewQuestionCategory.TECHNICAL]: 'Technical',
  [AiInterviewQuestionCategory.BEHAVIORAL]: 'Behavioral',
  [AiInterviewQuestionCategory.SITUATIONAL]: 'Situational',
  [AiInterviewQuestionCategory.PROJECT]: 'Project',
  [AiInterviewQuestionCategory.PROBLEM_SOLVING]: 'Problem Solving',
  [AiInterviewQuestionCategory.CLOSING]: 'Closing',
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: 'Pending',
  [SubmissionStatus.PROCESSING]: 'Processing',
  [SubmissionStatus.ACCEPTED]: 'Accepted',
  [SubmissionStatus.WRONG_ANSWER]: 'Wrong Answer',
  [SubmissionStatus.TIME_LIMIT_EXCEEDED]: 'Time Limit Exceeded',
  [SubmissionStatus.MEMORY_LIMIT_EXCEEDED]: 'Memory Limit Exceeded',
  [SubmissionStatus.RUNTIME_ERROR]: 'Runtime Error',
  [SubmissionStatus.COMPILATION_ERROR]: 'Compilation Error',
  [SubmissionStatus.INTERNAL_ERROR]: 'Internal Error',
};

// Status flow constants
export const ATTEMPT_STATUS_FLOW: Record<MockDriveAttemptStatus, MockDriveAttemptStatus[]> = {
  [MockDriveAttemptStatus.NOT_STARTED]: [MockDriveAttemptStatus.IN_PROGRESS],
  [MockDriveAttemptStatus.IN_PROGRESS]: [
    MockDriveAttemptStatus.COMPLETED,
    MockDriveAttemptStatus.TIMED_OUT,
    MockDriveAttemptStatus.ABANDONED,
  ],
  [MockDriveAttemptStatus.COMPLETED]: [],
  [MockDriveAttemptStatus.TIMED_OUT]: [],
  [MockDriveAttemptStatus.ABANDONED]: [],
};

export const MODULE_ATTEMPT_STATUS_FLOW: Record<
  MockDriveModuleAttemptStatus,
  MockDriveModuleAttemptStatus[]
> = {
  [MockDriveModuleAttemptStatus.LOCKED]: [MockDriveModuleAttemptStatus.AVAILABLE],
  [MockDriveModuleAttemptStatus.AVAILABLE]: [MockDriveModuleAttemptStatus.IN_PROGRESS],
  [MockDriveModuleAttemptStatus.IN_PROGRESS]: [
    MockDriveModuleAttemptStatus.COMPLETED,
    MockDriveModuleAttemptStatus.TIMED_OUT,
    MockDriveModuleAttemptStatus.SKIPPED,
  ],
  [MockDriveModuleAttemptStatus.COMPLETED]: [],
  [MockDriveModuleAttemptStatus.TIMED_OUT]: [],
  [MockDriveModuleAttemptStatus.SKIPPED]: [],
};

// ============================================
// Utility Types
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// API Request Types (for frontend use)
// ============================================

export interface MockDriveListQueryParams extends PaginationParams {
  status?: string; // comma-separated MockDriveStatus values
  instituteId?: string;
  search?: string;
  registrationOpen?: string; // 'true' or 'false'
}

export interface LeaderboardQueryParams extends PaginationParams {
  batchId?: string;
  department?: string;
}

export interface MyRankQueryParams {
  batchId?: string;
}

// ============================================
// Type Guards
// ============================================

export function isAptitudeModuleData(data: ModuleData): data is AptitudeModuleData {
  return (
    'questions' in data &&
    Array.isArray(data.questions) &&
    data.questions.length > 0 &&
    'aptitudeQuestionId' in data.questions[0]
  );
}

export function isMachineModuleData(data: ModuleData): data is MachineModuleData {
  return (
    'questions' in data &&
    Array.isArray(data.questions) &&
    data.questions.length > 0 &&
    'machineQuestionId' in data.questions[0]
  );
}

export function isAiInterviewModuleData(data: ModuleData): data is AiInterviewModuleData {
  return 'conversation' in data && 'responses' in data && 'config' in data;
}

export function isAptitudeModuleConfig(config: ModuleConfig): config is AptitudeModuleConfig {
  return 'questionTypes' in config && 'marksPerQuestion' in config;
}

export function isMachineModuleConfig(config: ModuleConfig): config is MachineModuleConfig {
  return 'allowedLanguages' in config && 'partialScoring' in config;
}

export function isAiInterviewModuleConfig(config: ModuleConfig): config is AiInterviewModuleConfig {
  return 'jobTitle' in config && 'focusAreas' in config;
}

// ============================================
// Helper Functions
// ============================================

export function getModuleTypeLabel(type: MockDriveModuleType): string {
  return MODULE_TYPE_LABELS[type] || type;
}

export function getAttemptStatusLabel(status: MockDriveAttemptStatus): string {
  return ATTEMPT_STATUS_LABELS[status] || status;
}

export function getModuleAttemptStatusLabel(status: MockDriveModuleAttemptStatus): string {
  return MODULE_ATTEMPT_STATUS_LABELS[status] || status;
}

export function getRegistrationStatusLabel(status: MockDriveRegistrationStatus): string {
  return REGISTRATION_STATUS_LABELS[status] || status;
}

export function getDriveStatusLabel(status: MockDriveStatus): string {
  return DRIVE_STATUS_LABELS[status] || status;
}

export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  return DIFFICULTY_LABELS[difficulty] || difficulty;
}

export function getQuestionTypeLabel(type: QuestionType): string {
  return QUESTION_TYPE_LABELS[type] || type;
}

export function getInterviewDifficultyLabel(difficulty: AiInterviewDifficulty): string {
  return INTERVIEW_DIFFICULTY_LABELS[difficulty] || difficulty;
}

export function getInterviewCategoryLabel(category: AiInterviewQuestionCategory): string {
  return INTERVIEW_CATEGORY_LABELS[category] || category;
}

export function getSubmissionStatusLabel(status: SubmissionStatus): string {
  return SUBMISSION_STATUS_LABELS[status] || status;
}

// ============================================
// Color/Style Helpers (for UI)
// ============================================

export type StatusColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export function getDriveStatusColor(status: MockDriveStatus): StatusColor {
  switch (status) {
    case MockDriveStatus.DRAFT:
      return 'default';
    case MockDriveStatus.PUBLISHED:
      return 'info';
    case MockDriveStatus.REGISTRATION_OPEN:
      return 'success';
    case MockDriveStatus.REGISTRATION_CLOSED:
      return 'warning';
    case MockDriveStatus.IN_PROGRESS:
      return 'primary';
    case MockDriveStatus.COMPLETED:
      return 'secondary';
    case MockDriveStatus.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
}

export function getAttemptStatusColor(status: MockDriveAttemptStatus): StatusColor {
  switch (status) {
    case MockDriveAttemptStatus.NOT_STARTED:
      return 'default';
    case MockDriveAttemptStatus.IN_PROGRESS:
      return 'primary';
    case MockDriveAttemptStatus.COMPLETED:
      return 'success';
    case MockDriveAttemptStatus.TIMED_OUT:
      return 'warning';
    case MockDriveAttemptStatus.ABANDONED:
      return 'error';
    default:
      return 'default';
  }
}

export function getModuleAttemptStatusColor(status: MockDriveModuleAttemptStatus): StatusColor {
  switch (status) {
    case MockDriveModuleAttemptStatus.LOCKED:
      return 'default';
    case MockDriveModuleAttemptStatus.AVAILABLE:
      return 'info';
    case MockDriveModuleAttemptStatus.IN_PROGRESS:
      return 'primary';
    case MockDriveModuleAttemptStatus.COMPLETED:
      return 'success';
    case MockDriveModuleAttemptStatus.TIMED_OUT:
      return 'warning';
    case MockDriveModuleAttemptStatus.SKIPPED:
      return 'secondary';
    default:
      return 'default';
  }
}

export function getRegistrationStatusColor(status: MockDriveRegistrationStatus): StatusColor {
  switch (status) {
    case MockDriveRegistrationStatus.PENDING:
      return 'warning';
    case MockDriveRegistrationStatus.APPROVED:
      return 'success';
    case MockDriveRegistrationStatus.REJECTED:
      return 'error';
    case MockDriveRegistrationStatus.WITHDRAWN:
      return 'secondary';
    default:
      return 'default';
  }
}

export function getSubmissionStatusColor(status: SubmissionStatus): StatusColor {
  switch (status) {
    case SubmissionStatus.PENDING:
    case SubmissionStatus.PROCESSING:
      return 'warning';
    case SubmissionStatus.ACCEPTED:
      return 'success';
    case SubmissionStatus.WRONG_ANSWER:
    case SubmissionStatus.RUNTIME_ERROR:
    case SubmissionStatus.COMPILATION_ERROR:
      return 'error';
    case SubmissionStatus.TIME_LIMIT_EXCEEDED:
    case SubmissionStatus.MEMORY_LIMIT_EXCEEDED:
      return 'warning';
    case SubmissionStatus.INTERNAL_ERROR:
      return 'error';
    default:
      return 'default';
  }
}

export function getDifficultyColor(difficulty: DifficultyLevel): StatusColor {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return 'success';
    case DifficultyLevel.MEDIUM:
      return 'warning';
    case DifficultyLevel.HARD:
      return 'error';
    default:
      return 'default';
  }
}

// ============================================
// Time Formatting Helpers
// ============================================

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export function isTimeWarning(seconds: number): boolean {
  return seconds > 0 && seconds <= MOCKDRIVE_CONSTANTS.AUTO_SUBMIT_WARNING_MINUTES * 60;
}

export function isTimeCritical(seconds: number): boolean {
  return seconds > 0 && seconds <= 60;
}
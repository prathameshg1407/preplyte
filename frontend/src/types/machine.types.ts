// src/types/machine.types.ts

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type TestCaseType = 'SAMPLE' | 'HIDDEN';
export type SessionStatus = 'in_progress' | 'completed' | 'expired';

export type SubmissionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR';

export type TestCaseResultStatus =
  | 'PASSED'
  | 'FAILED'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED';

export type CompilationStatus = 'SUCCESS' | 'COMPILATION_ERROR';

export type PerformanceRank = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';

export type OverallBatchStatus = 'PASSED' | 'PARTIALLY_PASSED' | 'FAILED' | 'ERROR';

// =====================================================
// LANGUAGE TYPES
// =====================================================

export interface ProgrammingLanguage {
  id: string;
  name: string;
  monacoId: string;
  judge0Id: number;
  isActive: boolean;
  defaultTemplate?: string;
}

export interface LanguagesResponse {
  languages: ProgrammingLanguage[];
  totalCount: number;
}

// =====================================================
// CONFIG TYPES
// =====================================================

export interface TimeRecommendation {
  min: number;
  max: number;
  recommended: number;
}

export interface TimeLimitConfig {
  minTimeLimit: number;
  maxTimeLimit: number;
  defaultTimeLimit: number;
  timeLimitUnit: string;
  recommendedTimeLimits: Record<DifficultyLevel, TimeRecommendation>;
}

export interface CodeExecutionConfig {
  perTestCaseTimeLimit: number;
  perTestCaseMemoryLimit: number;
  timeUnit: string;
  memoryUnit: string;
}

export interface QuestionLimitsConfig {
  min: number;
  max: number;
  default: number;
}

export interface ConfigResponse {
  aptitude: TimeLimitConfig;
  machine: TimeLimitConfig;
  codeExecution: CodeExecutionConfig;
  questionLimits: {
    aptitude: QuestionLimitsConfig;
    machine: QuestionLimitsConfig;
  };
}

// =====================================================
// ENUMS TYPES
// =====================================================

export interface DifficultyLevelInfo {
  value: DifficultyLevel;
  label: string;
  description: string;
  color: string;
  aptitudeTimeMultiplier: number;
  machineTimeMultiplier: number;
}

export interface AptitudeQuestionType {
  value: string;
  label: string;
  description: string;
  icon: string;
  topics: string[];
}

export interface MachineQuestionTag {
  value: string;
  label: string;
  count: number;
}

export interface SubmissionStatusInfo {
  value: SubmissionStatus;
  label: string;
  description: string;
  color: string;
}

export interface DifficultyLevelsResponse {
  difficultyLevels: DifficultyLevelInfo[];
}

export interface QuestionTypesResponse {
  aptitudeQuestionTypes: AptitudeQuestionType[];
  machineQuestionTags: MachineQuestionTag[];
  submissionStatuses: SubmissionStatusInfo[];
}

// =====================================================
// SESSION TYPES
// =====================================================

// POST /api/machine/sessions - Request
export interface CreateSessionRequest {
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  timeLimit: number; // 30-180 minutes
  tags?: string[];
}

// POST /api/machine/sessions - Response
// Backend: machine.service.ts createSession() returns this shape
export interface CreateSessionResponse {
  id: string;
  userId: string;
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  timeLimit: number;
  startedAt: string; // ISO date string
  expiresAt: string; // ISO date string
  completedAt: null;
  totalScore: null;
  totalSolved: null;
  status: 'in_progress';
  createdAt: string; // ISO date string
}

// GET /api/machine/sessions - Query
export interface ListSessionsQuery {
  page?: number;
  limit?: number;
  status?: 'all' | 'completed' | 'in_progress' | 'expired';
  difficulty?: DifficultyLevel;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// GET /api/machine/sessions - Response Item
// Backend: machine.service.ts listSessions() returns sessionsWithStatus
export interface SessionListItem {
  id: string;
  userId: string;
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  timeLimit: number;
  startedAt: string;
  expiresAt: string;
  completedAt: string | null;
  totalScore: number | null;
  totalSolved: number | null;
  status: SessionStatus;
  solvedPercentage: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListSessionsResponse {
  sessions: SessionListItem[];
  pagination: PaginationInfo;
}

// GET /api/machine/sessions/:id - Response
// Backend: machine.service.ts getSessionDetails()
export interface SessionProgress {
  solved: number;
  attempted: number;
  total: number;
}

export interface SessionDetailsResponse {
  id: string;
  userId: string;
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  timeLimit: number;
  startedAt: string;
  expiresAt: string;
  completedAt: string | null;
  status: SessionStatus;
  timeRemaining: number; // milliseconds
  timeRemainingFormatted: string; // "45:30"
  progress: SessionProgress;
  totalScore: number | null;
  totalSolved: number | null;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// QUESTION TYPES
// =====================================================

// GET /api/machine/sessions/:id/questions - Response
// Backend: machine.service.ts getSessionQuestions()
export interface QuestionBestSubmission {
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
  testCasesPassed: number;
  testCasesTotal: number;
  submittedAt: string;
}

export interface QuestionListItem {
  id: string;
  sessionQuestionId: string;
  order: number;
  title: string;
  difficulty: DifficultyLevel;
  tags: string[];
  isSolved: boolean;
  submissionCount: number;
  bestSubmission: QuestionBestSubmission | null;
}

export interface SessionQuestionsResponse {
  sessionId: string;
  status: SessionStatus;
  questions: QuestionListItem[];
  totalQuestions: number;
  solvedCount: number;
}

// GET /api/machine/sessions/:id/questions/:questionId - Response
// Backend: machine.service.ts getQuestion()
export interface SampleTestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface QuestionDetail {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  inputFormat: string | null;
  outputFormat: string | null;
  constraints: string | null; // Backend returns string, not array
  tags: string[];
  sampleTestCases: SampleTestCase[];
  totalTestCases: number;
}

export interface QuestionLastSubmission {
  id: string;
  status: SubmissionStatus;
  languageId: number;
  testCasesPassed: number;
  testCasesTotal: number;
  submittedAt: string;
}

export interface QuestionNavigation {
  previousQuestionId: string | null;
  nextQuestionId: string | null;
  currentPosition: number;
  totalQuestions: number;
}

export interface QuestionDetailResponse {
  sessionId: string;
  sessionQuestionId: string;
  question: QuestionDetail;
  isSolved: boolean;
  submissionCount: number;
  lastSubmission: QuestionLastSubmission | null;
  navigation: QuestionNavigation;
}

// =====================================================
// CODE EXECUTION TYPES
// =====================================================

// POST /api/machine/sessions/:sessionId/questions/:questionId/run - Request
export interface RunCodeRequest {
  code: string;
  languageId: number;
  customInput?: string;
}

// Backend: machine.service.ts runCode() / machine.types.ts TestCaseResult
export interface TestCaseResult {
  testCaseId?: string;
  testCaseNumber?: number;
  type?: TestCaseType;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  status: TestCaseResultStatus;
  executionTime: number | null; // milliseconds
  memoryUsed: number | null; // KB
  stderr?: string | null;
}

export interface RunCodeSummary {
  totalTestCases: number;
  passed: number;
  failed: number;
  averageExecutionTime?: number;
  maxMemoryUsed?: number;
}

// Backend: machine.types.ts CodeExecutionResult - sample_test_cases type
export interface RunCodeResponseSampleTestCases {
  sessionId: string;
  questionId: string;
  executionType: 'sample_test_cases';
  results: TestCaseResult[];
  summary: RunCodeSummary;
  compilationStatus: CompilationStatus;
  compileOutput: string | null;
}

// Backend: machine.types.ts CodeExecutionResult - custom_input type
export interface CustomInputResult {
  input: string;
  output: string;
  executionTime: number;
  memoryUsed: number;
  status: string;
}

export interface RunCodeResponseCustomInput {
  sessionId: string;
  questionId: string;
  executionType: 'custom_input';
  result: CustomInputResult;
  compilationStatus: CompilationStatus;
  compileOutput: string | null;
}

export type RunCodeResponse = RunCodeResponseSampleTestCases | RunCodeResponseCustomInput;

// Type guard for RunCodeResponse
export function isRunCodeSampleTestCases(
  response: RunCodeResponse
): response is RunCodeResponseSampleTestCases {
  return response.executionType === 'sample_test_cases';
}

export function isRunCodeCustomInput(
  response: RunCodeResponse
): response is RunCodeResponseCustomInput {
  return response.executionType === 'custom_input';
}

// =====================================================
// SUBMISSION TYPES
// =====================================================

// POST /api/machine/sessions/:sessionId/questions/:questionId/submit - Request
export interface SubmitCodeRequest {
  code: string;
  languageId: number;
}

// Backend: machine.types.ts SubmissionResult
export interface FailedTestCase {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  message: string;
}

export interface SubmitCodeResponse {
  submissionId: string;
  sessionId: string;
  questionId: string;
  status: SubmissionStatus;
  testCasesPassed: number;
  testCasesTotal: number;
  executionTime: number | null;
  memoryUsed: number | null;
  submittedAt: string;
  judgedAt: string;
  isSolved: boolean;
  score: number; // 0 or 100
  message: string;
  failedTestCase?: FailedTestCase;
}

// =====================================================
// SESSION STATUS TYPES
// =====================================================

// GET /api/machine/sessions/:id/status - Response
// Backend: machine.service.ts getSessionStatus()
export interface SessionStatusProgress {
  solved: number;
  attempted: number;
  unattempted: number;
  total: number;
  solvedPercentage: number;
}

export interface SessionSubmissionStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  lastSubmissionAt: string | null;
}

export interface SessionStatusResponse {
  sessionId: string;
  status: SessionStatus;
  timeRemaining: number;
  timeRemainingFormatted: string;
  startedAt: string;
  expiresAt: string;
  progress: SessionStatusProgress;
  submissionStats: SessionSubmissionStats;
}

// =====================================================
// SESSION COMPLETION TYPES
// =====================================================

// POST /api/machine/sessions/:id/complete - Response
// Backend: machine.service.ts completeSession()
export interface CompletedQuestionSummary {
  id: string;
  title: string;
  isSolved: boolean;
  submissionCount: number;
  bestStatus: SubmissionStatus | null;
}

export interface CompleteSessionResults {
  totalSolved: number;
  totalQuestions: number;
  totalScore: number;
  solvedPercentage: number;
  questions: CompletedQuestionSummary[];
}

export interface CompleteSessionResponse {
  sessionId: string;
  status: 'completed';
  completedAt: string;
  timeTaken: number; // minutes
  results: CompleteSessionResults;
}

// =====================================================
// SESSION RESULTS TYPES
// =====================================================

// GET /api/machine/sessions/:id/results - Response
// Backend: machine.service.ts getSessionResults()
export interface ResultQuestionBestSubmission {
  id: string;
  status: SubmissionStatus;
  executionTime: number | null;
  memoryUsed: number | null;
  languageId: number;
  language: string;
  submittedAt: string;
}

export interface ResultQuestion {
  order: number;
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  tags: string[];
  isSolved: boolean;
  score: number;
  submissionCount: number;
  bestSubmission: ResultQuestionBestSubmission | null;
}

export interface ResultSummary {
  totalSolved: number;
  totalQuestions: number;
  totalScore: number;
  maxPossibleScore: number;
  solvedPercentage: number;
  totalSubmissions: number;
}

export interface ResultPerformance {
  rank: PerformanceRank;
  message: string;
  suggestions: string[];
}

export interface SessionResultsResponse {
  sessionId: string;
  status: 'completed';
  completedAt: string;
  timeTaken: number;
  timeLimit: number;
  difficulty: DifficultyLevel;
  summary: ResultSummary;
  questions: ResultQuestion[];
  performance: ResultPerformance;
}

// =====================================================
// SUBMISSION HISTORY TYPES
// =====================================================

// GET /api/machine/sessions/:sessionId/questions/:questionId/submissions - Response
// Backend: machine.service.ts getSubmissionHistory()
export interface SubmissionHistoryItem {
  id: string;
  status: SubmissionStatus;
  languageId: number;
  language: string;
  executionTime: number | null;
  memoryUsed: number | null;
  testCasesPassed: number;
  testCasesTotal: number;
  submittedAt: string;
  judgedAt: string | null;
}

export interface SubmissionHistoryStats {
  totalSubmissions: number;
  acceptedCount: number;
  wrongAnswerCount: number;
  compilationErrorCount: number;
  firstAcceptedAt: string | null;
}

export interface SubmissionHistoryResponse {
  sessionId: string;
  questionId: string;
  questionTitle: string;
  submissions: SubmissionHistoryItem[];
  pagination: PaginationInfo;
  stats: SubmissionHistoryStats;
}

// =====================================================
// SUBMISSION DETAIL TYPES
// =====================================================

// GET /api/machine/submissions/:id - Response
// Backend: machine.service.ts getSubmissionDetails()
export interface SubmissionTestCaseResult {
  testCaseNumber: number;
  type: TestCaseType;
  status: 'PASSED' | 'FAILED';
  input: string; // '[Hidden]' for HIDDEN type
  expectedOutput: string; // '[Hidden]' for HIDDEN type
  actualOutput: string; // '[Hidden]' or '[Shown for sample only]'
}

export interface SubmissionDetailResponse {
  id: string;
  sessionId: string;
  questionId: string;
  questionTitle: string;
  code: string;
  languageId: number;
  language: string;
  status: SubmissionStatus;
  executionTime: number | null;
  memoryUsed: number | null;
  testCasesPassed: number;
  testCasesTotal: number;
  stdout: string | null;
  stderr: string | null;
  compileError: string | null;
  submittedAt: string;
  judgedAt: string | null;
  testCaseResults: SubmissionTestCaseResult[];
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface CodeState {
  [questionId: string]: {
    code: string;
    languageId: number;
  };
}

export type ActiveTab = 'description' | 'submissions' | 'output';

// =====================================================
// MONACO EDITOR TYPES
// =====================================================

export type MonacoLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'php'
  | 'kotlin'
  | 'swift'
  | 'scala';

export const MONACO_LANGUAGE_MAP: Record<string, MonacoLanguage> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  ruby: 'ruby',
  php: 'php',
  kotlin: 'kotlin',
  swift: 'swift',
  scala: 'scala',
};

// =====================================================
// JUDGE0 LANGUAGE ID MAPPING
// Matches backend: judge0.types.ts SUPPORTED_LANGUAGES
// =====================================================

export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  python3: 71,
  javascript: 63,
  nodejs: 63,
  java: 62,
  cpp: 54,
  'c++': 54,
  c: 50,
  csharp: 51,
  'c#': 51,
  go: 60,
  golang: 60,
  rust: 73,
  ruby: 72,
  swift: 83,
  kotlin: 78,
  typescript: 74,
  php: 68,
  scala: 81,
  r: 80,
};

// Reverse mapping: Judge0 ID to language key
export const JUDGE0_ID_TO_LANGUAGE: Record<number, string> = {
  71: 'python',
  63: 'javascript',
  62: 'java',
  54: 'cpp',
  50: 'c',
  51: 'csharp',
  60: 'go',
  73: 'rust',
  72: 'ruby',
  83: 'swift',
  78: 'kotlin',
  74: 'typescript',
  68: 'php',
  81: 'scala',
  80: 'r',
};

// Language display names (matches backend getLanguageName helper)
export const LANGUAGE_DISPLAY_NAMES: Record<number, string> = {
  50: 'C (GCC 9.2.0)',
  54: 'C++ (GCC 9.2.0)',
  62: 'Java (OpenJDK 13.0.1)',
  63: 'JavaScript (Node.js 12.14.0)',
  71: 'Python (3.8.1)',
  60: 'Go (1.13.5)',
  73: 'Rust (1.40.0)',
  51: 'C# (Mono 6.6.0.161)',
  72: 'Ruby (2.7.0)',
  83: 'Swift (5.2.3)',
  78: 'Kotlin (1.3.70)',
  74: 'TypeScript (3.7.4)',
  68: 'PHP (7.4.1)',
  81: 'Scala (2.13.2)',
  80: 'R (4.0.0)',
};
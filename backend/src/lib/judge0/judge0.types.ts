// src/lib/judge0/judge0.types.ts

// =====================================================
// JUDGE0 API TYPES
// =====================================================

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  cpu_extra_time?: number;
  wall_time_limit?: number;
  memory_limit?: number;
  stack_limit?: number;
  max_processes_and_or_threads?: number;
  enable_per_process_and_thread_time_limit?: boolean;
  enable_per_process_and_thread_memory_limit?: boolean;
  max_file_size?: number;
  number_of_runs?: number;
}

export interface Judge0SubmissionResponse {
  token: string;
}

export interface Judge0Result {
  token?: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  exit_code?: number | null;
  exit_signal?: number | null;
  status: {
    id: number;
    description: string;
  };
  created_at?: string;
  finished_at?: string;
  time: string | null;
  wall_time?: string;
  memory: number | null;
}

// =====================================================
// STATUS ENUMS
// =====================================================

export enum Judge0StatusId {
  IN_QUEUE = 1,
  PROCESSING = 2,
  ACCEPTED = 3,
  WRONG_ANSWER = 4,
  TIME_LIMIT_EXCEEDED = 5,
  COMPILATION_ERROR = 6,
  RUNTIME_ERROR_SIGSEGV = 7,
  RUNTIME_ERROR_SIGXFSZ = 8,
  RUNTIME_ERROR_SIGFPE = 9,
  RUNTIME_ERROR_SIGABRT = 10,
  RUNTIME_ERROR_NZEC = 11,
  RUNTIME_ERROR_OTHER = 12,
  INTERNAL_ERROR = 13,
  EXEC_FORMAT_ERROR = 14,
}

export type SubmissionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR';

export const mapJudge0StatusToSubmissionStatus = (statusId: number): SubmissionStatus => {
  switch (statusId) {
    case Judge0StatusId.IN_QUEUE:
    case Judge0StatusId.PROCESSING:
      return 'PENDING';
    case Judge0StatusId.ACCEPTED:
      return 'ACCEPTED';
    case Judge0StatusId.WRONG_ANSWER:
      return 'WRONG_ANSWER';
    case Judge0StatusId.TIME_LIMIT_EXCEEDED:
      return 'TIME_LIMIT_EXCEEDED';
    case Judge0StatusId.COMPILATION_ERROR:
      return 'COMPILATION_ERROR';
    default:
      return 'RUNTIME_ERROR';
  }
};

// =====================================================
// EXECUTION TYPES
// =====================================================

export interface CodeExecutionRequest {
  code: string;
  language: string;
  stdin?: string;
  expectedOutput?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface CodeExecutionResult {
  success: boolean;
  status: string;
  statusId: number;
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  executionTime: string;
  memoryUsed: number;
  isCorrect?: boolean;
  error?: string;
}

export interface TestCaseExecutionResult {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  isCorrect: boolean;
  status: string;
  statusId: number;
  executionTime: string;
  memoryUsed: number;
  error?: string;
}

export interface BatchExecutionResult {
  questionId: string;
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  results: TestCaseExecutionResult[];
  overallStatus: 'PASSED' | 'PARTIALLY_PASSED' | 'FAILED' | 'ERROR';
  totalExecutionTime: number;
  averageMemory: number;
}

// =====================================================
// CONFIGURATION
// =====================================================

export interface Judge0Config {
  rapidApiKey?: string;
  rapidApiHost?: string;
  rapidApiUrl?: string;
  selfHostedUrl?: string;
  selfHostedApiKey?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}
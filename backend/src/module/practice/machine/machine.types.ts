import { DifficultyLevel, SubmissionStatus } from '@prisma/client';

export interface CreateMachineSessionDto {
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  timeLimit: number;
  tags?: string[];
}

export interface RunCodeDto {
  code: string;
  languageId: number;
  customInput?: string;
}

export interface SubmitCodeDto {
  code: string;
  languageId: number;
}

export interface SessionListFilters {
  page: number;
  limit: number;
  status?: 'all' | 'completed' | 'in_progress' | 'expired';
  difficulty?: DifficultyLevel;
}

export interface TestCaseResult {
  testCaseId?: string;
  testCaseNumber?: number;
  type?: 'SAMPLE' | 'HIDDEN';
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  status: 'PASSED' | 'FAILED' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED';
  executionTime: number | null;
  memoryUsed: number | null;
  stderr?: string | null;
}

export interface CodeExecutionResult {
  sessionId: string;
  questionId: string;
  executionType: 'sample_test_cases' | 'custom_input';
  results?: TestCaseResult[];
  result?: {
    input: string;
    output: string;
    executionTime: number;
    memoryUsed: number;
    status: string;
  };
  summary?: {
    totalTestCases: number;
    passed: number;
    failed: number;
    averageExecutionTime?: number;
    maxMemoryUsed?: number;
  };
  compilationStatus: 'SUCCESS' | 'COMPILATION_ERROR';
  compileOutput: string | null;
}

export interface SubmissionResult {
  submissionId: string;
  sessionId: string;
  questionId: string;
  status: SubmissionStatus;
  testCasesPassed: number;
  testCasesTotal: number;
  executionTime: number | null;
  memoryUsed: number | null;
  submittedAt: Date;
  judgedAt: Date;
  isSolved: boolean;
  score: number;
  message: string;
  failedTestCase?: {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    message: string;
  };
}

export interface QuestionProgress {
  id: string;
  sessionQuestionId: string;
  order: number;
  title: string;
  difficulty: DifficultyLevel;
  tags: string[];
  isSolved: boolean;
  submissionCount: number;
  bestSubmission: {
    status: string;
    executionTime?: number;
    memoryUsed?: number;
    testCasesPassed?: number;
    testCasesTotal?: number;
    submittedAt: Date;
  } | null;
}
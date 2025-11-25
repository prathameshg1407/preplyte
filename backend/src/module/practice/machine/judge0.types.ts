// src/modules/practice/machine/judge0.types.ts

// =====================================================
// JUDGE0 API TYPES (RapidAPI)
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
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  exit_code: number | null;
  exit_signal: number | null;
  status: {
    id: number;
    description: string;
  };
  created_at: string;
  finished_at: string;
  time: string;
  wall_time: string;
  memory: number;
}

export interface Judge0Language {
  id: number;
  name: string;
}

export interface Judge0Status {
  id: number;
  description: string;
}

// Status IDs from Judge0
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

// Map Judge0 status to our SubmissionStatus enum
export const mapJudge0StatusToSubmissionStatus = (
  statusId: number
): 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR' => {
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
    case Judge0StatusId.RUNTIME_ERROR_SIGSEGV:
    case Judge0StatusId.RUNTIME_ERROR_SIGXFSZ:
    case Judge0StatusId.RUNTIME_ERROR_SIGFPE:
    case Judge0StatusId.RUNTIME_ERROR_SIGABRT:
    case Judge0StatusId.RUNTIME_ERROR_NZEC:
    case Judge0StatusId.RUNTIME_ERROR_OTHER:
    case Judge0StatusId.INTERNAL_ERROR:
    case Judge0StatusId.EXEC_FORMAT_ERROR:
      return 'RUNTIME_ERROR';
    default:
      return 'RUNTIME_ERROR';
  }
};

// =====================================================
// LANGUAGE MAPPING
// =====================================================

export const SUPPORTED_LANGUAGES: Record<string, Judge0Language> = {
  python: { id: 71, name: 'Python (3.8.1)' },
  python3: { id: 71, name: 'Python (3.8.1)' },
  javascript: { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  nodejs: { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  java: { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  cpp: { id: 54, name: 'C++ (GCC 9.2.0)' },
  'c++': { id: 54, name: 'C++ (GCC 9.2.0)' },
  c: { id: 50, name: 'C (GCC 9.2.0)' },
  csharp: { id: 51, name: 'C# (Mono 6.6.0.161)' },
  'c#': { id: 51, name: 'C# (Mono 6.6.0.161)' },
  go: { id: 60, name: 'Go (1.13.5)' },
  golang: { id: 60, name: 'Go (1.13.5)' },
  rust: { id: 73, name: 'Rust (1.40.0)' },
  ruby: { id: 72, name: 'Ruby (2.7.0)' },
  swift: { id: 83, name: 'Swift (5.2.3)' },
  kotlin: { id: 78, name: 'Kotlin (1.3.70)' },
  typescript: { id: 74, name: 'TypeScript (3.7.4)' },
  php: { id: 68, name: 'PHP (7.4.1)' },
  scala: { id: 81, name: 'Scala (2.13.2)' },
  r: { id: 80, name: 'R (4.0.0)' },
};

// Get Monaco editor language ID
export const getMonacoLanguageId = (language: string): string => {
  const langMap: Record<string, string> = {
    python: 'python',
    python3: 'python',
    javascript: 'javascript',
    nodejs: 'javascript',
    java: 'java',
    cpp: 'cpp',
    'c++': 'cpp',
    c: 'c',
    csharp: 'csharp',
    'c#': 'csharp',
    go: 'go',
    golang: 'go',
    rust: 'rust',
    ruby: 'ruby',
    swift: 'swift',
    kotlin: 'kotlin',
    typescript: 'typescript',
    php: 'php',
    scala: 'scala',
    r: 'r',
  };

  return langMap[language.toLowerCase()] || 'plaintext';
};

// =====================================================
// CODE EXECUTION TYPES
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
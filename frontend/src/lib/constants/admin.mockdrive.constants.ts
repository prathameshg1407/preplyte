// src/lib/constants/mockdrive.constants.ts

import {
  MockDriveStatus,
  MockDriveModuleType,
  MockDriveBatchStatus,
  MockDriveRegistrationStatus,
  MockDriveAttemptStatus,
  ProctoringSettings,
  AptitudeModuleConfig,
  MachineCodingModuleConfig,
  AiInterviewModuleConfig,
  DifficultyLevel,
  QuestionType,
  AiInterviewDifficulty,
} from '@/types/admin.mockdrive.types';

// ============================================
// Status Configuration
// ============================================

export const MOCK_DRIVE_STATUS_CONFIG: Record<
  MockDriveStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    icon: string;
  }
> = {
  [MockDriveStatus.DRAFT]: {
    label: 'Draft',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: 'Mock drive is being configured',
    icon: 'FileEdit',
  },
  [MockDriveStatus.PUBLISHED]: {
    label: 'Published',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'Mock drive is published and ready',
    icon: 'Globe',
  },
  [MockDriveStatus.REGISTRATION_OPEN]: {
    label: 'Registration Open',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: 'Students can register',
    icon: 'UserPlus',
  },
  [MockDriveStatus.REGISTRATION_CLOSED]: {
    label: 'Registration Closed',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    description: 'Registration period has ended',
    icon: 'UserX',
  },
  [MockDriveStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    description: 'Mock drive is currently running',
    icon: 'PlayCircle',
  },
  [MockDriveStatus.COMPLETED]: {
    label: 'Completed',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    description: 'Mock drive has finished',
    icon: 'CheckCircle',
  },
  [MockDriveStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    description: 'Mock drive was cancelled',
    icon: 'XCircle',
  },
};

export const BATCH_STATUS_CONFIG: Record<
  MockDriveBatchStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }
> = {
  [MockDriveBatchStatus.CREATED]: {
    label: 'Created',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: 'Batch has been created',
  },
  [MockDriveBatchStatus.SCHEDULED]: {
    label: 'Scheduled',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'Batch is scheduled',
  },
  [MockDriveBatchStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    description: 'Batch is currently active',
  },
  [MockDriveBatchStatus.COMPLETED]: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: 'Batch has been completed',
  },
  [MockDriveBatchStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    description: 'Batch has been cancelled',
  },
};

export const REGISTRATION_STATUS_CONFIG: Record<
  MockDriveRegistrationStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }
> = {
  [MockDriveRegistrationStatus.PENDING]: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    description: 'Awaiting review',
  },
  [MockDriveRegistrationStatus.APPROVED]: {
    label: 'Approved',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: 'Registration approved',
  },
  [MockDriveRegistrationStatus.REJECTED]: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    description: 'Registration rejected',
  },
  [MockDriveRegistrationStatus.WITHDRAWN]: {
    label: 'Withdrawn',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: 'Student withdrew',
  },
};

export const ATTEMPT_STATUS_CONFIG: Record<
  MockDriveAttemptStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }
> = {
  [MockDriveAttemptStatus.NOT_STARTED]: {
    label: 'Not Started',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: 'Attempt has not started',
  },
  [MockDriveAttemptStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'Currently attempting',
  },
  [MockDriveAttemptStatus.COMPLETED]: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: 'Attempt completed',
  },
  [MockDriveAttemptStatus.TIMED_OUT]: {
    label: 'Timed Out',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    description: 'Time limit exceeded',
  },
  [MockDriveAttemptStatus.ABANDONED]: {
    label: 'Abandoned',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    description: 'Attempt was abandoned',
  },
};

// ============================================
// Module Type Configuration
// ============================================

export const MODULE_TYPE_CONFIG: Record<
  MockDriveModuleType,
  {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  [MockDriveModuleType.APTITUDE]: {
    label: 'Aptitude Test',
    icon: 'Brain',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Multiple choice questions testing logical and analytical skills',
  },
  [MockDriveModuleType.MACHINE_CODING]: {
    label: 'Machine Coding',
    icon: 'Code',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Programming problems with automated test case evaluation',
  },
  [MockDriveModuleType.AI_INTERVIEW]: {
    label: 'AI Interview',
    icon: 'MessageSquare',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'AI-powered interview simulation based on resume',
  },
};

// ============================================
// Difficulty Configuration
// ============================================

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  {
    label: string;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  [DifficultyLevel.EASY]: {
    label: 'Easy',
    color: 'bg-green-500',
    bgColor: 'bg-green-100',
    description: 'Basic level questions suitable for beginners',
  },
  [DifficultyLevel.MEDIUM]: {
    label: 'Medium',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-100',
    description: 'Intermediate level questions with moderate complexity',
  },
  [DifficultyLevel.HARD]: {
    label: 'Hard',
    color: 'bg-red-500',
    bgColor: 'bg-red-100',
    description: 'Advanced level questions requiring deep understanding',
  },
};

// ============================================
// Question Type Configuration
// ============================================

export const QUESTION_TYPE_CONFIG: Record<
  QuestionType,
  {
    label: string;
    description: string;
    icon: string;
  }
> = {
  [QuestionType.QUANTITATIVE]: {
    label: 'Quantitative',
    description: 'Mathematical and numerical reasoning',
    icon: 'Calculator',
  },
  [QuestionType.VERBAL]: {
    label: 'Verbal',
    description: 'Language and comprehension skills',
    icon: 'BookOpen',
  },
  [QuestionType.LOGICAL]: {
    label: 'Logical',
    description: 'Pattern recognition and logical reasoning',
    icon: 'Puzzle',
  },
};

// ============================================
// AI Interview Difficulty Configuration
// ============================================

export const AI_INTERVIEW_DIFFICULTY_CONFIG: Record<
  AiInterviewDifficulty,
  {
    label: string;
    description: string;
    yearsOfExperience: string;
  }
> = {
  [AiInterviewDifficulty.ENTRY]: {
    label: 'Entry Level',
    description: 'For freshers and entry-level positions',
    yearsOfExperience: '0-1 years',
  },
  [AiInterviewDifficulty.MID]: {
    label: 'Mid Level',
    description: 'For 2-5 years experience',
    yearsOfExperience: '2-5 years',
  },
  [AiInterviewDifficulty.SENIOR]: {
    label: 'Senior Level',
    description: 'For 5+ years experience',
    yearsOfExperience: '5-8 years',
  },
  [AiInterviewDifficulty.LEAD]: {
    label: 'Lead Level',
    description: 'For leadership and architect roles',
    yearsOfExperience: '8+ years',
  },
};

// ============================================
// Supported Programming Languages
// ============================================

export const SUPPORTED_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C',
  'C#',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Scala',
  'R',
  'MATLAB',
  'SQL',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ============================================
// Default Configurations
// ============================================

export const DEFAULT_PROCTORING_SETTINGS: ProctoringSettings = {
  detectTabSwitch: true,
  maxTabSwitches: 0,
  requireFullscreen: false,
  detectCopyPaste: true,
  webcamRequired: false,
  screenshareRequired: false,
  textSelectionDisabled: true,
  rightClickDisabled: true,
  autoSubmitOnViolation: true,
};

export const DEFAULT_APTITUDE_CONFIG: AptitudeModuleConfig = {
  difficulty: DifficultyLevel.MEDIUM,
  questionTypes: [QuestionType.QUANTITATIVE, QuestionType.LOGICAL],
  numberOfQuestions: 30,
  marksPerQuestion: 1,
  negativeMarking: 0.25,
};

export const DEFAULT_MACHINE_CODING_CONFIG: MachineCodingModuleConfig = {
  difficulty: DifficultyLevel.MEDIUM,
  numberOfQuestions: 2,
  allowedLanguages: ['JavaScript', 'Python', 'Java', 'C++'],
  partialScoring: true,
  maxScorePerQuestion: 100,
};

export const DEFAULT_AI_INTERVIEW_CONFIG: AiInterviewModuleConfig = {
  difficulty: AiInterviewDifficulty.MID,
  jobTitle: 'Software Engineer',
  companyName: null,
  focusAreas: ['Technical Skills', 'Problem Solving'],
  targetQuestions: 10,
};

// ============================================
// Validation Constants
// ============================================

export const VALIDATION = {
  TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 200,
  },
  DESCRIPTION: {
    MAX_LENGTH: 5000,
  },
  INSTRUCTIONS: {
    MAX_LENGTH: 10000,
  },
  APTITUDE: {
    MIN_QUESTIONS: 5,
    MAX_QUESTIONS: 100,
    MIN_MARKS: 0.5,
    MAX_MARKS: 10,
    MAX_NEGATIVE: 5,
  },
  MACHINE_CODING: {
    MIN_QUESTIONS: 1,
    MAX_QUESTIONS: 10,
    MIN_SCORE: 10,
    MAX_SCORE: 1000,
  },
  AI_INTERVIEW: {
    MIN_QUESTIONS: 5,
    MAX_QUESTIONS: 20,
    MIN_FOCUS_AREAS: 1,
    MAX_FOCUS_AREAS: 10,
  },
  MODULE: {
    MIN_TIME_LIMIT: 5,
    MAX_TIME_LIMIT: 300,
    MIN_WEIGHTAGE: 0,
    MAX_WEIGHTAGE: 100,
    MIN_PASSING_SCORE: 0,
    MAX_PASSING_SCORE: 100,
  },
  CGPA: {
    MIN: 0,
    MAX: 10,
  },
  MARKS: {
    MIN: 0,
    MAX: 100,
  },
  BACKLOGS: {
    MIN: 0,
    MAX: 20,
  },
} as const;

// ============================================
// Pagination Defaults
// ============================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// ============================================
// Wizard Steps
// ============================================

export const WIZARD_STEPS = [
  { id: 0, title: 'Basic Info', description: 'Title and description' },
  { id: 1, title: 'Schedule', description: 'Dates and registration' },
  { id: 2, title: 'Eligibility', description: 'Student criteria' },
  { id: 3, title: 'Modules', description: 'Test rounds' },
  { id: 4, title: 'Review', description: 'Review and create' },
] as const;

// ============================================
// Options for Select Fields
// ============================================

export const DEPARTMENT_OPTIONS = [
  'Computer Science',
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Aerospace Engineering',
  'Data Science',
  'Artificial Intelligence',
] as const;

export const COURSE_YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Post Graduate',
] as const;

export const SKILL_OPTIONS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Express.js',
  'Django',
  'Flask',
  'Spring Boot',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'Machine Learning',
  'Deep Learning',
  'Data Structures',
  'Algorithms',
  'System Design',
  'REST APIs',
  'GraphQL',
  'Microservices',
] as const;

// ============================================
// Module Limits
// ============================================

export const MODULE_LIMITS = {
  maxModules: 10,
  minTimeLimit: 5,
  maxTimeLimit: 300,
  minPassingScore: 0,
  maxPassingScore: 100,
} as const;

// ============================================
// Registration Limits
// ============================================

export const REGISTRATION_LIMITS = {
  minRegistrations: 1,
  maxRegistrations: 100000,
  bulkOperationLimit: 100,
} as const;

// ============================================
// Batch Limits
// ============================================

export const BATCH_LIMITS = {
  minCapacity: 1,
  maxCapacity: 10000,
  minIntervalMinutes: 30,
  maxIntervalMinutes: 1440,
  minBatchSize: 1,
  maxBatchSize: 500,
} as const;

// ============================================
// Time Constants
// ============================================

export const TIME_CONSTANTS = {
  STALE_TIME: {
    SHORT: 30 * 1000, // 30 seconds
    MEDIUM: 60 * 1000, // 1 minute
    LONG: 5 * 60 * 1000, // 5 minutes
  },
  REFETCH_INTERVAL: {
    LIVE: 10 * 1000, // 10 seconds for live data
    NORMAL: 60 * 1000, // 1 minute
  },
} as const;
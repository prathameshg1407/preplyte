// src/module/mock-drive/shared/mockdrive.shared-types.ts

import {
  MockDriveStatus,
  MockDriveModuleType,
  MockDriveAttemptStatus,
  MockDriveModuleAttemptStatus,
  MockDriveRegistrationStatus,
  DifficultyLevel,
  QuestionType,
  AiInterviewDifficulty,
  AiInterviewQuestionCategory,
  SubmissionStatus,
} from '@prisma/client';

// ============================================
// Module Configuration Types
// ============================================

export interface AptitudeModuleConfig {
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  marksPerQuestion: number;
  negativeMarking: number;
  passingPercentage?: number;
}

export interface MachineModuleConfig {
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  allowedLanguages: string[];
  partialScoring: boolean;
  maxScorePerQuestion: number;
  passingScore?: number;
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
export interface AptitudeQuestionOption {
  id: string;
  content: string;
}

export interface AptitudeQuestionAttempt {
  questionId: string;
  aptitudeQuestionId: string;
  content: string;
  options: AptitudeQuestionOption[];
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
  title: string;
  description: string;
  defaultCode: string;
  displayOrder: number;
  submissions: MachineSubmissionData[];
  bestSubmissionId: string | null;
  bestScore: number;
  isSolved: boolean;
  testCases: TestCaseAttempt[]; // Sample test cases for display
}

export interface TestCaseAttempt {
  input: string;
  expectedOutput: string;
}

export interface MachineModuleSummary {
  totalQuestions: number;
  totalSolved: number;
  totalPartial: number;
  totalUnattempted: number;
  totalScore: number;
  maxScore: number;
}

export interface MachineModuleData {
  questions: MachineQuestionAttempt[];
  summary?: MachineModuleSummary;
  _runResult?: {
    stdout: string | null;
    stderr: string | null;
    executionTime: number | null;
  };
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
  isVoiceEnabled?: boolean;
  pendingTranscription?: string;
}

export type ModuleData = AptitudeModuleData | MachineModuleData | AiInterviewModuleData;

// ============================================
// Attempt State Types
// ============================================

export interface ModuleAttemptState {
  moduleId: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string | null;
  status: MockDriveModuleAttemptStatus;
  timeLimit: number;
  startedAt: Date | null;
  expiresAt: Date | null;
  timeSpentSeconds: number;
}

export interface AttemptState {
  attemptId: string;
  status: MockDriveAttemptStatus;
  currentModuleOrder: number;
  startedAt: Date | null;
  modules: ModuleAttemptState[];
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
  startedAt: Date | null;
  expiresAt: Date | null;
  timeRemainingSeconds: number;
  config: ModuleConfig;
  data: ModuleData | null;
}

// ============================================
// Eligibility Types
// ============================================

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
  failedCriteria: string[];
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

// ============================================
// API Response Types
// ============================================

export interface MockDriveListItem {
  id: string;
  title: string;
  description: string | null;
  status: MockDriveStatus;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  driveStartDate: Date | null;
  driveEndDate: Date | null;
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
    scheduledStartTime: Date;
    scheduledEndTime: Date;
  } | null;
}

export interface MockDriveDetail extends Omit<MockDriveListItem, 'moduleCount'> {
  instructions: string | null;
  modules: {
    id: string;
    moduleType: MockDriveModuleType;
    order: number;
    name: string | null;
    timeLimit: number;
    weightage: number;
    instructions: string | null;
  }[];
  eligibilityCriteria: {
    minCgpa: number | null;
    maxCgpa: number | null;
    minMarks10: number | null;
    minMarks12: number | null;
    allowedDepartmentIds: string[];
    allowedCourseYears: string[];
    requiredSkills: string[];
    maxBacklogs: number | null;
  } | null;
  totalTimeLimit: number;
}
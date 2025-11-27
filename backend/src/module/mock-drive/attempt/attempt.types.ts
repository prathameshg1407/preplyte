// src/module/mock-drive/attempt/attempt.types.ts

import {
  MockDriveAttemptStatus,
  MockDriveModuleAttemptStatus,
  MockDriveModuleType,
} from '@prisma/client';
import {
  AttemptState,
  CurrentModuleState,
  ModuleData,
  ModuleConfig,
} from '../shared';

// ============================================
// Response Types
// ============================================

export interface StartAttemptResponse {
  attemptId: string;
  status: MockDriveAttemptStatus;
  currentModule: CurrentModuleState | null;
  modules: AttemptState['modules'];
}

export interface GetAttemptResponse {
  attempt: AttemptState;
  currentModule: CurrentModuleState | null;
}

export interface StartModuleResponse {
  moduleAttemptId: string;
  status: MockDriveModuleAttemptStatus;
  startedAt: Date;
  expiresAt: Date;
  timeRemainingSeconds: number;
  moduleType: MockDriveModuleType;
  config: ModuleConfig;
  data: Partial<ModuleData>;
  instructions: string | null;
}

export interface ModuleActionResponse {
  success: boolean;
  updatedData: Partial<ModuleData>;
  timeRemainingSeconds: number;
  message?: string;
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

export interface CompleteAttemptResponse {
  attemptId: string;
  status: MockDriveAttemptStatus;
  totalScore: number;
  percentageScore: number;
  completedAt: Date;
  moduleScores: ModuleScoreSummary[];
}

export interface ModuleScoreSummary {
  moduleId: string;
  moduleName: string | null;
  moduleType: MockDriveModuleType;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
}

// ============================================
// Payload Types
// ============================================

export interface AptitudeAnswerPayload {
  questionId: string;
  selectedOptionId: string;
  timeSpent?: number;
}

export interface AptitudeClearPayload {
  questionId: string;
}

export interface AptitudeMarkReviewPayload {
  questionId: string;
  isMarked: boolean;
}

export interface MachineSubmitPayload {
  questionId: string;
  code: string;
  languageId: number;
}

export interface MachineRunPayload {
  questionId: string;
  code: string;
  languageId: number;
  customInput?: string;
}

export interface InterviewRespondPayload {
  answer: string;
  timeTaken?: number;
  audioBuffer?: string;
}

export interface InterviewSkipPayload {
  reason?: string;
}

export interface InterviewAudioChunkPayload {
  chunk: string;
  isFinal: boolean;
}

// ============================================
// Internal Types
// ============================================

export interface LeaderboardUpdateData {
  totalScore: number;
  percentageScore: number;
  moduleScores: ModuleScoreSummary[];
  completedAt: Date;
}
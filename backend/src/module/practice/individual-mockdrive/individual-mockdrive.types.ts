// src/module/practice/individual-mockdrive/individual-mockdrive.types.ts

import {
  MockDriveModuleType,
  DifficultyLevel,
  QuestionType,
  AiInterviewDifficulty,
  MockDriveAttemptStatus,
  MockDriveModuleAttemptStatus
} from '@prisma/client';

// ============================================
// Module Configuration Types (Simplified)
// ============================================

export interface AptitudeModuleConfig {
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
}

export interface MachineCodingModuleConfig {
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
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
// Request DTOs
// ============================================

export interface CreateIndividualMockDriveDTO {
  title: string;
  description?: string | null;
  modules: {
    moduleType: MockDriveModuleType;
    order: number;
    name?: string | null;
    timeLimit: number;
    config: ModuleConfig;
  }[];
}

export interface UpdateIndividualMockDriveDTO {
  title?: string;
  description?: string | null;
  isActive?: boolean;
}

// ============================================
// Response Types
// ============================================

export interface IndividualMockDriveListItem {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    modules: number;
    attempts: number;
  };
}

export interface IndividualMockDriveDetails extends IndividualMockDriveListItem {
  modules: {
    id: string;
    moduleType: MockDriveModuleType;
    order: number;
    name: string | null;
    timeLimit: number;
    config: any;
  }[];
}

export interface IndividualMockDriveAttemptListItem {
  id: string;
  mockDriveId: string;
  status: MockDriveAttemptStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  totalScore: number | null;
  percentageScore: number | null;
  createdAt: Date;
  mockDrive: {
    title: string;
    _count?: {
      modules: number;
    };
  };
  moduleAttempts?: Array<{
    id: string;
    status: MockDriveModuleAttemptStatus;
    score: number | null;
    maxScore: number | null;
    percentage: number | null;
    module: {
      order: number;
      name: string | null;
      moduleType: MockDriveModuleType;
    };
  }>;
}

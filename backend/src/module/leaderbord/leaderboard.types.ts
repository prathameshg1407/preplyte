// src/module/leaderboard/leaderboard.types.ts

import { LEADERBOARD_CATEGORIES, LEADERBOARD_SCOPES } from './leaderboard.constants';

// =====================================================
// ENUMS & LITERALS
// =====================================================

export type LeaderboardCategory = (typeof LEADERBOARD_CATEGORIES)[number];
export type LeaderboardScope = (typeof LEADERBOARD_SCOPES)[number];

// =====================================================
// REQUEST TYPES
// =====================================================

export interface LeaderboardQuery {
  scope?: LeaderboardScope;
  category?: LeaderboardCategory;
  page?: number;
  limit?: number;
}

export interface LeaderboardFilters {
  scope: LeaderboardScope;
  category: LeaderboardCategory;
  page: number;
  limit: number;
  userId: string;
  instituteId: string | null;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  profilePictureUrl: string | null;
  instituteName: string | null;
  departmentName: string | null;
  score: number;
  scoreUnit: string;
  isCurrentUser: boolean;
}

export interface LeaderboardPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CurrentUserRank {
  rank: number | null;
  score: number;
  totalParticipants: number;
  percentile: number | null;
  scoreBreakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  lms: number;
  aptitude: number;
  coding: number;
  aiInterview: number;
  mockDrive: number;
  overall: number;
}

export interface LeaderboardResponse {
  category: LeaderboardCategory;
  categoryLabel: string;
  scoreUnit: string;
  scope: LeaderboardScope;
  entries: LeaderboardEntry[];
  pagination: LeaderboardPagination;
  currentUser: CurrentUserRank;
  lastUpdated: Date;
}

export interface LeaderboardConfigResponse {
  categories: Array<{
    value: LeaderboardCategory;
    label: string;
    description: string;
    unit: string;
  }>;
  scopes: Array<{
    value: LeaderboardScope;
    label: string;
    available: boolean;
  }>;
  defaultCategory: LeaderboardCategory;
  defaultScope: LeaderboardScope;
}

// =====================================================
// INTERNAL TYPES
// =====================================================

export interface UserScore {
  userId: string;
  score: number;
}

export interface UserScoreWithDetails extends UserScore {
  userName: string;
  profilePictureUrl: string | null;
  instituteName: string | null;
  departmentName: string | null;
}

export interface UserDetails {
  userName: string;
  profilePictureUrl: string | null;
  instituteName: string | null;
  departmentName: string | null;
}

// =====================================================
// DETAILED STATS TYPES
// =====================================================

export interface LmsStats {
  coursesCompleted: number;
  totalPointsEarned: number;
}

export interface AptitudeStats {
  sessionsCompleted: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
}

export interface CodingStats {
  sessionsCompleted: number;
  totalSolved: number;
  totalQuestions: number;
  solveRate: number;
}

export interface AiInterviewStats {
  interviewsCompleted: number;
  totalScore: number;
  averageScore: number;
}

export interface MockDriveStats {
  drivesCompleted: number;
  totalScore: number;
  averageScore: number;
}

export interface UserDetailedStats {
  breakdown: ScoreBreakdown;
  details: {
    lms: LmsStats;
    aptitude: AptitudeStats;
    coding: CodingStats;
    aiInterview: AiInterviewStats;
    mockDrive: MockDriveStats;
  };
}
// src/types/leaderboard.types.ts

// =====================================================
// ENUMS & LITERALS
// =====================================================

export type LeaderboardCategory =
  | 'overall'
  | 'lms'
  | 'aptitude'
  | 'coding'
  | 'ai_interview'
  | 'mock_drive';

export type LeaderboardScope = 'global' | 'institute';

// =====================================================
// REQUEST TYPES
// =====================================================

export interface LeaderboardQuery {
  scope?: LeaderboardScope;
  category?: LeaderboardCategory;
  page?: number;
  limit?: number;
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

export interface ScoreBreakdown {
  lms: number;
  aptitude: number;
  coding: number;
  aiInterview: number;
  mockDrive: number;
  overall: number;
}

export interface CurrentUserRank {
  rank: number | null;
  score: number;
  totalParticipants: number;
  percentile: number | null;
  scoreBreakdown: ScoreBreakdown;
}

export interface LeaderboardResponse {
  category: LeaderboardCategory;
  categoryLabel: string;
  scoreUnit: string;
  scope: LeaderboardScope;
  entries: LeaderboardEntry[];
  pagination: LeaderboardPagination;
  currentUser: CurrentUserRank;
  lastUpdated: string;
}

export interface CategoryOption {
  value: LeaderboardCategory;
  label: string;
  description: string;
  unit: string;
}

export interface ScopeOption {
  value: LeaderboardScope;
  label: string;
  available: boolean;
}

export interface LeaderboardConfigResponse {
  categories: CategoryOption[];
  scopes: ScopeOption[];
  defaultCategory: LeaderboardCategory;
  defaultScope: LeaderboardScope;
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

// =====================================================
// UI STATE TYPES
// =====================================================

export interface LeaderboardFilters {
  scope: LeaderboardScope;
  category: LeaderboardCategory;
  page: number;
  limit: number;
}
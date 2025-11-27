// src/types/aiInterview.types.ts

// ============= Enums (match Prisma/Backend) =============

export enum AiInterviewQuestionCategory {
  INTRODUCTORY = "INTRODUCTORY",
  TECHNICAL = "TECHNICAL",
  BEHAVIORAL = "BEHAVIORAL",
  SITUATIONAL = "SITUATIONAL",
  CLOSING = "CLOSING",
}

export enum AiInterviewSessionStatus {
  STARTED = "STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ============= Core Types =============

export interface QuestionItem {
  id?: string;
  text: string;
  category: AiInterviewQuestionCategory;
  audioUrl?: string;
  isFollowUp?: boolean;
  transition?: string;
}

export interface Progress {
  questionNumber: number;
  estimatedTotal: number;
  topicsCovered: string[];
  percentComplete: number;
}

export interface AnswerScore {
  contentScore: number;
  clarityScore: number;
  relevanceScore: number;
  depthScore: number;
  overallScore: number;
  feedback: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  feedback: string;
}

// ============= Request DTOs =============

export interface StartInterviewRequest {
  resumeId?: number;
  jobTitle?: string;
  companyName?: string;
  difficulty?: "entry" | "mid" | "senior" | "lead";
  focusAreas?: string[];
}

export interface SubmitResponseDto {
  transcript?: string;
  audioBlob?: string;
}

export interface GetSessionsParams {
  page?: number;
  limit?: number;
}

// ============= Response DTOs =============

export interface SessionResponse {
  sessionId: string;
  status: "active" | "completed";
  currentQuestion: QuestionItem;
  progress: Progress;
  context: {
    jobTitle: string;
    companyName?: string;
  };
}

export interface SubmitResponseResult {
  responseReceived: {
    id: string;
    transcript: string;
    scores: AnswerScore;
  };
  nextQuestion?: QuestionItem & {
    isFollowUp: boolean;
    transition?: string;
  };
  isComplete: boolean;
  progress: Progress;
}

export interface FeedbackResponse {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  categoryScores: CategoryScore[];
  recommendations: string[];
}

export interface SessionSummary {
  id: string;
  jobTitle: string;
  companyName?: string;
  status: AiInterviewSessionStatus;
  questionsAnswered: number;
  overallScore?: number;
  createdAt: string;
  completedAt?: string;
}

export interface PaginatedSessionsResponse {
  sessions: SessionSummary[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  topCategories: { category: string; count: number }[];
}

// ============= UI State Types =============

export type InterviewPhase = "start" | "interview" | "results";

export type InterviewUIStatus =
  | "INITIALIZING"
  | "AI_SPEAKING"
  | "USER_LISTENING"
  | "PROCESSING_ANSWER"
  | "ENDED"
  | "ERROR";

export interface TranscriptMessage {
  id: string;
  speaker: "AI" | "USER";
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface InterviewConfig {
  jobTitle: string;
  companyName?: string;
  resumeId?: number;
  difficulty?: "entry" | "mid" | "senior" | "lead";
}

// ============= API Response Wrapper =============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============= Legacy Types (for backwards compatibility) =============

/** @deprecated Use SessionResponse instead */
export type InterviewSessionResponse = SessionResponse;

/** @deprecated Use SessionResponse instead */
export type SessionStateResponse = SessionResponse;

/** @deprecated Use SubmitResponseResult instead */
export type SubmitAnswerResponse = SubmitResponseResult;

/** @deprecated Use FeedbackResponse instead */
export type InterviewFeedbackResponse = FeedbackResponse;

/** @deprecated Use SessionSummary[] instead */
export type UserSessionSummaryDto = SessionSummary[];

/** @deprecated Use SessionStats instead */
export type UserSessionStatsResponse = SessionStats;

/** @deprecated Use InterviewUIStatus instead */
export type InterviewStatus = InterviewUIStatus;
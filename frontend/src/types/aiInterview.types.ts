// src/types/aiInterview.types.ts

// ============= Enums (match Prisma) =============

export enum AiInterviewQuestionCategory {
  INTRODUCTORY = "INTRODUCTORY",
  TECHNICAL = "TECHNICAL",
  CLOSING = "CLOSING",
}

export enum AiInterviewSessionStatus {
  STARTED = "STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ============= Request Types =============

export interface StartInterviewRequest {
  resumeId?: number;
  jobTitle?: string;
  companyName?: string;
}

export interface SubmitAnswerRequest {
  question: string;
  answer: string;
  category: AiInterviewQuestionCategory;
  questionIndex?: number;
  isTranscribed?: boolean;
  timeTakenSeconds?: number;
}

// ============= Response Types (match backend) =============

export interface QuestionItem {
  category: AiInterviewQuestionCategory;
  text: string;
}

// Matches backend InterviewSessionResponse
export interface InterviewSessionResponse {
  id: string;
  userId: string;
  status: AiInterviewSessionStatus;
  questions: QuestionItem[];
  currentQuestion: QuestionItem;
  currentQuestionIndex: number;
  totalQuestions: number;
  audioUrl?: string;
  createdAt: string;
}

// Matches backend SessionStateResponse
export interface SessionStateResponse {
  id: string;
  userId: string;
  status: AiInterviewSessionStatus;
  questions: QuestionItem[];
  currentQuestion: QuestionItem;
  currentQuestionIndex: number;
  totalQuestions: number;
  audioUrl?: string;
}

// Matches backend NextQuestionResponse
export interface NextQuestionResponse {
  question: string;
  category: AiInterviewQuestionCategory;
  index: number;
  audioUrl?: string;
  totalQuestions: number;
  isComplete: false;
}

// Matches backend QuestionCompletionResponse
export interface QuestionCompletionResponse {
  isComplete: true;
  message: string;
  audioUrl?: string;
}

// Matches backend SubmitAnswerResponse
export interface SubmitAnswerResponse {
  nextQuestion?: {
    category: AiInterviewQuestionCategory;
    text: string;
  };
  questionIndex?: number;
  totalQuestions?: number;
  isComplete: boolean;
  message?: string;
  audioUrl?: string;
}

// Matches backend ResponseScoreDto
export interface ResponseScoreDto {
  questionIndex?: number;
  contentScore: number;
  fluencyScore: number;
  relevanceScore: number;
  feedback: string;
}

// Matches backend InterviewFeedbackResponse
export interface InterviewFeedbackResponse {
  overallScore: number;
  overallSummary: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  weakSections: string[];
  perResponseScores: ResponseScoreDto[];
}

// Matches backend UserSessionSummaryDto
export interface UserSessionSummaryDto {
  id: string;
  jobTitle: string;
  companyName: string | null;
  resumeId: number | null;
  status: AiInterviewSessionStatus;
  totalQuestions: number;
  answeredQuestions: number;
  currentQuestionIndex: number;
  overallScore: number | null;
  createdAt: string;
  completedAt: string | null;
  hasFeedback: boolean;
}

// Matches backend UserSessionStatsResponse
export interface UserSessionStatsResponse {
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  highestScore?: number | null;
  lowestScore?: number | null;
}

// ============= UI State Types =============

export type InterviewPhase = "start" | "interview" | "results";

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
}

// ============= API Response Wrapper =============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}



// src/types/aiInterview.types.ts

// ... (previous code remains the same)

// Update TranscriptMessage to include id
export interface TranscriptMessage {
  id: string;
  speaker: "AI" | "USER";
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

// Rename for clarity (keep alias for backwards compatibility)
export type InterviewUIStatus =
  | "INITIALIZING"
  | "AI_SPEAKING"
  | "USER_LISTENING"
  | "PROCESSING_ANSWER"
  | "ENDED"
  | "ERROR";

// Backwards compatibility alias
export type InterviewStatus = InterviewUIStatus;
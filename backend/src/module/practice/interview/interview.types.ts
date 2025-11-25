// src/modules/interview/interview.types.ts

import { AiInterviewQuestionCategory, AiInterviewSessionStatus } from '@prisma/client';

// ============= Request Types =============

export interface StartInterviewSessionRequest {
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

// ============= Response Types =============

export interface QuestionItemDto {
  category: AiInterviewQuestionCategory;
  text: string;
}

export interface InterviewSessionResponse {
  id: string;
  userId: string;
  status: AiInterviewSessionStatus;
  questions: QuestionItemDto[];
  currentQuestion: QuestionItemDto;
  currentQuestionIndex: number;
  totalQuestions: number;
  audioUrl?: string;
  createdAt: Date;
}

export interface NextQuestionResponse {
  question: string;
  category: AiInterviewQuestionCategory;
  index: number;
  audioUrl?: string;
  totalQuestions: number;
  isComplete: false;
}

export interface QuestionCompletionResponse {
  isComplete: true;
  message: string;
  audioUrl?: string;
}

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

export interface SessionStateResponse {
  id: string;
  userId: string;
  status: AiInterviewSessionStatus;
  questions: QuestionItemDto[];
  currentQuestion: QuestionItemDto;
  currentQuestionIndex: number;
  totalQuestions: number;
  audioUrl?: string;
  responses?: ResponseSummary[];
}

export interface ResponseSummary {
  questionIndex: number;
  question: string;
  category: AiInterviewQuestionCategory;
  hasAnswer: boolean;
}

export interface ResponseScoreDto {
  questionIndex?: number;
  contentScore: number;
  fluencyScore: number;
  relevanceScore: number;
  feedback: string;
}

export interface InterviewFeedbackResponse {
  overallScore: number;
  overallSummary: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  weakSections: string[];
  perResponseScores: ResponseScoreDto[];
}

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
  createdAt: Date;
  completedAt: Date | null;
  hasFeedback: boolean;
}

export interface UserSessionStatsResponse {
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  highestScore?: number | null;
  lowestScore?: number | null;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  code?: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

// ============= Internal Types =============

export interface AnswerScore {
  contentScore: number;
  fluencyScore: number;
  relevanceScore: number;
  feedback: string;
  weakSection?: string;
}

export interface QuestionItem {
  category: AiInterviewQuestionCategory;
  text: string;
}

export interface Questions {
  questions: QuestionItem[];
}

export interface SessionContext {
  jobTitle: string;
  companyName?: string;
  resumeText?: string;
}

export interface JwtUser {
  sub: string;
  email: string;
  role?: string;
  instituteId?: string | null;
  iat?: number;
  exp?: number;
}

// ============= API Response Wrapper =============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ============= TTS Types =============

export interface TTSGenerateResult {
  url: string;
  duration?: number;
}

// ============= Groq Types =============

export interface GroqApiOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}
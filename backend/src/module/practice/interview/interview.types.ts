// interview.types.ts

import { AiInterviewQuestionCategory, AiInterviewSessionStatus } from '@prisma/client';

// =====================================================
// CORE TYPES
// =====================================================

export interface ConversationTurn {
  id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  category: AiInterviewQuestionCategory;
  timestamp: Date;
  audioUrl?: string;
  isFollowUp: boolean;
  metadata?: {
    sentiment?: 'positive' | 'neutral' | 'negative';
    confidence?: number;
    topics?: string[];
    timeTakenSeconds?: number;
  };
}

export interface SessionContext {
  jobTitle: string;
  companyName?: string;
  resumeText?: string;
  difficulty: 'entry' | 'mid' | 'senior' | 'lead';
}

export interface QuestionItem {
  category: AiInterviewQuestionCategory;
  text: string;
}

export interface LiveSessionState {
  sessionId: string;
  userId: string;
  context: SessionContext;
  conversationHistory: ConversationTurn[];
  currentQuestion: QuestionItem;
  currentIsFollowUp: boolean;
  currentTopic: InterviewTopic;
  topicDepth: number;
  coveredTopics: Set<string>;
  questionCount: number;
  startedAt: Date;
  lastActivityAt: Date;
  lastAnalysis?: ResponseAnalysis | null;
}

export interface ResponseAnalysis {
  quality: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'off_topic';
  keyPoints: string[];
  missingPoints: string[];
  followUpOpportunities: string[];
  scores: {
    content: number;
    relevance: number;
    depth: number;
    clarity: number;
  };
  shouldFollowUp: boolean;
  followUpReason?: string;
  suggestedNextTopic: string;
  topics: string[];
}

export interface AnswerScore {
  contentScore: number;
  clarityScore: number;
  relevanceScore: number;
  depthScore: number;
  overallScore: number;
  feedback: string;
}

// =====================================================
// REQUEST DTOs
// =====================================================

export interface StartSessionDto {
  resumeId?: number;
  jobTitle?: string;
  companyName?: string;
  difficulty?: 'entry' | 'mid' | 'senior' | 'lead';
  focusAreas?: string[];
}

export interface SubmitResponseDto {
  audioBlob?: string;
  transcript?: string;
}

export interface GetSessionsDto {
  page?: number;
  limit?: number;
}

// =====================================================
// RESPONSE DTOs
// =====================================================

export interface SessionResponse {
  sessionId: string;
  status: 'active' | 'completed';
  currentQuestion: {
    id: string;
    text: string;
    category: AiInterviewQuestionCategory;
    audioUrl?: string;
  };
  progress: {
    questionNumber: number;
    estimatedTotal: number;
    topicsCovered: string[];
    percentComplete: number;
  };
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
  nextQuestion?: {
    id: string;
    text: string;
    category: AiInterviewQuestionCategory;
    audioUrl?: string;
    isFollowUp: boolean;
    transition?: string;
  };
  isComplete: boolean;
  progress: {
    questionNumber: number;
    estimatedTotal: number;
    topicsCovered: string[];
    percentComplete: number;
  };
}

export interface FeedbackResponse {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  categoryScores: {
    category: string;
    score: number;
    feedback: string;
  }[];
  recommendations: string[];
}

export interface SessionSummary {
  id: string;
  jobTitle: string;
  companyName?: string;
  status: AiInterviewSessionStatus;
  questionsAnswered: number;
  overallScore?: number;
  createdAt: Date;
  completedAt?: Date;
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

// =====================================================
// CONSTANTS
// =====================================================

export const INTERVIEW_CONFIG = {
  // Question limits
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 15,
  TARGET_QUESTIONS: 10,

  // Follow-up settings
  MAX_TOPIC_DEPTH: 3,
  MAX_CONSECUTIVE_FOLLOWUPS: 2,
  MIN_ANSWER_LENGTH_FOR_FOLLOWUP: 20,

  // Topic settings
  MIN_TOPICS_TO_COVER: 4,
  REQUIRED_TOPICS: ['experience', 'technical', 'behavioral'],

  // Timing
  REQUEST_DEDUP_MS: 2000,
  MAX_RESPONSE_WAIT_SECONDS: 120,

  // Defaults
  DEFAULT_JOB_TITLE: 'Software Engineer',
  DEFAULT_DIFFICULTY: 'mid' as const,
} as const;

export const INTERVIEW_TOPICS = [
  'introduction',
  'experience',
  'technical_skills',
  'problem_solving',
  'teamwork',
  'challenges',
  'system_design',
  'career_goals',
  'culture_fit',
  'closing',
] as const;

export type InterviewTopic = (typeof INTERVIEW_TOPICS)[number];
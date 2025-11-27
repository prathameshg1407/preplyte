// src/types/interview.types.ts

// =====================================================
// ENUMS
// =====================================================

export type InterviewDifficulty = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
export type InterviewSessionStatus = 
  | 'CREATED' 
  | 'STARTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'FAILED';
export type QuestionCategory = 
  | 'INTRODUCTORY' 
  | 'TECHNICAL' 
  | 'BEHAVIORAL' 
  | 'SITUATIONAL' 
  | 'CLOSING';
export type HiringRecommendation = 
  | 'strong_yes' 
  | 'yes' 
  | 'maybe' 
  | 'no' 
  | 'strong_no';

// =====================================================
// SESSION TYPES
// =====================================================

export interface CreateSessionInput {
  resumeId?: string;
  jobTitle?: string;
  companyName?: string;
  difficulty?: InterviewDifficulty;
  focusAreas?: string[];
  targetQuestions?: number;
}

export interface SessionConfig {
  resumeId: string | null;
  jobTitle: string;
  companyName: string | null;
  difficulty: InterviewDifficulty;
  focusAreas: string[];
  targetQuestions: number;
}

export interface SessionProgress {
  totalQuestions: number;
  currentQuestionIndex: number;
  questionsAnswered: number;
  estimatedTimeRemaining: number;
  percentComplete: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  status: InterviewSessionStatus;
  config: SessionConfig;
  progress: SessionProgress;
  wsUrl: string;
  createdAt: string;
  startedAt: string | null;
}

export interface InterviewSessionSummary {
  id: string;
  status: InterviewSessionStatus;
  jobTitle: string;
  difficulty: InterviewDifficulty;
  questionsAnswered: number;
  totalQuestions: number;
  overallScore: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface SessionListResponse {
  sessions: InterviewSessionSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =====================================================
// QUESTION & RESPONSE TYPES
// =====================================================

export interface ResponseScores {
  relevance: number;
  clarity: number;
  depth: number;
  technicalAccuracy: number | null;
  communication: number;
  overall: number;
}

export interface QuestionResponse {
  questionId: string;
  category: QuestionCategory;
  question: string;
  answer: string;
  isFollowUp: boolean;
  timeTakenSeconds: number;
  scores: ResponseScores | null;
  feedback: string;
}

// =====================================================
// FEEDBACK TYPES
// =====================================================

export interface CategoryScore {
  score: number;
  maxScore: number;
  feedback: string;
}

export interface CategoryScores {
  technical: CategoryScore;
  behavioral: CategoryScore;
  communication: CategoryScore;
  problemSolving: CategoryScore;
  cultureFit: CategoryScore;
}

export interface QuestionFeedbackItem {
  questionId: string;
  question: string;
  category: QuestionCategory;
  answer: string;
  scores: ResponseScores;
  feedback: string;
  suggestions: string[];
}

export interface DetailedAnalysis {
  technicalDepth: string;
  communicationStyle: string;
  problemSolvingApproach: string;
  leadershipPotential: string;
  growthMindset: string;
}

export interface InterviewFeedback {
  id: string;
  sessionId: string;
  overallScore: number;
  overallSummary: string;
  categoryScores: CategoryScores;
  keyStrengths: string[];
  areasForImprovement: string[];
  questionFeedback: QuestionFeedbackItem[];
  recommendations: string[];
  hiringRecommendation: HiringRecommendation;
  detailedAnalysis: DetailedAnalysis;
  generatedAt: string;
}

// =====================================================
// WEBSOCKET TYPES
// =====================================================

export interface WSMessage {
  type: string;
  data?: unknown;
  timestamp: number;
  sessionId?: string;
}

export interface TranscriptionMessage {
  type: 'transcription' | 'transcription_final';
  data: {
    text: string;
    isFinal: boolean;
    confidence?: number;
  };
}

export interface AIAudioMessage {
  type: 'ai_audio';
  data: {
    chunk: string; // Base64
    isLast: boolean;
    format: string;
  };
}

export interface AISpeakingMessage {
  type: 'ai_speaking';
  data: {
    text: string;
    category: QuestionCategory;
    isFollowUp?: boolean;
  };
}

export interface SessionStateMessage {
  type: 'session_state';
  data: {
    sessionId: string;
    status: InterviewSessionStatus;
    currentQuestion: {
      id: string;
      category: QuestionCategory;
      question: string;
      order: number;
      isFollowUp: boolean;
    } | null;
    isListening: boolean;
    isAISpeaking: boolean;
    progress: SessionProgress;
  };
}

export interface ErrorMessage {
  type: 'error';
  data: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

// =====================================================
// CONVERSATION TYPES
// =====================================================

export interface ConversationMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  category?: QuestionCategory;
  isFollowUp?: boolean;
  audioPlayed?: boolean;
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface InterviewUIState {
  isConnected: boolean;
  isConnecting: boolean;
  isRecording: boolean;
  isAISpeaking: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  error: string | null;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface StartSessionResponse {
  session: InterviewSession;
  openingMessage: string;
}

export interface SubmitResponseResult {
  nextQuestion: string | null;
  isComplete: boolean;
  scores: ResponseScores;
}

export interface SessionDetailResponse {
  session: InterviewSession;
  responses: QuestionResponse[];
  feedback: InterviewFeedback | null;
  metrics: SessionMetrics | null;
}

export interface SessionMetrics {
  totalDuration: number;
  questionsAsked: number;
  questionsAnswered: number;
  averageResponseTime: number;
  longestResponse: number;
  shortestResponse: number;
  silencePeriods: number;
}
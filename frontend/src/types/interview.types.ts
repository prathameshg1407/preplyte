// src/types/interview.types.ts

// =====================================================
// ENUMS - Match backend exactly
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
  companyName?: string | null;
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

export interface CurrentQuestion {
  id: string;
  category: QuestionCategory;
  question: string;
  order: number;
  isFollowUp: boolean;
  startedAt?: string;
}

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

export interface SubmitResponseResult {
  nextQuestion: string | null;
  isComplete: boolean;
  scores: ResponseScores;
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
// WEBSOCKET TYPES - Match backend WS_EVENTS exactly
// =====================================================

export const WS_EVENTS = {
  CLIENT: {
    AUDIO_CHUNK: 'audio_chunk',
    START_RECORDING: 'start_recording',
    STOP_RECORDING: 'stop_recording',
    END_INTERVIEW: 'end_interview',
    PAUSE: 'pause',
    RESUME: 'resume',
    SKIP_QUESTION: 'skip_question',
    PING: 'ping',
  },
  SERVER: {
    CONNECTED: 'connected',
    SESSION_READY: 'session_ready',
    TRANSCRIPTION: 'transcription',
    TRANSCRIPTION_FINAL: 'transcription_final',
    AI_THINKING: 'ai_thinking',
    AI_SPEAKING: 'ai_speaking',
    AI_AUDIO: 'ai_audio',
    AI_DONE: 'ai_done',
    QUESTION_START: 'question_start',
    INTERVIEW_ENDED: 'interview_ended',
    ERROR: 'error',
    PONG: 'pong',
    SESSION_STATE: 'session_state',
  },
} as const;

export interface WSMessage<T = unknown> {
  type: string;
  data?: T;
  timestamp: number;
  sessionId?: string;
}

export interface WSConnectedData {
  connectionId: string;
  sessionId: string;
  status: InterviewSessionStatus;
}

export interface WSSessionReadyData {
  sessionId: string;
  status: 'ready';
  currentQuestion: CurrentQuestion | null;
}

export interface WSTranscriptionData {
  text: string;
  isFinal: boolean;
  confidence?: number;
}

export interface WSAISpeakingData {
  text: string;
  category: QuestionCategory;
  isFollowUp?: boolean;
}

export interface WSAIAudioData {
  chunk: string; // Base64
  isLast: boolean;
  format: string;
}

export interface WSSessionStateData {
  sessionId: string;
  status: InterviewSessionStatus;
  currentQuestion: CurrentQuestion | null;
  isListening: boolean;
  isAISpeaking: boolean;
  progress: SessionProgress;
}

export interface WSInterviewEndedData {
  sessionId: string;
  reason: string;
  feedbackUrl: string;
}

export interface WSErrorData {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface WSAIDoneData {
  questionId: string;
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
  isPaused: boolean;
  currentTranscript: string;
  error: string | null;
  connectionAttempts: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface StartSessionResponse {
  session: InterviewSession;
  openingMessage: string;
}

export interface EndSessionResponse {
  feedback: InterviewFeedback;
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

// =====================================================
// AUDIO TYPES
// =====================================================

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  bufferSize: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000,
  channelCount: 1,
  bufferSize: 4096,
};

// =====================================================
// CONSTANTS
// =====================================================

export const DIFFICULTY_OPTIONS = [
  {
    value: 'ENTRY' as InterviewDifficulty,
    label: 'Entry Level',
    description: 'Foundational concepts, basic problem-solving',
    color: 'bg-green-500',
  },
  {
    value: 'MID' as InterviewDifficulty,
    label: 'Mid Level',
    description: 'Practical experience, moderate complexity',
    color: 'bg-blue-500',
  },
  {
    value: 'SENIOR' as InterviewDifficulty,
    label: 'Senior Level',
    description: 'Deep expertise, system design, leadership',
    color: 'bg-orange-500',
  },
  {
    value: 'LEAD' as InterviewDifficulty,
    label: 'Lead/Principal',
    description: 'Strategic thinking, architecture, team management',
    color: 'bg-red-500',
  },
] as const;

export const FOCUS_AREA_OPTIONS = [
  'Data Structures',
  'Algorithms',
  'System Design',
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Leadership',
  'Communication',
  'Problem Solving',
] as const;

export const STATUS_CONFIG: Record<
  InterviewSessionStatus,
  { label: string; color: string; bgColor: string }
> = {
  CREATED: { label: 'Created', color: 'text-gray-600', bgColor: 'bg-gray-500' },
  STARTED: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  COMPLETED: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-500' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-500' },
  FAILED: { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-500' },
};

export const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  INTRODUCTORY: 'bg-green-500/10 text-green-700 border-green-500/20',
  TECHNICAL: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  BEHAVIORAL: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  SITUATIONAL: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  CLOSING: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
};
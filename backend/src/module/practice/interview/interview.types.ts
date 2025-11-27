// src/module/practice/interview/interview.types.ts

import {
  AiInterviewSession,
  AiInterviewResponse,
  AiInterviewFeedback,
  AiInterviewSessionStatus,
  AiInterviewQuestionCategory,
  AiInterviewDifficulty,
  Resume,
} from '@prisma/client';

// =====================================================
// SESSION TYPES
// =====================================================

export interface CreateSessionInput {
  resumeId?: string;
  jobTitle?: string;
  companyName?: string;
  difficulty?: AiInterviewDifficulty;
  focusAreas?: string[];
  targetQuestions?: number;
}

export interface SessionConfig {
  resumeId: string | null;
  jobTitle: string;
  companyName: string | null;
  difficulty: AiInterviewDifficulty;
  focusAreas: string[];
  targetQuestions: number;
}

export interface InterviewSessionResponse {
  id: string;
  userId: string;
  status: AiInterviewSessionStatus;
  config: SessionConfig;
  progress: SessionProgress;
  wsUrl: string;
  createdAt: Date;
  startedAt: Date | null;
}

export interface SessionProgress {
  totalQuestions: number;
  currentQuestionIndex: number;
  questionsAnswered: number;
  estimatedTimeRemaining: number;
  percentComplete: number;
}

export interface SessionState {
  sessionId: string;
  status: AiInterviewSessionStatus;
  currentQuestion: QuestionState | null;
  isListening: boolean;
  isAISpeaking: boolean;
  progress: SessionProgress;
}

// =====================================================
// QUESTION TYPES
// =====================================================

export interface GeneratedQuestion {
  id: string;
  category: AiInterviewQuestionCategory;
  question: string;
  context?: string;
  expectedTopics?: string[];
  followUpPotential: string[];
  order: number;
}

export interface QuestionState {
  id: string;
  category: AiInterviewQuestionCategory;
  question: string;
  order: number;
  isFollowUp: boolean;
  parentQuestionId?: string;
  startedAt: Date;
}

export interface QuestionResponse {
  questionId: string;
  category: AiInterviewQuestionCategory;
  question: string;
  answer: string;
  isFollowUp: boolean;
  timeTakenSeconds: number;
  scores: ResponseScores;
  feedback: string;
}

export interface ResponseScores {
  relevance: number;
  clarity: number;
  depth: number;
  technicalAccuracy: number | null;
  communication: number;
  overall: number;
}

// =====================================================
// CONVERSATION TYPES
// =====================================================

export interface ConversationMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  questionId?: string;
  category?: AiInterviewQuestionCategory;
  isFollowUp?: boolean;
  scores?: ResponseScores;
  transcriptionConfidence?: number;
}

export interface ConversationContext {
  resume: ParsedResume;
  config: SessionConfig;
  history: ConversationMessage[];
  questionsAsked: GeneratedQuestion[];
  currentTopic: string | null;
  followUpDepth: number;
  candidateProfile: CandidateProfile;
}

// =====================================================
// RESUME TYPES
// =====================================================

export interface ParsedResume {
  rawText: string;
  structured: StructuredResume;
  hash: string;
  parsedAt: Date;
}

export interface StructuredResume {
  name: string;
  email: string;
  phone: string;
  summary?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications?: string[];
  achievements?: string[];
}

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  responsibilities: string[];
  technologies?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  year: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  highlights?: string[];
  url?: string;
}

export interface CandidateProfile {
  name: string;
  yearsOfExperience: number;
  primarySkills: string[];
  recentRole: string;
  industryBackground: string[];
}

// =====================================================
// FEEDBACK TYPES
// =====================================================

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
  generatedAt: Date;
}

export interface CategoryScores {
  technical: CategoryScore;
  behavioral: CategoryScore;
  communication: CategoryScore;
  problemSolving: CategoryScore;
  cultureFit: CategoryScore;
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  feedback: string;
}

export interface QuestionFeedbackItem {
  questionId: string;
  question: string;
  category: AiInterviewQuestionCategory;
  answer: string;
  scores: ResponseScores;
  feedback: string;
  suggestions: string[];
}

export type HiringRecommendation =
  | 'strong_yes'
  | 'yes'
  | 'maybe'
  | 'no'
  | 'strong_no';

export interface DetailedAnalysis {
  technicalDepth: string;
  communicationStyle: string;
  problemSolvingApproach: string;
  leadershipPotential: string;
  growthMindset: string;
}

// =====================================================
// SPEECH TYPES
// =====================================================

export interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  words?: TranscribedWord[];
}

export interface TranscribedWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TTSResult {
  audioBuffer: Buffer;
  format: string;
  duration: number;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

// =====================================================
// WEBSOCKET TYPES
// =====================================================

export interface WSClientMessage {
  type: string;
  data?: unknown;
  timestamp?: number;
}

export interface WSServerMessage {
  type: string;
  data?: unknown;
  timestamp: number;
  sessionId?: string;
}

export interface WSTranscriptionMessage extends WSServerMessage {
  type: 'transcription' | 'transcription_final';
  data: {
    text: string;
    isFinal: boolean;
    confidence?: number;
  };
}

export interface WSAudioMessage extends WSServerMessage {
  type: 'ai_audio';
  data: {
    chunk: string; // Base64 encoded audio
    isLast: boolean;
    format: string;
  };
}

export interface WSErrorMessage extends WSServerMessage {
  type: 'error';
  data: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

// =====================================================
// SESSION MANAGEMENT TYPES
// =====================================================

export interface ActiveSession {
  id: string;
  userId: string;
  wsConnectionId: string;
  status: AiInterviewSessionStatus;
  startedAt: Date;
  lastActivityAt: Date;
  conversationEngine: ConversationContext;
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
// API RESPONSE TYPES
// =====================================================

export interface SessionListResponse {
  sessions: InterviewSessionSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface InterviewSessionSummary {
  id: string;
  status: AiInterviewSessionStatus;
  jobTitle: string;
  difficulty: AiInterviewDifficulty;
  questionsAnswered: number;
  totalQuestions: number;
  overallScore: number | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface SessionDetailResponse {
  session: InterviewSessionResponse;
  responses: QuestionResponse[];
  feedback: InterviewFeedback | null;
  metrics: SessionMetrics | null;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Safely parses a JSON field from Prisma to a typed object
 */
function parseJsonField<T>(json: unknown, defaultValue: T): T {
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    return json as T;
  }
  return defaultValue;
}

function calculateEstimatedTime(session: AiInterviewSession): number {
  const remainingQuestions = session.totalQuestions - session.currentQuestionIndex;
  const avgTimePerQuestion = 120; // 2 minutes average
  return remainingQuestions * avgTimePerQuestion;
}

function getDefaultCategoryScores(): CategoryScores {
  return {
    technical: { score: 0, maxScore: 10, feedback: '' },
    behavioral: { score: 0, maxScore: 10, feedback: '' },
    communication: { score: 0, maxScore: 10, feedback: '' },
    problemSolving: { score: 0, maxScore: 10, feedback: '' },
    cultureFit: { score: 0, maxScore: 10, feedback: '' },
  };
}

function getDefaultScores(): ResponseScores {
  return {
    relevance: 0,
    clarity: 0,
    depth: 0,
    technicalAccuracy: null,
    communication: 0,
    overall: 0,
  };
}

function getDefaultAnalysis(): DetailedAnalysis {
  return {
    technicalDepth: '',
    communicationStyle: '',
    problemSolvingApproach: '',
    leadershipPotential: '',
    growthMindset: '',
  };
}

// =====================================================
// MAPPER FUNCTIONS
// =====================================================

export function mapSessionToResponse(
  session: AiInterviewSession & { resume?: Resume | null }
): InterviewSessionResponse {
  const wsUrl = `${process.env.WS_URL || 'ws://localhost:3001'}/ws/interview/${session.id}`;

  return {
    id: session.id,
    userId: session.userId,
    status: session.status,
    config: {
      resumeId: session.resumeId,
      jobTitle: session.jobTitle || 'Software Engineer',
      companyName: session.companyName,
      difficulty: session.difficulty,
      focusAreas: session.focusAreas,
      targetQuestions: session.totalQuestions,
    },
    progress: {
      totalQuestions: session.totalQuestions,
      currentQuestionIndex: session.currentQuestionIndex,
      questionsAnswered: session.currentQuestionIndex,
      estimatedTimeRemaining: calculateEstimatedTime(session),
      percentComplete: Math.round(
        (session.currentQuestionIndex / session.totalQuestions) * 100
      ),
    },
    wsUrl,
    createdAt: session.createdAt,
    startedAt: session.startedAt,
  };
}

export function mapFeedbackToResponse(
  feedback: AiInterviewFeedback,
  responses: AiInterviewResponse[]
): InterviewFeedback {
  const feedbackJson = (feedback.feedbackJson as unknown as Record<string, unknown>) || {};

  return {
    id: feedback.id,
    sessionId: feedback.sessionId,
    overallScore: Number(feedback.overallScore),
    overallSummary: feedback.overallSummary,
    categoryScores: parseJsonField<CategoryScores>(
      feedbackJson.categoryScores,
      getDefaultCategoryScores()
    ),
    keyStrengths: feedback.keyStrengths,
    areasForImprovement: feedback.areasForImprovement,
    questionFeedback: responses.map((r) => ({
      questionId: r.id,
      question: r.question,
      category: r.category,
      answer: r.answer,
      scores: parseJsonField<ResponseScores>(r.scoresJson, getDefaultScores()),
      feedback: r.feedbackText || '',
      suggestions: [],
    })),
    recommendations: parseJsonField<string[]>(feedbackJson.recommendations, []),
    hiringRecommendation: parseJsonField<HiringRecommendation>(
      feedbackJson.hiringRecommendation,
      'maybe'
    ),
    detailedAnalysis: parseJsonField<DetailedAnalysis>(
      feedbackJson.detailedAnalysis,
      getDefaultAnalysis()
    ),
    generatedAt: feedback.createdAt,
  };
}

export function mapResponseToQuestionResponse(
  response: AiInterviewResponse
): QuestionResponse {
  return {
    questionId: response.id,
    category: response.category,
    question: response.question,
    answer: response.answer,
    isFollowUp: response.isFollowup, // Fixed: isFollowup (lowercase 'u') matches Prisma schema
    timeTakenSeconds: response.timeTakenSeconds || 0,
    scores: parseJsonField<ResponseScores>(response.scoresJson, getDefaultScores()),
    feedback: response.feedbackText || '',
  };
}

export function mapSessionToSummary(
  session: AiInterviewSession & { feedback?: AiInterviewFeedback | null }
): InterviewSessionSummary {
  return {
    id: session.id,
    status: session.status,
    jobTitle: session.jobTitle || 'Software Engineer',
    difficulty: session.difficulty,
    questionsAnswered: session.currentQuestionIndex,
    totalQuestions: session.totalQuestions,
    overallScore: session.feedback ? Number(session.feedback.overallScore) : null,
    createdAt: session.createdAt,
    completedAt: session.completedAt,
  };
}
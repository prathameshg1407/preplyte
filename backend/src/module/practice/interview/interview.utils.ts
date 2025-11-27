// interview.utils.ts

import { AiInterviewQuestionCategory } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  ConversationTurn,
  LiveSessionState,
  SessionContext,
  QuestionItem,
  InterviewTopic,
  INTERVIEW_CONFIG,
  INTERVIEW_TOPICS,
} from './interview.types';

// =====================================================
// CONSTANTS
// =====================================================

export const VALID_TOPICS: readonly string[] = [
  'introduction',
  'experience',
  'technical_skills',
  'problem_solving',
  'teamwork',
  'challenges',
  'career_goals',
  'system_design',
  'culture_fit',
  'closing',
  'general',
] as const;

export const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_TRANSCRIPT_LENGTH = 10000;
export const MAX_SESSIONS_PER_PAGE = 50;

// =====================================================
// SANITIZATION UTILITIES
// =====================================================

/**
 * Sanitize input strings to prevent issues
 */
export function sanitizeInput(input: string | undefined | null): string | undefined {
  if (!input) {
    return undefined;
  }

  return input
    .trim()
    .slice(0, 500)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Sanitize text before including in prompts to prevent prompt injection
 */
export function sanitizeForPrompt(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .replace(/```/g, "'''")
    .replace(/\{\{/g, '{ {')
    .replace(/\}\}/g, '} }')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, 5000)
    .trim();
}

/**
 * Sanitize and validate an array of strings
 */
export function sanitizeStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 20);
}

// =====================================================
// SCORE UTILITIES
// =====================================================

/**
 * Clamp a score to 0-10 range
 */
export function clampScore(score: number | undefined): number {
  if (score === undefined || score === null || isNaN(Number(score))) {
    return 5;
  }
  return Math.min(10, Math.max(0, Math.round(Number(score))));
}

/**
 * Clamp a percentage to 0-100 range
 */
export function clampPercentage(value: number | undefined): number {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return 70;
  }
  return Math.min(100, Math.max(0, Math.round(Number(value))));
}

// =====================================================
// CATEGORY & TOPIC UTILITIES
// =====================================================

/**
 * Map string category to enum
 */
export function mapCategory(category: string): AiInterviewQuestionCategory {
  const normalizedCategory = (category || '').toUpperCase().trim();

  const map: Record<string, AiInterviewQuestionCategory> = {
    TECHNICAL: AiInterviewQuestionCategory.TECHNICAL,
    BEHAVIORAL: AiInterviewQuestionCategory.BEHAVIORAL,
    SITUATIONAL: AiInterviewQuestionCategory.SITUATIONAL,
    INTRODUCTORY: AiInterviewQuestionCategory.INTRODUCTORY,
    CLOSING: AiInterviewQuestionCategory.CLOSING,
  };

  return map[normalizedCategory] || AiInterviewQuestionCategory.BEHAVIORAL;
}

/**
 * Convert category to topic
 */
export function categoryToTopic(category: AiInterviewQuestionCategory): InterviewTopic {
  const map: Record<AiInterviewQuestionCategory, InterviewTopic> = {
    [AiInterviewQuestionCategory.TECHNICAL]: 'technical_skills',
    [AiInterviewQuestionCategory.BEHAVIORAL]: 'experience',
    [AiInterviewQuestionCategory.SITUATIONAL]: 'problem_solving',
    [AiInterviewQuestionCategory.INTRODUCTORY]: 'introduction',
    [AiInterviewQuestionCategory.CLOSING]: 'career_goals',
  };

  return map[category] || 'experience';
}

/**
 * Validate topic string
 */
export function validateTopic(topic: unknown): InterviewTopic | undefined {
  if (typeof topic !== 'string') {
    return undefined;
  }

  const normalizedTopic = topic.toLowerCase().trim();

  if (VALID_TOPICS.includes(normalizedTopic)) {
    return normalizedTopic as InterviewTopic;
  }

  return undefined;
}

/**
 * Get next uncovered topic
 */
export function getNextTopic(liveState: LiveSessionState): InterviewTopic {
  const uncovered = INTERVIEW_TOPICS.filter(
    (t) => !liveState.coveredTopics.has(t)
  );
  return uncovered[0] || 'experience';
}

// =====================================================
// CONVERSATION UTILITIES
// =====================================================

/**
 * Format conversation turns for display/prompts
 */
export function formatConversation(turns: ConversationTurn[]): string {
  return turns
    .map(
      (t) =>
        `${t.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${t.content}`
    )
    .join('\n\n');
}

/**
 * Create interviewer conversation turn
 */
export function createInterviewerTurn(
  question: QuestionItem,
  isFollowUp: boolean
): ConversationTurn {
  return {
    id: uuidv4(),
    role: 'interviewer',
    content: question.text,
    category: question.category,
    timestamp: new Date(),
    isFollowUp,
  };
}

/**
 * Create candidate conversation turn
 */
export function createCandidateTurn(
  transcript: string,
  category: AiInterviewQuestionCategory
): ConversationTurn {
  return {
    id: uuidv4(),
    role: 'candidate',
    content: transcript,
    category,
    timestamp: new Date(),
    isFollowUp: false,
  };
}

// =====================================================
// STATE UTILITIES
// =====================================================

/**
 * Create initial live state
 */
export function createLiveState(
  sessionId: string,
  userId: string,
  context: SessionContext,
  openingQuestion: QuestionItem
): LiveSessionState {
  const now = new Date();

  const interviewerTurn = createInterviewerTurn(openingQuestion, false);
  interviewerTurn.timestamp = now;

  return {
    sessionId,
    userId,
    context,
    conversationHistory: [interviewerTurn],
    currentQuestion: openingQuestion,
    currentIsFollowUp: false,
    currentTopic: 'introduction',
    topicDepth: 0,
    coveredTopics: new Set(['introduction']),
    questionCount: 1,
    startedAt: now,
    lastActivityAt: now,
    lastAnalysis: null,
  };
}

/**
 * Calculate interview progress
 */
export function calculateProgress(liveState: LiveSessionState): {
  questionNumber: number;
  estimatedTotal: number;
  topicsCovered: string[];
  percentComplete: number;
} {
  const estimatedTotal = Math.min(
    INTERVIEW_CONFIG.MAX_QUESTIONS,
    Math.max(liveState.questionCount + 3, INTERVIEW_CONFIG.TARGET_QUESTIONS)
  );

  const rawPercent = Math.round(
    (liveState.questionCount / estimatedTotal) * 100
  );
  const percentComplete = Math.min(95, rawPercent);

  return {
    questionNumber: liveState.questionCount,
    estimatedTotal,
    topicsCovered: Array.from(liveState.coveredTopics),
    percentComplete,
  };
}

/**
 * Check if interview should end
 */
export function shouldEndInterview(liveState: LiveSessionState): boolean {
  if (liveState.questionCount >= INTERVIEW_CONFIG.MAX_QUESTIONS) {
    return true;
  }

  const topicsCovered = liveState.coveredTopics.size;
  if (
    topicsCovered >= INTERVIEW_CONFIG.MIN_TOPICS_TO_COVER &&
    liveState.questionCount >= INTERVIEW_CONFIG.MIN_QUESTIONS
  ) {
    if (liveState.questionCount >= INTERVIEW_CONFIG.TARGET_QUESTIONS) {
      return true;
    }
  }

  return false;
}

// =====================================================
// ERROR UTILITIES
// =====================================================

/**
 * Extract error message from unknown error
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
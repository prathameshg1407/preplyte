// src/module/practice/interview/utils/session.utils.ts

import { AiInterviewSessionStatus, AiInterviewDifficulty } from '@prisma/client';
import { INTERVIEW_SESSION_CONFIG, DIFFICULTY_CONFIG } from '../interview.constants';

/**
 * Check if session status allows starting
 */
export function canStartSession(status: AiInterviewSessionStatus): boolean {
  return status === 'CREATED';
}

/**
 * Check if session status allows responses
 */
export function canSubmitResponse(status: AiInterviewSessionStatus): boolean {
  return ['STARTED', 'IN_PROGRESS'].includes(status);
}

/**
 * Check if session status allows ending
 */
export function canEndSession(status: AiInterviewSessionStatus): boolean {
  return ['STARTED', 'IN_PROGRESS'].includes(status);
}

/**
 * Check if session is active
 */
export function isSessionActive(status: AiInterviewSessionStatus): boolean {
  return ['CREATED', 'STARTED', 'IN_PROGRESS'].includes(status);
}

/**
 * Check if session is completed
 */
export function isSessionCompleted(status: AiInterviewSessionStatus): boolean {
  return status === 'COMPLETED';
}

/**
 * Calculate session timeout based on difficulty
 */
export function calculateSessionTimeout(
  difficulty: AiInterviewDifficulty,
  questionCount: number
): number {
  const config = DIFFICULTY_CONFIG[difficulty];
  const timePerQuestion = config.timePerQuestion;
  const totalMinutes = (timePerQuestion * questionCount) / 60;

  // Add 20% buffer
  return Math.ceil(totalMinutes * 1.2);
}

/**
 * Calculate estimated remaining time
 */
export function calculateRemainingTime(
  totalQuestions: number,
  currentIndex: number,
  difficulty: AiInterviewDifficulty
): number {
  const remaining = totalQuestions - currentIndex;
  const config = DIFFICULTY_CONFIG[difficulty];
  return remaining * config.timePerQuestion;
}

/**
 * Validate session timing
 */
export function validateSessionTiming(
  startedAt: Date | null,
  difficulty: AiInterviewDifficulty,
  questionCount: number
): { valid: boolean; expired: boolean; remainingMinutes: number } {
  if (!startedAt) {
    return { valid: true, expired: false, remainingMinutes: -1 };
  }

  const timeoutMinutes = calculateSessionTimeout(difficulty, questionCount);
  const elapsedMinutes = (Date.now() - startedAt.getTime()) / 60000;
  const remainingMinutes = timeoutMinutes - elapsedMinutes;

  return {
    valid: remainingMinutes > 0,
    expired: remainingMinutes <= 0,
    remainingMinutes: Math.max(0, remainingMinutes),
  };
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get difficulty display name
 */
export function getDifficultyDisplayName(difficulty: AiInterviewDifficulty): string {
  const names: Record<AiInterviewDifficulty, string> = {
    ENTRY: 'Entry Level',
    MID: 'Mid Level',
    SENIOR: 'Senior Level',
    LEAD: 'Lead/Principal Level',
  };
  return names[difficulty];
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(
  currentIndex: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((currentIndex / totalQuestions) * 100);
}

/**
 * Generate session summary
 */
export function generateSessionSummary(session: {
  status: AiInterviewSessionStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  startedAt: Date | null;
  completedAt: Date | null;
}): {
  status: string;
  progress: number;
  duration: number | null;
  questionsAnswered: number;
} {
  const progress = calculateProgress(
    session.currentQuestionIndex,
    session.totalQuestions
  );

  let duration: number | null = null;
  if (session.startedAt && session.completedAt) {
    duration = Math.round(
      (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
    );
  } else if (session.startedAt) {
    duration = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
  }

  return {
    status: session.status,
    progress,
    duration,
    questionsAnswered: session.currentQuestionIndex,
  };
}
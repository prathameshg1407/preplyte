// src/lib/api/services/interview.service.ts

import { apiClient } from "../axios-instance";
import { INTERVIEW_ENDPOINTS } from "../endpoints";
import { parseApiError } from "../error-handler";
import {
  StartInterviewRequest,
  SubmitAnswerRequest,
  InterviewSessionResponse,
  SessionStateResponse,
  SubmitAnswerResponse,
  InterviewFeedbackResponse,
  UserSessionSummaryDto,
  UserSessionStatsResponse,
  AiInterviewQuestionCategory,
  ApiResponse,
  NextQuestionResponse,
  QuestionCompletionResponse,
} from "@/types/aiInterview.types";

// ============= API Response Type =============

interface ServiceResponse<T> {
  success: boolean;
  data: T;
}

// ============= API Functions =============

export async function startInterviewSession(
  data: StartInterviewRequest
): Promise<InterviewSessionResponse> {
  const response = await apiClient.post<ServiceResponse<InterviewSessionResponse>>(
    INTERVIEW_ENDPOINTS.START,
    data
  );
  return response.data.data;
}

export async function getInterviewSession(
  sessionId: string
): Promise<SessionStateResponse> {
  const response = await apiClient.get<ServiceResponse<SessionStateResponse>>(
    INTERVIEW_ENDPOINTS.SESSION(sessionId)
  );
  return response.data.data;
}

export async function getNextQuestion(
  sessionId: string
): Promise<NextQuestionResponse | QuestionCompletionResponse> {
  const response = await apiClient.get<
    ServiceResponse<NextQuestionResponse | QuestionCompletionResponse>
  >(INTERVIEW_ENDPOINTS.NEXT_QUESTION(sessionId));
  return response.data.data;
}

export async function submitInterviewAnswer(
  sessionId: string,
  data: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  const response = await apiClient.post<ServiceResponse<SubmitAnswerResponse>>(
    INTERVIEW_ENDPOINTS.SUBMIT_ANSWER(sessionId),
    data
  );
  return response.data.data;
}

export async function getInterviewFeedback(
  sessionId: string
): Promise<InterviewFeedbackResponse> {
  const response = await apiClient.get<ServiceResponse<InterviewFeedbackResponse>>(
    INTERVIEW_ENDPOINTS.FEEDBACK(sessionId)
  );
  return response.data.data;
}

// FIX: Added try/catch to return empty array on failure
export async function getUserSessions(): Promise<UserSessionSummaryDto[]> {
  try {
    const response = await apiClient.get<ServiceResponse<UserSessionSummaryDto[]>>(
      INTERVIEW_ENDPOINTS.SESSIONS
    );
    return response.data.data || [];
  } catch (error) {
    console.warn("Could not fetch sessions (API might be down or unreachable):", error);
    return [];
  }
}

// FIX: Added try/catch to return null/default stats on failure
export async function getUserSessionStats(): Promise<UserSessionStatsResponse> {
  try {
    const response = await apiClient.get<ServiceResponse<UserSessionStatsResponse>>(
      INTERVIEW_ENDPOINTS.STATS
    );
    return response.data.data;
  } catch (error) {
    console.warn("Could not fetch stats (API might be down or unreachable):", error);
    // Return a safe fallback (casted to any to avoid type errors if fields differ)
    return {
      totalInterviews: 0,
      averageScore: 0,
      totalDuration: 0,
      completedInterviews: 0,
    } as unknown as UserSessionStatsResponse;
  }
}

export async function cancelSession(sessionId: string): Promise<void> {
  await apiClient.post(INTERVIEW_ENDPOINTS.CANCEL(sessionId));
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiClient.delete(INTERVIEW_ENDPOINTS.DELETE(sessionId));
}

export async function testTTS(): Promise<unknown> {
  const response = await apiClient.get<ServiceResponse<unknown>>(
    INTERVIEW_ENDPOINTS.TEST_TTS
  );
  return response.data.data;
}

// ============= Helper Functions =============

export function createAnswerRequest(
  question: string,
  category: AiInterviewQuestionCategory,
  answer: string,
  questionIndex?: number,
  timeTakenSeconds?: number,
  isTranscribed: boolean = true
): SubmitAnswerRequest {
  return {
    question,
    answer,
    category,
    questionIndex,
    isTranscribed,
    timeTakenSeconds,
  };
}

export function validateAnswer(answer: string): { valid: boolean; error?: string } {
  const trimmed = answer.trim();
  
  if (!trimmed) {
    return { valid: false, error: "Answer cannot be empty" };
  }
  
  if (trimmed.length < 10) {
    return { valid: false, error: "Please provide a more detailed answer" };
  }
  
  if (trimmed.length > 10000) {
    return { valid: false, error: "Answer is too long (max 10000 characters)" };
  }
  
  return { valid: true };
}

export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateSessionDuration(
  startTime: string,
  endTime?: string | null
): number {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  return Math.round((end - start) / 60000);
}

export function getCategoryColors(category: AiInterviewQuestionCategory): {
  bgClass: string;
  textClass: string;
  badgeClass: string;
} {
  const colors: Record<AiInterviewQuestionCategory, { bgClass: string; textClass: string; badgeClass: string }> = {
    [AiInterviewQuestionCategory.INTRODUCTORY]: {
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-600 dark:text-blue-400",
      badgeClass: "bg-blue-500",
    },
    [AiInterviewQuestionCategory.TECHNICAL]: {
      bgClass: "bg-purple-100 dark:bg-purple-900/30",
      textClass: "text-purple-600 dark:text-purple-400",
      badgeClass: "bg-purple-500",
    },
    [AiInterviewQuestionCategory.CLOSING]: {
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-600 dark:text-green-400",
      badgeClass: "bg-green-500",
    },
  };

  return colors[category];
}

export function getScoreRating(score: number): {
  label: string;
  colorClass: string;
  bgClass: string;
} {
  if (score >= 90) {
    return {
      label: "Excellent",
      colorClass: "text-green-600 dark:text-green-400",
      bgClass: "bg-green-100 dark:bg-green-900/30",
    };
  }
  if (score >= 80) {
    return {
      label: "Very Good",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
    };
  }
  if (score >= 70) {
    return {
      label: "Good",
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
    };
  }
  if (score >= 60) {
    return {
      label: "Fair",
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-100 dark:bg-amber-900/30",
    };
  }
  return {
    label: "Needs Improvement",
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100 dark:bg-red-900/30",
  };
}

export function getStatusBadge(status: string): {
  label: string;
  colorClass: string;
} {
  const badges: Record<string, { label: string; colorClass: string }> = {
    STARTED: { label: "Started", colorClass: "bg-blue-100 text-blue-800" },
    IN_PROGRESS: { label: "In Progress", colorClass: "bg-yellow-100 text-yellow-800" },
    COMPLETED: { label: "Completed", colorClass: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Cancelled", colorClass: "bg-gray-100 text-gray-800" },
  };

  return badges[status] || badges.STARTED;
}
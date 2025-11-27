// src/lib/api/services/interview.service.ts

import { apiClient } from "../axios-instance";
import { API_ENDPOINTS } from "../endpoints";
import {
  StartInterviewRequest,
  SubmitResponseDto,
  SessionResponse,
  SubmitResponseResult,
  FeedbackResponse,
  SessionSummary,
  PaginatedSessionsResponse,
  SessionStats,
  AiInterviewQuestionCategory,
  GetSessionsParams,
} from "@/types/aiInterview.types";

// ============= API Response Type =============

interface ServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============= API Functions =============

/**
 * Start a new interview session
 * POST /practice/interview/start
 */
export async function startInterviewSession(
  data: StartInterviewRequest
): Promise<SessionResponse> {
  const response = await apiClient.post<ServiceResponse<SessionResponse>>(
    API_ENDPOINTS.INTERVIEW.START,
    data
  );
  return response.data.data;
}

/**
 * Get interview session details
 * GET /practice/interview/:id
 */
export async function getInterviewSession(
  sessionId: string
): Promise<SessionResponse> {
  const response = await apiClient.get<ServiceResponse<SessionResponse>>(
    API_ENDPOINTS.INTERVIEW.SESSION(sessionId)
  );
  return response.data.data;
}

/**
 * Submit response for current question
 * POST /practice/interview/:id/respond
 */
export async function submitInterviewAnswer(
  sessionId: string,
  data: SubmitResponseDto
): Promise<SubmitResponseResult> {
  const response = await apiClient.post<ServiceResponse<SubmitResponseResult>>(
    API_ENDPOINTS.INTERVIEW.RESPOND(sessionId),
    data
  );
  return response.data.data;
}

/**
 * End interview session early
 * POST /practice/interview/:id/end
 */
export async function endSession(sessionId: string): Promise<FeedbackResponse> {
  const response = await apiClient.post<ServiceResponse<FeedbackResponse>>(
    API_ENDPOINTS.INTERVIEW.END(sessionId)
  );
  return response.data.data;
}

/**
 * Get interview feedback/results
 * GET /practice/interview/:id/feedback
 */
export async function getInterviewFeedback(
  sessionId: string
): Promise<FeedbackResponse> {
  const response = await apiClient.get<ServiceResponse<FeedbackResponse>>(
    API_ENDPOINTS.INTERVIEW.FEEDBACK(sessionId)
  );
  return response.data.data;
}

/**
 * Get user's interview sessions with pagination
 * GET /practice/interview/sessions
 */
export async function getUserSessions(
  params: GetSessionsParams = {}
): Promise<PaginatedSessionsResponse> {
  const { page = 1, limit = 20 } = params;

  try {
    const response = await apiClient.get<
      ServiceResponse<PaginatedSessionsResponse>
    >(API_ENDPOINTS.INTERVIEW.SESSIONS, {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.warn("Could not fetch sessions:", error);
    return {
      sessions: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

/**
 * Get user's interview statistics
 * GET /practice/interview/stats
 */
export async function getUserSessionStats(): Promise<SessionStats> {
  try {
    const response = await apiClient.get<ServiceResponse<SessionStats>>(
      API_ENDPOINTS.INTERVIEW.STATS
    );
    return response.data.data;
  } catch (error) {
    console.warn("Could not fetch stats:", error);
    return {
      totalSessions: 0,
      completedSessions: 0,
      averageScore: 0,
      totalQuestionsAnswered: 0,
      topCategories: [],
    };
  }
}

/**
 * Delete an interview session
 * DELETE /practice/interview/:id
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.INTERVIEW.DELETE(sessionId));
}

// ============= Helper Functions =============

export function validateAnswer(answer: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = answer.trim();

  if (!trimmed) {
    return { valid: false, error: "Answer cannot be empty" };
  }

  if (trimmed.length < 3) {
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
  const colors: Record<
    AiInterviewQuestionCategory,
    { bgClass: string; textClass: string; badgeClass: string }
  > = {
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
    [AiInterviewQuestionCategory.BEHAVIORAL]: {
      bgClass: "bg-amber-100 dark:bg-amber-900/30",
      textClass: "text-amber-600 dark:text-amber-400",
      badgeClass: "bg-amber-500",
    },
    [AiInterviewQuestionCategory.SITUATIONAL]: {
      bgClass: "bg-teal-100 dark:bg-teal-900/30",
      textClass: "text-teal-600 dark:text-teal-400",
      badgeClass: "bg-teal-500",
    },
    [AiInterviewQuestionCategory.CLOSING]: {
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-600 dark:text-green-400",
      badgeClass: "bg-green-500",
    },
  };

  return (
    colors[category] || {
      bgClass: "bg-gray-100 dark:bg-gray-900/30",
      textClass: "text-gray-600 dark:text-gray-400",
      badgeClass: "bg-gray-500",
    }
  );
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
    IN_PROGRESS: {
      label: "In Progress",
      colorClass: "bg-yellow-100 text-yellow-800",
    },
    COMPLETED: { label: "Completed", colorClass: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Cancelled", colorClass: "bg-gray-100 text-gray-800" },
  };

  return badges[status] || badges.STARTED;
}

// ============= Interview Service Class =============

class InterviewService {
  async startSession(data: StartInterviewRequest): Promise<SessionResponse> {
    return startInterviewSession(data);
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    return getInterviewSession(sessionId);
  }

  async submitResponse(
    sessionId: string,
    data: SubmitResponseDto
  ): Promise<SubmitResponseResult> {
    return submitInterviewAnswer(sessionId, data);
  }

  async endSession(sessionId: string): Promise<FeedbackResponse> {
    return endSession(sessionId);
  }

  async getFeedback(sessionId: string): Promise<FeedbackResponse> {
    return getInterviewFeedback(sessionId);
  }

  async getSessions(
    params?: GetSessionsParams
  ): Promise<PaginatedSessionsResponse> {
    return getUserSessions(params);
  }

  async getStats(): Promise<SessionStats> {
    return getUserSessionStats();
  }

  async deleteSession(sessionId: string): Promise<void> {
    return deleteSession(sessionId);
  }
}

export const interviewService = new InterviewService();
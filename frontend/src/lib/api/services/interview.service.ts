// src/lib/api/services/interview.service.ts

import { apiClient } from '../axios-instance';
import type {
  ApiResponse,
  CreateSessionInput,
  InterviewSession,
  SessionListResponse,
  SessionDetailResponse,
  InterviewFeedback,
  StartSessionResponse,
  EndSessionResponse,
  InterviewSessionStatus,
  SubmitResponseResult,
} from '@/types/interview.types';

// =====================================================
// ENDPOINTS
// =====================================================

const ENDPOINTS = {
  SESSIONS: '/api/practice/interview/sessions',
  SESSION: (id: string) => `/api/practice/interview/sessions/${id}`,
  SESSION_DETAIL: (id: string) => `/api/practice/interview/sessions/${id}/detail`,
  START: (id: string) => `/api/practice/interview/sessions/${id}/start`,
  CANCEL: (id: string) => `/api/practice/interview/sessions/${id}/cancel`,
  END: (id: string) => `/api/practice/interview/sessions/${id}/end`,
  RESPOND: (id: string) => `/api/practice/interview/sessions/${id}/respond`,
  FEEDBACK: (id: string) => `/api/practice/interview/sessions/${id}/feedback`,
  REGENERATE_FEEDBACK: (id: string) => `/api/practice/interview/sessions/${id}/feedback/regenerate`,
} as const;

// =====================================================
// ERROR CLASS
// =====================================================

export class InterviewServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'InterviewServiceError';
  }
}

// =====================================================
// ERROR HANDLER
// =====================================================

function handleApiError(error: unknown): never {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: { message?: string; code?: string };
      };
      message?: string;
    };

    const message = axiosError.response?.data?.message || axiosError.message || 'Unknown error';
    const code = axiosError.response?.data?.code || 'UNKNOWN_ERROR';
    const statusCode = axiosError.response?.status;
    const recoverable = statusCode ? statusCode < 500 : true;

    throw new InterviewServiceError(message, code, statusCode, recoverable);
  }

  throw new InterviewServiceError(
    error instanceof Error ? error.message : 'Unknown error',
    'UNKNOWN_ERROR'
  );
}

// =====================================================
// SERVICE CLASS
// =====================================================

class InterviewService {
  // ===================================================
  // SESSION MANAGEMENT
  // ===================================================

  async createSession(input: CreateSessionInput): Promise<InterviewSession> {
    try {
      // Sanitize input - convert null/empty to undefined, matching backend expectations
      const sanitizedInput: CreateSessionInput = {
        jobTitle: input.jobTitle?.trim() || undefined,
        companyName: input.companyName?.trim() || undefined,
        difficulty: input.difficulty || 'MID',
        focusAreas: input.focusAreas?.length ? input.focusAreas : undefined,
        targetQuestions: input.targetQuestions || 10,
        resumeId: input.resumeId && input.resumeId !== 'none' ? input.resumeId : undefined,
      };

      const response = await apiClient.post<ApiResponse<InterviewSession>>(
        ENDPOINTS.SESSIONS,
        sanitizedInput
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async listSessions(params?: {
    page?: number;
    pageSize?: number;
    status?: InterviewSessionStatus;
    sortBy?: 'createdAt' | 'completedAt' | 'overallScore';
    sortOrder?: 'asc' | 'desc';
  }): Promise<SessionListResponse> {
    try {
      const response = await apiClient.get<ApiResponse<SessionListResponse>>(
        ENDPOINTS.SESSIONS,
        { params }
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async getSession(sessionId: string): Promise<InterviewSession> {
    try {
      const response = await apiClient.get<ApiResponse<InterviewSession>>(
        ENDPOINTS.SESSION(sessionId)
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async getSessionDetail(sessionId: string): Promise<SessionDetailResponse> {
    try {
      const response = await apiClient.get<ApiResponse<SessionDetailResponse>>(
        ENDPOINTS.SESSION_DETAIL(sessionId)
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async startSession(sessionId: string): Promise<StartSessionResponse> {
    try {
      const response = await apiClient.post<ApiResponse<StartSessionResponse>>(
        ENDPOINTS.START(sessionId)
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async cancelSession(sessionId: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.CANCEL(sessionId));
    } catch (error) {
      handleApiError(error);
    }
  }

  async endSession(sessionId: string): Promise<EndSessionResponse> {
    try {
      const response = await apiClient.post<ApiResponse<EndSessionResponse>>(
        ENDPOINTS.END(sessionId)
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async submitResponse(
    sessionId: string,
    questionId: string,
    answer: string,
    timeTakenSeconds?: number
  ): Promise<SubmitResponseResult> {
    try {
      const response = await apiClient.post<ApiResponse<SubmitResponseResult>>(
        ENDPOINTS.RESPOND(sessionId),
        { questionId, answer, timeTakenSeconds }
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // ===================================================
  // FEEDBACK
  // ===================================================

  async getFeedback(sessionId: string): Promise<InterviewFeedback> {
    try {
      const response = await apiClient.get<ApiResponse<InterviewFeedback>>(
        ENDPOINTS.FEEDBACK(sessionId)
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  async regenerateFeedback(sessionId: string): Promise<InterviewFeedback> {
    try {
      const response = await apiClient.post<ApiResponse<InterviewFeedback>>(
        ENDPOINTS.REGENERATE_FEEDBACK(sessionId)
      );
      return response.data.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // ===================================================
  // WEBSOCKET URL
  // ===================================================

  getWebSocketUrl(sessionId: string, token: string): string {
    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    if (wsBaseUrl) {
      // Use configured WS URL
      const cleanUrl = wsBaseUrl.replace(/\/$/, '');
      return `${cleanUrl}/ws/interview/${sessionId}?token=${encodeURIComponent(token)}`;
    }
    
    // Fallback: derive from current location
    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:';
      const wsProtocol = isSecure ? 'wss:' : 'ws:';
      const host = window.location.host;
      return `${wsProtocol}//${host}/ws/interview/${sessionId}?token=${encodeURIComponent(token)}`;
    }
    
    // Server-side fallback
    return `ws://localhost:3001/ws/interview/${sessionId}?token=${encodeURIComponent(token)}`;
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const interviewService = new InterviewService();
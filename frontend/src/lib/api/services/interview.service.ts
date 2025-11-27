// src/lib/api/services/interview.service.ts

import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';
import type {
  CreateSessionInput,
  InterviewSession,
  SessionListResponse,
  SessionDetailResponse,
  InterviewFeedback,
  StartSessionResponse,
  SubmitResponseResult,
} from '@/types/interview.types';

// =====================================================
// ENDPOINTS
// =====================================================

const INTERVIEW_ENDPOINTS = {
  SESSIONS: '/practice/interview/sessions',
  SESSION: (id: string) => `/practice/interview/sessions/${id}`,
  SESSION_DETAIL: (id: string) => `/practice/interview/sessions/${id}/detail`,
  START: (id: string) => `/practice/interview/sessions/${id}/start`,
  CANCEL: (id: string) => `/practice/interview/sessions/${id}/cancel`,
  END: (id: string) => `/practice/interview/sessions/${id}/end`,
  RESPOND: (id: string) => `/practice/interview/sessions/${id}/respond`,
  FEEDBACK: (id: string) => `/practice/interview/sessions/${id}/feedback`,
  REGENERATE_FEEDBACK: (id: string) => `/practice/interview/sessions/${id}/feedback/regenerate`,
};

// =====================================================
// SERVICE CLASS
// =====================================================

class InterviewService {
  // ===================================================
  // SESSION MANAGEMENT
  // ===================================================

  /**
   * Create a new interview session
   */
  async createSession(input: CreateSessionInput): Promise<InterviewSession> {
    const response = await apiClient.post(INTERVIEW_ENDPOINTS.SESSIONS, input);
    return response.data.data;
  }

  /**
   * List user's interview sessions
   */
  async listSessions(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<SessionListResponse> {
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.SESSIONS, { params });
    return response.data.data;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<InterviewSession> {
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.SESSION(sessionId));
    return response.data.data;
  }

  /**
   * Get session with full details
   */
  async getSessionDetail(sessionId: string): Promise<SessionDetailResponse> {
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.SESSION_DETAIL(sessionId));
    return response.data.data;
  }

  /**
   * Start an interview session
   */
  async startSession(sessionId: string): Promise<StartSessionResponse> {
    const response = await apiClient.post(INTERVIEW_ENDPOINTS.START(sessionId));
    return response.data.data;
  }

  /**
   * Cancel an active session
   */
  async cancelSession(sessionId: string): Promise<void> {
    await apiClient.post(INTERVIEW_ENDPOINTS.CANCEL(sessionId));
  }

  /**
   * End session and get feedback
   */
  async endSession(sessionId: string): Promise<{ feedback: InterviewFeedback }> {
    const response = await apiClient.post(INTERVIEW_ENDPOINTS.END(sessionId));
    return response.data.data;
  }

  // ===================================================
  // RESPONSES
  // ===================================================

  /**
   * Submit a response (for REST-based flow)
   */
  async submitResponse(
    sessionId: string,
    answer: string,
    timeTakenSeconds?: number
  ): Promise<SubmitResponseResult> {
    const response = await apiClient.post(INTERVIEW_ENDPOINTS.RESPOND(sessionId), {
      answer,
      timeTakenSeconds,
    });
    return response.data.data;
  }

  // ===================================================
  // FEEDBACK
  // ===================================================

  /**
   * Get feedback for a completed session
   */
  async getFeedback(sessionId: string): Promise<InterviewFeedback> {
    const response = await apiClient.get(INTERVIEW_ENDPOINTS.FEEDBACK(sessionId));
    return response.data.data;
  }

  /**
   * Regenerate feedback
   */
  async regenerateFeedback(sessionId: string): Promise<InterviewFeedback> {
    const response = await apiClient.post(INTERVIEW_ENDPOINTS.REGENERATE_FEEDBACK(sessionId));
    return response.data.data;
  }

  // ===================================================
  // WEBSOCKET URL
  // ===================================================

  /**
   * Get WebSocket URL for session
   */
  getWebSocketUrl(sessionId: string, token: string): string {
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    return `${wsBase}/ws/interview/${sessionId}?token=${token}`;
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const interviewService = new InterviewService();
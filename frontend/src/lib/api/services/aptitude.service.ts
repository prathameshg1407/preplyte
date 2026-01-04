// src/lib/api/services/aptitude.service.ts

import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';
import type {
  ApiResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  ListSessionsParams,
  ListSessionsResponse,
  SessionDetailsResponse,
  GetSessionQuestionsResponse,
  GetQuestionResponse,
  SaveAnswerRequest,
  SaveAnswerResponse,
  SubmitSessionResponse,
  SessionStatusResponse,
  SessionResultsResponse,
  GetSolutionsParams,
  GetSolutionsResponse,
  TimeLimitsResponse,
  DifficultyLevelsResponse,
  QuestionTypesResponse,
} from '@/types/aptitude.types';

class AptitudeService {
  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  /**
   * Create a new practice session
   * POST /api/aptitude/sessions
   */
  async createSession(
    data: CreateSessionRequest
  ): Promise<ApiResponse<CreateSessionResponse>> {
    const response = await apiClient.post(API_ENDPOINTS.APTITUDE.SESSIONS, data);
    return response.data;
  }

  /**
   * List user's sessions with pagination and filters
   * GET /api/aptitude/sessions
   */
  async listSessions(
    params?: ListSessionsParams
  ): Promise<ApiResponse<ListSessionsResponse>> {
    const response = await apiClient.get(API_ENDPOINTS.APTITUDE.SESSIONS, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        status: params?.status ?? 'all',
        difficulty: params?.difficulty,
        sortBy: params?.sortBy ?? 'createdAt',
        sortOrder: params?.sortOrder ?? 'desc',
      },
    });
    return response.data;
  }

  /**
   * Get session details
   * GET /api/aptitude/sessions/:id
   */
  async getSession(
    sessionId: string
  ): Promise<ApiResponse<SessionDetailsResponse>> {
    const response = await apiClient.get(API_ENDPOINTS.APTITUDE.SESSION(sessionId));
    return response.data;
  }

  // =====================================================
  // QUESTIONS
  // =====================================================

  /**
   * Get all questions for a session
   * GET /api/aptitude/sessions/:id/questions
   */
  async getSessionQuestions(
    sessionId: string
  ): Promise<ApiResponse<GetSessionQuestionsResponse>> {
    const response = await apiClient.get(
      API_ENDPOINTS.APTITUDE.QUESTIONS(sessionId)
    );
    return response.data;
  }

  /**
   * Get a specific question with navigation info
   * GET /api/aptitude/sessions/:id/questions/:questionId
   */
  async getQuestion(
    sessionId: string,
    questionId: string
  ): Promise<ApiResponse<GetQuestionResponse>> {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APTITUDE.QUESTIONS(sessionId)}/${questionId}`
    );
    return response.data;
  }

  // =====================================================
  // TEST TAKING
  // =====================================================

  /**
   * Save answer for a question
   * POST /api/aptitude/sessions/:id/answer
   */
  async saveAnswer(
    sessionId: string,
    data: SaveAnswerRequest
  ): Promise<ApiResponse<SaveAnswerResponse>> {
    const response = await apiClient.post(
      API_ENDPOINTS.APTITUDE.ANSWER(sessionId),
      data
    );
    return response.data;
  }

  /**
   * Submit test for scoring
   * POST /api/aptitude/sessions/:id/submit
   */
  async submitSession(
    sessionId: string
  ): Promise<ApiResponse<SubmitSessionResponse>> {
    const response = await apiClient.post(
      API_ENDPOINTS.APTITUDE.SUBMIT(sessionId)
    );
    return response.data;
  }

  // =====================================================
  // STATUS & RESULTS
  // =====================================================

  /**
   * Get session status (timer, progress)
   * GET /api/aptitude/sessions/:id/status
   */
  async getSessionStatus(
    sessionId: string
  ): Promise<ApiResponse<SessionStatusResponse>> {
    const response = await apiClient.get(
      API_ENDPOINTS.APTITUDE.STATUS(sessionId)
    );
    return response.data;
  }

  /**
   * Get detailed session results (after completion)
   * GET /api/aptitude/sessions/:id/results
   */
  async getSessionResults(
    sessionId: string
  ): Promise<ApiResponse<SessionResultsResponse>> {
    const response = await apiClient.get(
      API_ENDPOINTS.APTITUDE.RESULTS(sessionId)
    );
    return response.data;
  }

  /**
   * Get solutions with explanations (after completion)
   * GET /api/aptitude/sessions/:id/solutions
   */
  async getSolutions(
    sessionId: string,
    params?: GetSolutionsParams
  ): Promise<ApiResponse<GetSolutionsResponse>> {
    const response = await apiClient.get(
      `${API_ENDPOINTS.APTITUDE.SESSION(sessionId)}/solutions`,
      {
        params: {
          filter: params?.filter ?? 'all',
        },
      }
    );
    return response.data;
  }

  // =====================================================
  // CONFIGURATION
  // =====================================================

  /**
   * Get time limits configuration
   * GET /api/practice/config/time-limits
   */
  async getTimeLimits(): Promise<ApiResponse<TimeLimitsResponse>> {
    const response = await apiClient.get(API_ENDPOINTS.COMMON.TIME_LIMITS);
    return response.data;
  }

  /**
   * Get difficulty levels
   * GET /api/practice/enums/difficulty-levels
   */
  async getDifficultyLevels(): Promise<ApiResponse<DifficultyLevelsResponse>> {
    const response = await apiClient.get(API_ENDPOINTS.COMMON.DIFFICULTY_LEVELS);
    return response.data;
  }

  /**
   * Get question types
   * GET /api/practice/enums/question-types
   */
  async getQuestionTypes(): Promise<ApiResponse<QuestionTypesResponse>> {
    const response = await apiClient.get(API_ENDPOINTS.COMMON.QUESTION_TYPES);
    return response.data;
  }
}

export const aptitudeService = new AptitudeService();
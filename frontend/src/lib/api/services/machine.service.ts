// src/lib/api/services/machine.service.ts

import { apiClient } from '../axios-instance';
import {
  MACHINE_ENDPOINTS,
  LANGUAGES_ENDPOINTS,
  CONFIG_ENDPOINTS,
  ENUMS_ENDPOINTS,
} from '../endpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  // Request Types
  CreateSessionRequest,
  ListSessionsQuery,
  RunCodeRequest,
  SubmitCodeRequest,
  // Response Types
  CreateSessionResponse,
  ListSessionsResponse,
  SessionDetailsResponse,
  SessionQuestionsResponse,
  QuestionDetailResponse,
  RunCodeResponse,
  SubmitCodeResponse,
  SessionStatusResponse,
  CompleteSessionResponse,
  SessionResultsResponse,
  SubmissionHistoryResponse,
  SubmissionDetailResponse,
  // Common Types
  LanguagesResponse,
  ConfigResponse,
  DifficultyLevelsResponse,
  QuestionTypesResponse,
  ProgrammingLanguage,
} from '@/types/machine.types';

class MachineService {
  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  /**
   * Create a new machine coding session
   * POST /api/machine/sessions
   * Backend: machineController.createSession -> machineService.createSession
   */
  async createSession(
    data: CreateSessionRequest
  ): Promise<ApiResponse<CreateSessionResponse>> {
    const response = await apiClient.post(MACHINE_ENDPOINTS.SESSIONS, data);
    return response.data;
  }

  /**
   * List user's sessions with filters and pagination
   * GET /api/machine/sessions
   * Backend: machineController.listSessions -> machineService.listSessions
   */
  async listSessions(
    query: ListSessionsQuery = {}
  ): Promise<ApiResponse<ListSessionsResponse>> {
    const response = await apiClient.get(MACHINE_ENDPOINTS.SESSIONS, {
      params: {
        page: query.page || 1,
        limit: query.limit || 10,
        status: query.status || 'all',
        difficulty: query.difficulty,
      },
    });
    return response.data;
  }

  /**
   * Get session details
   * GET /api/machine/sessions/:id
   * Backend: machineController.getSession -> machineService.getSessionDetails
   */
  async getSession(
    sessionId: string
  ): Promise<ApiResponse<SessionDetailsResponse>> {
    const response = await apiClient.get(MACHINE_ENDPOINTS.SESSION(sessionId));
    return response.data;
  }

  // =====================================================
  // QUESTIONS
  // =====================================================

  /**
   * Get all questions in a session
   * GET /api/machine/sessions/:id/questions
   * Backend: machineController.getSessionQuestions -> machineService.getSessionQuestions
   */
  async getSessionQuestions(
    sessionId: string
  ): Promise<ApiResponse<SessionQuestionsResponse>> {
    const response = await apiClient.get(
      MACHINE_ENDPOINTS.SESSION_QUESTIONS(sessionId)
    );
    return response.data;
  }

  /**
   * Get specific question with details and sample test cases
   * GET /api/machine/sessions/:id/questions/:questionId
   * Backend: machineController.getQuestion -> machineService.getQuestion
   */
  async getQuestion(
    sessionId: string,
    questionId: string
  ): Promise<ApiResponse<QuestionDetailResponse>> {
    const response = await apiClient.get(
      MACHINE_ENDPOINTS.SESSION_QUESTION(sessionId, questionId)
    );
    return response.data;
  }

  // =====================================================
  // CODE EXECUTION
  // =====================================================

  /**
   * Run code against sample test cases or custom input
   * POST /api/machine/sessions/:sessionId/questions/:questionId/run
   * Backend: machineController.runCode -> machineService.runCode
   *
   * Two modes:
   * 1. customInput provided -> runs with custom input, returns RunCodeResponseCustomInput
   * 2. no customInput -> runs against sample test cases, returns RunCodeResponseSampleTestCases
   */
  async runCode(
    sessionId: string,
    questionId: string,
    data: RunCodeRequest
  ): Promise<ApiResponse<RunCodeResponse>> {
    const response = await apiClient.post(
      MACHINE_ENDPOINTS.RUN_CODE(sessionId, questionId),
      {
        code: data.code,
        languageId: data.languageId,
        customInput: data.customInput,
      }
    );
    return response.data;
  }

  /**
   * Submit code for full evaluation against all test cases (SAMPLE + HIDDEN)
   * POST /api/machine/sessions/:sessionId/questions/:questionId/submit
   * Backend: machineController.submitCode -> machineService.submitCode
   */
  async submitCode(
    sessionId: string,
    questionId: string,
    data: SubmitCodeRequest
  ): Promise<ApiResponse<SubmitCodeResponse>> {
    const response = await apiClient.post(
      MACHINE_ENDPOINTS.SUBMIT_CODE(sessionId, questionId),
      {
        code: data.code,
        languageId: data.languageId,
      }
    );
    return response.data;
  }

  // =====================================================
  // SESSION CONTROL
  // =====================================================

  /**
   * Get current session status
   * GET /api/machine/sessions/:id/status
   * Backend: machineController.getSessionStatus -> machineService.getSessionStatus
   */
  async getSessionStatus(
    sessionId: string
  ): Promise<ApiResponse<SessionStatusResponse>> {
    const response = await apiClient.get(
      MACHINE_ENDPOINTS.SESSION_STATUS(sessionId)
    );
    return response.data;
  }

  /**
   * Complete/End session manually
   * POST /api/machine/sessions/:id/complete
   * Backend: machineController.completeSession -> machineService.completeSession
   */
  async completeSession(
    sessionId: string
  ): Promise<ApiResponse<CompleteSessionResponse>> {
    const response = await apiClient.post(
      MACHINE_ENDPOINTS.COMPLETE_SESSION(sessionId)
    );
    return response.data;
  }

  /**
   * Get session results (only for completed sessions)
   * GET /api/machine/sessions/:id/results
   * Backend: machineController.getSessionResults -> machineService.getSessionResults
   * Throws SessionNotCompletedError if session is not completed
   */
  async getSessionResults(
    sessionId: string
  ): Promise<ApiResponse<SessionResultsResponse>> {
    const response = await apiClient.get(
      MACHINE_ENDPOINTS.SESSION_RESULTS(sessionId)
    );
    return response.data;
  }

  // =====================================================
  // SUBMISSIONS
  // =====================================================

  /**
   * Get submission history for a question
   * GET /api/machine/sessions/:sessionId/questions/:questionId/submissions
   * Backend: machineController.getSubmissionHistory -> machineService.getSubmissionHistory
   */
  async getSubmissionHistory(
    sessionId: string,
    questionId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<SubmissionHistoryResponse>> {
    const response = await apiClient.get(
      MACHINE_ENDPOINTS.QUESTION_SUBMISSIONS(sessionId, questionId),
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  /**
   * Get specific submission details
   * GET /api/machine/submissions/:id
   * Backend: machineController.getSubmissionDetails -> machineService.getSubmissionDetails
   */
  async getSubmissionDetail(
    submissionId: string
  ): Promise<ApiResponse<SubmissionDetailResponse>> {
    const response = await apiClient.get(
      MACHINE_ENDPOINTS.SUBMISSION_DETAIL(submissionId)
    );
    return response.data;
  }

  // =====================================================
  // COMMON APIs
  // =====================================================

  /**
   * Get all programming languages
   * GET /api/languages
   * Backend: languagesController.getAllLanguages -> languagesService.getAllLanguages
   */
  async getLanguages(
    activeOnly: boolean = true
  ): Promise<ApiResponse<LanguagesResponse>> {
    const response = await apiClient.get(LANGUAGES_ENDPOINTS.LIST, {
      params: { active: activeOnly },
    });
    return response.data;
  }

  /**
   * Get language details with template
   * GET /api/languages/:id
   * Backend: languagesController.getLanguageById -> languagesService.getLanguageById
   */
  async getLanguageDetail(
    id: string
  ): Promise<ApiResponse<ProgrammingLanguage>> {
    const response = await apiClient.get(LANGUAGES_ENDPOINTS.DETAIL(id));
    return response.data;
  }

  /**
   * Get time limits configuration
   * GET /api/config/time-limits
   * Backend: configController.getTimeLimits -> configService.getTimeLimits
   */
  async getConfig(): Promise<ApiResponse<ConfigResponse>> {
    const response = await apiClient.get(CONFIG_ENDPOINTS.TIME_LIMITS);
    return response.data;
  }

  /**
   * Get difficulty levels
   * GET /api/enums/difficulty-levels
   * Backend: enumsController.getDifficultyLevels
   */
  async getDifficultyLevels(): Promise<ApiResponse<DifficultyLevelsResponse>> {
    const response = await apiClient.get(ENUMS_ENDPOINTS.DIFFICULTY_LEVELS);
    return response.data;
  }

  /**
   * Get question types and tags
   * GET /api/enums/question-types
   * Backend: enumsController.getQuestionTypes
   */
  async getQuestionTypes(): Promise<ApiResponse<QuestionTypesResponse>> {
    const response = await apiClient.get(ENUMS_ENDPOINTS.QUESTION_TYPES);
    return response.data;
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  /**
   * Check if user has an active (in-progress) session
   */
  async getActiveSession(): Promise<ApiResponse<SessionDetailsResponse | null>> {
    try {
      const response = await this.listSessions({
        status: 'in_progress',
        limit: 1,
      });

      // Check if response is successful and has data
      if (!response.success || !response.data) {
        return {
          success: true,
          data: null,
          message: 'No active session found',
        };
      }

      // Check if sessions array exists and has items
      const sessions = response.data.sessions;
      if (!sessions || sessions.length === 0) {
        return {
          success: true,
          data: null,
          message: 'No active session found',
        };
      }

      // Fetch full details of the active session
      const activeSession = sessions[0];
      const detailResponse = await this.getSession(activeSession.id);
      return detailResponse;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Failed to check active session',
      };
    }
  }

  /**
   * Validate if session is still active (not expired, not completed)
   */
  async validateSessionActive(sessionId: string): Promise<{
    isActive: boolean;
    status: string;
    message: string;
  }> {
    try {
      const response = await this.getSessionStatus(sessionId);

      if (!response.success || !response.data) {
        return {
          isActive: false,
          status: 'error',
          message: 'Failed to fetch session status',
        };
      }

      const { status, timeRemaining } = response.data;

      if (status === 'completed') {
        return {
          isActive: false,
          status: 'completed',
          message: 'Session has been completed',
        };
      }

      if (status === 'expired' || timeRemaining <= 0) {
        return {
          isActive: false,
          status: 'expired',
          message: 'Session has expired',
        };
      }

      return {
        isActive: true,
        status: 'in_progress',
        message: 'Session is active',
      };
    } catch (error) {
      return {
        isActive: false,
        status: 'error',
        message: 'Failed to validate session',
      };
    }
  }
}

export const machineService = new MachineService();
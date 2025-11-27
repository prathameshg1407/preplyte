// src/lib/api/services/machine.service.ts

import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';
import type { ApiResponse } from '../../../types/api.types';
import type {
  CreateSessionRequest,
  ListSessionsQuery,
  RunCodeRequest,
  SubmitCodeRequest,
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
  LanguagesResponse,
  ConfigResponse,
  DifficultyLevelsResponse,
  QuestionTypesResponse,
  ProgrammingLanguage,
} from '../../../types/machine.types';

// =====================================================
// CACHE UTILITY
// =====================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  // Deduplicate concurrent requests
  async dedupe<T>(key: string, request: () => Promise<T>): Promise<T> {
    const pending = this.pendingRequests.get(key);
    if (pending) return pending as Promise<T>;

    const promise = request().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new RequestCache();

// =====================================================
// CONSTANTS
// =====================================================

const CACHE_TTL = {
  STATIC: 5 * 60 * 1000,      // 5 minutes for static data
  SESSION: 30 * 1000,          // 30 seconds for session data
  LANGUAGES: 10 * 60 * 1000,   // 10 minutes for languages
} as const;

const { MACHINE, COMMON } = API_ENDPOINTS;

// =====================================================
// MACHINE SERVICE
// =====================================================

class MachineService {
  // -------------------------------------------------
  // SESSION MANAGEMENT
  // -------------------------------------------------

  async createSession(
    data: CreateSessionRequest
  ): Promise<ApiResponse<CreateSessionResponse>> {
    const response = await apiClient.post<ApiResponse<CreateSessionResponse>>(
      MACHINE.SESSIONS,
      data
    );
    
    // Invalidate session list cache
    cache.invalidate('sessions');
    
    return response.data;
  }

  async listSessions(
    query: ListSessionsQuery = {}
  ): Promise<ApiResponse<ListSessionsResponse>> {
    const params = {
      page: query.page ?? 1,
      limit: Math.min(query.limit ?? 10, 50),
      status: query.status ?? 'all',
      difficulty: query.difficulty,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
    };

    // Remove undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    );

    const cacheKey = `sessions:${JSON.stringify(cleanParams)}`;

    // Check cache for list requests
    const cached = cache.get<ApiResponse<ListSessionsResponse>>(cacheKey);
    if (cached) return cached;

    const response = await cache.dedupe(cacheKey, () =>
      apiClient.get<ApiResponse<ListSessionsResponse>>(MACHINE.SESSIONS, {
        params: cleanParams,
      })
    );

    cache.set(cacheKey, response.data, CACHE_TTL.SESSION);
    return response.data;
  }

  async getSession(
    sessionId: string
  ): Promise<ApiResponse<SessionDetailsResponse>> {
    const cacheKey = `session:${sessionId}`;

    return cache.dedupe(cacheKey, async () => {
      const response = await apiClient.get<ApiResponse<SessionDetailsResponse>>(
        MACHINE.SESSION(sessionId)
      );
      return response.data;
    });
  }

  // -------------------------------------------------
  // QUESTIONS
  // -------------------------------------------------

  async getSessionQuestions(
    sessionId: string
  ): Promise<ApiResponse<SessionQuestionsResponse>> {
    const cacheKey = `session:${sessionId}:questions`;

    const cached = cache.get<ApiResponse<SessionQuestionsResponse>>(cacheKey);
    if (cached) return cached;

    const response = await cache.dedupe(cacheKey, () =>
      apiClient.get<ApiResponse<SessionQuestionsResponse>>(
        MACHINE.QUESTIONS(sessionId)
      )
    );

    cache.set(cacheKey, response.data, CACHE_TTL.SESSION);
    return response.data;
  }

  async getQuestion(
    sessionId: string,
    questionId: string
  ): Promise<ApiResponse<QuestionDetailResponse>> {
    const cacheKey = `session:${sessionId}:question:${questionId}`;

    const cached = cache.get<ApiResponse<QuestionDetailResponse>>(cacheKey);
    if (cached) return cached;

    const response = await cache.dedupe(cacheKey, () =>
      apiClient.get<ApiResponse<QuestionDetailResponse>>(
        MACHINE.QUESTION(sessionId, questionId)
      )
    );

    cache.set(cacheKey, response.data, CACHE_TTL.SESSION);
    return response.data;
  }

  // -------------------------------------------------
  // CODE EXECUTION
  // -------------------------------------------------

  async runCode(
    sessionId: string,
    questionId: string,
    data: RunCodeRequest
  ): Promise<ApiResponse<RunCodeResponse>> {
    const response = await apiClient.post<ApiResponse<RunCodeResponse>>(
      MACHINE.RUN(sessionId, questionId),
      {
        code: data.code,
        languageId: data.languageId,
        customInput: data.customInput,
      }
    );
    return response.data;
  }

  async submitCode(
    sessionId: string,
    questionId: string,
    data: SubmitCodeRequest
  ): Promise<ApiResponse<SubmitCodeResponse>> {
    const response = await apiClient.post<ApiResponse<SubmitCodeResponse>>(
      MACHINE.SUBMIT(sessionId, questionId),
      {
        code: data.code,
        languageId: data.languageId,
      }
    );

    // Invalidate question cache to reflect new submission
    cache.invalidate(`session:${sessionId}:question:${questionId}`);

    return response.data;
  }

  // -------------------------------------------------
  // SESSION CONTROL
  // -------------------------------------------------

  async getSessionStatus(
    sessionId: string
  ): Promise<ApiResponse<SessionStatusResponse>> {
    // Don't cache status - always fetch fresh
    const response = await apiClient.get<ApiResponse<SessionStatusResponse>>(
      `${MACHINE.SESSION(sessionId)}/status`
    );
    return response.data;
  }

  async completeSession(
    sessionId: string
  ): Promise<ApiResponse<CompleteSessionResponse>> {
    const response = await apiClient.post<ApiResponse<CompleteSessionResponse>>(
      MACHINE.COMPLETE(sessionId)
    );

    // Invalidate all session-related caches
    cache.invalidate(`session:${sessionId}`);
    cache.invalidate('sessions');

    return response.data;
  }

  async getSessionResults(
    sessionId: string
  ): Promise<ApiResponse<SessionResultsResponse>> {
    const cacheKey = `session:${sessionId}:results`;

    // Results don't change - cache longer
    const cached = cache.get<ApiResponse<SessionResultsResponse>>(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get<ApiResponse<SessionResultsResponse>>(
      MACHINE.RESULTS(sessionId)
    );

    cache.set(cacheKey, response.data, CACHE_TTL.STATIC);
    return response.data;
  }

  // -------------------------------------------------
  // SUBMISSIONS
  // -------------------------------------------------

  async getSubmissionHistory(
    sessionId: string,
    questionId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<SubmissionHistoryResponse>> {
    const response = await apiClient.get<ApiResponse<SubmissionHistoryResponse>>(
      `${MACHINE.QUESTION(sessionId, questionId)}/submissions`,
      { params: { page, limit } }
    );
    return response.data;
  }

  async getSubmissionDetail(
    submissionId: string
  ): Promise<ApiResponse<SubmissionDetailResponse>> {
    const cacheKey = `submission:${submissionId}`;

    const cached = cache.get<ApiResponse<SubmissionDetailResponse>>(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get<ApiResponse<SubmissionDetailResponse>>(
      `/api/machine/submissions/${submissionId}`
    );

    cache.set(cacheKey, response.data, CACHE_TTL.STATIC);
    return response.data;
  }

  // -------------------------------------------------
  // STATIC DATA (Heavily Cached)
  // -------------------------------------------------

  async getLanguages(
    activeOnly = true
  ): Promise<ApiResponse<LanguagesResponse>> {
    const cacheKey = `languages:${activeOnly}`;

    const cached = cache.get<ApiResponse<LanguagesResponse>>(cacheKey);
    if (cached) return cached;

    const response = await cache.dedupe(cacheKey, () =>
      apiClient.get<ApiResponse<LanguagesResponse>>(COMMON.LANGUAGES, {
        params: { active: activeOnly },
      })
    );

    cache.set(cacheKey, response.data, CACHE_TTL.LANGUAGES);
    return response.data;
  }

  async getLanguageDetail(
    id: string
  ): Promise<ApiResponse<ProgrammingLanguage>> {
    const cacheKey = `language:${id}`;

    const cached = cache.get<ApiResponse<ProgrammingLanguage>>(cacheKey);
    if (cached) return cached;

    const response = await apiClient.get<ApiResponse<ProgrammingLanguage>>(
      `${COMMON.LANGUAGES}/${id}`
    );

    cache.set(cacheKey, response.data, CACHE_TTL.LANGUAGES);
    return response.data;
  }

  async getConfig(): Promise<ApiResponse<ConfigResponse>> {
    const cacheKey = 'config:time-limits';

    const cached = cache.get<ApiResponse<ConfigResponse>>(cacheKey);
    if (cached) return cached;

    const response = await cache.dedupe(cacheKey, () =>
      apiClient.get<ApiResponse<ConfigResponse>>(COMMON.TIME_LIMITS)
    );

    cache.set(cacheKey, response.data, CACHE_TTL.STATIC);
    return response.data;
  }

  async getDifficultyLevels(): Promise<ApiResponse<DifficultyLevelsResponse>> {
    const cacheKey = 'enums:difficulty-levels';

    const cached = cache.get<ApiResponse<DifficultyLevelsResponse>>(cacheKey);
    if (cached) return cached;

    const response = await cache.dedupe(cacheKey, () =>
      apiClient.get<ApiResponse<DifficultyLevelsResponse>>(
        COMMON.DIFFICULTY_LEVELS
      )
    );

    cache.set(cacheKey, response.data, CACHE_TTL.STATIC);
    return response.data;
  }

  async getQuestionTypes(): Promise<ApiResponse<QuestionTypesResponse>> {
    const cacheKey = 'enums:question-types';

    const cached = cache.get<ApiResponse<QuestionTypesResponse>>(cacheKey);
    if (cached) return cached;

    const response = await cache.dedupe(cacheKey, () =>
      apiClient.get<ApiResponse<QuestionTypesResponse>>(COMMON.QUESTION_TYPES)
    );

    cache.set(cacheKey, response.data, CACHE_TTL.STATIC);
    return response.data;
  }

  // -------------------------------------------------
  // HELPER METHODS
  // -------------------------------------------------

  async getActiveSession(): Promise<SessionDetailsResponse | null> {
    try {
      const response = await this.listSessions({
        status: 'in_progress',
        limit: 1,
      });

      const sessions = response.data?.sessions;
      if (!sessions?.length) return null;

      const detailResponse = await this.getSession(sessions[0].id);
      return detailResponse.data ?? null;
    } catch {
      return null;
    }
  }

  async validateSessionActive(sessionId: string): Promise<{
    isActive: boolean;
    status: 'in_progress' | 'completed' | 'expired' | 'error';
    message: string;
    timeRemaining?: number;
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
        timeRemaining,
      };
    } catch {
      return {
        isActive: false,
        status: 'error',
        message: 'Failed to validate session',
      };
    }
  }

  // Prefetch common data for better UX
  async prefetchStaticData(): Promise<void> {
    await Promise.allSettled([
      this.getLanguages(),
      this.getConfig(),
      this.getDifficultyLevels(),
      this.getQuestionTypes(),
    ]);
  }

  // Clear all caches (useful on logout)
  clearCache(): void {
    cache.invalidate();
  }
}

export const machineService = new MachineService();
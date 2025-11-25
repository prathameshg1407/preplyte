// src/lib/hooks/use-aptitude.ts

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAptitudeStore } from '@/lib/store/aptitude-store';
import { aptitudeService } from '@/lib/api/services/aptitude.service';
import type {
  CreateSessionRequest,
  ListSessionsParams,
  GetSolutionsParams,
  DifficultyLevel,
} from '@/types/aptitude.types';
import { toast } from 'sonner';

// =====================================================
// DEBOUNCE HELPER WITH PROPER TYPING
// =====================================================

type SaveAnswerFn = (questionId: string, optionId: string | null, sessionId: string) => void;

function createDebouncedSaveAnswer(
  func: (questionId: string, optionId: string | null, sessionId: string) => Promise<void>,
  wait: number
): SaveAnswerFn {
  let timeout: NodeJS.Timeout | null = null;
  
  return (questionId: string, optionId: string | null, sessionId: string) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(questionId, optionId, sessionId);
    }, wait);
  };
}

export function useAptitude() {
  const router = useRouter();
  const saveAnswerRef = useRef<SaveAnswerFn | null>(null);

  // Get individual selectors to prevent unnecessary re-renders
  const sessionId = useAptitudeStore((state) => state.sessionId);
  const questions = useAptitudeStore((state) => state.questions);
  const currentQuestionIndex = useAptitudeStore((state) => state.currentQuestionIndex);
  const selectedAnswers = useAptitudeStore((state) => state.selectedAnswers);
  const sessionStatus = useAptitudeStore((state) => state.sessionStatus);
  const timeLimit = useAptitudeStore((state) => state.timeLimit);
  const startedAt = useAptitudeStore((state) => state.startedAt);
  const expiresAt = useAptitudeStore((state) => state.expiresAt);
  const timeRemaining = useAptitudeStore((state) => state.timeRemaining);
  const difficulty = useAptitudeStore((state) => state.difficulty);
  const questionTypes = useAptitudeStore((state) => state.questionTypes);
  const numberOfQuestions = useAptitudeStore((state) => state.numberOfQuestions);
  const progress = useAptitudeStore((state) => state.progress);
  const result = useAptitudeStore((state) => state.result);
  const difficultyLevels = useAptitudeStore((state) => state.difficultyLevels);
  const questionTypeOptions = useAptitudeStore((state) => state.questionTypeOptions);
  const timeLimitConfig = useAptitudeStore((state) => state.timeLimitConfig);
  const isLoading = useAptitudeStore((state) => state.isLoading);
  const isSubmitting = useAptitudeStore((state) => state.isSubmitting);
  const isSavingAnswer = useAptitudeStore((state) => state.isSavingAnswer);
  const showResults = useAptitudeStore((state) => state.showResults);
  const hasUnsavedChanges = useAptitudeStore((state) => state.hasUnsavedChanges);

  // Get actions - these are stable references
  const setLoading = useAptitudeStore((state) => state.setLoading);
  const setTimeLimitConfig = useAptitudeStore((state) => state.setTimeLimitConfig);
  const setDifficultyLevels = useAptitudeStore((state) => state.setDifficultyLevels);
  const setQuestionTypeOptions = useAptitudeStore((state) => state.setQuestionTypeOptions);
  const initSession = useAptitudeStore((state) => state.initSession);
  const updateTimeRemaining = useAptitudeStore((state) => state.updateTimeRemaining);
  const updateSessionStatus = useAptitudeStore((state) => state.updateSessionStatus);
  const updateProgress = useAptitudeStore((state) => state.updateProgress);
  const selectAnswerAction = useAptitudeStore((state) => state.selectAnswer);
  const clearAnswerAction = useAptitudeStore((state) => state.clearAnswer);
  const markAnswerSaved = useAptitudeStore((state) => state.markAnswerSaved);
  const setSavingAnswer = useAptitudeStore((state) => state.setSavingAnswer);
  const setSubmitting = useAptitudeStore((state) => state.setSubmitting);
  const setResult = useAptitudeStore((state) => state.setResult);
  const resetSession = useAptitudeStore((state) => state.resetSession);
  const setShowResults = useAptitudeStore((state) => state.setShowResults);
  const goToQuestion = useAptitudeStore((state) => state.goToQuestion);
  const goToQuestionById = useAptitudeStore((state) => state.goToQuestionById);
  const nextQuestion = useAptitudeStore((state) => state.nextQuestion);
  const previousQuestion = useAptitudeStore((state) => state.previousQuestion);
  const goToFirstUnanswered = useAptitudeStore((state) => state.goToFirstUnanswered);
  const canGoNext = useAptitudeStore((state) => state.canGoNext);
  const canGoPrevious = useAptitudeStore((state) => state.canGoPrevious);
  const getAnsweredCount = useAptitudeStore((state) => state.getAnsweredCount);
  const getUnansweredCount = useAptitudeStore((state) => state.getUnansweredCount);
  const getCurrentQuestion = useAptitudeStore((state) => state.getCurrentQuestion);
  const getQuestionByIndex = useAptitudeStore((state) => state.getQuestionByIndex);
  const getQuestionById = useAptitudeStore((state) => state.getQuestionById);
  const isQuestionAnswered = useAptitudeStore((state) => state.isQuestionAnswered);
  const getQuestionStatus = useAptitudeStore((state) => state.getQuestionStatus);
  const isSessionActive = useAptitudeStore((state) => state.isSessionActive);
  const isSessionCompleted = useAptitudeStore((state) => state.isSessionCompleted);
  const isSessionExpired = useAptitudeStore((state) => state.isSessionExpired);

  // =====================================================
  // CONFIGURATION
  // =====================================================

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);

      const [timeLimitsRes, difficultyRes, questionTypesRes] = await Promise.all([
        aptitudeService.getTimeLimits(),
        aptitudeService.getDifficultyLevels(),
        aptitudeService.getQuestionTypes(),
      ]);

      if (timeLimitsRes.success && timeLimitsRes.data) {
        setTimeLimitConfig(timeLimitsRes.data.aptitude.recommendedTimeLimits);
      }

      if (difficultyRes.success && difficultyRes.data) {
        setDifficultyLevels(difficultyRes.data.difficultyLevels);
      }

      if (questionTypesRes.success && questionTypesRes.data) {
        setQuestionTypeOptions(questionTypesRes.data.aptitudeQuestionTypes);
      }

      return {
        timeLimits: timeLimitsRes.data,
        difficultyLevels: difficultyRes.data,
        questionTypes: questionTypesRes.data,
      };
    } catch (error) {
      console.error('Failed to fetch config:', error);
      toast.error('Failed to load configuration');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTimeLimitConfig, setDifficultyLevels, setQuestionTypeOptions]);

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  const createSession = useCallback(
    async (data: CreateSessionRequest) => {
      try {
        setLoading(true);

        const createResponse = await aptitudeService.createSession(data);

        if (!createResponse.success || !createResponse.data) {
          throw new Error(createResponse.error?.message || 'Failed to create session');
        }

        const session = createResponse.data;

        const questionsResponse = await aptitudeService.getSessionQuestions(session.id);

        if (!questionsResponse.success || !questionsResponse.data) {
          throw new Error(questionsResponse.error?.message || 'Failed to fetch questions');
        }

        const questionsData = questionsResponse.data;

        initSession({
          sessionId: session.id,
          questions: questionsData.questions,
          timeLimit: session.timeLimit,
          startedAt: session.startedAt,
          expiresAt: session.expiresAt,
          difficulty: session.difficulty,
          questionTypes: session.questionTypes,
          status: questionsData.status,
        });

        router.push(`/practice/aptitude/test/${session.id}`);

        toast.success('Practice session started!');
        return session.id;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
        
        if (errorMessage.includes('SESSION_IN_PROGRESS') || errorMessage.includes('active session')) {
          toast.error('You have an active session. Please complete or wait for it to expire.');
        } else {
          toast.error(errorMessage);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setLoading, initSession]
  );

  const resumeSession = useCallback(
    async (sessionIdToResume: string) => {
      try {
        setLoading(true);

        const sessionResponse = await aptitudeService.getSession(sessionIdToResume);

        if (!sessionResponse.success || !sessionResponse.data) {
          throw new Error(sessionResponse.error?.message || 'Session not found');
        }

        const session = sessionResponse.data;

        if (session.status !== 'in_progress') {
          if (session.status === 'completed') {
            toast.info('This session is already completed');
            router.push(`/practice/aptitude/result/${sessionIdToResume}`);
            return false;
          }
          if (session.status === 'expired') {
            toast.error('This session has expired');
            return false;
          }
        }

        const questionsResponse = await aptitudeService.getSessionQuestions(sessionIdToResume);

        if (!questionsResponse.success || !questionsResponse.data) {
          throw new Error(questionsResponse.error?.message || 'Failed to fetch questions');
        }

        const questionsData = questionsResponse.data;

        initSession({
          sessionId: session.id,
          questions: questionsData.questions,
          timeLimit: session.timeLimit,
          startedAt: session.startedAt,
          expiresAt: session.expiresAt,
          difficulty: session.difficulty,
          questionTypes: session.questionTypes,
          status: questionsData.status,
        });

        router.push(`/practice/aptitude/test/${sessionIdToResume}`);

        toast.success('Session resumed!');
        return true;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to resume session';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setLoading, initSession]
  );

  const fetchSessionStatus = useCallback(
    async (sessionIdToFetch: string) => {
      try {
        const response = await aptitudeService.getSessionStatus(sessionIdToFetch);

        if (response.success && response.data) {
          updateTimeRemaining(response.data.timeRemaining);
          updateSessionStatus(response.data.status);
          updateProgress(response.data.progress);
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch session status:', error);
        return null;
      }
    },
    [updateTimeRemaining, updateSessionStatus, updateProgress]
  );

  const listSessions = useCallback(async (params?: ListSessionsParams) => {
    try {
      const response = await aptitudeService.listSessions(params);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return null;
    }
  }, []);

  // =====================================================
  // ANSWER MANAGEMENT
  // =====================================================

  const saveAnswerToServer = useCallback(
    async (questionId: string, optionId: string | null, currentSessionId: string) => {
      try {
        setSavingAnswer(true);

        const response = await aptitudeService.saveAnswer(currentSessionId, {
          questionId,
          selectedOptionId: optionId,
        });

        if (response.success && response.data) {
          markAnswerSaved(questionId, response.data.answeredAt || new Date().toISOString());
          updateProgress(response.data.progress);
        }
      } catch (error) {
        console.error('Failed to save answer:', error);
      } finally {
        setSavingAnswer(false);
      }
    },
    [setSavingAnswer, markAnswerSaved, updateProgress]
  );

  const saveAnswer = useCallback(
    (questionId: string, optionId: string | null) => {
      const currentSessionId = useAptitudeStore.getState().sessionId;

      if (!currentSessionId) {
        toast.error('No active session');
        return;
      }

      if (optionId) {
        selectAnswerAction(questionId, optionId);
      } else {
        clearAnswerAction(questionId);
      }

      if (!saveAnswerRef.current) {
        saveAnswerRef.current = createDebouncedSaveAnswer(saveAnswerToServer, 500);
      }

      saveAnswerRef.current(questionId, optionId, currentSessionId);
    },
    [selectAnswerAction, clearAnswerAction, saveAnswerToServer]
  );

  const saveAnswerImmediate = useCallback(
    async (questionId: string, optionId: string | null) => {
      const currentSessionId = useAptitudeStore.getState().sessionId;

      if (!currentSessionId) return;

      try {
        setSavingAnswer(true);

        const response = await aptitudeService.saveAnswer(currentSessionId, {
          questionId,
          selectedOptionId: optionId,
        });

        if (response.success && response.data) {
          if (optionId) {
            selectAnswerAction(questionId, optionId);
          } else {
            clearAnswerAction(questionId);
          }
          markAnswerSaved(questionId, response.data.answeredAt || new Date().toISOString());
          updateProgress(response.data.progress);
        }
      } catch (error) {
        console.error('Failed to save answer:', error);
        toast.error('Failed to save answer');
      } finally {
        setSavingAnswer(false);
      }
    },
    [setSavingAnswer, selectAnswerAction, clearAnswerAction, markAnswerSaved, updateProgress]
  );

  // =====================================================
  // TEST SUBMISSION
  // =====================================================

  const submitSession = useCallback(async () => {
    const currentSessionId = useAptitudeStore.getState().sessionId;
    const currentHasUnsavedChanges = useAptitudeStore.getState().hasUnsavedChanges;

    if (!currentSessionId) {
      toast.error('No active session');
      return null;
    }

    try {
      setSubmitting(true);

      if (currentHasUnsavedChanges) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      const response = await aptitudeService.submitSession(currentSessionId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to submit test');
      }

      resetSession();
      router.push(`/practice/aptitude/result/${currentSessionId}`);

      toast.success('Test submitted successfully!');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit test';
      toast.error(errorMessage);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [router, setSubmitting, resetSession]);

  // =====================================================
  // RESULTS
  // =====================================================

  const fetchResults = useCallback(
    async (sessionIdToFetch: string) => {
      try {
        setLoading(true);

        const response = await aptitudeService.getSessionResults(sessionIdToFetch);

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to fetch results');
        }

        setResult(response.data);
        return response.data;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch results';
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setResult]
  );

  const fetchSolutions = useCallback(
    async (sessionIdToFetch: string, params?: GetSolutionsParams) => {
      try {
        const response = await aptitudeService.getSolutions(sessionIdToFetch, params);

        if (response.success && response.data) {
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch solutions:', error);
        toast.error('Failed to load solutions');
        return null;
      }
    },
    []
  );

  // =====================================================
  // UTILITY
  // =====================================================

  const getRecommendedTimeLimit = useCallback(
    (difficultyLevel: DifficultyLevel): number => {
      const currentTimeLimitConfig = useAptitudeStore.getState().timeLimitConfig;
      if (currentTimeLimitConfig && currentTimeLimitConfig[difficultyLevel]) {
        return currentTimeLimitConfig[difficultyLevel].recommended;
      }
      const defaults: Record<DifficultyLevel, number> = {
        EASY: 15,
        MEDIUM: 30,
        HARD: 45,
      };
      return defaults[difficultyLevel];
    },
    []
  );

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // State
    sessionId,
    questions,
    currentQuestionIndex,
    selectedAnswers,
    sessionStatus,
    timeLimit,
    startedAt,
    expiresAt,
    timeRemaining,
    difficulty,
    questionTypes,
    numberOfQuestions,
    progress,
    result,

    // Config
    difficultyLevels,
    questionTypeOptions,
    timeLimitConfig,

    // UI State
    isLoading,
    isSubmitting,
    isSavingAnswer,
    showResults,
    hasUnsavedChanges,

    // Navigation actions
    goToQuestion,
    goToQuestionById,
    nextQuestion,
    previousQuestion,
    goToFirstUnanswered,
    canGoNext,
    canGoPrevious,

    // Answer actions (local)
    selectAnswer: selectAnswerAction,
    clearAnswer: clearAnswerAction,

    // UI actions
    setShowResults,
    resetSession,

    // Computed
    getAnsweredCount,
    getUnansweredCount,
    getCurrentQuestion,
    getQuestionByIndex,
    getQuestionById,
    isQuestionAnswered,
    getQuestionStatus,
    isSessionActive,
    isSessionCompleted,
    isSessionExpired,

    // Async Actions
    fetchConfig,
    createSession,
    resumeSession,
    fetchSessionStatus,
    listSessions,
    saveAnswer,
    saveAnswerImmediate,
    submitSession,
    fetchResults,
    fetchSolutions,
    getRecommendedTimeLimit,
  };
}
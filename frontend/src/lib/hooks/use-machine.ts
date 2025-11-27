// src/lib/hooks/use-machine.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMachineStore } from '../store/machine-store';
import { machineService } from '../api/services/machine.service';
import type {
  CreateSessionRequest,
  ListSessionsQuery,
} from '../../types/machine.types';
import { toast } from 'sonner';

// =====================================================
// SINGLETON CONFIG LOADER
// =====================================================

// Global promise to ensure config is only loaded once across all components
let configLoadPromise: Promise<void> | null = null;
let configLoadAttempted = false;

const loadConfigSingleton = async (
  store: ReturnType<typeof useMachineStore.getState>
): Promise<void> => {
  // Check if already loaded from persisted state
  const currentState = useMachineStore.getState();
  if (currentState.configLoaded && currentState.languages.length > 0) {
    return;
  }

  // If already loading, wait for existing promise
  if (configLoadPromise) {
    return configLoadPromise;
  }

  // If already attempted and failed, don't retry immediately
  if (configLoadAttempted) {
    return;
  }

  configLoadAttempted = true;

  configLoadPromise = (async () => {
    store.setConfigLoading(true);
    store.setConfigError(null);

    try {
      const [configResponse, languagesResponse, difficultyResponse] = await Promise.all([
        machineService.getConfig(),
        machineService.getLanguages(),
        machineService.getDifficultyLevels(),
      ]);

      if (configResponse.success && configResponse.data) {
        store.setConfig(configResponse.data);
      }

      if (languagesResponse.success && languagesResponse.data) {
        store.setLanguages(languagesResponse.data.languages);
      }

      if (difficultyResponse.success && difficultyResponse.data) {
        store.setDifficultyLevels(difficultyResponse.data.difficultyLevels);
      }

      store.setConfigLoaded(true);
    } catch (error) {
      console.error('Failed to initialize config:', error);
      store.setConfigError('Failed to load configuration');
      // Reset attempt flag after delay to allow retry
      setTimeout(() => {
        configLoadAttempted = false;
        configLoadPromise = null;
      }, 5000);
      throw error;
    } finally {
      store.setConfigLoading(false);
    }
  })();

  return configLoadPromise;
};

// =====================================================
// MAIN HOOK
// =====================================================

export function useMachine() {
  const router = useRouter();
  const store = useMachineStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // =====================================================
  // TIMER MANAGEMENT - Now in SECONDS
  // =====================================================

  const startTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Track if warnings have been shown to avoid duplicates
    let fiveMinWarningShown = false;
    let oneMinWarningShown = false;

    timerRef.current = setInterval(() => {
      const { expiresAt, status, updateTimeRemaining, setSessionStatus } =
        useMachineStore.getState();

      if (!expiresAt || status === 'completed' || status === 'expired') {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      // Calculate remaining time in SECONDS
      const now = Date.now();
      const expiresTime = new Date(expiresAt).getTime();
      const remainingMs = expiresTime - now;
      const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

      if (remainingSeconds <= 0) {
        updateTimeRemaining(0);
        setSessionStatus('expired');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        toast.warning('Time is up! Your session has expired.');
        return;
      }

      updateTimeRemaining(remainingSeconds);

      // Show warnings (5 minutes = 300 seconds, 1 minute = 60 seconds)
      if (remainingSeconds <= 300 && remainingSeconds > 295 && !fiveMinWarningShown) {
        fiveMinWarningShown = true;
        toast.warning('5 minutes remaining!');
      }
      if (remainingSeconds <= 60 && remainingSeconds > 55 && !oneMinWarningShown) {
        oneMinWarningShown = true;
        toast.error('1 minute remaining!');
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // =====================================================
  // CONFIGURATION - WITH SINGLETON PATTERN
  // =====================================================

  const initializeConfig = useCallback(async () => {
    const currentStore = useMachineStore.getState();
    
    // Skip if already loaded
    if (currentStore.configLoaded && currentStore.languages.length > 0) {
      return;
    }

    // Skip if currently loading
    if (currentStore.configLoading) {
      return;
    }

    try {
      await loadConfigSingleton(currentStore);
    } catch (error) {
      // Error already handled in singleton
    }
  }, []);

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================
const checkActiveSession = useCallback(async () => {
  try {
    // getActiveSession returns data directly, not ApiResponse
    return await machineService.getActiveSession();
  } catch (error) {
    console.error('Failed to check active session:', error);
    return null;
  }
}, []);

  const createSession = useCallback(
    async (data: CreateSessionRequest) => {
      const currentStore = useMachineStore.getState();
      
      try {
        currentStore.setLoading(true);
        currentStore.setError(null);

        const response = await machineService.createSession(data);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create session');
        }

        const session = response.data;

        currentStore.initSession({
          sessionId: session.id,
          difficulty: session.difficulty,
          status: 'in_progress',
          numberOfQuestions: session.numberOfQuestions,
          timeLimit: session.timeLimit,
          startedAt: session.startedAt,
          expiresAt: session.expiresAt,
        });

        const questionsResponse = await machineService.getSessionQuestions(
          session.id
        );

        if (questionsResponse.success && questionsResponse.data) {
          currentStore.setQuestions(questionsResponse.data.questions);
        }

        startTimer();
        router.push(`/practice/machine/test/${session.id}`);

        toast.success('Session started! Good luck!');
        return session.id;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to create session';
        currentStore.setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        currentStore.setLoading(false);
      }
    },
    [router, startTimer]
  );

  const resumeSession = useCallback(
    async (sessionId: string) => {
      const currentStore = useMachineStore.getState();
      
      try {
        currentStore.setLoading(true);
        currentStore.setError(null);

        const sessionResponse = await machineService.getSession(sessionId);

        if (!sessionResponse.success || !sessionResponse.data) {
          throw new Error(sessionResponse.message || 'Failed to fetch session');
        }

        const session = sessionResponse.data;

        if (session.status === 'completed') {
          router.push(`/practice/machine/result/${sessionId}`);
          return false;
        }

        if (session.status === 'expired') {
          toast.warning('This session has expired');
          router.push('/practice/machine');
          return false;
        }

        currentStore.initSession({
          sessionId: session.id,
          difficulty: session.difficulty,
          status: session.status,
          numberOfQuestions: session.numberOfQuestions,
          timeLimit: session.timeLimit,
          startedAt: session.startedAt,
          expiresAt: session.expiresAt,
        });

        const questionsResponse = await machineService.getSessionQuestions(
          sessionId
        );

        if (questionsResponse.success && questionsResponse.data) {
          currentStore.setQuestions(questionsResponse.data.questions);
        }

        startTimer();
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to resume session';
        currentStore.setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        currentStore.setLoading(false);
      }
    },
    [router, startTimer]
  );

  const fetchSessionHistory = useCallback(
    async (query: ListSessionsQuery = {}) => {
      try {
        const response = await machineService.listSessions(query);
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch session history:', error);
        return null;
      }
    },
    []
  );

  // =====================================================
  // QUESTION MANAGEMENT
  // =====================================================

  const fetchQuestion = useCallback(
    async (questionId: string) => {
      const currentStore = useMachineStore.getState();
      const { sessionId } = currentStore;

      if (!sessionId) {
        toast.error('No active session');
        return null;
      }

      try {
        currentStore.setLoading(true);
        const response = await machineService.getQuestion(sessionId, questionId);

        if (response.success && response.data) {
          currentStore.setCurrentQuestion(response.data.question);
          return response.data;
        }

        return null;
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch question');
        return null;
      } finally {
        currentStore.setLoading(false);
      }
    },
    []
  );

  // =====================================================
  // CODE EXECUTION
  // =====================================================

  const runCode = useCallback(
    async (questionId: string, customInput?: string) => {
      const currentStore = useMachineStore.getState();
      const { sessionId, codeState, selectedLanguageId, canRunCode } = currentStore;

      if (!sessionId) {
        toast.error('No active session');
        return null;
      }

      if (!canRunCode()) {
        toast.error('Cannot run code at this time');
        return null;
      }

      const code = codeState[questionId]?.code || '';

      if (!code.trim()) {
        toast.error('Please write some code first');
        return null;
      }

      try {
        currentStore.setRunning(true);
        currentStore.setRunResult(null);
        currentStore.setError(null);

        const response = await machineService.runCode(sessionId, questionId, {
          code,
          languageId: selectedLanguageId,
          customInput,
        });

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to run code');
        }

        currentStore.setRunResult(response.data);

        if (response.data.compilationStatus === 'COMPILATION_ERROR') {
          toast.error('Compilation error');
        } else if (response.data.executionType === 'sample_test_cases') {
          const { passed, failed } = response.data.summary;
          if (failed === 0) {
            toast.success(`All ${passed} sample test cases passed!`);
          } else {
            toast.warning(`Passed ${passed}/${passed + failed} sample test cases`);
          }
        } else if (response.data.executionType === 'custom_input') {
          toast.success('Code executed successfully');
        }

        return response.data;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to run code';
        currentStore.setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        currentStore.setRunning(false);
      }
    },
    []
  );

  // =====================================================
  // CODE SUBMISSION
  // =====================================================

  const submitCode = useCallback(
    async (questionId: string) => {
      const currentStore = useMachineStore.getState();
      const { sessionId, codeState, selectedLanguageId, canSubmitCode } = currentStore;

      if (!sessionId) {
        toast.error('No active session');
        return null;
      }

      if (!canSubmitCode()) {
        toast.error('Cannot submit code at this time');
        return null;
      }

      const code = codeState[questionId]?.code || '';

      if (!code.trim()) {
        toast.error('Please write some code first');
        return null;
      }

      try {
        currentStore.setSubmitting(true);
        currentStore.setError(null);

        const response = await machineService.submitCode(sessionId, questionId, {
          code,
          languageId: selectedLanguageId,
        });

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to submit code');
        }

        currentStore.addSubmitResult(questionId, response.data);

        if (response.data.isSolved) {
          toast.success('All test cases passed! 🎉');
        } else if (response.data.status === 'COMPILATION_ERROR') {
          toast.error('Compilation error');
        } else if (response.data.status === 'TIME_LIMIT_EXCEEDED') {
          toast.warning('Time limit exceeded on some test cases');
        } else if (response.data.status === 'RUNTIME_ERROR') {
          toast.error('Runtime error on some test cases');
        } else if (response.data.status === 'MEMORY_LIMIT_EXCEEDED') {
          toast.warning('Memory limit exceeded on some test cases');
        } else {
          toast.warning(
            `Passed ${response.data.testCasesPassed}/${response.data.testCasesTotal} test cases`
          );
        }

        return response.data;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to submit code';
        currentStore.setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        currentStore.setSubmitting(false);
      }
    },
    []
  );

  // =====================================================
  // SESSION COMPLETION
  // =====================================================

  const completeSession = useCallback(async () => {
    const currentStore = useMachineStore.getState();
    const { sessionId } = currentStore;

    if (!sessionId) {
      toast.error('No active session');
      return null;
    }

    try {
      currentStore.setLoading(true);
      stopTimer();

      const response = await machineService.completeSession(sessionId);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to complete session');
      }

      currentStore.setSessionStatus('completed');
      router.push(`/practice/machine/result/${sessionId}`);

      toast.success('Session completed successfully!');
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete session');
      startTimer(); // Restart timer if completion failed
      return null;
    } finally {
      currentStore.setLoading(false);
    }
  }, [router, stopTimer, startTimer]);

  const fetchResults = useCallback(
    async (sessionId: string) => {
      const currentStore = useMachineStore.getState();
      
      try {
        currentStore.setLoading(true);
        currentStore.setError(null);

        const response = await machineService.getSessionResults(sessionId);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch results');
        }

        currentStore.setResult(response.data);
        return response.data;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch results';
        currentStore.setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        currentStore.setLoading(false);
      }
    },
    []
  );

  // =====================================================
  // HELPER METHODS
  // =====================================================

  const getSolvedCount = useCallback(() => {
    return useMachineStore.getState().getSolvedCount();
  }, []);

  const getAttemptedCount = useCallback(() => {
    return useMachineStore.getState().getAttemptedCount();
  }, []);

  const getSelectedLanguageMonacoId = useCallback(() => {
    return useMachineStore.getState().getSelectedLanguageMonacoId();
  }, []);

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Store state (reactive)
    ...store,

    // Timer
    startTimer,
    stopTimer,

    // Config Actions
    initializeConfig,

    // Session Actions
    checkActiveSession,
    createSession,
    resumeSession,
    fetchSessionHistory,

    // Question Actions
    fetchQuestion,

    // Code Execution
    runCode,

    // Submission Actions
    submitCode,

    // Completion Actions
    completeSession,
    fetchResults,

    // Helpers
    getSolvedCount,
    getAttemptedCount,
    getSelectedLanguageMonacoId,
  };
}

// =====================================================
// CONFIG INITIALIZATION HOOK
// =====================================================

/**
 * Hook to initialize config once on mount.
 * Uses singleton pattern to prevent duplicate calls.
 */
export function useMachineConfigInit() {
  const { configLoaded, configLoading, configError, _hasHydrated } = useMachineStore();
  const [isInitializing, setIsInitializing] = useState(false);
  const initAttempted = useRef(false);

  useEffect(() => {
    // Wait for hydration
    if (!_hasHydrated) {
      return;
    }

    // Skip if already loaded or loading
    if (configLoaded || configLoading || initAttempted.current) {
      return;
    }

    initAttempted.current = true;

    const init = async () => {
      setIsInitializing(true);
      try {
        await loadConfigSingleton(useMachineStore.getState());
      } catch (error) {
        // Error handled in singleton
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [_hasHydrated, configLoaded, configLoading]);

  return {
    isReady: configLoaded && !configLoading,
    isLoading: configLoading || isInitializing,
    error: configError,
    hasHydrated: _hasHydrated,
  };
}

// =====================================================
// TIMER HOOK
// =====================================================

export function useMachineTimer() {
  const { timeRemaining, expiresAt, status } = useMachineStore();

  const formatTime = useCallback((seconds: number): string => {
    if (seconds <= 0) return '00:00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  // Time thresholds in SECONDS
  const isLowTime = timeRemaining > 0 && timeRemaining <= 300; // 5 minutes
  const isCriticalTime = timeRemaining > 0 && timeRemaining <= 60; // 1 minute
  const isExpired = timeRemaining <= 0 || status === 'expired';

  return {
    timeRemaining,
    expiresAt,
    formattedTime: formatTime(timeRemaining),
    isLowTime,
    isCriticalTime,
    isExpired,
  };
}

// =====================================================
// PROGRESS HOOK
// =====================================================

export function useMachineProgress() {
  const { questions, getSolvedCount, getAttemptedCount } = useMachineStore();

  const solvedCount = getSolvedCount();
  const attemptedCount = getAttemptedCount();
  const totalCount = questions.length;

  const solvedPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
  const attemptedPercentage =
    totalCount > 0 ? (attemptedCount / totalCount) * 100 : 0;

  return {
    solvedCount,
    attemptedCount,
    totalCount,
    solvedPercentage,
    attemptedPercentage,
    remainingCount: totalCount - solvedCount,
    allSolved: solvedCount === totalCount && totalCount > 0,
  };
}

// =====================================================
// CODE EDITOR HOOK
// =====================================================

export function useMachineCodeEditor(questionId: string | null) {
  const {
    codeState,
    selectedLanguageId,
    languages,
    setCode,
    resetCode,
    getCodeForQuestion,
    getLanguageIdForQuestion,
    setSelectedLanguageId,
    getSelectedLanguageMonacoId,
  } = useMachineStore();

  const code = questionId ? getCodeForQuestion(questionId) : '';
  const languageId = questionId
    ? getLanguageIdForQuestion(questionId)
    : selectedLanguageId;
  const monacoLanguage = getSelectedLanguageMonacoId();

  const handleCodeChange = useCallback(
    (newCode: string) => {
      if (questionId) {
        setCode(questionId, newCode);
      }
    },
    [questionId, setCode]
  );

  const handleResetCode = useCallback(() => {
    if (questionId) {
      resetCode(questionId);
    }
  }, [questionId, resetCode]);

  const handleLanguageChange = useCallback(
    (newLanguageId: number) => {
      setSelectedLanguageId(newLanguageId);
    },
    [setSelectedLanguageId]
  );

  return {
    code,
    languageId,
    monacoLanguage,
    languages,
    selectedLanguageId,
    handleCodeChange,
    handleResetCode,
    handleLanguageChange,
  };
}
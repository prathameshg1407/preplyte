// src/lib/hooks/use-interview.ts

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useInterviewStore } from "../store/interview-store";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useTextToSpeech } from "./useTextToSpeech";
import {
  startInterviewSession,
  submitInterviewAnswer,
  getInterviewFeedback,
  getInterviewSession,
  getUserSessions,
  getUserSessionStats,
  deleteSession as apiDeleteSession,
  endSession as apiEndSession,
} from "../api/services/interview.service";
import { getErrorMessage } from "../api/error-handler";
import {
  AiInterviewQuestionCategory,
  AiInterviewSessionStatus,
  StartInterviewRequest,
  SubmitResponseDto,
  SessionResponse,
  SubmitResponseResult,
  FeedbackResponse,
  GetSessionsParams,
} from "../../types/aiInterview.types";

const SILENCE_TIMEOUT_SECONDS = 7;
const MAX_NO_SPEECH_RETRIES = 3;
const SUBMIT_RETRY_LIMIT = 3;

export function useInterview() {
  const router = useRouter();
  const params = useParams();
  const sessionIdFromUrl = params?.sessionId as string | undefined;

  // Store selectors
  const sessionId = useInterviewStore((s) => s.sessionId);
  const phase = useInterviewStore((s) => s.phase);
  const status = useInterviewStore((s) => s.status);
  const questions = useInterviewStore((s) => s.questions);
  const currentQuestionIndex = useInterviewStore((s) => s.currentQuestionIndex);
  const currentQuestion = useInterviewStore((s) => s.currentQuestion);
  const totalQuestions = useInterviewStore((s) => s.totalQuestions);
  const progress = useInterviewStore((s) => s.progress);
  const transcript = useInterviewStore((s) => s.transcript);
  const currentTranscript = useInterviewStore((s) => s.currentTranscript);
  const feedback = useInterviewStore((s) => s.feedback);
  const sessions = useInterviewStore((s) => s.sessions);
  const sessionsPagination = useInterviewStore((s) => s.sessionsPagination);
  const stats = useInterviewStore((s) => s.stats);
  const loading = useInterviewStore((s) => s.loading);
  const error = useInterviewStore((s) => s.error);
  const micPermission = useInterviewStore((s) => s.micPermission);
  const silenceTimer = useInterviewStore((s) => s.silenceTimer);
  const isRecording = useInterviewStore((s) => s.isRecording);
  const isAiSpeaking = useInterviewStore((s) => s.isAiSpeaking);
  const isProcessing = useInterviewStore((s) => s.isProcessing);
  const context = useInterviewStore((s) => s.context);

  // Get actions once - they're stable
  const setStatus = useInterviewStore((s) => s.setStatus);
  const setSessionStatus = useInterviewStore((s) => s.setSessionStatus);
  const addToTranscript = useInterviewStore((s) => s.addToTranscript);
  const setCurrentTranscript = useInterviewStore((s) => s.setCurrentTranscript);
  const setFeedback = useInterviewStore((s) => s.setFeedback);
  const setSessions = useInterviewStore((s) => s.setSessions);
  const setStats = useInterviewStore((s) => s.setStats);
  const setLoading = useInterviewStore((s) => s.setLoading);
  const setError = useInterviewStore((s) => s.setError);
  const setMicPermission = useInterviewStore((s) => s.setMicPermission);
  const resetSilenceTimer = useInterviewStore((s) => s.resetSilenceTimer);
  const decrementSilenceTimer = useInterviewStore((s) => s.decrementSilenceTimer);
  const initSession = useInterviewStore((s) => s.initSession);
  const advanceQuestion = useInterviewStore((s) => s.advanceQuestion);
  const updateProgress = useInterviewStore((s) => s.updateProgress);
  const completeSession = useInterviewStore((s) => s.completeSession);
  const resetSession = useInterviewStore((s) => s.resetSession);
  const resetAll = useInterviewStore((s) => s.resetAll);
  const setPhase = useInterviewStore((s) => s.setPhase);
  const setContext = useInterviewStore((s) => s.setContext);

  // Refs
  const isMountedRef = useRef(true);
  const noSpeechCountRef = useRef(0);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef(Date.now());
  const isSubmittingRef = useRef(false);
  const isLoadingSessionRef = useRef(false);
  const loadedSessionIdRef = useRef<string | null>(null);

  // Clear silence interval helper
  const clearSilenceInterval = useCallback(() => {
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
  }, []);

  // Text to Speech setup
  const {
    speak: ttsSpeak,
    stop: ttsStop,
    isSpeaking,
  } = useTextToSpeech({
    onStart: () => setStatus("AI_SPEAKING"),
    onEnd: () => {
      const state = useInterviewStore.getState();
      if (isMountedRef.current && state.phase === "interview") {
        setStatus("USER_LISTENING");
      }
    },
    onError: (error) => {
      console.warn("TTS error:", error);
      const state = useInterviewStore.getState();
      if (isMountedRef.current && state.phase === "interview") {
        setStatus("USER_LISTENING");
      }
    },
  });

  // Speak question helper
  const speakQuestion = useCallback(
    async (text: string, audioUrl?: string) => {
      addToTranscript({
        speaker: "AI",
        text,
        timestamp: new Date(),
        audioUrl,
      });
      await ttsSpeak(text);
    },
    [ttsSpeak, addToTranscript]
  );

  // Forward declare handleSubmitAnswer
  const handleSubmitAnswerRef = useRef<
    ((retryCount?: number) => Promise<void>) | null
  >(null);

  // Speech Recognition setup
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript: speechTranscript,
    startListening,
    stopListening,
    resetTranscript,
    hasPermission: micPermissionFromSpeech,
    requestPermission,
  } = useSpeechRecognition({
    onResult: (text, isFinal) => {
      setCurrentTranscript(text);
      if (isFinal) {
        noSpeechCountRef.current = 0;
        resetSilenceTimer();
      }
    },
    onSpeechDetected: () => {
      noSpeechCountRef.current = 0;
      resetSilenceTimer();
    },
    onEnd: () => {
      const state = useInterviewStore.getState();
      if (!isSubmittingRef.current && state.status === "USER_LISTENING") {
        if (state.currentTranscript.trim().length > 0) {
          handleSubmitAnswerRef.current?.();
        } else if (noSpeechCountRef.current >= MAX_NO_SPEECH_RETRIES) {
          handleSubmitAnswerRef.current?.();
        } else {
          noSpeechCountRef.current++;
        }
      }
    },
    onError: (error) => {
      if (error === "no-speech") {
        noSpeechCountRef.current++;
        if (noSpeechCountRef.current >= MAX_NO_SPEECH_RETRIES) {
          handleSubmitAnswerRef.current?.();
        }
      } else {
        setError(`Speech recognition error: ${error}`);
        setStatus("ERROR");
      }
    },
  });

  // Update mic permission in store
  useEffect(() => {
    setMicPermission(micPermissionFromSpeech);
  }, [micPermissionFromSpeech, setMicPermission]);

  // Stop recording function
  const stopRecording = useCallback(() => {
    clearSilenceInterval();
    stopListening();
  }, [stopListening, clearSilenceInterval]);

  // Submit Answer function
  const handleSubmitAnswer = useCallback(
    async (retryCount = 0) => {
      if (isSubmittingRef.current) return;

      const state = useInterviewStore.getState();
      if (!state.sessionId || !state.currentQuestion) return;

      isSubmittingRef.current = true;
      stopRecording();
      setStatus("PROCESSING_ANSWER");

      const answer = state.currentTranscript.trim() || "(No answer provided)";

      addToTranscript({
        speaker: "USER",
        text: answer,
        timestamp: new Date(),
      });

      try {
        const request: SubmitResponseDto = {
          transcript: answer,
        };

        const response: SubmitResponseResult = await submitInterviewAnswer(
          state.sessionId,
          request
        );

        if (!isMountedRef.current) {
          isSubmittingRef.current = false;
          return;
        }

        if (response.progress) {
          updateProgress(response.progress);
        }

        if (response.isComplete) {
          completeSession();
          setSessionStatus(AiInterviewSessionStatus.COMPLETED);

          try {
            const feedbackData: FeedbackResponse = await getInterviewFeedback(
              state.sessionId
            );
            setFeedback(feedbackData);
          } catch (feedbackError) {
            console.warn("Failed to fetch feedback:", feedbackError);
          }

          router.push(`/practice/ai-interview/results/${state.sessionId}`);
        } else if (response.nextQuestion) {
          advanceQuestion(response.nextQuestion, response.progress);
          await speakQuestion(
            response.nextQuestion.text,
            response.nextQuestion.audioUrl
          );
        }
      } catch (error) {
        if (!isMountedRef.current) {
          isSubmittingRef.current = false;
          return;
        }

        if (retryCount < SUBMIT_RETRY_LIMIT) {
          isSubmittingRef.current = false;
          setTimeout(
            () => handleSubmitAnswer(retryCount + 1),
            1000 * (retryCount + 1)
          );
          return;
        } else {
          setError(getErrorMessage(error));
          setStatus("ERROR");
        }
      } finally {
        isSubmittingRef.current = false;
        setCurrentTranscript("");
      }
    },
    [
      stopRecording,
      addToTranscript,
      completeSession,
      advanceQuestion,
      updateProgress,
      setFeedback,
      setError,
      setStatus,
      setCurrentTranscript,
      setSessionStatus,
      router,
      speakQuestion,
    ]
  );

  // Update ref with latest function
  useEffect(() => {
    handleSubmitAnswerRef.current = handleSubmitAnswer;
  }, [handleSubmitAnswer]);

  // Start recording function
  const startRecording = useCallback(async () => {
    if (!isSpeechSupported) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    const state = useInterviewStore.getState();
    if (!state.micPermission) {
      const granted = await requestPermission();
      if (!granted) {
        setError("Microphone permission denied");
        setStatus("ERROR");
        return;
      }
    }

    setStatus("USER_LISTENING");
    resetTranscript();
    setCurrentTranscript("");
    questionStartTimeRef.current = Date.now();
    noSpeechCountRef.current = 0;

    startListening();

    clearSilenceInterval();
    resetSilenceTimer();

    silenceIntervalRef.current = setInterval(() => {
      decrementSilenceTimer();
      const currentTimer = useInterviewStore.getState().silenceTimer;
      if (currentTimer <= 0) {
        clearSilenceInterval();
        handleSubmitAnswerRef.current?.();
      }
    }, 1000);
  }, [
    isSpeechSupported,
    requestPermission,
    resetTranscript,
    startListening,
    clearSilenceInterval,
    setError,
    setStatus,
    setCurrentTranscript,
    resetSilenceTimer,
    decrementSilenceTimer,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearSilenceInterval();
      ttsStop();
    };
  }, [clearSilenceInterval, ttsStop]);

  // Load session from URL
  useEffect(() => {
    if (!sessionIdFromUrl || phase === "results") {
      return;
    }

    if (
      isLoadingSessionRef.current ||
      loadedSessionIdRef.current === sessionIdFromUrl
    ) {
      return;
    }

    if (sessionId === sessionIdFromUrl) {
      return;
    }

    const loadSession = async () => {
      isLoadingSessionRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const session: SessionResponse =
          await getInterviewSession(sessionIdFromUrl);

        if (!isMountedRef.current) return;

        loadedSessionIdRef.current = sessionIdFromUrl;

        initSession({
          sessionId: session.sessionId,
          currentQuestion: session.currentQuestion,
          currentQuestionIndex: session.progress.questionNumber - 1,
          totalQuestions: session.progress.estimatedTotal,
          progress: session.progress,
          context: session.context,
        });

        await speakQuestion(
          session.currentQuestion.text,
          session.currentQuestion.audioUrl
        );
      } catch (error) {
        if (isMountedRef.current) {
          setError(getErrorMessage(error));
          router.push("/practice/ai-interview");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        isLoadingSessionRef.current = false;
      }
    };

    loadSession();
  }, [sessionIdFromUrl]);

  // Start new session
  const startSession = useCallback(
    async (config: StartInterviewRequest) => {
      if (!config.jobTitle?.trim()) {
        setError("Please enter a job title");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const session: SessionResponse = await startInterviewSession(config);

        if (!isMountedRef.current) return;

        loadedSessionIdRef.current = session.sessionId;

        initSession({
          sessionId: session.sessionId,
          currentQuestion: session.currentQuestion,
          currentQuestionIndex: 0,
          totalQuestions: session.progress.estimatedTotal,
          progress: session.progress,
          context: session.context,
        });

        router.push(`/practice/ai-interview/${session.sessionId}`);

        await speakQuestion(
          session.currentQuestion.text,
          session.currentQuestion.audioUrl
        );
      } catch (error) {
        if (isMountedRef.current) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [router, speakQuestion, initSession, setLoading, setError]
  );

  // End current session
  const endSession = useCallback(async () => {
    const state = useInterviewStore.getState();
    if (!state.sessionId) return;

    try {
      const feedbackData: FeedbackResponse = await apiEndSession(
        state.sessionId
      );
      setFeedback(feedbackData);
      completeSession();
      setSessionStatus(AiInterviewSessionStatus.COMPLETED);
      loadedSessionIdRef.current = null;
      router.push(`/practice/ai-interview/results/${state.sessionId}`);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }, [completeSession, setFeedback, setSessionStatus, router, setError]);

  // Delete a session
  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        await apiDeleteSession(id);
        // Refresh sessions list
        const result = await getUserSessions();
        setSessions(result);
      } catch (error) {
        setError(getErrorMessage(error));
      }
    },
    [setSessions, setError]
  );

  // Fetch user sessions with pagination
  const fetchUserSessions = useCallback(
    async (params?: GetSessionsParams) => {
      try {
        const result = await getUserSessions(params);
        setSessions(result);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    },
    [setSessions]
  );

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    try {
      const statsData = await getUserSessionStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [setStats]);

  // Manual load session function (for explicit calls)
  const loadSession = useCallback(
    async (id: string) => {
      if (isLoadingSessionRef.current) return;

      isLoadingSessionRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const session: SessionResponse = await getInterviewSession(id);

        if (!isMountedRef.current) return;

        loadedSessionIdRef.current = id;

        initSession({
          sessionId: session.sessionId,
          currentQuestion: session.currentQuestion,
          currentQuestionIndex: session.progress.questionNumber - 1,
          totalQuestions: session.progress.estimatedTotal,
          progress: session.progress,
          context: session.context,
        });

        await speakQuestion(
          session.currentQuestion.text,
          session.currentQuestion.audioUrl
        );
      } catch (error) {
        if (isMountedRef.current) {
          setError(getErrorMessage(error));
          router.push("/practice/ai-interview");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        isLoadingSessionRef.current = false;
      }
    },
    [router, speakQuestion, initSession, setLoading, setError]
  );

  return {
    // Session State
    sessionId,
    phase,
    status,
    context,

    // Questions
    questions,
    currentQuestionIndex,
    currentQuestion,
    currentQuestionText: currentQuestion?.text || "Please wait...",
    currentCategory:
      currentQuestion?.category || AiInterviewQuestionCategory.INTRODUCTORY,
    totalQuestions,
    progress,

    // Transcript
    fullTranscript: transcript,
    currentTranscript,

    // UI State
    loading,
    error,
    micPermission,
    silenceTimer,
    isRecording,
    isAiSpeaking,
    isProcessing,
    isListening,
    isSpeaking,
    isSpeechSupported,

    // User Data
    sessions,
    sessionsPagination,
    stats,
    feedback,

    // Actions
    startSession,
    loadSession,
    startRecording,
    stopRecording,
    submitAnswer: handleSubmitAnswer,
    endSession,
    deleteSession: handleDeleteSession,
    fetchUserSessions,
    fetchUserStats,
    requestMicPermission: requestPermission,
    setError,
    setLoading,
    setPhase,
    setFeedback,
    resetSession,
    resetAll,
  };
}
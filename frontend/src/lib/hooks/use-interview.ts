// src/hooks/useInterview.ts

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useInterviewStore } from "@/lib/store/interview-store";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useTextToSpeech } from "./useTextToSpeech";
import {
  startInterviewSession,
  submitInterviewAnswer,
  getInterviewFeedback,
  getInterviewSession,
  getUserSessions,
  getUserSessionStats,
  deleteSession as apiDeleteSession, // Renamed to avoid collision
  cancelSession as apiCancelSession, // Renamed to avoid collision
  createAnswerRequest,
} from "@/lib/api/services/interview.service";
import { handleApiError } from "@/lib/api/error-handler";
import {
  AiInterviewQuestionCategory,
  StartInterviewRequest,
} from "@/types/aiInterview.types";

const SILENCE_TIMEOUT_SECONDS = 7;
const MAX_NO_SPEECH_RETRIES = 3;
const SUBMIT_RETRY_LIMIT = 3;

export function useInterview() {
  const router = useRouter();
  const params = useParams();
  const sessionIdFromUrl = params?.sessionId as string | undefined;

  // Store - get all properties we need
  const {
    // State
    sessionId,
    phase,
    status,
    questions,
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    progress,
    transcript,
    currentTranscript,
    feedback,
    sessions,
    stats,
    loading,
    error,
    micPermission,
    silenceTimer,
    isRecording,
    isAiSpeaking,
    isProcessing,

    // Actions
    setSessionId,
    setPhase,
    setStatus,
    setQuestions,
    setCurrentQuestionIndex,
    addToTranscript,
    setCurrentTranscript,
    setFeedback,
    setSessions,
    setStats,
    setLoading,
    setError,
    setMicPermission,
    setSilenceTimer,
    decrementSilenceTimer,
    resetSilenceTimer,
    initSession,
    advanceQuestion,
    completeSession,
    resetSession,
    resetAll,
  } = useInterviewStore();

  // Refs
  const isMountedRef = useRef(true);
  const noSpeechCountRef = useRef(0);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef(Date.now());
  const isSubmittingRef = useRef(false);

  // Speech Recognition
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
      if (!isSubmittingRef.current && status === "USER_LISTENING") {
        handleAutoSubmit();
      }
    },
    onError: (error) => {
      if (error === "no-speech") {
        noSpeechCountRef.current++;
        if (noSpeechCountRef.current >= MAX_NO_SPEECH_RETRIES) {
          handleSubmitAnswer();
        }
      } else {
        setError(`Speech recognition error: ${error}`);
        setStatus("ERROR");
      }
    },
  });

  // Text to Speech
  const { speak: ttsSpeak, stop: ttsStop, isSpeaking } = useTextToSpeech({
    onStart: () => setStatus("AI_SPEAKING"),
    onEnd: () => {
      if (isMountedRef.current && phase === "interview") {
        setStatus("USER_LISTENING");
        startRecording();
      }
    },
    onError: (error) => console.warn("TTS error:", error),
  });

  // Update mic permission
  useEffect(() => {
    setMicPermission(micPermissionFromSpeech);
  }, [micPermissionFromSpeech, setMicPermission]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearSilenceInterval();
      ttsStop();
    };
  }, []);

  // Load session if URL has sessionId
  useEffect(() => {
    if (sessionIdFromUrl && phase !== "results") {
      loadSession(sessionIdFromUrl);
    }
  }, [sessionIdFromUrl]);

  // Helper functions
  const clearSilenceInterval = useCallback(() => {
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
  }, []);

  const startSilenceTimer = useCallback(() => {
    clearSilenceInterval();
    resetSilenceTimer();

    silenceIntervalRef.current = setInterval(() => {
      decrementSilenceTimer();

      const timer = useInterviewStore.getState().silenceTimer;
      if (timer <= 0) {
        handleAutoSubmit();
      }
    }, 1000);
  }, [decrementSilenceTimer, resetSilenceTimer]);

  const handleAutoSubmit = useCallback(() => {
    const transcript = useInterviewStore.getState().currentTranscript;

    if (transcript.trim().length > 0) {
      handleSubmitAnswer();
    } else if (noSpeechCountRef.current >= MAX_NO_SPEECH_RETRIES) {
      handleSubmitAnswer();
    } else {
      noSpeechCountRef.current++;
      startRecording();
    }
  }, []);

  // Recording
  const startRecording = useCallback(async () => {
    if (!isSpeechSupported) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    if (!micPermission) {
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
    startListening();
    startSilenceTimer();
  }, [
    isSpeechSupported,
    micPermission,
    requestPermission,
    startListening,
    resetTranscript,
    startSilenceTimer,
    setStatus,
    setCurrentTranscript,
    setError,
  ]);

  const stopRecording = useCallback(() => {
    clearSilenceInterval();
    stopListening();
  }, [stopListening, clearSilenceInterval]);

  // Submit Answer
  const handleSubmitAnswer = useCallback(
    async (retryCount = 0) => {
      if (isSubmittingRef.current) return;

      const state = useInterviewStore.getState();
      if (!state.sessionId || !state.currentQuestion) return;

      isSubmittingRef.current = true;
      stopRecording();
      setStatus("PROCESSING_ANSWER");

      const answer = state.currentTranscript.trim() || "(No answer provided)";
      const timeTaken = Math.round(
        (Date.now() - questionStartTimeRef.current) / 1000
      );

      // Add to transcript
      addToTranscript({
        speaker: "USER",
        text: answer,
        timestamp: new Date(),
      });

      try {
        const request = createAnswerRequest(
          state.currentQuestion.text,
          state.currentQuestion.category,
          answer,
          state.currentQuestionIndex,
          timeTaken,
          true
        );

        const response = await submitInterviewAnswer(state.sessionId, request);

        if (!isMountedRef.current) return;

        if (response.isComplete) {
          completeSession();

          try {
            const feedbackData = await getInterviewFeedback(state.sessionId);
            setFeedback(feedbackData);
          } catch {
            // Feedback fetch failed, but session is complete
          }

          router.push(`/practice/ai-interview/results/${state.sessionId}`);
        } else if (response.nextQuestion) {
          advanceQuestion({
            text: response.nextQuestion.text,
            category: response.nextQuestion.category as AiInterviewQuestionCategory,
          });

          await speakQuestion(
            response.nextQuestion.text,
            response.audioUrl
          );
        }
      } catch (error) {
        if (!isMountedRef.current) return;

        if (retryCount < SUBMIT_RETRY_LIMIT) {
          setTimeout(
            () => handleSubmitAnswer(retryCount + 1),
            1000 * (retryCount + 1)
          );
        } else {
          setError(handleApiError(error));
          setStatus("ERROR");
        }
      } finally {
        isSubmittingRef.current = false;
        setCurrentTranscript("");
      }
    },
    [
      stopRecording,
      setStatus,
      addToTranscript,
      completeSession,
      setFeedback,
      router,
      advanceQuestion,
      setCurrentTranscript,
      setError,
    ]
  );

  // TTS
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

  // Session Management
  const startSession = useCallback(
    async (config: StartInterviewRequest) => {
      if (!config.jobTitle?.trim()) {
        setError("Please enter a job title");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const session = await startInterviewSession(config);

        if (!isMountedRef.current) return;

        initSession({
          sessionId: session.id,
          questions: session.questions,
          currentQuestionIndex: session.currentQuestionIndex,
          totalQuestions: session.totalQuestions,
        });

        router.push(`/practice/ai-interview/${session.id}`);

        await speakQuestion(session.currentQuestion.text, session.audioUrl);
      } catch (error) {
        if (isMountedRef.current) {
          setError(handleApiError(error));
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [router, speakQuestion, initSession, setLoading, setError]
  );

  const loadSession = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const session = await getInterviewSession(id);

        if (!isMountedRef.current) return;

        initSession({
          sessionId: session.id,
          questions: session.questions,
          currentQuestionIndex: session.currentQuestionIndex,
          totalQuestions: session.totalQuestions,
        });

        await speakQuestion(session.currentQuestion.text, session.audioUrl);
      } catch (error) {
        if (isMountedRef.current) {
          setError(handleApiError(error));
          router.push("/practice/ai-interview");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [router, speakQuestion, initSession, setLoading, setError]
  );

  const cancelSession = useCallback(async () => {
    const state = useInterviewStore.getState();
    if (!state.sessionId) return;

    try {
      // FIX: Use the renamed API function
      await apiCancelSession(state.sessionId);
      resetSession();
      router.push("/practice/ai-interview");
    } catch (error) {
      setError(handleApiError(error));
    }
  }, [resetSession, router, setError]);

  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        // FIX: Use the renamed API function
        await apiDeleteSession(id);
        const currentSessions = useInterviewStore.getState().sessions;
        setSessions(currentSessions.filter((s) => s.id !== id));
      } catch (error) {
        setError(handleApiError(error));
      }
    },
    [setSessions, setError]
  );

  // User Data
  const fetchUserSessions = useCallback(async () => {
    try {
      const sessionList = await getUserSessions();
      setSessions(sessionList);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  }, [setSessions]);

  const fetchUserStats = useCallback(async () => {
    try {
      const statsData = await getUserSessionStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [setStats]);

  // Return all properties the components expect
  return {
    // Session State
    sessionId,
    phase,
    status,

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
    stats,
    feedback,

    // Actions
    startSession,
    loadSession,
    startRecording,
    stopRecording,
    submitAnswer: handleSubmitAnswer,
    cancelSession,
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
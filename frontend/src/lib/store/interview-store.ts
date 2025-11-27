// src/lib/store/interview-store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  InterviewPhase,
  InterviewUIStatus,
  TranscriptMessage,
  QuestionItem,
  FeedbackResponse,
  SessionSummary,
  SessionStats,
  AiInterviewQuestionCategory,
  AiInterviewSessionStatus,
  Progress,
  PaginatedSessionsResponse,
} from "../../types/aiInterview.types";

// ============= Constants =============

const SILENCE_TIMEOUT_SECONDS = 7;
const MAX_QUESTIONS = 15;

// ============= State Interface =============

interface InterviewState {
  // Session
  sessionId: string | null;
  phase: InterviewPhase;
  status: InterviewUIStatus;
  sessionStatus: AiInterviewSessionStatus | null;

  // Questions
  questions: QuestionItem[];
  currentQuestionIndex: number;
  totalQuestions: number;

  // Transcript
  transcript: TranscriptMessage[];
  currentTranscript: string;

  // Feedback
  feedback: FeedbackResponse | null;

  // User data (persisted)
  sessions: SessionSummary[];
  sessionsPagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  stats: SessionStats | null;

  // UI state
  loading: boolean;
  error: string | null;
  micPermission: boolean | null;
  silenceTimer: number;

  // Computed
  currentQuestion: QuestionItem | null;
  progress: Progress | null;
  isRecording: boolean;
  isAiSpeaking: boolean;
  isProcessing: boolean;

  // Context
  context: {
    jobTitle: string;
    companyName?: string;
  } | null;
}

// ============= Actions Interface =============

interface InterviewActions {
  // Setters
  setSessionId: (id: string | null) => void;
  setPhase: (phase: InterviewPhase) => void;
  setStatus: (status: InterviewUIStatus) => void;
  setSessionStatus: (status: AiInterviewSessionStatus | null) => void;
  setQuestions: (questions: QuestionItem[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setTotalQuestions: (total: number) => void;
  addToTranscript: (message: Omit<TranscriptMessage, "id">) => void;
  setCurrentTranscript: (text: string) => void;
  setFeedback: (feedback: FeedbackResponse | null) => void;
  setSessions: (data: PaginatedSessionsResponse) => void;
  setStats: (stats: SessionStats | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMicPermission: (permission: boolean | null) => void;
  setSilenceTimer: (timer: number) => void;
  decrementSilenceTimer: () => void;
  resetSilenceTimer: () => void;
  setContext: (context: { jobTitle: string; companyName?: string } | null) => void;

  // Session management
  initSession: (data: {
    sessionId: string;
    currentQuestion: QuestionItem;
    currentQuestionIndex: number;
    totalQuestions: number;
    progress: Progress;
    context: { jobTitle: string; companyName?: string };
  }) => void;
  advanceQuestion: (nextQuestion: QuestionItem, progress: Progress) => void;
  updateProgress: (progress: Progress) => void;
  completeSession: () => void;

  // Reset
  resetSession: () => void;
  resetAll: () => void;
}

type InterviewStore = InterviewState & InterviewActions;

// ============= Initial State =============

const initialState: InterviewState = {
  sessionId: null,
  phase: "start",
  status: "INITIALIZING",
  sessionStatus: null,
  questions: [],
  currentQuestionIndex: 0,
  totalQuestions: MAX_QUESTIONS,
  transcript: [],
  currentTranscript: "",
  feedback: null,
  sessions: [],
  sessionsPagination: {
    total: 0,
    page: 1,
    totalPages: 0,
  },
  stats: null,
  loading: false,
  error: null,
  micPermission: null,
  silenceTimer: SILENCE_TIMEOUT_SECONDS,
  currentQuestion: null,
  progress: null,
  isRecording: false,
  isAiSpeaking: false,
  isProcessing: false,
  context: null,
};

// ============= Store =============

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Setters
      setSessionId: (id) => set({ sessionId: id }),

      setPhase: (phase) => set({ phase }),

      setStatus: (status) =>
        set({
          status,
          isRecording: status === "USER_LISTENING",
          isAiSpeaking: status === "AI_SPEAKING",
          isProcessing: status === "PROCESSING_ANSWER",
        }),

      setSessionStatus: (sessionStatus) => set({ sessionStatus }),

      setQuestions: (questions) =>
        set({
          questions,
          currentQuestion: questions[get().currentQuestionIndex] || null,
        }),

      setCurrentQuestionIndex: (index) =>
        set((state) => ({
          currentQuestionIndex: index,
          currentQuestion: state.questions[index] || null,
        })),

      setTotalQuestions: (total) => set({ totalQuestions: total }),

      addToTranscript: (message) =>
        set((state) => ({
          transcript: [
            ...state.transcript,
            { ...message, id: crypto.randomUUID() },
          ],
        })),

      setCurrentTranscript: (text) => set({ currentTranscript: text }),

      setFeedback: (feedback) => set({ feedback }),

      setSessions: (data) =>
        set({
          sessions: data.sessions,
          sessionsPagination: {
            total: data.total,
            page: data.page,
            totalPages: data.totalPages,
          },
        }),

      setStats: (stats) => set({ stats }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setMicPermission: (permission) => set({ micPermission: permission }),

      setSilenceTimer: (timer) => set({ silenceTimer: timer }),

      decrementSilenceTimer: () =>
        set((state) => ({
          silenceTimer: Math.max(0, state.silenceTimer - 1),
        })),

      resetSilenceTimer: () => set({ silenceTimer: SILENCE_TIMEOUT_SECONDS }),

      setContext: (context) => set({ context }),

      updateProgress: (progress) =>
        set({
          progress,
          totalQuestions: progress.estimatedTotal,
        }),

      // Session management
      initSession: ({
        sessionId,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        progress,
        context,
      }) =>
        set({
          sessionId,
          questions: [currentQuestion],
          currentQuestionIndex,
          totalQuestions,
          currentQuestion,
          progress,
          context,
          phase: "interview",
          status: "INITIALIZING",
          sessionStatus: AiInterviewSessionStatus.STARTED,
          error: null,
          transcript: [],
          currentTranscript: "",
        }),

      advanceQuestion: (nextQuestion, progress) =>
        set((state) => {
          const newIndex = state.currentQuestionIndex + 1;
          const newQuestions = [...state.questions, nextQuestion];

          return {
            questions: newQuestions,
            currentQuestionIndex: newIndex,
            currentQuestion: nextQuestion,
            progress,
            totalQuestions: progress.estimatedTotal,
            currentTranscript: "",
            silenceTimer: SILENCE_TIMEOUT_SECONDS,
            sessionStatus: AiInterviewSessionStatus.IN_PROGRESS,
          };
        }),

      completeSession: () =>
        set({
          status: "ENDED",
          phase: "results",
          sessionStatus: AiInterviewSessionStatus.COMPLETED,
        }),

      // Reset
      resetSession: () =>
        set({
          sessionId: null,
          phase: "start",
          status: "INITIALIZING",
          sessionStatus: null,
          questions: [],
          currentQuestionIndex: 0,
          currentQuestion: null,
          progress: null,
          context: null,
          transcript: [],
          currentTranscript: "",
          feedback: null,
          error: null,
          silenceTimer: SILENCE_TIMEOUT_SECONDS,
        }),

      resetAll: () => set(initialState),
    }),
    {
      name: "interview-storage",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        sessions: state.sessions,
        sessionsPagination: state.sessionsPagination,
        stats: state.stats,
      }),
    }
  )
);

// ============= Selector Hooks =============

export const useInterviewSession = () =>
  useInterviewStore((state) => ({
    sessionId: state.sessionId,
    phase: state.phase,
    status: state.status,
    context: state.context,
  }));

export const useInterviewQuestions = () =>
  useInterviewStore((state) => ({
    questions: state.questions,
    currentQuestion: state.currentQuestion,
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions: state.totalQuestions,
    progress: state.progress,
  }));

export const useInterviewTranscript = () =>
  useInterviewStore((state) => ({
    transcript: state.transcript,
    currentTranscript: state.currentTranscript,
  }));

export const useInterviewUI = () =>
  useInterviewStore((state) => ({
    loading: state.loading,
    error: state.error,
    micPermission: state.micPermission,
    silenceTimer: state.silenceTimer,
    isRecording: state.isRecording,
    isAiSpeaking: state.isAiSpeaking,
    isProcessing: state.isProcessing,
  }));

export const useUserInterviewData = () =>
  useInterviewStore((state) => ({
    sessions: state.sessions,
    sessionsPagination: state.sessionsPagination,
    stats: state.stats,
    feedback: state.feedback,
  }));
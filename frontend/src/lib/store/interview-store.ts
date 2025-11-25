// src/lib/store/interview-store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  InterviewPhase,
  InterviewUIStatus,
  TranscriptMessage,
  QuestionItem,
  InterviewFeedbackResponse,
  UserSessionSummaryDto,
  UserSessionStatsResponse,
  AiInterviewQuestionCategory,
  AiInterviewSessionStatus,
} from "@/types/aiInterview.types";

// ============= Constants =============

const SILENCE_TIMEOUT_SECONDS = 7;
const MAX_QUESTIONS = 10;

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
  feedback: InterviewFeedbackResponse | null;

  // User data (persisted)
  sessions: UserSessionSummaryDto[];
  stats: UserSessionStatsResponse | null;

  // UI state
  loading: boolean;
  error: string | null;
  micPermission: boolean | null;
  silenceTimer: number;

  // Computed
  currentQuestion: QuestionItem | null;
  progress: number;
  isRecording: boolean;
  isAiSpeaking: boolean;
  isProcessing: boolean;
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
  setFeedback: (feedback: InterviewFeedbackResponse | null) => void;
  setSessions: (sessions: UserSessionSummaryDto[]) => void;
  setStats: (stats: UserSessionStatsResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMicPermission: (permission: boolean | null) => void;
  setSilenceTimer: (timer: number) => void;
  decrementSilenceTimer: () => void;
  resetSilenceTimer: () => void;

  // Session management
  initSession: (data: {
    sessionId: string;
    questions: QuestionItem[];
    currentQuestionIndex: number;
    totalQuestions: number;
  }) => void;
  advanceQuestion: (nextQuestion: QuestionItem) => void;
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
  stats: null,
  loading: false,
  error: null,
  micPermission: null,
  silenceTimer: SILENCE_TIMEOUT_SECONDS,
  currentQuestion: null,
  progress: 0,
  isRecording: false,
  isAiSpeaking: false,
  isProcessing: false,
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
          progress: ((index + 1) / state.totalQuestions) * 100,
        })),
      
      setTotalQuestions: (total) =>
        set((state) => ({
          totalQuestions: total,
          progress: ((state.currentQuestionIndex + 1) / total) * 100,
        })),
      
      addToTranscript: (message) =>
        set((state) => ({
          transcript: [
            ...state.transcript,
            { ...message, id: crypto.randomUUID() },
          ],
        })),
      
      setCurrentTranscript: (text) => set({ currentTranscript: text }),
      
      setFeedback: (feedback) => set({ feedback }),
      
      setSessions: (sessions) => set({ sessions }),
      
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

      // Session management
      initSession: ({ sessionId, questions, currentQuestionIndex, totalQuestions }) =>
        set({
          sessionId,
          questions,
          currentQuestionIndex,
          totalQuestions,
          currentQuestion: questions[currentQuestionIndex] || null,
          progress: ((currentQuestionIndex + 1) / totalQuestions) * 100,
          phase: "interview",
          status: "INITIALIZING",
          error: null,
          transcript: [],
          currentTranscript: "",
        }),

      advanceQuestion: (nextQuestion) =>
        set((state) => {
          const newIndex = state.currentQuestionIndex + 1;
          const newQuestions = [...state.questions];
          newQuestions[newIndex] = nextQuestion;
          
          return {
            questions: newQuestions,
            currentQuestionIndex: newIndex,
            currentQuestion: nextQuestion,
            progress: ((newIndex + 1) / state.totalQuestions) * 100,
            currentTranscript: "",
            silenceTimer: SILENCE_TIMEOUT_SECONDS,
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
          progress: 0,
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
    stats: state.stats,
    feedback: state.feedback,
  }));
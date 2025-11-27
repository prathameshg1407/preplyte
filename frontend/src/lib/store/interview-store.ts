// src/lib/store/interview-store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  InterviewSession,
  InterviewSessionSummary,
  InterviewFeedback,
  ConversationMessage,
  InterviewUIState,
  SessionProgress,
  QuestionCategory,
} from '@/types/interview.types';

// =====================================================
// STATE INTERFACE
// =====================================================

interface InterviewState {
  // Session data
  currentSession: InterviewSession | null;
  sessionHistory: InterviewSessionSummary[];
  historyLoading: boolean;
  historyHasMore: boolean;
  historyPage: number;

  // Conversation
  messages: ConversationMessage[];
  currentQuestion: {
    id: string;
    category: QuestionCategory;
    question: string;
    order: number;
    isFollowUp: boolean;
  } | null;

  // Progress
  progress: SessionProgress | null;

  // Feedback
  feedback: InterviewFeedback | null;
  feedbackLoading: boolean;

  // UI State
  ui: InterviewUIState;

  // Actions - Session
  setCurrentSession: (session: InterviewSession | null) => void;
  updateSessionStatus: (status: InterviewSession['status']) => void;
  setSessionHistory: (sessions: InterviewSessionSummary[], hasMore: boolean) => void;
  appendSessionHistory: (sessions: InterviewSessionSummary[], hasMore: boolean) => void;
  setHistoryLoading: (loading: boolean) => void;

  // Actions - Conversation
  addMessage: (message: ConversationMessage) => void;
  updateLastMessage: (content: string) => void;
  setCurrentQuestion: (question: InterviewState['currentQuestion']) => void;
  clearMessages: () => void;

  // Actions - Progress
  setProgress: (progress: SessionProgress) => void;

  // Actions - Feedback
  setFeedback: (feedback: InterviewFeedback | null) => void;
  setFeedbackLoading: (loading: boolean) => void;

  // Actions - UI
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setRecording: (recording: boolean) => void;
  setAISpeaking: (speaking: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setCurrentTranscript: (transcript: string) => void;
  appendTranscript: (text: string) => void;
  setError: (error: string | null) => void;
  resetUI: () => void;

  // Actions - Full Reset
  reset: () => void;
}

// =====================================================
// INITIAL STATE
// =====================================================

const initialUIState: InterviewUIState = {
  isConnected: false,
  isConnecting: false,
  isRecording: false,
  isAISpeaking: false,
  isProcessing: false,
  currentTranscript: '',
  error: null,
};

const initialState: Omit<InterviewState, 
  | 'setCurrentSession' | 'updateSessionStatus' | 'setSessionHistory' 
  | 'appendSessionHistory' | 'setHistoryLoading' | 'addMessage' 
  | 'updateLastMessage' | 'setCurrentQuestion' | 'clearMessages'
  | 'setProgress' | 'setFeedback' | 'setFeedbackLoading'
  | 'setConnected' | 'setConnecting' | 'setRecording' | 'setAISpeaking'
  | 'setProcessing' | 'setCurrentTranscript' | 'appendTranscript'
  | 'setError' | 'resetUI' | 'reset'
> = {
  currentSession: null,
  sessionHistory: [],
  historyLoading: false,
  historyHasMore: true,
  historyPage: 1,
  messages: [],
  currentQuestion: null,
  progress: null,
  feedback: null,
  feedbackLoading: false,
  ui: initialUIState,
};

// =====================================================
// STORE
// =====================================================

export const useInterviewStore = create<InterviewState>()(
  devtools(
    (set) => ({
      ...initialState,

      // ===================================================
      // SESSION ACTIONS
      // ===================================================

      setCurrentSession: (session: InterviewSession | null) => 
        set({ currentSession: session }),

      updateSessionStatus: (status: InterviewSession['status']) =>
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, status }
            : null,
        })),

      setSessionHistory: (sessions: InterviewSessionSummary[], hasMore: boolean) =>
        set({
          sessionHistory: sessions,
          historyHasMore: hasMore,
          historyPage: 1,
        }),

      appendSessionHistory: (sessions: InterviewSessionSummary[], hasMore: boolean) =>
        set((state) => ({
          sessionHistory: [...state.sessionHistory, ...sessions],
          historyHasMore: hasMore,
          historyPage: state.historyPage + 1,
        })),

      setHistoryLoading: (loading: boolean) => 
        set({ historyLoading: loading }),

      // ===================================================
      // CONVERSATION ACTIONS
      // ===================================================

      addMessage: (message: ConversationMessage) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateLastMessage: (content: string) =>
        set((state) => {
          const messages = [...state.messages];
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content,
            };
          }
          return { messages };
        }),

      setCurrentQuestion: (question: InterviewState['currentQuestion']) => 
        set({ currentQuestion: question }),

      clearMessages: () => 
        set({ messages: [], currentQuestion: null }),

      // ===================================================
      // PROGRESS ACTIONS
      // ===================================================

      setProgress: (progress: SessionProgress) => 
        set({ progress }),

      // ===================================================
      // FEEDBACK ACTIONS
      // ===================================================

      setFeedback: (feedback: InterviewFeedback | null) => 
        set({ feedback }),

      setFeedbackLoading: (loading: boolean) => 
        set({ feedbackLoading: loading }),

      // ===================================================
      // UI ACTIONS
      // ===================================================

      setConnected: (connected: boolean) =>
        set((state) => ({
          ui: { ...state.ui, isConnected: connected, isConnecting: false },
        })),

      setConnecting: (connecting: boolean) =>
        set((state) => ({
          ui: { ...state.ui, isConnecting: connecting },
        })),

      setRecording: (recording: boolean) =>
        set((state) => ({
          ui: { ...state.ui, isRecording: recording },
        })),

      setAISpeaking: (speaking: boolean) =>
        set((state) => ({
          ui: { ...state.ui, isAISpeaking: speaking },
        })),

      setProcessing: (processing: boolean) =>
        set((state) => ({
          ui: { ...state.ui, isProcessing: processing },
        })),

      setCurrentTranscript: (transcript: string) =>
        set((state) => ({
          ui: { ...state.ui, currentTranscript: transcript },
        })),

      appendTranscript: (text: string) =>
        set((state) => ({
          ui: {
            ...state.ui,
            currentTranscript: state.ui.currentTranscript + ' ' + text,
          },
        })),

      setError: (error: string | null) =>
        set((state) => ({
          ui: { ...state.ui, error },
        })),

      resetUI: () =>
        set(() => ({
          ui: initialUIState,
        })),

      // ===================================================
      // FULL RESET
      // ===================================================

      reset: () => set(initialState),
    }),
    { name: 'interview-store' }
  )
);

// =====================================================
// SELECTORS
// =====================================================

export const selectCurrentSession = (state: InterviewState) => state.currentSession;
export const selectMessages = (state: InterviewState) => state.messages;
export const selectProgress = (state: InterviewState) => state.progress;
export const selectFeedback = (state: InterviewState) => state.feedback;
export const selectUI = (state: InterviewState) => state.ui;
export const selectIsInterviewActive = (state: InterviewState) =>
  state.currentSession?.status === 'STARTED' ||
  state.currentSession?.status === 'IN_PROGRESS';
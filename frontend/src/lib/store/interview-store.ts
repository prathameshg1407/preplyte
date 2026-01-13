// src/lib/store/interview-store.ts

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  InterviewSession,
  InterviewSessionSummary,
  InterviewFeedback,
  ConversationMessage,
  InterviewUIState,
  SessionProgress,
  CurrentQuestion,
  InterviewSessionStatus,
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
  currentQuestion: CurrentQuestion | null;

  // Progress
  progress: SessionProgress | null;

  // Feedback
  feedback: InterviewFeedback | null;
  feedbackLoading: boolean;

  // UI State
  ui: InterviewUIState;

  // Actions - Session
  setCurrentSession: (session: InterviewSession | null) => void;
  updateSessionStatus: (status: InterviewSessionStatus) => void;
  updateSessionProgress: (progress: Partial<SessionProgress>) => void;
  setSessionHistory: (sessions: InterviewSessionSummary[], hasMore: boolean) => void;
  appendSessionHistory: (sessions: InterviewSessionSummary[], hasMore: boolean) => void;
  setHistoryLoading: (loading: boolean) => void;
  incrementHistoryPage: () => void;

  // Actions - Conversation
  addMessage: (message: ConversationMessage) => void;
  updateMessage: (id: string, updates: Partial<ConversationMessage>) => void;
  updateLastMessage: (content: string) => void;
  setCurrentQuestion: (question: CurrentQuestion | null) => void;
  clearMessages: () => void;

  // Actions - Progress
  setProgress: (progress: SessionProgress | null) => void;

  // Actions - Feedback
  setFeedback: (feedback: InterviewFeedback | null) => void;
  setFeedbackLoading: (loading: boolean) => void;

  // Actions - UI
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setRecording: (recording: boolean) => void;
  setAISpeaking: (speaking: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setCurrentTranscript: (transcript: string) => void;
  appendTranscript: (text: string) => void;
  clearTranscript: () => void;
  setError: (error: string | null) => void;
  incrementConnectionAttempts: () => void;
  resetConnectionAttempts: () => void;
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
  isPaused: false,
  currentTranscript: '',
  error: null,
  connectionAttempts: 0,
};

const getInitialState = () => ({
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
  ui: { ...initialUIState },
});

// =====================================================
// STORE
// =====================================================

export const useInterviewStore = create<InterviewState>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        ...getInitialState(),

        // ===================================================
        // SESSION ACTIONS
        // ===================================================

        setCurrentSession: (session) =>
          set((state) => {
            state.currentSession = session;
            if (session) {
              state.progress = session.progress;
            }
          }),

        updateSessionStatus: (status) =>
          set((state) => {
            if (state.currentSession) {
              state.currentSession.status = status;
            }
          }),

        updateSessionProgress: (progress) =>
          set((state) => {
            if (state.progress) {
              Object.assign(state.progress, progress);
            }
            if (state.currentSession) {
              Object.assign(state.currentSession.progress, progress);
            }
          }),

        setSessionHistory: (sessions, hasMore) =>
          set((state) => {
            state.sessionHistory = sessions;
            state.historyHasMore = hasMore;
            state.historyPage = 1;
          }),

        appendSessionHistory: (sessions, hasMore) =>
          set((state) => {
            const existingIds = new Set(state.sessionHistory.map(s => s.id));
            const newSessions = sessions.filter(s => !existingIds.has(s.id));
            state.sessionHistory.push(...newSessions);
            state.historyHasMore = hasMore;
          }),

        setHistoryLoading: (loading) =>
          set((state) => {
            state.historyLoading = loading;
          }),

        incrementHistoryPage: () =>
          set((state) => {
            state.historyPage += 1;
          }),

        // ===================================================
        // CONVERSATION ACTIONS
        // ===================================================

        addMessage: (message) =>
          set((state) => {
            if (!state.messages.some(m => m.id === message.id)) {
              state.messages.push(message);
            }
          }),

        updateMessage: (id, updates) =>
          set((state) => {
            const index = state.messages.findIndex((m) => m.id === id);
            if (index !== -1) {
              Object.assign(state.messages[index], updates);
            }
          }),

        updateLastMessage: (content) =>
          set((state) => {
            if (state.messages.length > 0) {
              state.messages[state.messages.length - 1].content = content;
            }
          }),

        setCurrentQuestion: (question) =>
          set((state) => {
            state.currentQuestion = question;
            if (question && !state.messages.some(m => m.id === question.id)) {
               state.messages.push({
                 id: question.id, // Use the same ID so we don't duplicate
                 role: 'assistant',
                 content: question.question,
                 timestamp: new Date(), // Or question.startedAt if available
                 category: question.category,
                 isFollowUp: question.isFollowUp
               });
            }
          }),

        clearMessages: () =>
          set((state) => {
            state.messages = [];
            state.currentQuestion = null;
          }),

        // ===================================================
        // PROGRESS ACTIONS
        // ===================================================

        setProgress: (progress) =>
          set((state) => {
            state.progress = progress;
          }),

        // ===================================================
        // FEEDBACK ACTIONS
        // ===================================================

        setFeedback: (feedback) =>
          set((state) => {
            state.feedback = feedback;
          }),

        setFeedbackLoading: (loading) =>
          set((state) => {
            state.feedbackLoading = loading;
          }),

        // ===================================================
        // UI ACTIONS
        // ===================================================

        setConnected: (connected) =>
          set((state) => {
            state.ui.isConnected = connected;
            state.ui.isConnecting = false;
            if (connected) {
              state.ui.error = null;
              state.ui.connectionAttempts = 0;
            }
          }),

        setConnecting: (connecting) =>
          set((state) => {
            state.ui.isConnecting = connecting;
          }),

        setRecording: (recording) =>
          set((state) => {
            state.ui.isRecording = recording;
          }),

        setAISpeaking: (speaking) =>
          set((state) => {
            state.ui.isAISpeaking = speaking;
          }),

        setProcessing: (processing) =>
          set((state) => {
            state.ui.isProcessing = processing;
          }),

        setPaused: (paused) =>
          set((state) => {
            state.ui.isPaused = paused;
          }),

        setCurrentTranscript: (transcript) =>
          set((state) => {
            state.ui.currentTranscript = transcript;
          }),

        appendTranscript: (text) =>
          set((state) => {
            const current = state.ui.currentTranscript.trim();
            state.ui.currentTranscript = current ? `${current} ${text}` : text;
          }),

        clearTranscript: () =>
          set((state) => {
            state.ui.currentTranscript = '';
          }),

        setError: (error) =>
          set((state) => {
            state.ui.error = error;
          }),

        incrementConnectionAttempts: () =>
          set((state) => {
            state.ui.connectionAttempts += 1;
          }),

        resetConnectionAttempts: () =>
          set((state) => {
            state.ui.connectionAttempts = 0;
          }),

        resetUI: () =>
          set((state) => {
            state.ui = { ...initialUIState };
          }),

        // ===================================================
        // FULL RESET
        // ===================================================

        reset: () => set(getInitialState()),
      }))
    ),
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
export const selectCurrentQuestion = (state: InterviewState) => state.currentQuestion;

export const selectIsInterviewActive = (state: InterviewState) =>
  state.currentSession?.status === 'STARTED' ||
  state.currentSession?.status === 'IN_PROGRESS';

export const selectCanRecord = (state: InterviewState) =>
  state.ui.isConnected &&
  !state.ui.isAISpeaking &&
  !state.ui.isProcessing &&
  !state.ui.isPaused;

export const selectConnectionStatus = (state: InterviewState) => ({
  isConnected: state.ui.isConnected,
  isConnecting: state.ui.isConnecting,
  attempts: state.ui.connectionAttempts,
  error: state.ui.error,
});
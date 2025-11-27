// src/lib/store/aptitude-store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  SessionQuestion,
  SelectedAnswers,
  DifficultyLevel,
  QuestionType,
  SessionStatus,
  SessionResultsResponse,
  DifficultyLevelInfo,
  AptitudeQuestionTypeInfo,
  SessionProgress,
  TimeLimitConfig,
} from '../../types/aptitude.types';

// =====================================================
// STORE STATE INTERFACE
// =====================================================

interface AptitudeState {
  // Session State
  sessionId: string | null;
  questions: SessionQuestion[];
  currentQuestionIndex: number;
  selectedAnswers: SelectedAnswers;
  sessionStatus: SessionStatus | null;

  // Timer State
  timeLimit: number; // in minutes
  startedAt: string | null;
  expiresAt: string | null;
  timeRemaining: number; // in seconds

  // Config State
  difficulty: DifficultyLevel | null;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  
  // Configuration Options (from API)
  difficultyLevels: DifficultyLevelInfo[];
  questionTypeOptions: AptitudeQuestionTypeInfo[];
  timeLimitConfig: Record<DifficultyLevel, TimeLimitConfig> | null;

  // Result State
  result: SessionResultsResponse | null;

  // Progress State
  progress: SessionProgress;

  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  isSavingAnswer: boolean;
  showResults: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: string | null;
}

// =====================================================
// STORE ACTIONS INTERFACE
// =====================================================

interface AptitudeActions {
  // Config Actions
  setDifficultyLevels: (levels: DifficultyLevelInfo[]) => void;
  setQuestionTypeOptions: (types: AptitudeQuestionTypeInfo[]) => void;
  setTimeLimitConfig: (config: Record<DifficultyLevel, TimeLimitConfig>) => void;

  // Session Actions
  initSession: (params: {
    sessionId: string;
    questions: SessionQuestion[];
    timeLimit: number;
    startedAt: string;
    expiresAt: string;
    difficulty: DifficultyLevel;
    questionTypes: QuestionType[];
    status: SessionStatus;
  }) => void;
  
  updateSessionStatus: (status: SessionStatus) => void;
  updateTimeRemaining: (seconds: number) => void;
  updateProgress: (progress: SessionProgress) => void;

  // Answer Actions
  selectAnswer: (questionId: string, optionId: string) => void;
  clearAnswer: (questionId: string) => void;
  markAnswerSaved: (questionId: string, answeredAt: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  // Navigation Actions
  goToQuestion: (index: number) => void;
  goToQuestionById: (questionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToFirstUnanswered: () => void;

  // Result Actions
  setResult: (result: SessionResultsResponse) => void;
  clearResult: () => void;

  // UI Actions
  setLoading: (isLoading: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSavingAnswer: (isSaving: boolean) => void;
  setShowResults: (show: boolean) => void;

  // Reset Actions
  resetSession: () => void;
  clearStore: () => void;

  // Computed Getters
  getAnsweredCount: () => number;
  getUnansweredCount: () => number;
  getCurrentQuestion: () => SessionQuestion | null;
  getQuestionByIndex: (index: number) => SessionQuestion | null;
  getQuestionById: (id: string) => SessionQuestion | null;
  isQuestionAnswered: (questionId: string) => boolean;
  getQuestionStatus: (index: number) => 'answered' | 'current' | 'unanswered';
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  isSessionActive: () => boolean;
  isSessionCompleted: () => boolean;
  isSessionExpired: () => boolean;
}

// =====================================================
// COMBINED STORE TYPE
// =====================================================

type AptitudeStore = AptitudeState & AptitudeActions;

// =====================================================
// INITIAL STATE
// =====================================================

const initialProgress: SessionProgress = {
  answered: 0,
  unanswered: 0,
  total: 0,
};

const initialState: AptitudeState = {
  // Session
  sessionId: null,
  questions: [],
  currentQuestionIndex: 0,
  selectedAnswers: {},
  sessionStatus: null,

  // Timer
  timeLimit: 0,
  startedAt: null,
  expiresAt: null,
  timeRemaining: 0,

  // Config
  difficulty: null,
  questionTypes: [],
  numberOfQuestions: 0,
  difficultyLevels: [],
  questionTypeOptions: [],
  timeLimitConfig: null,

  // Result
  result: null,

  // Progress
  progress: initialProgress,

  // UI
  isLoading: false,
  isSubmitting: false,
  isSavingAnswer: false,
  showResults: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,
};

// =====================================================
// STORE IMPLEMENTATION
// =====================================================

export const useAptitudeStore = create<AptitudeStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // -------------------------------------------
        // CONFIG ACTIONS
        // -------------------------------------------

        setDifficultyLevels: (levels) => {
          set({ difficultyLevels: levels });
        },

        setQuestionTypeOptions: (types) => {
          set({ questionTypeOptions: types });
        },

        setTimeLimitConfig: (config) => {
          set({ timeLimitConfig: config });
        },

        // -------------------------------------------
        // SESSION ACTIONS
        // -------------------------------------------

        initSession: (params) => {
          const {
            sessionId,
            questions,
            timeLimit,
            startedAt,
            expiresAt,
            difficulty,
            questionTypes,
            status,
          } = params;

          // Pre-populate selectedAnswers from questions
          const selectedAnswers: SelectedAnswers = {};
          questions.forEach((q) => {
            if (q.selectedOptionId) {
              selectedAnswers[q.id] = q.selectedOptionId;
            }
          });

          // Calculate time remaining
          const expiresDate = new Date(expiresAt);
          const now = new Date();
          const timeRemaining = Math.max(
            0,
            Math.floor((expiresDate.getTime() - now.getTime()) / 1000)
          );

          // Calculate progress
          const answered = Object.keys(selectedAnswers).length;
          const progress: SessionProgress = {
            answered,
            unanswered: questions.length - answered,
            total: questions.length,
          };

          set({
            sessionId,
            questions,
            timeLimit,
            startedAt,
            expiresAt,
            difficulty,
            questionTypes,
            numberOfQuestions: questions.length,
            sessionStatus: status,
            currentQuestionIndex: 0,
            selectedAnswers,
            timeRemaining,
            progress,
            result: null,
            showResults: false,
            hasUnsavedChanges: false,
            lastSavedAt: null,
          });
        },

        updateSessionStatus: (status) => {
          set({ sessionStatus: status });
        },

        updateTimeRemaining: (seconds) => {
          set({ timeRemaining: Math.max(0, seconds) });
        },

        updateProgress: (progress) => {
          set({ progress });
        },

        // -------------------------------------------
        // ANSWER ACTIONS
        // -------------------------------------------

        selectAnswer: (questionId, optionId) => {
          set((state) => {
            const newAnswers = {
              ...state.selectedAnswers,
              [questionId]: optionId,
            };
            const answered = Object.keys(newAnswers).length;
            
            return {
              selectedAnswers: newAnswers,
              hasUnsavedChanges: true,
              progress: {
                ...state.progress,
                answered,
                unanswered: state.questions.length - answered,
              },
            };
          });
        },

        clearAnswer: (questionId) => {
          set((state) => {
            const newAnswers = { ...state.selectedAnswers };
            delete newAnswers[questionId];
            const answered = Object.keys(newAnswers).length;
            
            return {
              selectedAnswers: newAnswers,
              hasUnsavedChanges: true,
              progress: {
                ...state.progress,
                answered,
                unanswered: state.questions.length - answered,
              },
            };
          });
        },

        markAnswerSaved: (questionId, answeredAt) => {
          set((state) => {
            // Update the question's answeredAt in the questions array
            const updatedQuestions = state.questions.map((q) =>
              q.id === questionId
                ? { ...q, answeredAt, selectedOptionId: state.selectedAnswers[questionId] || null }
                : q
            );

            return {
              questions: updatedQuestions,
              hasUnsavedChanges: false,
              lastSavedAt: answeredAt,
            };
          });
        },

        setHasUnsavedChanges: (hasChanges) => {
          set({ hasUnsavedChanges: hasChanges });
        },

        // -------------------------------------------
        // NAVIGATION ACTIONS
        // -------------------------------------------

        goToQuestion: (index) => {
          const { questions } = get();
          if (index >= 0 && index < questions.length) {
            set({ currentQuestionIndex: index });
          }
        },

        goToQuestionById: (questionId) => {
          const { questions } = get();
          const index = questions.findIndex((q) => q.id === questionId);
          if (index !== -1) {
            set({ currentQuestionIndex: index });
          }
        },

        nextQuestion: () => {
          const { currentQuestionIndex, questions } = get();
          if (currentQuestionIndex < questions.length - 1) {
            set({ currentQuestionIndex: currentQuestionIndex + 1 });
          }
        },

        previousQuestion: () => {
          const { currentQuestionIndex } = get();
          if (currentQuestionIndex > 0) {
            set({ currentQuestionIndex: currentQuestionIndex - 1 });
          }
        },

        goToFirstUnanswered: () => {
          const { questions, selectedAnswers } = get();
          const firstUnansweredIndex = questions.findIndex(
            (q) => !selectedAnswers[q.id]
          );
          if (firstUnansweredIndex !== -1) {
            set({ currentQuestionIndex: firstUnansweredIndex });
          }
        },

        // -------------------------------------------
        // RESULT ACTIONS
        // -------------------------------------------

        setResult: (result) => {
          set({
            result,
            showResults: true,
            sessionStatus: 'completed',
            hasUnsavedChanges: false,
          });
        },

        clearResult: () => {
          set({ result: null, showResults: false });
        },

        // -------------------------------------------
        // UI ACTIONS
        // -------------------------------------------

        setLoading: (isLoading) => set({ isLoading }),
        setSubmitting: (isSubmitting) => set({ isSubmitting }),
        setSavingAnswer: (isSavingAnswer) => set({ isSavingAnswer }),
        setShowResults: (showResults) => set({ showResults }),

        // -------------------------------------------
        // RESET ACTIONS
        // -------------------------------------------

        resetSession: () => {
          const { difficultyLevels, questionTypeOptions, timeLimitConfig } = get();
          set({
            ...initialState,
            difficultyLevels,
            questionTypeOptions,
            timeLimitConfig,
          });
        },

        clearStore: () => {
          set(initialState);
        },

        // -------------------------------------------
        // COMPUTED GETTERS
        // -------------------------------------------

        getAnsweredCount: () => {
          const { selectedAnswers } = get();
          return Object.keys(selectedAnswers).length;
        },

        getUnansweredCount: () => {
          const { questions, selectedAnswers } = get();
          return questions.length - Object.keys(selectedAnswers).length;
        },

        getCurrentQuestion: () => {
          const { questions, currentQuestionIndex } = get();
          return questions[currentQuestionIndex] || null;
        },

        getQuestionByIndex: (index) => {
          const { questions } = get();
          return questions[index] || null;
        },

        getQuestionById: (id) => {
          const { questions } = get();
          return questions.find((q) => q.id === id) || null;
        },

        isQuestionAnswered: (questionId) => {
          const { selectedAnswers } = get();
          return !!selectedAnswers[questionId];
        },

        getQuestionStatus: (index) => {
          const { questions, selectedAnswers, currentQuestionIndex } = get();
          if (index === currentQuestionIndex) return 'current';
          const question = questions[index];
          if (question && selectedAnswers[question.id]) return 'answered';
          return 'unanswered';
        },

        canGoNext: () => {
          const { currentQuestionIndex, questions } = get();
          return currentQuestionIndex < questions.length - 1;
        },

        canGoPrevious: () => {
          const { currentQuestionIndex } = get();
          return currentQuestionIndex > 0;
        },

        isSessionActive: () => {
          const { sessionStatus } = get();
          return sessionStatus === 'in_progress';
        },

        isSessionCompleted: () => {
          const { sessionStatus } = get();
          return sessionStatus === 'completed';
        },

        isSessionExpired: () => {
          const { sessionStatus } = get();
          return sessionStatus === 'expired';
        },
      }),
      {
        name: 'aptitude-practice-store',
        partialize: (state) => ({
          // Only persist essential session data
          sessionId: state.sessionId,
          selectedAnswers: state.selectedAnswers,
          currentQuestionIndex: state.currentQuestionIndex,
          startedAt: state.startedAt,
          expiresAt: state.expiresAt,
          difficulty: state.difficulty,
          questionTypes: state.questionTypes,
          sessionStatus: state.sessionStatus,
        }),
      }
    ),
    { name: 'AptitudeStore' }
  )
);

// =====================================================
// SELECTOR HOOKS
// =====================================================

export const useAptitudeSession = () =>
  useAptitudeStore((state) => ({
    sessionId: state.sessionId,
    questions: state.questions,
    currentQuestionIndex: state.currentQuestionIndex,
    selectedAnswers: state.selectedAnswers,
    difficulty: state.difficulty,
    questionTypes: state.questionTypes,
    numberOfQuestions: state.numberOfQuestions,
    sessionStatus: state.sessionStatus,
    progress: state.progress,
  }));

export const useAptitudeTimer = () =>
  useAptitudeStore((state) => ({
    timeLimit: state.timeLimit,
    startedAt: state.startedAt,
    expiresAt: state.expiresAt,
    timeRemaining: state.timeRemaining,
    updateTimeRemaining: state.updateTimeRemaining,
  }));

export const useAptitudeUI = () =>
  useAptitudeStore((state) => ({
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    isSavingAnswer: state.isSavingAnswer,
    showResults: state.showResults,
    hasUnsavedChanges: state.hasUnsavedChanges,
    lastSavedAt: state.lastSavedAt,
  }));

export const useAptitudeNavigation = () =>
  useAptitudeStore((state) => ({
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions: state.questions.length,
    goToQuestion: state.goToQuestion,
    goToQuestionById: state.goToQuestionById,
    nextQuestion: state.nextQuestion,
    previousQuestion: state.previousQuestion,
    goToFirstUnanswered: state.goToFirstUnanswered,
    canGoNext: state.canGoNext,
    canGoPrevious: state.canGoPrevious,
  }));

export const useAptitudeConfig = () =>
  useAptitudeStore((state) => ({
    difficultyLevels: state.difficultyLevels,
    questionTypeOptions: state.questionTypeOptions,
    timeLimitConfig: state.timeLimitConfig,
    setDifficultyLevels: state.setDifficultyLevels,
    setQuestionTypeOptions: state.setQuestionTypeOptions,
    setTimeLimitConfig: state.setTimeLimitConfig,
  }));

export const useAptitudeResult = () =>
  useAptitudeStore((state) => ({
    result: state.result,
    setResult: state.setResult,
    clearResult: state.clearResult,
  }));
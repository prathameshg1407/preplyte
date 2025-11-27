// src/lib/store/mock-drive/attempt-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AttemptState,
  CurrentModuleState,
  ModuleData,
  AptitudeModuleData,
  MachineModuleData,
  AiInterviewModuleData,
  MockDriveModuleAttemptStatus,
  MOCKDRIVE_CONSTANTS,
  AptitudeQuestionAttempt,
} from '@/types/mockdrive.types';

interface AttemptStoreState {
  // Current attempt state
  currentDriveId: string | null;
  attemptState: AttemptState | null;
  currentModule: CurrentModuleState | null;

  // Local module data (for optimistic updates)
  localModuleData: Partial<ModuleData> | null;

  // UI state
  showSubmitConfirm: boolean;
  showTimeWarning: boolean;
  showExitConfirm: boolean;
  tabSwitchCount: number;
  fullscreenMode: boolean;
  isSubmitting: boolean;
  isRunningCode: boolean;

  // Actions
  setAttemptState: (state: AttemptState | null) => void;
  setCurrentModule: (module: CurrentModuleState | null) => void;
  setLocalModuleData: (data: Partial<ModuleData> | null) => void;
  updateLocalModuleData: (data: Partial<ModuleData>) => void;
  setCurrentDriveId: (driveId: string | null) => void;

  // Aptitude-specific actions
  updateAptitudeAnswer: (questionId: string, selectedOptionId: string | null) => void;
  updateAptitudeMarkForReview: (questionId: string, isMarked: boolean) => void;

  // Machine-specific actions
  setIsRunningCode: (running: boolean) => void;

  // UI actions
  setShowSubmitConfirm: (show: boolean) => void;
  setShowTimeWarning: (show: boolean) => void;
  setShowExitConfirm: (show: boolean) => void;
  incrementTabSwitchCount: () => void;
  resetTabSwitchCount: () => void;
  setFullscreenMode: (fullscreen: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;

  // Computed / helpers
  isModuleInProgress: () => boolean;
  canSubmitModule: () => boolean;
  shouldShowTabWarning: () => boolean;
  getAptitudeProgress: () => { answered: number; total: number; markedForReview: number } | null;

  // Reset
  reset: () => void;
  resetModule: () => void;
}

const initialState = {
  currentDriveId: null,
  attemptState: null,
  currentModule: null,
  localModuleData: null,
  showSubmitConfirm: false,
  showTimeWarning: false,
  showExitConfirm: false,
  tabSwitchCount: 0,
  fullscreenMode: false,
  isSubmitting: false,
  isRunningCode: false,
};

export const useAttemptStore = create<AttemptStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAttemptState: (state) => set({ attemptState: state }),

      setCurrentModule: (module) =>
        set({
          currentModule: module,
          localModuleData: module?.data ? (module.data as Partial<ModuleData>) : null,
        }),

      setLocalModuleData: (data) => set({ localModuleData: data }),

      updateLocalModuleData: (data: Partial<ModuleData>) => {
        const current = get().localModuleData;
        if (current) {
          const merged = Object.assign({}, current, data) as Partial<ModuleData>;
          set({ localModuleData: merged });
        } else {
          set({ localModuleData: data });
        }
      },

      setCurrentDriveId: (driveId) => set({ currentDriveId: driveId }),

      // Aptitude-specific: update answer in local state
      updateAptitudeAnswer: (questionId: string, selectedOptionId: string | null) => {
        const current = get().localModuleData;

        if (!current || !('questions' in current)) return;

        const aptitudeData = current as Partial<AptitudeModuleData>;
        if (!aptitudeData.questions) return;

        const updatedQuestions = aptitudeData.questions.map((q) =>
          q.questionId === questionId
            ? {
                ...q,
                selectedOptionId,
                answeredAt: selectedOptionId ? new Date().toISOString() : null,
              }
            : q
        );

        const updatedData: Partial<AptitudeModuleData> = {
          ...aptitudeData,
          questions: updatedQuestions,
        };

        set({
          localModuleData: updatedData as Partial<ModuleData>,
        });
      },

      // Aptitude-specific: mark for review
      updateAptitudeMarkForReview: (questionId: string, isMarked: boolean) => {
        const current = get().localModuleData;

        if (!current || !('questions' in current)) return;

        const aptitudeData = current as Partial<AptitudeModuleData>;
        if (!aptitudeData.questions) return;

        const updatedQuestions = aptitudeData.questions.map((q) =>
          q.questionId === questionId
            ? { ...q, isMarkedForReview: isMarked }
            : q
        );

        const updatedData: Partial<AptitudeModuleData> = {
          ...aptitudeData,
          questions: updatedQuestions,
        };

        set({
          localModuleData: updatedData as Partial<ModuleData>,
        });
      },

      setIsRunningCode: (running) => set({ isRunningCode: running }),

      setShowSubmitConfirm: (show) => set({ showSubmitConfirm: show }),

      setShowTimeWarning: (show) => set({ showTimeWarning: show }),

      setShowExitConfirm: (show) => set({ showExitConfirm: show }),

      incrementTabSwitchCount: () =>
        set((state) => ({
          tabSwitchCount: state.tabSwitchCount + 1,
        })),

      resetTabSwitchCount: () => set({ tabSwitchCount: 0 }),

      setFullscreenMode: (fullscreen) => set({ fullscreenMode: fullscreen }),

      setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

      // Computed helpers
      isModuleInProgress: () => {
        const { currentModule } = get();
        return currentModule?.status === MockDriveModuleAttemptStatus.IN_PROGRESS;
      },

      canSubmitModule: () => {
        const { currentModule, isSubmitting } = get();
        return (
          currentModule?.status === MockDriveModuleAttemptStatus.IN_PROGRESS &&
          !isSubmitting
        );
      },

      shouldShowTabWarning: () => {
        const { tabSwitchCount } = get();
        return tabSwitchCount >= MOCKDRIVE_CONSTANTS.MAX_TAB_SWITCHES_WARNING;
      },

      getAptitudeProgress: () => {
        const { localModuleData } = get();
        
        if (!localModuleData || !('questions' in localModuleData)) return null;
        
        const aptitudeData = localModuleData as Partial<AptitudeModuleData>;
        if (!aptitudeData.questions) return null;

        const questions = aptitudeData.questions as AptitudeQuestionAttempt[];
        const answered = questions.filter((q) => q.selectedOptionId !== null).length;
        const markedForReview = questions.filter((q) => q.isMarkedForReview).length;

        return {
          answered,
          total: questions.length,
          markedForReview,
        };
      },

      reset: () => set(initialState),

      resetModule: () =>
        set({
          currentModule: null,
          localModuleData: null,
          showSubmitConfirm: false,
          showTimeWarning: false,
          showExitConfirm: false,
          isSubmitting: false,
          isRunningCode: false,
        }),
    }),
    {
      name: 'mockdrive-attempt',
      partialize: (state) => ({
        currentDriveId: state.currentDriveId,
        tabSwitchCount: state.tabSwitchCount,
      }),
    }
  )
);

// Selector hooks for common use cases
export const useCurrentModule = () => useAttemptStore((state) => state.currentModule);
export const useAttemptStateData = () => useAttemptStore((state) => state.attemptState);
export const useLocalModuleData = () => useAttemptStore((state) => state.localModuleData);
export const useIsModuleInProgress = () => useAttemptStore((state) => state.isModuleInProgress());
export const useAptitudeProgress = () => useAttemptStore((state) => state.getAptitudeProgress());

// Type-safe selector for specific module data types
export const useAptitudeModuleData = () =>
  useAttemptStore((state) => {
    const data = state.localModuleData;
    if (data && 'questions' in data && Array.isArray(data.questions)) {
      const firstQuestion = data.questions[0];
      if (firstQuestion && 'selectedOptionId' in firstQuestion) {
        return data as Partial<AptitudeModuleData>;
      }
    }
    return null;
  });

export const useMachineModuleData = () =>
  useAttemptStore((state) => {
    const data = state.localModuleData;
    if (data && 'questions' in data && Array.isArray(data.questions)) {
      const firstQuestion = data.questions[0];
      if (firstQuestion && 'machineQuestionId' in firstQuestion) {
        return data as Partial<MachineModuleData>;
      }
    }
    return null;
  });

export const useInterviewModuleData = () =>
  useAttemptStore((state) => {
    const data = state.localModuleData;
    if (data && 'conversation' in data && 'responses' in data) {
      return data as Partial<AiInterviewModuleData>;
    }
    return null;
  });
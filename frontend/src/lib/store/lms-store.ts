// src/lib/store/lms-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GetCoursesParams, DifficultyLevel } from '@/types/lms.types';

// Filter types
interface LmsFilters extends GetCoursesParams {
  search?: string;
  categorySlug?: string;
  difficulty?: DifficultyLevel;
  priceRange?: 'free' | 'paid' | 'all';
  sortBy?: 'popular' | 'newest' | 'price-low' | 'price-high';
  page?: number;
  limit?: number;
}

// Test state types
interface TestState {
  attemptId: string;
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> optionId
  flaggedQuestions: Set<string>;
  startTime: number;
  timeRemaining: number;
  totalQuestions: number;
}

// Serializable test state for persistence
interface SerializableTestState {
  attemptId: string;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  flaggedQuestions: string[];
  startTime: number;
  timeRemaining: number;
  totalQuestions: number;
}

// Video progress tracking
interface VideoProgress {
  lessonId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
}

// Course progress cache
interface CourseProgressCache {
  courseSlug: string;
  completedLessons: string[];
  currentModuleOrder: number;
  currentLessonOrder: number;
  lastUpdated: number;
}

interface LmsStore {
  // Filters
  filters: LmsFilters;
  setFilters: (filters: Partial<LmsFilters>) => void;
  resetFilters: () => void;

  // Test state
  testState: TestState | null;
  initTestState: (attemptId: string, totalQuestions: number, timeLimit: number) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  setCurrentQuestion: (index: number) => void;
  toggleFlaggedQuestion: (questionId: string) => void;
  updateTimeRemaining: (seconds: number) => void;
  clearTestState: () => void;

  // Video progress
  videoProgress: Record<string, VideoProgress>;
  updateVideoProgress: (lessonId: string, progress: Partial<VideoProgress>) => void;
  getVideoProgress: (lessonId: string) => VideoProgress | undefined;
  clearVideoProgress: (lessonId: string) => void;

  // Course progress cache
  courseProgressCache: Record<string, CourseProgressCache>;
  updateCourseProgressCache: (courseSlug: string, progress: Partial<CourseProgressCache>) => void;
  getCourseProgressCache: (courseSlug: string) => CourseProgressCache | undefined;
  clearCourseProgressCache: (courseSlug: string) => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Recently viewed courses
  recentlyViewedCourses: string[];
  addRecentlyViewedCourse: (courseSlug: string) => void;
  clearRecentlyViewedCourses: () => void;
}

const defaultFilters: LmsFilters = {
  page: 1,
  limit: 12,
  priceRange: 'all',
  sortBy: 'popular',
};

const defaultVideoProgress: VideoProgress = {
  lessonId: '',
  currentTime: 0,
  duration: 0,
  completed: false,
};

const defaultCourseProgressCache: CourseProgressCache = {
  courseSlug: '',
  completedLessons: [],
  currentModuleOrder: 1,
  currentLessonOrder: 1,
  lastUpdated: 0,
};

export const useLmsStore = create<LmsStore>()(
  persist(
    (set, get) => ({
      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 },
        })),
      resetFilters: () => set({ filters: defaultFilters }),

      // Test state
      testState: null,
      initTestState: (attemptId, totalQuestions, timeLimit) =>
        set({
          testState: {
            attemptId,
            currentQuestionIndex: 0,
            answers: {},
            flaggedQuestions: new Set(),
            startTime: Date.now(),
            timeRemaining: timeLimit,
            totalQuestions,
          },
        }),
      setAnswer: (questionId, optionId) =>
        set((state) => {
          if (!state.testState) return state;
          return {
            testState: {
              ...state.testState,
              answers: {
                ...state.testState.answers,
                [questionId]: optionId,
              },
            },
          };
        }),
      setCurrentQuestion: (index) =>
        set((state) => {
          if (!state.testState) return state;
          // Ensure index is within bounds
          const clampedIndex = Math.max(0, Math.min(index, state.testState.totalQuestions - 1));
          return {
            testState: {
              ...state.testState,
              currentQuestionIndex: clampedIndex,
            },
          };
        }),
      toggleFlaggedQuestion: (questionId) =>
        set((state) => {
          if (!state.testState) return state;
          const flaggedQuestions = new Set(state.testState.flaggedQuestions);
          if (flaggedQuestions.has(questionId)) {
            flaggedQuestions.delete(questionId);
          } else {
            flaggedQuestions.add(questionId);
          }
          return {
            testState: {
              ...state.testState,
              flaggedQuestions,
            },
          };
        }),
      updateTimeRemaining: (seconds) =>
        set((state) => {
          if (!state.testState) return state;
          return {
            testState: {
              ...state.testState,
              timeRemaining: Math.max(0, seconds),
            },
          };
        }),
      clearTestState: () => set({ testState: null }),

      // Video progress
      videoProgress: {},
      updateVideoProgress: (lessonId, progress) =>
        set((state) => {
          const existing = state.videoProgress[lessonId];
          return {
            videoProgress: {
              ...state.videoProgress,
              [lessonId]: {
                ...defaultVideoProgress,
                ...existing,
                ...progress,
                lessonId, // Ensure lessonId is always correct
              },
            },
          };
        }),
      getVideoProgress: (lessonId) => get().videoProgress[lessonId],
      clearVideoProgress: (lessonId) =>
        set((state) => {
          const { [lessonId]: _, ...rest } = state.videoProgress;
          return { videoProgress: rest };
        }),

      // Course progress cache
      courseProgressCache: {},
      updateCourseProgressCache: (courseSlug, progress) =>
        set((state) => {
          const existing = state.courseProgressCache[courseSlug];
          return {
            courseProgressCache: {
              ...state.courseProgressCache,
              [courseSlug]: {
                ...defaultCourseProgressCache,
                ...existing,
                ...progress,
                courseSlug, // Ensure courseSlug is always correct
                lastUpdated: Date.now(),
              },
            },
          };
        }),
      getCourseProgressCache: (courseSlug) => get().courseProgressCache[courseSlug],
      clearCourseProgressCache: (courseSlug) =>
        set((state) => {
          const { [courseSlug]: _, ...rest } = state.courseProgressCache;
          return { courseProgressCache: rest };
        }),

      // UI state
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Recently viewed courses
      recentlyViewedCourses: [],
      addRecentlyViewedCourse: (courseSlug) =>
        set((state) => {
          const filtered = state.recentlyViewedCourses.filter((slug) => slug !== courseSlug);
          return {
            recentlyViewedCourses: [courseSlug, ...filtered].slice(0, 10), // Keep last 10
          };
        }),
      clearRecentlyViewedCourses: () => set({ recentlyViewedCourses: [] }),
    }),
    {
      name: 'lms-store',
      partialize: (state) => ({
        // Only persist these fields
        filters: state.filters,
        videoProgress: state.videoProgress,
        courseProgressCache: state.courseProgressCache,
        sidebarCollapsed: state.sidebarCollapsed,
        recentlyViewedCourses: state.recentlyViewedCourses,
        // Convert Set to Array for testState persistence
        testState: state.testState
          ? {
            ...state.testState,
            flaggedQuestions: Array.from(state.testState.flaggedQuestions),
          }
          : null,
      }),
      // Handle rehydration to convert flaggedQuestions back to Set
      onRehydrateStorage: () => (state) => {
        if (state?.testState) {
          const serializedState = state.testState as unknown as SerializableTestState;
          state.testState = {
            ...serializedState,
            flaggedQuestions: new Set(serializedState.flaggedQuestions || []),
          };
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useLmsFilters = () => useLmsStore((state) => state.filters);
export const useTestState = () => useLmsStore((state) => state.testState);
export const useVideoProgress = (lessonId: string) =>
  useLmsStore((state) => state.videoProgress[lessonId]);
export const useSidebarCollapsed = () => useLmsStore((state) => state.sidebarCollapsed);

// Actions only (no state subscription)
export const useLmsActions = () =>
  useLmsStore((state) => ({
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    initTestState: state.initTestState,
    setAnswer: state.setAnswer,
    setCurrentQuestion: state.setCurrentQuestion,
    toggleFlaggedQuestion: state.toggleFlaggedQuestion,
    updateTimeRemaining: state.updateTimeRemaining,
    clearTestState: state.clearTestState,
    updateVideoProgress: state.updateVideoProgress,
    clearVideoProgress: state.clearVideoProgress,
    updateCourseProgressCache: state.updateCourseProgressCache,
    clearCourseProgressCache: state.clearCourseProgressCache,
    toggleSidebar: state.toggleSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
    addRecentlyViewedCourse: state.addRecentlyViewedCourse,
    clearRecentlyViewedCourses: state.clearRecentlyViewedCourses,
  }));
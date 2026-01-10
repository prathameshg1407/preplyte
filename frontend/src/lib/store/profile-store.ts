// src/lib/store/profile-store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  CompleteProfile,
  UserProfile,
  StudentProfile,
  Resume,
  Department,
  CreateStudentProfileInput,
  UpdateStudentProfileInput,
  UpdateUserProfileInput,
  AcademicMarksInput,
  ProfileCompletionStatus,
} from '@/types/profile.types';
import { profileService } from '@/lib/api/services/profile.service';

// =====================================================
// TYPES
// =====================================================

interface ProfileState {
  // Data
  userProfile: UserProfile | null;
  studentProfile: StudentProfile | null;
  resumes: Resume[];
  resumeCount: number;
  maxResumes: number;
  profileCompletion: ProfileCompletionStatus | null;
  departments: Department[];

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isUploadingResume: boolean;
  isDepartmentsLoading: boolean;

  // Fetch tracking (prevents duplicate calls)
  _profileFetched: boolean;
  _resumesFetched: boolean;
  _departmentsFetched: boolean;

  // Error state
  error: string | null;

  // Actions - Profile
  fetchCompleteProfile: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (input: UpdateUserProfileInput) => Promise<void>;

  // Actions - Departments
  fetchDepartments: () => Promise<void>;

  // Actions - Student Profile
  createStudentProfile: (input: CreateStudentProfileInput) => Promise<void>;
  fetchStudentProfile: () => Promise<void>;
  updateStudentProfile: (input: UpdateStudentProfileInput) => Promise<void>;
  deleteStudentProfile: () => Promise<void>;

  // Actions - Skills
  addSkills: (skills: string[]) => Promise<void>;
  removeSkills: (skills: string[]) => Promise<void>;

  // Actions - Academics
  updateAcademicMarks: (input: AcademicMarksInput) => Promise<void>;

  // Actions - Resumes
  fetchResumes: () => Promise<void>;
  uploadResume: (file: File) => Promise<Resume>;
  deleteResume: (resumeId: string) => Promise<void>;
  setDefaultResume: (resumeId: string) => Promise<void>;
  linkResumeToProfile: (resumeId: string) => Promise<void>;

  // Utility
  clearError: () => void;
  reset: () => void;
  invalidateResumes: () => void;
  invalidateProfile: () => void;
  invalidateDepartments: () => void;
}

// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {
  userProfile: null,
  studentProfile: null,
  resumes: [],
  resumeCount: 0,
  maxResumes: 5,
  profileCompletion: null,
  departments: [],
  isLoading: false,
  isUpdating: false,
  isUploadingResume: false,
  isDepartmentsLoading: false,
  _profileFetched: false,
  _resumesFetched: false,
  _departmentsFetched: false,
  error: null,
};

// =====================================================
// STORE
// =====================================================

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // =================================================
      // PROFILE ACTIONS
      // =================================================

      fetchCompleteProfile: async () => {
        const state = get();

        // Prevent duplicate fetches
        if (state.isLoading || state._profileFetched) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await profileService.getCompleteProfile();
          set({
            userProfile: data.user,
            studentProfile: data.studentProfile,
            resumes: data.resumes,
            resumeCount: data.resumes.length,
            profileCompletion: data.profileCompletion,
            departments: data.availableDepartments,
            isLoading: false,
            _profileFetched: true,
            _resumesFetched: true,
            _departmentsFetched: true,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch profile',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchUserProfile: async () => {
        const state = get();

        if (state.isLoading) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await profileService.getUserProfile();
          set({
            userProfile: data,
            studentProfile: data.studentProfile,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch user profile',
            isLoading: false,
          });
          throw error;
        }
      },

      updateUserProfile: async (input) => {
        set({ isUpdating: true, error: null });

        try {
          const data = await profileService.updateUserProfile(input);
          set({
            userProfile: data,
            isUpdating: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update profile',
            isUpdating: false,
          });
          throw error;
        }
      },

      // =================================================
      // DEPARTMENT ACTIONS
      // =================================================

      fetchDepartments: async () => {
        const state = get();

        // Prevent duplicate fetches
        if (state.isDepartmentsLoading || state._departmentsFetched) {
          return;
        }

        set({ isDepartmentsLoading: true, error: null });

        try {
          const data = await profileService.getDepartments();
          set({
            departments: data.departments,
            isDepartmentsLoading: false,
            _departmentsFetched: true,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch departments',
            isDepartmentsLoading: false,
          });
          throw error;
        }
      },

      // =================================================
      // STUDENT PROFILE ACTIONS
      // =================================================

      createStudentProfile: async (input) => {
        set({ isUpdating: true, error: null });

        try {
          const data = await profileService.createStudentProfile(input);
          set({
            studentProfile: data,
            isUpdating: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to create student profile',
            isUpdating: false,
          });
          throw error;
        }
      },

      fetchStudentProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const data = await profileService.getStudentProfile();
          set({
            studentProfile: data,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch student profile',
            isLoading: false,
          });
          throw error;
        }
      },

      updateStudentProfile: async (input) => {
        set({ isUpdating: true, error: null });

        try {
          const data = await profileService.updateStudentProfile(input);
          set({
            studentProfile: data,
            isUpdating: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update student profile',
            isUpdating: false,
          });
          throw error;
        }
      },

      deleteStudentProfile: async () => {
        set({ isUpdating: true, error: null });

        try {
          await profileService.deleteStudentProfile();
          set({
            studentProfile: null,
            isUpdating: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete student profile',
            isUpdating: false,
          });
          throw error;
        }
      },

      // =================================================
      // SKILLS ACTIONS
      // =================================================

      addSkills: async (skills) => {
        set({ isUpdating: true, error: null });

        try {
          const data = await profileService.addSkills(skills);
          set({
            studentProfile: data,
            isUpdating: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to add skills',
            isUpdating: false,
          });
          throw error;
        }
      },

      removeSkills: async (skills) => {
        set({ isUpdating: true, error: null });

        try {
          const data = await profileService.removeSkills(skills);
          set({
            studentProfile: data,
            isUpdating: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to remove skills',
            isUpdating: false,
          });
          throw error;
        }
      },

      // =================================================
      // ACADEMICS ACTIONS
      // =================================================

      updateAcademicMarks: async (input) => {
        set({ isUpdating: true, error: null });

        try {
          const data = await profileService.updateAcademicMarks(input);
          set({
            studentProfile: data,
            isUpdating: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update academic marks',
            isUpdating: false,
          });
          throw error;
        }
      },

      // =================================================
      // RESUME ACTIONS
      // =================================================

      fetchResumes: async () => {
        const state = get();

        // Prevent duplicate fetches
        if (state.isLoading || state._resumesFetched) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await profileService.getResumes();
          set({
            resumes: data.resumes,
            resumeCount: data.total,
            maxResumes: data.maxAllowed,
            isLoading: false,
            _resumesFetched: true,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch resumes',
            isLoading: false,
          });
          throw error;
        }
      },

      uploadResume: async (file) => {
        set({ isUploadingResume: true, error: null });

        try {
          const data = await profileService.uploadResume(file);
          set((state) => ({
            resumes: [data, ...state.resumes],
            resumeCount: state.resumeCount + 1,
            isUploadingResume: false,
          }));
          return data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to upload resume',
            isUploadingResume: false,
          });
          throw error;
        }
      },

      deleteResume: async (resumeId) => {
        set({ isUpdating: true, error: null });

        try {
          await profileService.deleteResume(resumeId);
          set((state) => ({
            resumes: state.resumes.filter((r) => r.id !== resumeId),
            resumeCount: state.resumeCount - 1,
            isUpdating: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete resume',
            isUpdating: false,
          });
          throw error;
        }
      },

      setDefaultResume: async (resumeId) => {
        set({ isUpdating: true, error: null });

        try {
          await profileService.setDefaultResume(resumeId);
          set((state) => ({
            resumes: state.resumes.map((r) => ({
              ...r,
              isDefault: r.id === resumeId,
            })),
            isUpdating: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to set default resume',
            isUpdating: false,
          });
          throw error;
        }
      },

      linkResumeToProfile: async (resumeId) => {
        set({ isUpdating: true, error: null });

        try {
          await profileService.linkResumeToProfile(resumeId);
          const studentProfile = await profileService.getStudentProfile();
          set({
            studentProfile,
            isUpdating: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to link resume',
            isUpdating: false,
          });
          throw error;
        }
      },

      // =================================================
      // UTILITY ACTIONS
      // =================================================

      clearError: () => set({ error: null }),

      invalidateResumes: () => set({ _resumesFetched: false }),

      invalidateProfile: () =>
        set({ _profileFetched: false, _resumesFetched: false, _departmentsFetched: false }),

      invalidateDepartments: () => set({ _departmentsFetched: false }),

      reset: () => set(initialState),
    }),
    { name: 'profile-store' }
  )
);

export default useProfileStore;
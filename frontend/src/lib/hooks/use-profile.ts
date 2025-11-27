// src/lib/hooks/use-profile.ts

import { useCallback, useEffect } from 'react';
import { useProfileStore } from '@/lib/store/profile-store';
import type {
  CreateStudentProfileInput,
  UpdateStudentProfileInput,
  UpdateUserProfileInput,
  AcademicMarksInput,
} from '@/types/profile.types';

export const useProfile = () => {
  const store = useProfileStore();

  // Fetch complete profile on mount
  const initializeProfile = useCallback(async () => {
    if (!store.userProfile && !store.isLoading) {
      await store.fetchCompleteProfile();
    }
  }, [store]);

  return {
    // Data
    userProfile: store.userProfile,
    studentProfile: store.studentProfile,
    resumes: store.resumes,
    resumeCount: store.resumeCount,
    maxResumes: store.maxResumes,
    profileCompletion: store.profileCompletion,

    // Loading states
    isLoading: store.isLoading,
    isUpdating: store.isUpdating,
    isUploadingResume: store.isUploadingResume,

    // Error
    error: store.error,
    clearError: store.clearError,

    // Initialize
    initializeProfile,

    // Profile actions
    fetchCompleteProfile: store.fetchCompleteProfile,
    fetchUserProfile: store.fetchUserProfile,
    updateUserProfile: store.updateUserProfile,

    // Student profile actions
    createStudentProfile: store.createStudentProfile,
    fetchStudentProfile: store.fetchStudentProfile,
    updateStudentProfile: store.updateStudentProfile,
    deleteStudentProfile: store.deleteStudentProfile,

    // Skills actions
    addSkills: store.addSkills,
    removeSkills: store.removeSkills,

    // Academics actions
    updateAcademicMarks: store.updateAcademicMarks,

    // Resume actions
    fetchResumes: store.fetchResumes,
    uploadResume: store.uploadResume,
    deleteResume: store.deleteResume,
    setDefaultResume: store.setDefaultResume,
    linkResumeToProfile: store.linkResumeToProfile,

    // Computed
    hasStudentProfile: !!store.studentProfile,
    hasResumes: store.resumes.length > 0,
    canUploadMore: store.resumeCount < store.maxResumes,
    defaultResume: store.resumes.find((r) => r.isDefault) || null,

    // Reset
    reset: store.reset,
  };
};

// Hook for auto-fetching profile
export const useProfileData = () => {
  const { initializeProfile, ...rest } = useProfile();

  useEffect(() => {
    initializeProfile();
  }, [initializeProfile]);

  return rest;
};

export default useProfile;
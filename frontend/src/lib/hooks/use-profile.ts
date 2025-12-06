import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useProfileStore } from '@/lib/store/profile-store';
import type {
  CreateStudentProfileInput,
  UpdateStudentProfileInput,
  UpdateUserProfileInput,
  AcademicMarksInput,
} from '@/types/profile.types';

// =====================================================
// MAIN PROFILE HOOK
// =====================================================

export const useProfile = () => {
  const {
    userProfile,
    studentProfile,
    resumes,
    resumeCount,
    maxResumes,
    profileCompletion,
    isLoading,
    isUpdating,
    isUploadingResume,
    error,
    _profileFetched,
    clearError,
    fetchCompleteProfile,
    fetchUserProfile,
    updateUserProfile,
    createStudentProfile,
    fetchStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
    addSkills,
    removeSkills,
    updateAcademicMarks,
    fetchResumes,
    uploadResume,
    deleteResume,
    setDefaultResume,
    linkResumeToProfile,
    reset,
    invalidateProfile,
  } = useProfileStore(
    useShallow((state) => ({
      userProfile: state.userProfile,
      studentProfile: state.studentProfile,
      resumes: state.resumes,
      resumeCount: state.resumeCount,
      maxResumes: state.maxResumes,
      profileCompletion: state.profileCompletion,
      isLoading: state.isLoading,
      isUpdating: state.isUpdating,
      isUploadingResume: state.isUploadingResume,
      error: state.error,
      _profileFetched: state._profileFetched,
      clearError: state.clearError,
      fetchCompleteProfile: state.fetchCompleteProfile,
      fetchUserProfile: state.fetchUserProfile,
      updateUserProfile: state.updateUserProfile,
      createStudentProfile: state.createStudentProfile,
      fetchStudentProfile: state.fetchStudentProfile,
      updateStudentProfile: state.updateStudentProfile,
      deleteStudentProfile: state.deleteStudentProfile,
      addSkills: state.addSkills,
      removeSkills: state.removeSkills,
      updateAcademicMarks: state.updateAcademicMarks,
      fetchResumes: state.fetchResumes,
      uploadResume: state.uploadResume,
      deleteResume: state.deleteResume,
      setDefaultResume: state.setDefaultResume,
      linkResumeToProfile: state.linkResumeToProfile,
      reset: state.reset,
      invalidateProfile: state.invalidateProfile,
    }))
  );

  // Initialize profile if not fetched
  const initializeProfile = useCallback(async () => {
    if (!_profileFetched && !isLoading) {
      await fetchCompleteProfile();
    }
  }, [_profileFetched, isLoading, fetchCompleteProfile]);

  return {
    // Data
    userProfile,
    studentProfile,
    resumes,
    resumeCount,
    maxResumes,
    profileCompletion,

    // Loading states
    isLoading,
    isUpdating,
    isUploadingResume,

    // Error
    error,
    clearError,

    // Initialize
    initializeProfile,

    // Profile actions
    fetchCompleteProfile,
    fetchUserProfile,
    updateUserProfile,

    // Student profile actions
    createStudentProfile,
    fetchStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,

    // Skills actions
    addSkills,
    removeSkills,

    // Academics actions
    updateAcademicMarks,

    // Resume actions
    fetchResumes,
    uploadResume,
    deleteResume,
    setDefaultResume,
    linkResumeToProfile,

    // Computed
    hasStudentProfile: !!studentProfile,
    hasResumes: resumes.length > 0,
    canUploadMore: resumeCount < maxResumes,
    defaultResume: resumes.find((r) => r.isDefault) || null,

    // Reset & Invalidate
    reset,
    invalidateProfile,
  };
};

// =====================================================
// AUTO-FETCHING PROFILE HOOK
// =====================================================

export const useProfileData = () => {
  const profile = useProfile();
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      profile.initializeProfile();
    }
  }, [profile.initializeProfile]);

  return profile;
};

// =====================================================
// RESUMES HOOK
// =====================================================

export const useResumes = () => {
  const {
    resumes,
    resumeCount,
    maxResumes,
    isLoading,
    isUploadingResume,
    error,
    _resumesFetched,
    fetchResumes,
    uploadResume,
    deleteResume,
    setDefaultResume,
    invalidateResumes,
  } = useProfileStore(
    useShallow((state) => ({
      resumes: state.resumes,
      resumeCount: state.resumeCount,
      maxResumes: state.maxResumes,
      isLoading: state.isLoading,
      isUploadingResume: state.isUploadingResume,
      error: state.error,
      _resumesFetched: state._resumesFetched,
      fetchResumes: state.fetchResumes,
      uploadResume: state.uploadResume,
      deleteResume: state.deleteResume,
      setDefaultResume: state.setDefaultResume,
      invalidateResumes: state.invalidateResumes,
    }))
  );

  const initRef = useRef(false);

  useEffect(() => {
    // Only fetch once on mount if not already fetched
    if (!initRef.current && !_resumesFetched && !isLoading) {
      initRef.current = true;
      fetchResumes();
    }
  }, [_resumesFetched, isLoading, fetchResumes]);

  // Manual refetch function that invalidates cache first
  const refetch = useCallback(async () => {
    invalidateResumes();
    await fetchResumes();
  }, [invalidateResumes, fetchResumes]);

  return {
    data: {
      resumes,
      count: resumeCount,
      maxResumes,
    },
    isLoading,
    error,
    refetch,
    uploadResume,
    deleteResume,
    setDefaultResume,
    isUploadingResume,
    canUploadMore: resumeCount < maxResumes,
    defaultResume: resumes.find((r) => r.isDefault) || null,
  };
};

// =====================================================
// STUDENT PROFILE HOOK
// =====================================================

export const useStudentProfile = () => {
  const {
    studentProfile,
    isLoading,
    isUpdating,
    error,
    fetchStudentProfile,
    createStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
    addSkills,
    removeSkills,
    updateAcademicMarks,
    clearError,
  } = useProfileStore(
    useShallow((state) => ({
      studentProfile: state.studentProfile,
      isLoading: state.isLoading,
      isUpdating: state.isUpdating,
      error: state.error,
      fetchStudentProfile: state.fetchStudentProfile,
      createStudentProfile: state.createStudentProfile,
      updateStudentProfile: state.updateStudentProfile,
      deleteStudentProfile: state.deleteStudentProfile,
      addSkills: state.addSkills,
      removeSkills: state.removeSkills,
      updateAcademicMarks: state.updateAcademicMarks,
      clearError: state.clearError,
    }))
  );

  return {
    studentProfile,
    isLoading,
    isUpdating,
    error,
    clearError,
    fetchStudentProfile,
    createStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
    addSkills,
    removeSkills,
    updateAcademicMarks,
    hasProfile: !!studentProfile,
  };
};

// =====================================================
// USER PROFILE HOOK
// =====================================================

export const useUserProfile = () => {
  const {
    userProfile,
    isLoading,
    isUpdating,
    error,
    fetchUserProfile,
    updateUserProfile,
    clearError,
  } = useProfileStore(
    useShallow((state) => ({
      userProfile: state.userProfile,
      isLoading: state.isLoading,
      isUpdating: state.isUpdating,
      error: state.error,
      fetchUserProfile: state.fetchUserProfile,
      updateUserProfile: state.updateUserProfile,
      clearError: state.clearError,
    }))
  );

  return {
    userProfile,
    isLoading,
    isUpdating,
    error,
    clearError,
    fetchUserProfile,
    updateUserProfile,
  };
};

export default useProfile;
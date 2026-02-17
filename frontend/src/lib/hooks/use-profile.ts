// src/lib/hooks/use-profile.ts

import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useProfileStore } from '@/lib/store/profile-store';

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
    departments,
    isLoading,
    isUpdating,
    isUploadingResume,
    isDepartmentsLoading,
    error,
    _profileFetched,
    clearError,
    fetchCompleteProfile,
    fetchUserProfile,
    updateUserProfile,
    fetchDepartments,
    createStudentProfile,
    fetchStudentProfile,
    // renamed internal update function to wrap it
    updateStudentProfile: _updateStudentProfile,
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
    invalidateDepartments,
  } = useProfileStore(
    useShallow((state) => ({
      userProfile: state.userProfile,
      studentProfile: state.studentProfile,
      resumes: state.resumes,
      resumeCount: state.resumeCount,
      maxResumes: state.maxResumes,
      profileCompletion: state.profileCompletion,
      departments: state.departments,
      isLoading: state.isLoading,
      isUpdating: state.isUpdating,
      isUploadingResume: state.isUploadingResume,
      isDepartmentsLoading: state.isDepartmentsLoading,
      error: state.error,
      _profileFetched: state._profileFetched,
      clearError: state.clearError,
      fetchCompleteProfile: state.fetchCompleteProfile,
      fetchUserProfile: state.fetchUserProfile,
      updateUserProfile: state.updateUserProfile,
      fetchDepartments: state.fetchDepartments,
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
      invalidateDepartments: state.invalidateDepartments,
    }))
  );

  // Initialize profile if not fetched
  const initializeProfile = useCallback(async () => {
    if (!_profileFetched && !isLoading) {
      await fetchCompleteProfile();
    }
  }, [_profileFetched, isLoading, fetchCompleteProfile]);

  // FIX: Wrap update to force data refresh
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateStudentProfile = useCallback(async (data: any) => {
    try {
        await _updateStudentProfile(data);
        // Force refresh to ensure UI is in sync immediately
        await fetchStudentProfile(); 
    } catch (err) {
        throw err;
    }
  }, [_updateStudentProfile, fetchStudentProfile]);

  return {
    // Data
    userProfile,
    studentProfile,
    resumes,
    resumeCount,
    maxResumes,
    profileCompletion,
    departments,

    // Loading states
    isLoading,
    isUpdating,
    isUploadingResume,
    isDepartmentsLoading,

    // Error
    error,
    clearError,

    // Initialize
    initializeProfile,

    // Profile actions
    fetchCompleteProfile,
    fetchUserProfile,
    updateUserProfile,

    // Department actions
    fetchDepartments,

    // Student profile actions
    createStudentProfile,
    fetchStudentProfile,
    updateStudentProfile: handleUpdateStudentProfile, // Use wrapper
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
    hasDepartments: departments.length > 0,

    // Reset & Invalidate
    reset,
    invalidateProfile,
    invalidateDepartments,
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
// DEPARTMENTS HOOK
// =====================================================

export const useDepartments = () => {
  const {
    departments,
    isDepartmentsLoading,
    error,
    _departmentsFetched,
    fetchDepartments,
    invalidateDepartments,
  } = useProfileStore(
    useShallow((state) => ({
      departments: state.departments,
      isDepartmentsLoading: state.isDepartmentsLoading,
      error: state.error,
      _departmentsFetched: state._departmentsFetched,
      fetchDepartments: state.fetchDepartments,
      invalidateDepartments: state.invalidateDepartments,
    }))
  );

  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current && !_departmentsFetched && !isDepartmentsLoading) {
      initRef.current = true;
      fetchDepartments();
    }
  }, [_departmentsFetched, isDepartmentsLoading, fetchDepartments]);

  const refetch = useCallback(async () => {
    invalidateDepartments();
    await fetchDepartments();
  }, [invalidateDepartments, fetchDepartments]);

  return {
    departments,
    isLoading: isDepartmentsLoading,
    error,
    refetch,
    hasDepartments: departments.length > 0,
  };
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
    if (!initRef.current && !_resumesFetched && !isLoading) {
      initRef.current = true;
      fetchResumes();
    }
  }, [_resumesFetched, isLoading, fetchResumes]);

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
    departments,
    isLoading,
    isUpdating,
    isDepartmentsLoading,
    error,
    fetchStudentProfile,
    fetchDepartments,
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
      departments: state.departments,
      isLoading: state.isLoading,
      isUpdating: state.isUpdating,
      isDepartmentsLoading: state.isDepartmentsLoading,
      error: state.error,
      fetchStudentProfile: state.fetchStudentProfile,
      fetchDepartments: state.fetchDepartments,
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
    departments,
    isLoading,
    isUpdating,
    isDepartmentsLoading,
    error,
    clearError,
    fetchStudentProfile,
    fetchDepartments,
    createStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
    addSkills,
    removeSkills,
    updateAcademicMarks,
    hasProfile: !!studentProfile,
    hasDepartments: departments.length > 0,
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
// src/lib/api/services/profile.service.ts

import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';
import type {
  CompleteProfile,
  UserProfile,
  StudentProfile,
  Resume,
  ResumeListResponse,
  ExtractedResumeData,
  CreateStudentProfileInput,
  UpdateStudentProfileInput,
  UpdateUserProfileInput,
  AcademicMarksInput,
  ProfileApiResponse,
} from '@/types/profile.types';

// =====================================================
// COMPLETE PROFILE
// =====================================================

export const getCompleteProfile = async (): Promise<CompleteProfile> => {
  const response = await apiClient.get<ProfileApiResponse<CompleteProfile>>(
    API_ENDPOINTS.PROFILE.COMPLETE
  );
  return response.data.data;
};

// =====================================================
// USER PROFILE
// =====================================================

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<ProfileApiResponse<UserProfile>>(
    API_ENDPOINTS.PROFILE.USER
  );
  return response.data.data;
};

export const updateUserProfile = async (
  input: UpdateUserProfileInput
): Promise<UserProfile> => {
  const response = await apiClient.patch<ProfileApiResponse<UserProfile>>(
    API_ENDPOINTS.PROFILE.USER,
    input
  );
  return response.data.data;
};

// =====================================================
// STUDENT PROFILE
// =====================================================

export const createStudentProfile = async (
  input: CreateStudentProfileInput
): Promise<StudentProfile> => {
  const response = await apiClient.post<ProfileApiResponse<StudentProfile>>(
    API_ENDPOINTS.PROFILE.STUDENT,
    input
  );
  return response.data.data;
};

export const getStudentProfile = async (): Promise<StudentProfile | null> => {
  const response = await apiClient.get<ProfileApiResponse<StudentProfile | null>>(
    API_ENDPOINTS.PROFILE.STUDENT
  );
  return response.data.data;
};

export const updateStudentProfile = async (
  input: UpdateStudentProfileInput
): Promise<StudentProfile> => {
  const response = await apiClient.patch<ProfileApiResponse<StudentProfile>>(
    API_ENDPOINTS.PROFILE.STUDENT,
    input
  );
  return response.data.data;
};

export const deleteStudentProfile = async (): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.PROFILE.STUDENT);
};

// =====================================================
// SKILLS
// =====================================================

export const addSkills = async (skills: string[]): Promise<StudentProfile> => {
  const response = await apiClient.post<ProfileApiResponse<StudentProfile>>(
    API_ENDPOINTS.PROFILE.STUDENT_SKILLS,
    { skills }
  );
  return response.data.data;
};

export const removeSkills = async (skills: string[]): Promise<StudentProfile> => {
  const response = await apiClient.delete<ProfileApiResponse<StudentProfile>>(
    API_ENDPOINTS.PROFILE.STUDENT_SKILLS,
    { data: { skills } }
  );
  return response.data.data;
};

// =====================================================
// ACADEMICS
// =====================================================

export const updateAcademicMarks = async (
  input: AcademicMarksInput
): Promise<StudentProfile> => {
  const response = await apiClient.patch<ProfileApiResponse<StudentProfile>>(
    API_ENDPOINTS.PROFILE.STUDENT_ACADEMICS,
    input
  );
  return response.data.data;
};

// =====================================================
// RESUMES
// =====================================================

export const getResumes = async (): Promise<ResumeListResponse> => {
  const response = await apiClient.get<ProfileApiResponse<ResumeListResponse>>(
    API_ENDPOINTS.PROFILE.RESUMES
  );
  return response.data.data;
};

export const uploadResume = async (file: File): Promise<Resume> => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await apiClient.post<ProfileApiResponse<Resume>>(
    API_ENDPOINTS.PROFILE.RESUMES,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

export const getResume = async (resumeId: number): Promise<Resume> => {
  const response = await apiClient.get<ProfileApiResponse<Resume>>(
    API_ENDPOINTS.PROFILE.RESUME(resumeId)
  );
  return response.data.data;
};

export const deleteResume = async (resumeId: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.PROFILE.RESUME(resumeId));
};

export const getDefaultResume = async (): Promise<Resume | null> => {
  const response = await apiClient.get<ProfileApiResponse<Resume | null>>(
    API_ENDPOINTS.PROFILE.RESUMES_DEFAULT
  );
  return response.data.data;
};

export const setDefaultResume = async (resumeId: number): Promise<Resume> => {
  const response = await apiClient.patch<ProfileApiResponse<Resume>>(
    API_ENDPOINTS.PROFILE.RESUME_DEFAULT(resumeId)
  );
  return response.data.data;
};

export const extractResumeText = async (
  resumeId: number
): Promise<ExtractedResumeData> => {
  const response = await apiClient.get<ProfileApiResponse<ExtractedResumeData>>(
    API_ENDPOINTS.PROFILE.RESUME_TEXT(resumeId)
  );
  return response.data.data;
};

export const linkResumeToProfile = async (resumeId: number): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.PROFILE.RESUME_LINK(resumeId));
};

// =====================================================
// EXPORT ALL
// =====================================================

export const profileService = {
  // Complete profile
  getCompleteProfile,

  // User profile
  getUserProfile,
  updateUserProfile,

  // Student profile
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  deleteStudentProfile,

  // Skills
  addSkills,
  removeSkills,

  // Academics
  updateAcademicMarks,

  // Resumes
  getResumes,
  uploadResume,
  getResume,
  deleteResume,
  getDefaultResume,
  setDefaultResume,
  extractResumeText,
  linkResumeToProfile,
};

export default profileService;
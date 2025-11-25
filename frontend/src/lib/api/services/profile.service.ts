// src/lib/api/services/profile.service.ts

import { apiClient } from "../axios-instance";

const PROFILE_ENDPOINTS = {
  RESUMES: "/api/profile/resumes",
  RESUME: (id: number) => `/api/profile/resumes/${id}`,
  DEFAULT_RESUME: "/api/profile/resumes/default",
};

export interface ResumeResponse {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  isDefault: boolean;
  createdAt: string;
}

interface ServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const profileService = {
  getResumes: async (): Promise<ResumeResponse[]> => {
    const response = await apiClient.get<ServiceResponse<ResumeResponse[]>>(
      PROFILE_ENDPOINTS.RESUMES
    );
    return response.data.data || [];
  },

  getResume: async (id: number): Promise<ResumeResponse> => {
    const response = await apiClient.get<ServiceResponse<ResumeResponse>>(
      PROFILE_ENDPOINTS.RESUME(id)
    );
    return response.data.data;
  },

  getDefaultResume: async (): Promise<ResumeResponse | null> => {
    try {
      const response = await apiClient.get<ServiceResponse<ResumeResponse>>(
        PROFILE_ENDPOINTS.DEFAULT_RESUME
      );
      return response.data.data;
    } catch {
      return null;
    }
  },

  uploadResume: async (file: File): Promise<ResumeResponse> => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await apiClient.post<ServiceResponse<ResumeResponse>>(
      PROFILE_ENDPOINTS.RESUMES,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  deleteResume: async (id: number): Promise<void> => {
    await apiClient.delete(PROFILE_ENDPOINTS.RESUME(id));
  },

  setDefaultResume: async (id: number): Promise<ResumeResponse> => {
    const response = await apiClient.patch<ServiceResponse<ResumeResponse>>(
      `${PROFILE_ENDPOINTS.RESUME(id)}/default`
    );
    return response.data.data;
  },
};
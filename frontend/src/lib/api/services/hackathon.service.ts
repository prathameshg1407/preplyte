// src/lib/api/services/hackathon.service.ts

import { apiClient } from '@/lib/api/axios-instance';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { 
  Hackathon, 
  PaginatedResponse, 
  HackathonStatus,
  HackathonMode,
  ParticipationType
} from '@/types/event.types';

export interface HackathonListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: HackathonStatus[];
  mode?: HackathonMode[];
  participationType?: ParticipationType;
  instituteId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  registrationOpen?: boolean;
}

export const hackathonService = {
  listHackathons: async (params?: HackathonListParams): Promise<PaginatedResponse<Hackathon>> => {
    const response = await apiClient.get(API_ENDPOINTS.HACKATHON.SESSIONS, { params });
    return response.data;
  },

  getHackathon: async (id: string): Promise<Hackathon> => {
    const response = await apiClient.get(API_ENDPOINTS.HACKATHON.DETAIL(id));
    return response.data;
  },

  createHackathon: async (data: any): Promise<Hackathon> => {
    const response = await apiClient.post(API_ENDPOINTS.HACKATHON.SESSIONS, data);
    return response.data;
  },

  updateHackathon: async (id: string, data: any): Promise<Hackathon> => {
    const response = await apiClient.put(`${API_ENDPOINTS.HACKATHON.SESSIONS}/${id}`, data);
    return response.data;
  },

  checkEligibility: async (id: string): Promise<{ eligible: boolean; reasons?: string[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.HACKATHON.ELIGIBILITY(id));
    return response.data.data;
  },

  register: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.HACKATHON.REGISTER(id), data);
    return response.data.data;
  },

  getRegistrationStatus: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.HACKATHON.REGISTRATION_STATUS(id));
    return response.data.data;
  },

  listRegistrations: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`${API_ENDPOINTS.HACKATHON.SESSIONS}/${id}/registrations`);
    return response.data.data;
  },

  // Teams
  createTeam: async (data: { hackathonId: string; teamName: string }): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.HACKATHON.TEAM.CREATE, data);
    return response.data.data;
  },

  joinTeam: async (data: { hackathonId: string; inviteCode: string }): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.HACKATHON.TEAM.JOIN, data);
    return response.data.data;
  },

  getTeam: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.HACKATHON.TEAM.DETAIL(id));
    return response.data.data;
  },

  // Submissions
  submitProject: async (data: any): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.HACKATHON.SUBMISSION.SUBMIT, data);
    return response.data.data;
  },

  saveDraft: async (data: any): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.HACKATHON.SUBMISSION.DRAFT, data);
    return response.data.data;
  },

  getSubmission: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.HACKATHON.SUBMISSION.DETAIL(id));
    return response.data.data;
  },

  listSubmissions: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`${API_ENDPOINTS.HACKATHON.SESSIONS}/${id}/submissions`);
    return response.data.data;
  },

  reviewSubmission: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.HACKATHON.SUBMISSION.REVIEW(id), data);
    return response.data.data;
  },
};

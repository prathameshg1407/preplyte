// src/lib/api/services/opportunity.service.ts

import { apiClient } from '@/lib/api/axios-instance';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { 
  Job, 
  Internship, 
  PaginatedResponse, 
  OpportunityStatus,
  JobType,
  WorkMode
} from '@/types/event.types';

export interface OpportunityListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OpportunityStatus[];
  instituteId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JobListParams extends OpportunityListParams {
  jobType?: JobType[];
  workMode?: WorkMode[];
  minSalary?: number;
  maxSalary?: number;
  location?: string;
}

export interface InternshipListParams extends OpportunityListParams {
  minStipend?: number;
  maxStipend?: number;
  location?: string;
  isPpo?: boolean;
}

export const opportunityService = {
  // Jobs
  listJobs: async (params?: JobListParams): Promise<PaginatedResponse<Job>> => {
    const response = await apiClient.get(API_ENDPOINTS.JOB.SESSIONS, { params });
    return response.data;
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await apiClient.get(API_ENDPOINTS.JOB.DETAIL(id));
    return response.data.data;
  },

  checkJobEligibility: async (id: string): Promise<{ eligible: boolean; reasons?: string[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.JOB.ELIGIBILITY(id));
    return response.data.data;
  },

  applyForJob: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.JOB.APPLY(id), data);
    return response.data.data;
  },

  createJob: async (data: any): Promise<Job> => {
    const response = await apiClient.post(API_ENDPOINTS.JOB.SESSIONS, data);
    return response.data;
  },

  updateJob: async (id: string, data: any): Promise<Job> => {
    const response = await apiClient.put(`${API_ENDPOINTS.JOB.SESSIONS}/${id}`, data);
    return response.data;
  },

  listJobApplications: async (params: { jobId?: string; status?: string }): Promise<any[]> => {
    const response = await apiClient.get(API_ENDPOINTS.JOB.APPLICATIONS, { params });
    return response.data.data;
  },

  // Internships
  listInternships: async (params?: InternshipListParams): Promise<PaginatedResponse<Internship>> => {
    const response = await apiClient.get(API_ENDPOINTS.INTERNSHIP.SESSIONS, { params });
    return response.data;
  },

  getInternship: async (id: string): Promise<Internship> => {
    const response = await apiClient.get(API_ENDPOINTS.INTERNSHIP.DETAIL(id));
    return response.data.data;
  },

  createInternship: async (data: any): Promise<Internship> => {
    const response = await apiClient.post(API_ENDPOINTS.INTERNSHIP.SESSIONS, data);
    return response.data;
  },

  updateInternship: async (id: string, data: any): Promise<Internship> => {
    const response = await apiClient.put(`${API_ENDPOINTS.INTERNSHIP.SESSIONS}/${id}`, data);
    return response.data;
  },

  checkInternshipEligibility: async (id: string): Promise<{ eligible: boolean; reasons?: string[] }> => {
    const response = await apiClient.get(API_ENDPOINTS.INTERNSHIP.ELIGIBILITY(id));
    return response.data.data;
  },

  applyForInternship: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.INTERNSHIP.APPLY(id), data);
    return response.data.data;
  },

  listInternshipApplications: async (params: { internshipId?: string; status?: string }): Promise<any[]> => {
    const response = await apiClient.get(API_ENDPOINTS.INTERNSHIP.APPLICATIONS, { params });
    return response.data.data;
  },

  reviewJobApplication: async (id: string, data: { status: string; feedback?: string }): Promise<any> => {
    const response = await apiClient.patch(API_ENDPOINTS.JOB.APPLICATION_REVIEW(id), data);
    return response.data.data;
  },

  reviewInternshipApplication: async (id: string, data: { status: string; feedback?: string }): Promise<any> => {
    const response = await apiClient.patch(API_ENDPOINTS.INTERNSHIP.APPLICATION_REVIEW(id), data);
    return response.data.data;
  },
};

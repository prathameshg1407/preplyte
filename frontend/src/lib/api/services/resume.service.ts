import { apiClient } from '../axios-instance';
import {
  ResumeTemplate,
  Resume,
  ResumeListItem,
  ResumeVersion,
  CreateResumeRequest,
  UpdateResumeRequest,
  UpdateSectionRequest,
  TemplateFilters,
  ResumeFilters,
  ResumesResponse,
  TemplateCategoryCount,
  ResumeSectionType,
} from '@/types/resume.types';
import { ApiResponse } from '@/types/api.types';

const BASE_URL = '/resume-builder';

// ============ Template Services ============

export const resumeTemplateService = {
  getAll: async (filters?: TemplateFilters): Promise<ResumeTemplate[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isPremium !== undefined) params.append('isPremium', String(filters.isPremium));
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<ApiResponse<ResumeTemplate[]>>(
      `${BASE_URL}/templates?${params.toString()}`
    );
    return response.data.data!;
  },

  getById: async (templateId: string): Promise<ResumeTemplate> => {
    const response = await apiClient.get<ApiResponse<ResumeTemplate>>(
      `${BASE_URL}/templates/${templateId}`
    );
    return response.data.data!;
  },

  getBySlug: async (slug: string): Promise<ResumeTemplate> => {
    const response = await apiClient.get<ApiResponse<ResumeTemplate>>(
      `${BASE_URL}/templates/slug/${slug}`
    );
    return response.data.data!;
  },

  getCategories: async (): Promise<TemplateCategoryCount[]> => {
    const response = await apiClient.get<ApiResponse<TemplateCategoryCount[]>>(
      `${BASE_URL}/templates/categories`
    );
    return response.data.data!;
  },
};

// ============ Resume Services ============

export const resumeService = {
  create: async (data: CreateResumeRequest): Promise<Resume> => {
    const response = await apiClient.post<ApiResponse<Resume>>(BASE_URL, data);
    return response.data.data!;
  },

  getAll: async (filters?: ResumeFilters): Promise<ResumesResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.templateId) params.append('templateId', filters.templateId);
    if (filters?.isComplete !== undefined) params.append('isComplete', String(filters.isComplete));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await apiClient.get<ApiResponse<ResumesResponse>>(
      `${BASE_URL}?${params.toString()}`
    );
    return response.data.data!;
  },

  getById: async (resumeId: string): Promise<Resume> => {
    const response = await apiClient.get<ApiResponse<Resume>>(
      `${BASE_URL}/${resumeId}`
    );
    return response.data.data!;
  },

  getBySlug: async (slug: string): Promise<Resume> => {
    const response = await apiClient.get<ApiResponse<Resume>>(
      `${BASE_URL}/slug/${slug}`
    );
    return response.data.data!;
  },

  update: async (resumeId: string, data: UpdateResumeRequest): Promise<Resume> => {
    const response = await apiClient.patch<ApiResponse<Resume>>(
      `${BASE_URL}/${resumeId}`,
      data
    );
    return response.data.data!;
  },

  updateSection: async (
    resumeId: string,
    section: ResumeSectionType,
    data: unknown
  ): Promise<Resume> => {
    const response = await apiClient.patch<ApiResponse<Resume>>(
      `${BASE_URL}/${resumeId}/section`,
      { section, data }
    );
    return response.data.data!;
  },

  delete: async (resumeId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${resumeId}`);
  },

  duplicate: async (resumeId: string, newTitle?: string): Promise<Resume> => {
    const response = await apiClient.post<ApiResponse<Resume>>(
      `${BASE_URL}/${resumeId}/duplicate`,
      { newTitle }
    );
    return response.data.data!;
  },

  changeTemplate: async (resumeId: string, templateId: string): Promise<Resume> => {
    const response = await apiClient.patch<ApiResponse<Resume>>(
      `${BASE_URL}/${resumeId}/template`,
      { templateId }
    );
    return response.data.data!;
  },

  getVersions: async (resumeId: string): Promise<ResumeVersion[]> => {
    const response = await apiClient.get<ApiResponse<ResumeVersion[]>>(
      `${BASE_URL}/${resumeId}/versions`
    );
    return response.data.data!;
  },

  restoreVersion: async (resumeId: string, versionId: string): Promise<Resume> => {
    const response = await apiClient.post<ApiResponse<Resume>>(
      `${BASE_URL}/${resumeId}/versions/${versionId}/restore`
    );
    return response.data.data!;
  },

  importFromProfile: async (resumeId: string): Promise<Resume> => {
    const response = await apiClient.post<ApiResponse<Resume>>(
      `${BASE_URL}/${resumeId}/import-profile`
    );
    return response.data.data!;
  },
};
import { apiClient } from '../axios-instance';
import type {
  ResumeTemplate,
  Resume,
  ResumeListItem,
  CreateResumeRequest,
  UpdateResumeRequest,
  TemplateFilters,
  ResumeFilters,
  ResumeTemplateCategory,
} from '@/types/resume-builder.types';

const BASE_URL = '/api/resume-builder';

export const resumeBuilderService = {
  // Templates
  async getTemplates(filters?: TemplateFilters): Promise<ResumeTemplate[]> {
    const { data } = await apiClient.get(`${BASE_URL}/templates`, {
      params: filters,
    });
    return data.data;
  },

  async getTemplateById(templateId: string): Promise<ResumeTemplate> {
    const { data } = await apiClient.get(`${BASE_URL}/templates/${templateId}`);
    return data.data;
  },

  async getTemplateBySlug(slug: string): Promise<ResumeTemplate> {
    const { data } = await apiClient.get(`${BASE_URL}/templates/slug/${slug}`);
    return data.data;
  },

  async getTemplateCategories(): Promise<{ category: ResumeTemplateCategory; count: number }[]> {
    const { data } = await apiClient.get(`${BASE_URL}/templates/categories`);
    return data.data;
  },

  // Resumes
  async createResume(request: CreateResumeRequest): Promise<Resume> {
    console.log('Creating resume with request:', request);
    const { data } = await apiClient.post(BASE_URL, request);
    console.log('Resume created, response:', data);
    return data.data;
  },

  async getUserResumes(
    filters?: ResumeFilters
  ): Promise<{
    resumes: ResumeListItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { data } = await apiClient.get(BASE_URL, { params: filters });
    return data.data;
  },

  async getResumeById(resumeId: string): Promise<Resume> {
    const { data } = await apiClient.get(`${BASE_URL}/${resumeId}`);
    return data.data;
  },

  async getResumeBySlug(slug: string): Promise<Resume> {
    const { data } = await apiClient.get(`${BASE_URL}/slug/${slug}`);
    return data.data;
  },

  async updateResume(resumeId: string, request: UpdateResumeRequest): Promise<Resume> {
    const { data } = await apiClient.patch(`${BASE_URL}/${resumeId}`, request);
    return data.data;
  },

  async updateResumeSection(
    resumeId: string,
    section: string,
    sectionData: unknown
  ): Promise<Resume> {
    console.log('API Service - updateResumeSection called:', {
      resumeId,
      section,
      sectionData,
    });
    
    try {
      const { data } = await apiClient.patch(`${BASE_URL}/${resumeId}/section`, {
        section,
        data: sectionData,
      });
      console.log('API Service - updateResumeSection response:', data);
      return data.data;
    } catch (error) {
      console.error('API Service - updateResumeSection error:', error);
      throw error;
    }
  },

  async deleteResume(resumeId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${resumeId}`);
  },

  async duplicateResume(resumeId: string, newTitle?: string): Promise<Resume> {
    const { data } = await apiClient.post(`${BASE_URL}/${resumeId}/duplicate`, {
      newTitle,
    });
    return data.data;
  },

  async changeTemplate(resumeId: string, templateId: string): Promise<Resume> {
    const { data } = await apiClient.patch(`${BASE_URL}/${resumeId}/template`, {
      templateId,
    });
    return data.data;
  },

  async importFromProfile(resumeId: string): Promise<Resume> {
    const { data } = await apiClient.post(`${BASE_URL}/${resumeId}/import-profile`);
    return data.data;
  },

  // Version History
  async getResumeVersions(
    resumeId: string
  ): Promise<{ id: string; version: number; changeNote: string | null; createdAt: string }[]> {
    const { data } = await apiClient.get(`${BASE_URL}/${resumeId}/versions`);
    return data.data;
  },

  async restoreVersion(resumeId: string, versionId: string): Promise<Resume> {
    const { data } = await apiClient.post(
      `${BASE_URL}/${resumeId}/versions/${versionId}/restore`
    );
    return data.data;
  },

  // Save to Profile
  async saveToProfile(
    resumeId: string,
    fileName?: string
  ): Promise<{ resumeId: string; fileName: string; message: string }> {
    const { data } = await apiClient.post(`${BASE_URL}/${resumeId}/save-to-profile`, {
      fileName,
    });
    return data.data;
  },

  async unlinkFromProfile(resumeId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${resumeId}/unlink-from-profile`);
  },
};

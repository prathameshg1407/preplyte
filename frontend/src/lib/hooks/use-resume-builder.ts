import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resumeBuilderService } from '../api/services/resume-builder.service';
import type {
  ResumeTemplate,
  Resume,
  CreateResumeRequest,
  UpdateResumeRequest,
  TemplateFilters,
  ResumeFilters,
} from '@/types/resume-builder.types';

// Simple toast notification function
const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
  if (typeof window !== 'undefined') {
    if (variant === 'destructive') {
      console.error(`❌ ${title}: ${description}`);
      // You can replace this with a proper toast library later
      alert(`Error: ${description}`);
    } else {
      console.log(`✅ ${title}: ${description}`);
    }
  }
};

export function useTemplates(filters?: TemplateFilters) {
  return useQuery({
    queryKey: ['resume-templates', filters],
    queryFn: () => resumeBuilderService.getTemplates(filters),
  });
}

export function useTemplate(templateId: string | null) {
  return useQuery({
    queryKey: ['resume-template', templateId],
    queryFn: () => resumeBuilderService.getTemplateById(templateId!),
    enabled: !!templateId,
  });
}

export function useTemplateCategories() {
  return useQuery({
    queryKey: ['resume-template-categories'],
    queryFn: () => resumeBuilderService.getTemplateCategories(),
  });
}

export function useResumes(filters?: ResumeFilters) {
  return useQuery({
    queryKey: ['resumes', filters],
    queryFn: () => resumeBuilderService.getUserResumes(filters),
  });
}

export function useResume(resumeId: string | null) {
  return useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => resumeBuilderService.getResumeById(resumeId!),
    enabled: !!resumeId,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateResumeRequest) => resumeBuilderService.createResume(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      showToast('Success', 'Resume created successfully');
    },
    onError: (error: any) => {
      showToast(
        'Error',
        error.response?.data?.message || 'Failed to create resume',
        'destructive'
      );
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, data }: { resumeId: string; data: UpdateResumeRequest }) =>
      resumeBuilderService.updateResume(resumeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resume', variables.resumeId] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      showToast('Success', 'Resume updated successfully');
    },
    onError: (error: any) => {
      showToast(
        'Error',
        error.response?.data?.message || 'Failed to update resume',
        'destructive'
      );
    },
  });
}

export function useUpdateResumeSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resumeId,
      section,
      data,
    }: {
      resumeId: string;
      section: string;
      data: unknown;
    }) => resumeBuilderService.updateResumeSection(resumeId, section, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resume', variables.resumeId] });
      showToast('Success', 'Section updated successfully');
    },
    onError: (error: any) => {
      showToast(
        'Error',
        error.response?.data?.message || 'Failed to update section',
        'destructive'
      );
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resumeId: string) => resumeBuilderService.deleteResume(resumeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      showToast('Success', 'Resume deleted successfully');
    },
    onError: (error: any) => {
      showToast(
        'Error',
        error.response?.data?.message || 'Failed to delete resume',
        'destructive'
      );
    },
  });
}

export function useDuplicateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, newTitle }: { resumeId: string; newTitle?: string }) =>
      resumeBuilderService.duplicateResume(resumeId, newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      showToast('Success', 'Resume duplicated successfully');
    },
    onError: (error: any) => {
      showToast(
        'Error',
        error.response?.data?.message || 'Failed to duplicate resume',
        'destructive'
      );
    },
  });
}

export function useChangeTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, templateId }: { resumeId: string; templateId: string }) =>
      resumeBuilderService.changeTemplate(resumeId, templateId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resume', variables.resumeId] });
      showToast('Success', 'Template changed successfully');
    },
    onError: (error: any) => {
      showToast(
        'Error',
        error.response?.data?.message || 'Failed to change template',
        'destructive'
      );
    },
  });
}

export function useImportFromProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resumeId: string) => resumeBuilderService.importFromProfile(resumeId),
    onSuccess: (_, resumeId) => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      showToast('Success', 'Profile data imported successfully');
    },
    onError: (error: any) => {
      showToast(
        'Error',
        error.response?.data?.message || 'Failed to import profile data',
        'destructive'
      );
    },
  });
}

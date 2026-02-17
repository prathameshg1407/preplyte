import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService, resumeTemplateService } from '@/lib/api/services/resume.service';
import { useResumeStore } from '@/lib/store/resume-store';
import {
  CreateResumeRequest,
  UpdateResumeRequest,
  TemplateFilters,
  ResumeFilters,
  ResumeSectionType,
} from '@/types/resume.types';
import { useToast } from '@/components/ui/use-toast';

// Query Keys
export const resumeKeys = {
  all: ['resumes'] as const,
  lists: () => [...resumeKeys.all, 'list'] as const,
  list: (filters: ResumeFilters) => [...resumeKeys.lists(), filters] as const,
  details: () => [...resumeKeys.all, 'detail'] as const,
  detail: (id: string) => [...resumeKeys.details(), id] as const,
  versions: (id: string) => [...resumeKeys.detail(id), 'versions'] as const,
};

export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters: TemplateFilters) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  categories: () => [...templateKeys.all, 'categories'] as const,
};

// ============ Template Hooks ============

export function useTemplates(filters?: TemplateFilters) {
  const { setTemplates, setIsLoadingTemplates } = useResumeStore();

  const query = useQuery({
    queryKey: templateKeys.list(filters || {}),
    queryFn: () => resumeTemplateService.getAll(filters),
  });

  // Handle side effects with useEffect
  React.useEffect(() => {
    if (query.data) {
      setTemplates(query.data);
      setIsLoadingTemplates(false);
    }
    if (query.error) {
      setIsLoadingTemplates(false);
    }
  }, [query.data, query.error, setTemplates, setIsLoadingTemplates]);

  return query;
}

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: templateKeys.detail(templateId),
    queryFn: () => resumeTemplateService.getById(templateId),
    enabled: !!templateId,
  });
}

export function useTemplateCategories() {
  const { setTemplateCategories } = useResumeStore();

  const query = useQuery({
    queryKey: templateKeys.categories(),
    queryFn: () => resumeTemplateService.getCategories(),
  });

  React.useEffect(() => {
    if (query.data) {
      setTemplateCategories(query.data);
    }
  }, [query.data, setTemplateCategories]);

  return query;
}

// ============ Resume Hooks ============

export function useResumes(filters?: ResumeFilters) {
  const { setResumes, setIsLoadingResumes } = useResumeStore();

  const query = useQuery({
    queryKey: resumeKeys.list(filters || {}),
    queryFn: () => resumeService.getAll(filters),
  });

  React.useEffect(() => {
    if (query.data) {
      setResumes(query.data.resumes, query.data.total, query.data.page, query.data.totalPages);
      setIsLoadingResumes(false);
    }
    if (query.error) {
      setIsLoadingResumes(false);
    }
  }, [query.data, query.error, setResumes, setIsLoadingResumes]);

  return query;
}

export function useResume(resumeId: string) {
  const { setCurrentResume, setIsLoadingCurrentResume } = useResumeStore();

  const query = useQuery({
    queryKey: resumeKeys.detail(resumeId),
    queryFn: () => resumeService.getById(resumeId),
    enabled: !!resumeId,
  });

  React.useEffect(() => {
    if (query.data) {
      setCurrentResume(query.data);
      setIsLoadingCurrentResume(false);
    }
    if (query.error) {
      setIsLoadingCurrentResume(false);
    }
  }, [query.data, query.error, setCurrentResume, setIsLoadingCurrentResume]);

  return query;
}

export function useResumeVersions(resumeId: string) {
  return useQuery({
    queryKey: resumeKeys.versions(resumeId),
    queryFn: () => resumeService.getVersions(resumeId),
    enabled: !!resumeId,
  });
}

// ============ Mutation Hooks ============

export function useCreateResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateResumeRequest) => resumeService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
      toast({
        title: 'Resume created',
        description: 'Your new resume has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create resume',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  const { setCurrentResume, setIsSaving, setUnsavedChanges } = useResumeStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ resumeId, data }: { resumeId: string; data: UpdateResumeRequest }) =>
      resumeService.update(resumeId, data),
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: (data) => {
      setCurrentResume(data);
      setUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving',
        description: error.message || 'Failed to save changes',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  const { setCurrentResume, setIsSaving, setUnsavedChanges } = useResumeStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      resumeId,
      section,
      data,
    }: {
      resumeId: string;
      section: ResumeSectionType;
      data: unknown;
    }) => resumeService.updateSection(resumeId, section, data),
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: (data) => {
      setCurrentResume(data);
      setUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(data.id) });
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving',
        description: error.message || 'Failed to save section',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  const { removeResume } = useResumeStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (resumeId: string) => resumeService.delete(resumeId),
    onSuccess: (_, resumeId) => {
      removeResume(resumeId);
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
      toast({
        title: 'Resume deleted',
        description: 'Your resume has been deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete resume',
        variant: 'destructive',
      });
    },
  });
}

export function useDuplicateResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ resumeId, newTitle }: { resumeId: string; newTitle?: string }) =>
      resumeService.duplicate(resumeId, newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
      toast({
        title: 'Resume duplicated',
        description: 'A copy of your resume has been created.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to duplicate resume',
        variant: 'destructive',
      });
    },
  });
}

export function useChangeTemplate() {
  const queryClient = useQueryClient();
  const { setCurrentResume } = useResumeStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ resumeId, templateId }: { resumeId: string; templateId: string }) =>
      resumeService.changeTemplate(resumeId, templateId),
    onSuccess: (data) => {
      setCurrentResume(data);
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(data.id) });
      toast({
        title: 'Template changed',
        description: 'Your resume template has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change template',
        variant: 'destructive',
      });
    },
  });
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();
  const { setCurrentResume } = useResumeStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ resumeId, versionId }: { resumeId: string; versionId: string }) =>
      resumeService.restoreVersion(resumeId, versionId),
    onSuccess: (data) => {
      setCurrentResume(data);
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: resumeKeys.versions(data.id) });
      toast({
        title: 'Version restored',
        description: 'Your resume has been restored to the selected version.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to restore version',
        variant: 'destructive',
      });
    },
  });
}

export function useImportFromProfile() {
  const queryClient = useQueryClient();
  const { setCurrentResume } = useResumeStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (resumeId: string) => resumeService.importFromProfile(resumeId),
    onSuccess: (data) => {
      setCurrentResume(data);
      queryClient.invalidateQueries({ queryKey: resumeKeys.detail(data.id) });
      toast({
        title: 'Profile imported',
        description: 'Your profile data has been imported to the resume.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to import profile',
        variant: 'destructive',
      });
    },
  });
}
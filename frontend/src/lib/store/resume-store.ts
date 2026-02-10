import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Resume,
  ResumeListItem,
  ResumeTemplate,
  ResumeContent,
  ResumeCustomization,
  ResumeSectionType,
  ResumeTemplateCategory,
} from '@/types/resume-builder.types';

interface TemplateCategoryCount {
  category: ResumeTemplateCategory;
  count: number;
}

interface ResumeState {
  // Templates
  templates: ResumeTemplate[];
  templateCategories: TemplateCategoryCount[];
  selectedTemplate: ResumeTemplate | null;
  templateFilter: {
    category: ResumeTemplateCategory | null;
    isPremium: boolean | null;
    search: string;
  };

  // Resumes
  resumes: ResumeListItem[];
  currentResume: Resume | null;
  totalResumes: number;
  currentPage: number;
  totalPages: number;

  // Editor State
  activeSection: ResumeSectionType | null;
  unsavedChanges: boolean;
  previewMode: boolean;
  zoomLevel: number;

  // Loading States
  isLoadingTemplates: boolean;
  isLoadingResumes: boolean;
  isLoadingCurrentResume: boolean;
  isSaving: boolean;

  // Actions - Templates
  setTemplates: (templates: ResumeTemplate[]) => void;
  setTemplateCategories: (categories: TemplateCategoryCount[]) => void;
  setSelectedTemplate: (template: ResumeTemplate | null) => void;
  setTemplateFilter: (filter: Partial<ResumeState['templateFilter']>) => void;

  // Actions - Resumes
  setResumes: (resumes: ResumeListItem[], total: number, page: number, totalPages: number) => void;
  setCurrentResume: (resume: Resume | null) => void;
  addResume: (resume: ResumeListItem) => void;
  removeResume: (resumeId: string) => void;
  updateResumeInList: (resumeId: string, updates: Partial<ResumeListItem>) => void;

  // Actions - Editor
  setActiveSection: (section: ResumeSectionType | null) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  setPreviewMode: (preview: boolean) => void;
  setZoomLevel: (zoom: number) => void;
  updateContent: (content: Partial<ResumeContent>) => void;
  updateCustomization: (customization: Partial<ResumeCustomization>) => void;

  // Actions - Loading
  setIsLoadingTemplates: (loading: boolean) => void;
  setIsLoadingResumes: (loading: boolean) => void;
  setIsLoadingCurrentResume: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Reset
  resetEditor: () => void;
  resetStore: () => void;
}

const initialState = {
  templates: [],
  templateCategories: [],
  selectedTemplate: null,
  templateFilter: {
    category: null,
    isPremium: null,
    search: '',
  },
  resumes: [],
  currentResume: null,
  totalResumes: 0,
  currentPage: 1,
  totalPages: 1,
  activeSection: null,
  unsavedChanges: false,
  previewMode: false,
  zoomLevel: 100,
  isLoadingTemplates: false,
  isLoadingResumes: false,
  isLoadingCurrentResume: false,
  isSaving: false,
};

export const useResumeStore = create<ResumeState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Template Actions
      setTemplates: (templates) => set({ templates }),
      setTemplateCategories: (templateCategories) => set({ templateCategories }),
      setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
      setTemplateFilter: (filter) =>
        set((state) => ({
          templateFilter: { ...state.templateFilter, ...filter },
        })),

      // Resume Actions
      setResumes: (resumes, totalResumes, currentPage, totalPages) =>
        set({ resumes, totalResumes, currentPage, totalPages }),
      
      setCurrentResume: (currentResume) => 
        set({ currentResume, unsavedChanges: false }),
      
      addResume: (resume) =>
        set((state) => ({
          resumes: [resume, ...state.resumes],
          totalResumes: state.totalResumes + 1,
        })),
      
      removeResume: (resumeId) =>
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== resumeId),
          totalResumes: state.totalResumes - 1,
        })),
      
      updateResumeInList: (resumeId, updates) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === resumeId ? { ...r, ...updates } : r
          ),
        })),

      // Editor Actions
      setActiveSection: (activeSection) => set({ activeSection }),
      setUnsavedChanges: (unsavedChanges) => set({ unsavedChanges }),
      setPreviewMode: (previewMode) => set({ previewMode }),
      setZoomLevel: (zoomLevel) => set({ zoomLevel }),
      
      updateContent: (content) =>
        set((state) => ({
          currentResume: state.currentResume
            ? {
                ...state.currentResume,
                content: { ...state.currentResume.content, ...content },
              }
            : null,
          unsavedChanges: true,
        })),
      
      updateCustomization: (customization) =>
        set((state) => ({
          currentResume: state.currentResume
            ? {
                ...state.currentResume,
                customization: { ...state.currentResume.customization, ...customization },
              }
            : null,
          unsavedChanges: true,
        })),

      // Loading Actions
      setIsLoadingTemplates: (isLoadingTemplates) => set({ isLoadingTemplates }),
      setIsLoadingResumes: (isLoadingResumes) => set({ isLoadingResumes }),
      setIsLoadingCurrentResume: (isLoadingCurrentResume) => set({ isLoadingCurrentResume }),
      setIsSaving: (isSaving) => set({ isSaving }),

      // Reset Actions
      resetEditor: () =>
        set({
          currentResume: null,
          activeSection: null,
          unsavedChanges: false,
          previewMode: false,
          zoomLevel: 100,
        }),
      
      resetStore: () => set(initialState),
    }),
    { name: 'resume-store' }
  )
);
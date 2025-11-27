// src/lib/store/mock-drive/results-store.ts

import { create } from 'zustand';
import {
  ResultOverview,
  DetailedReport,
  ModuleReport,
  MockDriveModuleType,
} from '@/types/mockdrive.types';

type ResultsTab = 'overview' | 'modules' | 'comparison' | 'recommendations';

interface ResultsStoreState {
  // Current results
  currentDriveId: string | null;
  resultOverview: ResultOverview | null;
  detailedReport: DetailedReport | null;

  // UI state
  activeTab: ResultsTab;
  selectedModuleId: string | null;
  expandedSections: Set<string>;

  // Actions
  setCurrentDriveId: (driveId: string | null) => void;
  setResultOverview: (overview: ResultOverview | null) => void;
  setDetailedReport: (report: DetailedReport | null) => void;
  setActiveTab: (tab: ResultsTab) => void;
  setSelectedModuleId: (moduleId: string | null) => void;
  toggleSection: (sectionId: string) => void;
  expandAllSections: () => void;
  collapseAllSections: () => void;

  // Computed / helpers
  getSelectedModuleReport: () => ModuleReport | null;
  getModulesByType: (type: MockDriveModuleType) => ModuleReport[];

  // Reset
  reset: () => void;
}

const initialState = {
  currentDriveId: null,
  resultOverview: null,
  detailedReport: null,
  activeTab: 'overview' as ResultsTab,
  selectedModuleId: null,
  expandedSections: new Set<string>(),
};

export const useResultsStore = create<ResultsStoreState>((set, get) => ({
  ...initialState,

  setCurrentDriveId: (driveId) => set({ currentDriveId: driveId }),

  setResultOverview: (overview) => set({ resultOverview: overview }),

  setDetailedReport: (report) => {
    set({ detailedReport: report });
    // Auto-select first module if none selected
    if (report && report.moduleReports.length > 0 && !get().selectedModuleId) {
      set({ selectedModuleId: report.moduleReports[0].moduleId });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedModuleId: (moduleId) => set({ selectedModuleId: moduleId }),

  toggleSection: (sectionId) => {
    const { expandedSections } = get();
    const newSections = new Set(expandedSections);
    if (newSections.has(sectionId)) {
      newSections.delete(sectionId);
    } else {
      newSections.add(sectionId);
    }
    set({ expandedSections: newSections });
  },

  expandAllSections: () => {
    const { detailedReport } = get();
    if (!detailedReport) return;
    const allSectionIds = detailedReport.moduleReports.map((m) => m.moduleId);
    set({ expandedSections: new Set(allSectionIds) });
  },

  collapseAllSections: () => {
    set({ expandedSections: new Set() });
  },

  getSelectedModuleReport: () => {
    const { detailedReport, selectedModuleId } = get();
    if (!detailedReport || !selectedModuleId) return null;
    return (
      detailedReport.moduleReports.find((m) => m.moduleId === selectedModuleId) || null
    );
  },

  getModulesByType: (type) => {
    const { detailedReport } = get();
    if (!detailedReport) return [];
    return detailedReport.moduleReports.filter((m) => m.moduleType === type);
  },

  reset: () => set({ ...initialState, expandedSections: new Set() }),
}));

// Selector hooks
export const useResultOverview = () => useResultsStore((state) => state.resultOverview);
export const useDetailedReport = () => useResultsStore((state) => state.detailedReport);
export const useActiveResultsTab = () => useResultsStore((state) => state.activeTab);
export const useSelectedModuleId = () => useResultsStore((state) => state.selectedModuleId);
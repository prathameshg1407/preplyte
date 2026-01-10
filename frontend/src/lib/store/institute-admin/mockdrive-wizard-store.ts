// src/lib/store/institute-admin/mockdrive-wizard-store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

import {
  MockDriveModuleType,
  DifficultyLevel,
  QuestionType,
  AiInterviewDifficulty,
  ProctoringSettings,
  AptitudeModuleConfig,
  MachineCodingModuleConfig,
  AiInterviewModuleConfig,
  ModuleConfig,
} from '@/types/admin.mockdrive.types';

// ============================================
// Types
// ============================================

export interface WizardModule {
  id: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string;
  timeLimit: number;
  weightage: number;
  config: ModuleConfig;
  passingScore: number | null;
  instructions: string;
}

export interface WizardBasicInfo {
  title: string;
  description: string;
  instructions: string;
}

export interface WizardSchedule {
  registrationStartDate: string;
  registrationEndDate: string;
  driveStartDate: string;
  driveEndDate: string;
  maxRegistrations: number | null;
}

export interface WizardEligibility {
  minCgpa: number | null;
  maxCgpa: number | null;
  minMarks10: number | null;
  minMarks12: number | null;
  allowedDepartmentIds: string[];
  allowedCourseYears: string[];
  requiredSkills: string[];
  maxBacklogs: number | null;
}

export interface WizardSettings {
  allowLateSubmission: boolean;
  showLeaderboard: boolean;
  showResultsImmediately: boolean;
  resultsReleaseDate: string;
  shuffleQuestions: boolean;
  enableProctoring: boolean;
  proctoringSettings: ProctoringSettings;
}

export interface WizardValidationErrors {
  basicInfo: Record<string, string>;
  schedule: Record<string, string>;
  eligibility: Record<string, string>;
  modules: Record<string, string>;
  settings: Record<string, string>;
}

export interface WizardState {
  // Navigation
  currentStep: number;
  completedSteps: Set<number>;
  
  // Form sections
  basicInfo: WizardBasicInfo;
  schedule: WizardSchedule;
  eligibility: WizardEligibility;
  modules: WizardModule[];
  settings: WizardSettings;
  
  // Validation
  errors: WizardValidationErrors;
  touched: Record<string, boolean>;
  
  // Meta
  isDirty: boolean;
  lastSavedAt: Date | null;
}

export interface WizardActions {
  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  goToStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  
  // Form updates
  setBasicInfo: (info: Partial<WizardBasicInfo>) => void;
  setSchedule: (schedule: Partial<WizardSchedule>) => void;
  setEligibility: (eligibility: Partial<WizardEligibility>) => void;
  setSettings: (settings: Partial<WizardSettings>) => void;
  
  // Module management
  addModule: (moduleType: MockDriveModuleType) => void;
  updateModule: (id: string, updates: Partial<WizardModule>) => void;
  removeModule: (id: string) => void;
  reorderModules: (startIndex: number, endIndex: number) => void;
  duplicateModule: (id: string) => void;
  
  // Validation
  validateStep: (step: number) => boolean;
  validateAll: () => boolean;
  setFieldError: (section: keyof WizardValidationErrors, field: string, error: string) => void;
  clearFieldError: (section: keyof WizardValidationErrors, field: string) => void;
  setTouched: (field: string) => void;
  
  // Utility
  reset: () => void;
  loadFromDraft: (data: Partial<WizardState>) => void;
  getSubmitData: () => CreateMockDrivePayload;
  canProceed: () => boolean;
}

export type WizardStore = WizardState & WizardActions;

// ============================================
// Payload Type for API
// ============================================

export interface CreateMockDrivePayload {
  title: string;
  description: string | null;
  instructions: string | null;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  driveStartDate: string | null;
  driveEndDate: string | null;
  maxRegistrations: number | null;
  allowLateSubmission: boolean;
  showLeaderboard: boolean;
  showResultsImmediately: boolean;
  resultsReleaseDate: string | null;
  shuffleQuestions: boolean;
  enableProctoring: boolean;
  proctoringSettings: ProctoringSettings | null;
}

// ============================================
// Constants
// ============================================

export const WIZARD_STEPS = [
  { id: 0, key: 'basicInfo', title: 'Basic Info', description: 'Title and description' },
  { id: 1, key: 'schedule', title: 'Schedule', description: 'Dates and registration' },
  { id: 2, key: 'eligibility', title: 'Eligibility', description: 'Student criteria' },
  { id: 3, key: 'modules', title: 'Modules', description: 'Test rounds' },
  { id: 4, key: 'settings', title: 'Settings', description: 'Proctoring and display' },
  { id: 5, key: 'review', title: 'Review', description: 'Review and create' },
] as const;

export const TOTAL_STEPS = WIZARD_STEPS.length;

// ============================================
// Default Values
// ============================================

const DEFAULT_PROCTORING_SETTINGS: ProctoringSettings = {
  detectTabSwitch: true,
  maxTabSwitches: 3,
  requireFullscreen: false,
  detectCopyPaste: true,
  webcamRequired: false,
  screenshareRequired: false,
};

const DEFAULT_APTITUDE_CONFIG: AptitudeModuleConfig = {
  difficulty: DifficultyLevel.MEDIUM,
  questionTypes: [QuestionType.QUANTITATIVE, QuestionType.LOGICAL],
  numberOfQuestions: 25,
  marksPerQuestion: 4,
  negativeMarking: 1,
};

const DEFAULT_MACHINE_CODING_CONFIG: MachineCodingModuleConfig = {
  difficulty: DifficultyLevel.MEDIUM,
  numberOfQuestions: 2,
  allowedLanguages: [],
  partialScoring: true,
  maxScorePerQuestion: 100,
};

const DEFAULT_AI_INTERVIEW_CONFIG: AiInterviewModuleConfig = {
  difficulty: AiInterviewDifficulty.MID,
  jobTitle: 'Software Engineer',
  companyName: null,
  focusAreas: ['Technical Skills', 'Problem Solving'],
  targetQuestions: 10,
};

const initialBasicInfo: WizardBasicInfo = {
  title: '',
  description: '',
  instructions: '',
};

const initialSchedule: WizardSchedule = {
  registrationStartDate: '',
  registrationEndDate: '',
  driveStartDate: '',
  driveEndDate: '',
  maxRegistrations: null,
};

const initialEligibility: WizardEligibility = {
  minCgpa: null,
  maxCgpa: null,
  minMarks10: null,
  minMarks12: null,
  allowedDepartmentIds: [],
  allowedCourseYears: [],
  requiredSkills: [],
  maxBacklogs: null,
};

const initialSettings: WizardSettings = {
  allowLateSubmission: false,
  showLeaderboard: true,
  showResultsImmediately: false,
  resultsReleaseDate: '',
  shuffleQuestions: true,
  enableProctoring: false,
  proctoringSettings: DEFAULT_PROCTORING_SETTINGS,
};

const initialErrors: WizardValidationErrors = {
  basicInfo: {},
  schedule: {},
  eligibility: {},
  modules: {},
  settings: {},
};

const initialState: WizardState = {
  currentStep: 0,
  completedSteps: new Set<number>(),
  basicInfo: initialBasicInfo,
  schedule: initialSchedule,
  eligibility: initialEligibility,
  modules: [],
  settings: initialSettings,
  errors: initialErrors,
  touched: {},
  isDirty: false,
  lastSavedAt: null,
};

// ============================================
// Helper Functions
// ============================================

const getDefaultModuleConfig = (
  moduleType: MockDriveModuleType
): { config: ModuleConfig; name: string; timeLimit: number } => {
  switch (moduleType) {
    case MockDriveModuleType.APTITUDE:
      return {
        config: { ...DEFAULT_APTITUDE_CONFIG },
        name: 'Aptitude Test',
        timeLimit: 60,
      };
    case MockDriveModuleType.MACHINE_CODING:
      return {
        config: { ...DEFAULT_MACHINE_CODING_CONFIG },
        name: 'Coding Round',
        timeLimit: 90,
      };
    case MockDriveModuleType.AI_INTERVIEW:
      return {
        config: { ...DEFAULT_AI_INTERVIEW_CONFIG },
        name: 'AI Interview',
        timeLimit: 30,
      };
  }
};

const calculateWeightages = (moduleCount: number): number[] => {
  if (moduleCount === 0) return [];
  
  const baseWeightage = Math.floor((100 / moduleCount) * 100) / 100;
  const remainder = Math.round((100 - baseWeightage * moduleCount) * 100) / 100;
  
  return Array.from({ length: moduleCount }, (_, index) =>
    index === 0 ? Math.round((baseWeightage + remainder) * 100) / 100 : baseWeightage
  );
};

const redistributeWeightages = (modules: WizardModule[]): WizardModule[] => {
  const weightages = calculateWeightages(modules.length);
  return modules.map((module, index) => ({
    ...module,
    order: index + 1,
    weightage: weightages[index] ?? 0,
  }));
};

const normalizeString = (value: string): string => value.trim();

const normalizeOptionalString = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

// ============================================
// Validation Functions
// ============================================

const validateBasicInfo = (basicInfo: WizardBasicInfo): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!basicInfo.title.trim()) {
    errors.title = 'Title is required';
  } else if (basicInfo.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (basicInfo.title.trim().length > 200) {
    errors.title = 'Title cannot exceed 200 characters';
  }
  
  if (basicInfo.description && basicInfo.description.length > 5000) {
    errors.description = 'Description cannot exceed 5000 characters';
  }
  
  if (basicInfo.instructions && basicInfo.instructions.length > 10000) {
    errors.instructions = 'Instructions cannot exceed 10000 characters';
  }
  
  return errors;
};

const validateSchedule = (schedule: WizardSchedule): Record<string, string> => {
  const errors: Record<string, string> = {};
  const now = new Date();
  
  if (!schedule.registrationStartDate) {
    errors.registrationStartDate = 'Registration start date is required';
  }
  
  if (!schedule.registrationEndDate) {
    errors.registrationEndDate = 'Registration end date is required';
  }
  
  if (!schedule.driveStartDate) {
    errors.driveStartDate = 'Drive start date is required';
  }
  
  if (!schedule.driveEndDate) {
    errors.driveEndDate = 'Drive end date is required';
  }
  
  // Date comparisons
  if (schedule.registrationStartDate && schedule.registrationEndDate) {
    const regStart = new Date(schedule.registrationStartDate);
    const regEnd = new Date(schedule.registrationEndDate);
    
    if (regStart >= regEnd) {
      errors.registrationEndDate = 'Registration end must be after start';
    }
  }
  
  if (schedule.driveStartDate && schedule.driveEndDate) {
    const driveStart = new Date(schedule.driveStartDate);
    const driveEnd = new Date(schedule.driveEndDate);
    
    if (driveStart >= driveEnd) {
      errors.driveEndDate = 'Drive end must be after start';
    }
  }
  
  if (schedule.registrationEndDate && schedule.driveStartDate) {
    const regEnd = new Date(schedule.registrationEndDate);
    const driveStart = new Date(schedule.driveStartDate);
    
    if (regEnd > driveStart) {
      errors.driveStartDate = 'Drive must start after registration ends';
    }
  }
  
  if (schedule.maxRegistrations !== null && schedule.maxRegistrations < 1) {
    errors.maxRegistrations = 'Max registrations must be at least 1';
  }
  
  return errors;
};

const validateEligibility = (eligibility: WizardEligibility): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (eligibility.minCgpa !== null) {
    if (eligibility.minCgpa < 0 || eligibility.minCgpa > 10) {
      errors.minCgpa = 'CGPA must be between 0 and 10';
    }
  }
  
  if (eligibility.maxCgpa !== null) {
    if (eligibility.maxCgpa < 0 || eligibility.maxCgpa > 10) {
      errors.maxCgpa = 'CGPA must be between 0 and 10';
    }
  }
  
  if (
    eligibility.minCgpa !== null &&
    eligibility.maxCgpa !== null &&
    eligibility.minCgpa > eligibility.maxCgpa
  ) {
    errors.minCgpa = 'Min CGPA cannot be greater than max CGPA';
  }
  
  if (eligibility.minMarks10 !== null) {
    if (eligibility.minMarks10 < 0 || eligibility.minMarks10 > 100) {
      errors.minMarks10 = 'Marks must be between 0 and 100';
    }
  }
  
  if (eligibility.minMarks12 !== null) {
    if (eligibility.minMarks12 < 0 || eligibility.minMarks12 > 100) {
      errors.minMarks12 = 'Marks must be between 0 and 100';
    }
  }
  
  if (eligibility.maxBacklogs !== null && eligibility.maxBacklogs < 0) {
    errors.maxBacklogs = 'Max backlogs cannot be negative';
  }
  
  return errors;
};

const validateModules = (modules: WizardModule[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (modules.length === 0) {
    errors.general = 'At least one module is required';
    return errors;
  }
  
  // Check total weightage
  const totalWeightage = modules.reduce((sum, m) => sum + m.weightage, 0);
  if (Math.abs(totalWeightage - 100) > 0.01) {
    errors.weightage = `Total weightage must be 100% (currently ${totalWeightage.toFixed(2)}%)`;
  }
  
  // Validate each module
  modules.forEach((module, index) => {
    if (!module.name.trim()) {
      errors[`module_${index}_name`] = 'Module name is required';
    }
    
    if (module.timeLimit < 5) {
      errors[`module_${index}_timeLimit`] = 'Time limit must be at least 5 minutes';
    }
    
    if (module.timeLimit > 300) {
      errors[`module_${index}_timeLimit`] = 'Time limit cannot exceed 300 minutes';
    }
    
    if (module.weightage <= 0) {
      errors[`module_${index}_weightage`] = 'Weightage must be greater than 0';
    }
  });
  
  return errors;
};

const validateSettings = (settings: WizardSettings): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (settings.enableProctoring) {
    if (settings.proctoringSettings.maxTabSwitches < 0) {
      errors.maxTabSwitches = 'Max tab switches cannot be negative';
    }
  }
  
  if (settings.resultsReleaseDate && !settings.showResultsImmediately) {
    const releaseDate = new Date(settings.resultsReleaseDate);
    if (isNaN(releaseDate.getTime())) {
      errors.resultsReleaseDate = 'Invalid date format';
    }
  }
  
  return errors;
};

// ============================================
// Store
// ============================================

export const useWizardStore = create<WizardStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,

        // ==========================================
        // Navigation Actions
        // ==========================================

        setCurrentStep: (step: number) => {
          const clampedStep = Math.max(0, Math.min(step, TOTAL_STEPS - 1));
          set({ currentStep: clampedStep }, false, 'setCurrentStep');
        },

        nextStep: () => {
          const { currentStep, validateStep, markStepCompleted } = get();
          
          // Validate current step before proceeding
          const isValid = validateStep(currentStep);
          
          if (!isValid) {
            return false;
          }
          
          markStepCompleted(currentStep);
          
          if (currentStep < TOTAL_STEPS - 1) {
            set({ currentStep: currentStep + 1 }, false, 'nextStep');
          }
          
          return true;
        },

        prevStep: () => {
          const { currentStep } = get();
          if (currentStep > 0) {
            set({ currentStep: currentStep - 1 }, false, 'prevStep');
          }
        },

        goToStep: (step: number) => {
          const { completedSteps, currentStep } = get();
          
          // Can only go to completed steps or the next uncompleted step
          const canGo = step <= currentStep || completedSteps.has(step - 1) || step === 0;
          
          if (canGo) {
            set({ currentStep: step }, false, 'goToStep');
          }
        },

        markStepCompleted: (step: number) => {
          set(
            (state) => ({
              completedSteps: new Set([...state.completedSteps, step]),
            }),
            false,
            'markStepCompleted'
          );
        },

        // ==========================================
        // Basic Info Actions
        // ==========================================

        setBasicInfo: (info: Partial<WizardBasicInfo>) => {
          set(
            (state) => ({
              basicInfo: { ...state.basicInfo, ...info },
              isDirty: true,
            }),
            false,
            'setBasicInfo'
          );
        },

        // ==========================================
        // Schedule Actions
        // ==========================================

        setSchedule: (schedule: Partial<WizardSchedule>) => {
          set(
            (state) => ({
              schedule: { ...state.schedule, ...schedule },
              isDirty: true,
            }),
            false,
            'setSchedule'
          );
        },

        // ==========================================
        // Eligibility Actions
        // ==========================================

        setEligibility: (eligibility: Partial<WizardEligibility>) => {
          set(
            (state) => ({
              eligibility: { ...state.eligibility, ...eligibility },
              isDirty: true,
            }),
            false,
            'setEligibility'
          );
        },

        // ==========================================
        // Settings Actions
        // ==========================================

        setSettings: (settings: Partial<WizardSettings>) => {
          set(
            (state) => ({
              settings: { ...state.settings, ...settings },
              isDirty: true,
            }),
            false,
            'setSettings'
          );
        },

        // ==========================================
        // Module Actions
        // ==========================================

        addModule: (moduleType: MockDriveModuleType) => {
          const { modules } = get();
          
          if (modules.length >= 10) {
            return; // Max modules reached
          }
          
          const defaults = getDefaultModuleConfig(moduleType);
          
          const newModule: WizardModule = {
            id: uuidv4(),
            moduleType,
            order: modules.length + 1,
            name: defaults.name,
            timeLimit: defaults.timeLimit,
            weightage: 0,
            config: defaults.config,
            passingScore: null,
            instructions: '',
          };
          
          const updatedModules = redistributeWeightages([...modules, newModule]);
          
          set({ modules: updatedModules, isDirty: true }, false, 'addModule');
        },

        updateModule: (id: string, updates: Partial<WizardModule>) => {
          set(
            (state) => ({
              modules: state.modules.map((module) =>
                module.id === id ? { ...module, ...updates } : module
              ),
              isDirty: true,
            }),
            false,
            'updateModule'
          );
        },

        removeModule: (id: string) => {
          const { modules } = get();
          const filteredModules = modules.filter((m) => m.id !== id);
          const updatedModules = redistributeWeightages(filteredModules);
          
          set({ modules: updatedModules, isDirty: true }, false, 'removeModule');
        },

        reorderModules: (startIndex: number, endIndex: number) => {
          const { modules } = get();
          
          if (
            startIndex < 0 ||
            startIndex >= modules.length ||
            endIndex < 0 ||
            endIndex >= modules.length
          ) {
            return;
          }
          
          const result = Array.from(modules);
          const [removed] = result.splice(startIndex, 1);
          
          if (!removed) return;
          
          result.splice(endIndex, 0, removed);
          
          const updatedModules = result.map((module, index) => ({
            ...module,
            order: index + 1,
          }));
          
          set({ modules: updatedModules, isDirty: true }, false, 'reorderModules');
        },

        duplicateModule: (id: string) => {
          const { modules } = get();
          
          if (modules.length >= 10) {
            return;
          }
          
          const original = modules.find((m) => m.id === id);
          if (!original) return;
          
          const duplicate: WizardModule = {
            ...original,
            id: uuidv4(),
            name: `${original.name} (Copy)`,
            order: modules.length + 1,
          };
          
          const updatedModules = redistributeWeightages([...modules, duplicate]);
          
          set({ modules: updatedModules, isDirty: true }, false, 'duplicateModule');
        },

        // ==========================================
        // Validation Actions
        // ==========================================

        validateStep: (step: number) => {
          const { basicInfo, schedule, eligibility, modules, settings } = get();
          
          let errors: Record<string, string> = {};
          let sectionKey: keyof WizardValidationErrors;
          
          switch (step) {
            case 0:
              errors = validateBasicInfo(basicInfo);
              sectionKey = 'basicInfo';
              break;
            case 1:
              errors = validateSchedule(schedule);
              sectionKey = 'schedule';
              break;
            case 2:
              errors = validateEligibility(eligibility);
              sectionKey = 'eligibility';
              break;
            case 3:
              errors = validateModules(modules);
              sectionKey = 'modules';
              break;
            case 4:
              errors = validateSettings(settings);
              sectionKey = 'settings';
              break;
            case 5:
              // Review step - validate all
              return get().validateAll();
            default:
              return true;
          }
          
          set(
            (state) => ({
              errors: {
                ...state.errors,
                [sectionKey]: errors,
              },
            }),
            false,
            'validateStep'
          );
          
          return Object.keys(errors).length === 0;
        },

        validateAll: () => {
          const { basicInfo, schedule, eligibility, modules, settings } = get();
          
          const allErrors: WizardValidationErrors = {
            basicInfo: validateBasicInfo(basicInfo),
            schedule: validateSchedule(schedule),
            eligibility: validateEligibility(eligibility),
            modules: validateModules(modules),
            settings: validateSettings(settings),
          };
          
          set({ errors: allErrors }, false, 'validateAll');
          
          return (
            Object.keys(allErrors.basicInfo).length === 0 &&
            Object.keys(allErrors.schedule).length === 0 &&
            Object.keys(allErrors.eligibility).length === 0 &&
            Object.keys(allErrors.modules).length === 0 &&
            Object.keys(allErrors.settings).length === 0
          );
        },

        setFieldError: (section, field, error) => {
          set(
            (state) => ({
              errors: {
                ...state.errors,
                [section]: {
                  ...state.errors[section],
                  [field]: error,
                },
              },
            }),
            false,
            'setFieldError'
          );
        },

        clearFieldError: (section, field) => {
          set(
            (state) => {
              const sectionErrors = { ...state.errors[section] };
              delete sectionErrors[field];
              return {
                errors: {
                  ...state.errors,
                  [section]: sectionErrors,
                },
              };
            },
            false,
            'clearFieldError'
          );
        },

        setTouched: (field: string) => {
          set(
            (state) => ({
              touched: { ...state.touched, [field]: true },
            }),
            false,
            'setTouched'
          );
        },

        // ==========================================
        // Utility Actions
        // ==========================================

        reset: () => {
          set(
            {
              ...initialState,
              completedSteps: new Set<number>(),
            },
            false,
            'reset'
          );
        },

        loadFromDraft: (data: Partial<WizardState>) => {
          set(
            (state) => ({
              ...state,
              ...data,
              completedSteps: new Set(data.completedSteps ?? []),
            }),
            false,
            'loadFromDraft'
          );
        },

        getSubmitData: (): CreateMockDrivePayload => {
          const { basicInfo, schedule, settings } = get();
          
          return {
            title: normalizeString(basicInfo.title),
            description: normalizeOptionalString(basicInfo.description),
            instructions: normalizeOptionalString(basicInfo.instructions),
            registrationStartDate: schedule.registrationStartDate || null,
            registrationEndDate: schedule.registrationEndDate || null,
            driveStartDate: schedule.driveStartDate || null,
            driveEndDate: schedule.driveEndDate || null,
            maxRegistrations: schedule.maxRegistrations,
            allowLateSubmission: settings.allowLateSubmission,
            showLeaderboard: settings.showLeaderboard,
            showResultsImmediately: settings.showResultsImmediately,
            resultsReleaseDate: settings.resultsReleaseDate || null,
            shuffleQuestions: settings.shuffleQuestions,
            enableProctoring: settings.enableProctoring,
            proctoringSettings: settings.enableProctoring
              ? settings.proctoringSettings
              : null,
          };
        },

        canProceed: () => {
          const { currentStep, errors } = get();
          const sectionKey = WIZARD_STEPS[currentStep]?.key;
          
          if (!sectionKey || sectionKey === 'review') {
            return true;
          }
          
          const sectionErrors = errors[sectionKey as keyof WizardValidationErrors];
          return !sectionErrors || Object.keys(sectionErrors).length === 0;
        },
      }),
      {
        name: 'mockdrive-wizard-storage',
        partialize: (state) => ({
          basicInfo: state.basicInfo,
          schedule: state.schedule,
          eligibility: state.eligibility,
          modules: state.modules,
          settings: state.settings,
          currentStep: state.currentStep,
          // Convert Set to Array for storage
          completedSteps: Array.from(state.completedSteps),
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Convert Array back to Set after rehydration
            state.completedSteps = new Set(state.completedSteps as unknown as number[]);
          }
        },
      }
    ),
    { name: 'MockDriveWizardStore' }
  )
);

// ============================================
// Selector Hooks
// ============================================

export const useWizardCurrentStep = () => useWizardStore((state) => state.currentStep);
export const useWizardBasicInfo = () => useWizardStore((state) => state.basicInfo);
export const useWizardSchedule = () => useWizardStore((state) => state.schedule);
export const useWizardEligibility = () => useWizardStore((state) => state.eligibility);
export const useWizardModules = () => useWizardStore((state) => state.modules);
export const useWizardSettings = () => useWizardStore((state) => state.settings);
export const useWizardErrors = () => useWizardStore((state) => state.errors);
export const useWizardIsDirty = () => useWizardStore((state) => state.isDirty);
export const useWizardCompletedSteps = () => useWizardStore((state) => state.completedSteps);

// Combined selectors for specific UI needs
export const useWizardNavigation = () =>
  useWizardStore((state) => ({
    currentStep: state.currentStep,
    completedSteps: state.completedSteps,
    setCurrentStep: state.setCurrentStep,
    nextStep: state.nextStep,
    prevStep: state.prevStep,
    goToStep: state.goToStep,
    canProceed: state.canProceed,
  }));

export const useWizardModuleActions = () =>
  useWizardStore((state) => ({
    modules: state.modules,
    addModule: state.addModule,
    updateModule: state.updateModule,
    removeModule: state.removeModule,
    reorderModules: state.reorderModules,
    duplicateModule: state.duplicateModule,
  }));
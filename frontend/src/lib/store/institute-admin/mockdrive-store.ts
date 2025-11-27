// src/lib/store/institute-admin/mockdrive-store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

import {
  MockDriveModuleType,
  ProctoringSettings,
  DifficultyLevel,
  QuestionType,
  AiInterviewDifficulty,
} from '@/types/admin.mockdrive.types';

import {
  DEFAULT_PROCTORING_SETTINGS,
  DEFAULT_APTITUDE_CONFIG,
  DEFAULT_MACHINE_CODING_CONFIG,
  DEFAULT_AI_INTERVIEW_CONFIG,
} from '@/lib/constants/admin.mockdrive.constants';

// ---------------------------
// Types
// ---------------------------

export interface WizardModule {
  id: string;
  moduleType: MockDriveModuleType;
  order: number;
  name: string;
  timeLimit: number;
  weightage: number;
  config: Record<string, unknown>;
  passingScore: number | null;
  instructions: string;
}

export interface WizardEligibility {
  minCgpa: number | null;
  maxCgpa: number | null;
  minMarks10: number | null;
  minMarks12: number | null;
  allowedDepartments: string[];
  allowedCourseYears: string[];
  requiredSkills: string[];
  maxBacklogs: number | null;
}

export interface WizardBasicInfo {
  title: string;
  description: string | null;
  instructions: string | null;
}

export interface WizardSchedule {
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  driveStartDate: string | null;
  driveEndDate: string | null;
  maxRegistrations: number | null;
}

export interface WizardSettings {
  allowLateSubmission: boolean;
  showLeaderboard: boolean;
  showResultsImmediately: boolean;
  resultsReleaseDate: string | null;
  shuffleQuestions: boolean;
  enableProctoring: boolean;
  proctoringSettings: ProctoringSettings;
}

// Form data type for submission
export interface WizardFormData {
  // Basic Info
  title: string;
  description: string | null;
  instructions: string | null;
  
  // Schedule
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  driveStartDate: string | null;
  driveEndDate: string | null;
  maxRegistrations: number | null;
  
  // Settings
  allowLateSubmission: boolean;
  showLeaderboard: boolean;
  showResultsImmediately: boolean;
  resultsReleaseDate: string | null;
  shuffleQuestions: boolean;
  enableProctoring: boolean;
  proctoringSettings: ProctoringSettings | null;
  
  // Eligibility
  eligibility: WizardEligibility;
  
  // Modules
  modules: Array<{
    id: string;
    moduleType: MockDriveModuleType;
    order: number;
    name: string;
    timeLimit: number;
    weightage: number;
    config: Record<string, unknown>;
    passingScore: number | null;
    instructions: string;
  }>;
}

interface CreateWizardState {
  // Current step
  currentStep: number;
  totalSteps: number;

  // Form sections
  basicInfo: WizardBasicInfo;
  schedule: WizardSchedule;
  eligibility: WizardEligibility;
  modules: WizardModule[];
  settings: WizardSettings;

  // Navigation actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Form actions
  setBasicInfo: (info: Partial<WizardBasicInfo>) => void;
  setSchedule: (schedule: Partial<WizardSchedule>) => void;
  setEligibility: (eligibility: Partial<WizardEligibility>) => void;
  setSettings: (settings: Partial<WizardSettings>) => void;

  // Module actions
  setModules: (modules: WizardModule[]) => void;
  addModule: (moduleType: MockDriveModuleType) => void;
  updateModule: (id: string, updates: Partial<WizardModule>) => void;
  removeModule: (id: string) => void;
  reorderModules: (startIndex: number, endIndex: number) => void;

// src/lib/store/institute-admin/mockdrive-store.ts (continued)

  // Utility actions
  reset: () => void;
  getFormData: () => WizardFormData;
  isStepValid: (step: number) => boolean;
}

// ---------------------------
// Initial State Values
// ---------------------------

const initialBasicInfo: WizardBasicInfo = {
  title: '',
  description: null,
  instructions: null,
};

const initialSchedule: WizardSchedule = {
  registrationStartDate: null,
  registrationEndDate: null,
  driveStartDate: null,
  driveEndDate: null,
  maxRegistrations: null,
};

const initialEligibility: WizardEligibility = {
  minCgpa: null,
  maxCgpa: null,
  minMarks10: null,
  minMarks12: null,
  allowedDepartments: [],
  allowedCourseYears: [],
  requiredSkills: [],
  maxBacklogs: null,
};

const initialSettings: WizardSettings = {
  allowLateSubmission: false,
  showLeaderboard: true,
  showResultsImmediately: false,
  resultsReleaseDate: null,
  shuffleQuestions: true,
  enableProctoring: false,
  proctoringSettings: DEFAULT_PROCTORING_SETTINGS,
};

// ---------------------------
// Helper Functions
// ---------------------------

/**
 * Normalizes empty strings to null
 */
const normalizeEmptyString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return null;
};

/**
 * Ensures value is a valid number or returns null
 */
const ensureNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

/**
 * Validates if a date string is valid ISO format
 */
const isValidDateString = (value: string | null): boolean => {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return !isNaN(timestamp);
};

/**
 * Calculates equal weightage distribution for modules
 */
const calculateWeightages = (moduleCount: number): number[] => {
  if (moduleCount === 0) return [];

  const baseWeightage = Math.floor((100 / moduleCount) * 100) / 100;
  const remainder = Math.round((100 - baseWeightage * moduleCount) * 100) / 100;

  return Array.from({ length: moduleCount }, (_, index) =>
    index === 0 ? baseWeightage + remainder : baseWeightage
  );
};

/**
 * Gets default configuration for a module type
 */
const getDefaultModuleConfig = (
  moduleType: MockDriveModuleType
): { config: Record<string, unknown>; name: string; timeLimit: number } => {
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
        name: 'Machine Coding',
        timeLimit: 90,
      };
    case MockDriveModuleType.AI_INTERVIEW:
      return {
        config: { ...DEFAULT_AI_INTERVIEW_CONFIG },
        name: 'AI Interview',
        timeLimit: 30,
      };
    default:
      return {
        config: {},
        name: 'Module',
        timeLimit: 30,
      };
  }
};

// ---------------------------
// Validation Helpers
// ---------------------------

const validateBasicInfo = (basicInfo: WizardBasicInfo): boolean => {
  return basicInfo.title.trim().length >= 3;
};

const validateSchedule = (schedule: WizardSchedule): boolean => {
  const { registrationStartDate, registrationEndDate, driveStartDate, driveEndDate } =
    schedule;

  // All dates must be present
  if (
    !registrationStartDate ||
    !registrationEndDate ||
    !driveStartDate ||
    !driveEndDate
  ) {
    return false;
  }

  // All dates must be valid
  if (
    !isValidDateString(registrationStartDate) ||
    !isValidDateString(registrationEndDate) ||
    !isValidDateString(driveStartDate) ||
    !isValidDateString(driveEndDate)
  ) {
    return false;
  }

  const regStart = Date.parse(registrationStartDate);
  const regEnd = Date.parse(registrationEndDate);
  const driveStart = Date.parse(driveStartDate);
  const driveEnd = Date.parse(driveEndDate);

  // Registration start must be before registration end
  if (regStart > regEnd) return false;

  // Drive start must be before drive end
  if (driveStart > driveEnd) return false;

  return true;
};

const validateModules = (modules: WizardModule[]): boolean => {
  if (modules.length === 0) return false;

  // Check if weightages sum to approximately 100
  const totalWeightage = modules.reduce((sum, m) => sum + (m.weightage ?? 0), 0);
  if (Math.abs(totalWeightage - 100) >= 0.01) return false;

  // Validate each module has required fields
  for (const module of modules) {
    if (!module.name.trim()) return false;
    if (module.timeLimit < 1) return false;

    // Module-specific validation
    if (module.moduleType === MockDriveModuleType.APTITUDE) {
      const questionTypes = module.config.questionTypes as string[] | undefined;
      if (!questionTypes || questionTypes.length === 0) return false;
    }

    if (module.moduleType === MockDriveModuleType.MACHINE_CODING) {
      const allowedLanguages = module.config.allowedLanguages as string[] | undefined;
      if (!allowedLanguages || allowedLanguages.length === 0) return false;
    }

    if (module.moduleType === MockDriveModuleType.AI_INTERVIEW) {
      const jobTitle = module.config.jobTitle as string | undefined;
      if (!jobTitle?.trim()) return false;
    }
  }

  return true;
};

// ---------------------------
// Store
// ---------------------------

export const useCreateWizardStore = create<CreateWizardState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentStep: 0,
      totalSteps: 6,
      basicInfo: initialBasicInfo,
      schedule: initialSchedule,
      eligibility: initialEligibility,
      modules: [],
      settings: initialSettings,

      // ---------------------------
      // Navigation Actions
      // ---------------------------

      setCurrentStep: (step: number) => {
        const { totalSteps } = get();
        const clampedStep = Math.max(0, Math.min(step, totalSteps - 1));
        set({ currentStep: clampedStep }, false, 'setCurrentStep');
      },

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        const nextStep = Math.min(currentStep + 1, totalSteps - 1);
        set({ currentStep: nextStep }, false, 'nextStep');
      },

      prevStep: () => {
        const { currentStep } = get();
        const prevStep = Math.max(currentStep - 1, 0);
        set({ currentStep: prevStep }, false, 'prevStep');
      },

      // ---------------------------
      // Basic Info Actions
      // ---------------------------

      setBasicInfo: (info: Partial<WizardBasicInfo>) => {
        set(
          (state) => ({
            basicInfo: {
              title: info.title !== undefined ? info.title : state.basicInfo.title,
              description:
                info.description !== undefined
                  ? normalizeEmptyString(info.description)
                  : state.basicInfo.description,
              instructions:
                info.instructions !== undefined
                  ? normalizeEmptyString(info.instructions)
                  : state.basicInfo.instructions,
            },
          }),
          false,
          'setBasicInfo'
        );
      },

      // ---------------------------
      // Schedule Actions
      // ---------------------------

      setSchedule: (schedule: Partial<WizardSchedule>) => {
        set(
          (state) => ({
            schedule: {
              registrationStartDate:
                schedule.registrationStartDate !== undefined
                  ? normalizeEmptyString(schedule.registrationStartDate)
                  : state.schedule.registrationStartDate,
              registrationEndDate:
                schedule.registrationEndDate !== undefined
                  ? normalizeEmptyString(schedule.registrationEndDate)
                  : state.schedule.registrationEndDate,
              driveStartDate:
                schedule.driveStartDate !== undefined
                  ? normalizeEmptyString(schedule.driveStartDate)
                  : state.schedule.driveStartDate,
              driveEndDate:
                schedule.driveEndDate !== undefined
                  ? normalizeEmptyString(schedule.driveEndDate)
                  : state.schedule.driveEndDate,
              maxRegistrations:
                schedule.maxRegistrations !== undefined
                  ? ensureNumberOrNull(schedule.maxRegistrations)
                  : state.schedule.maxRegistrations,
            },
          }),
          false,
          'setSchedule'
        );
      },

      // ---------------------------
      // Eligibility Actions
      // ---------------------------

      setEligibility: (eligibility: Partial<WizardEligibility>) => {
        set(
          (state) => ({
            eligibility: {
              minCgpa:
                eligibility.minCgpa !== undefined
                  ? ensureNumberOrNull(eligibility.minCgpa)
                  : state.eligibility.minCgpa,
              maxCgpa:
                eligibility.maxCgpa !== undefined
                  ? ensureNumberOrNull(eligibility.maxCgpa)
                  : state.eligibility.maxCgpa,
              minMarks10:
                eligibility.minMarks10 !== undefined
                  ? ensureNumberOrNull(eligibility.minMarks10)
                  : state.eligibility.minMarks10,
              minMarks12:
                eligibility.minMarks12 !== undefined
                  ? ensureNumberOrNull(eligibility.minMarks12)
                  : state.eligibility.minMarks12,
              allowedDepartments:
                eligibility.allowedDepartments !== undefined
                  ? eligibility.allowedDepartments
                  : state.eligibility.allowedDepartments,
              allowedCourseYears:
                eligibility.allowedCourseYears !== undefined
                  ? eligibility.allowedCourseYears
                  : state.eligibility.allowedCourseYears,
              requiredSkills:
                eligibility.requiredSkills !== undefined
                  ? eligibility.requiredSkills
                  : state.eligibility.requiredSkills,
              maxBacklogs:
                eligibility.maxBacklogs !== undefined
                  ? ensureNumberOrNull(eligibility.maxBacklogs)
                  : state.eligibility.maxBacklogs,
            },
          }),
          false,
          'setEligibility'
        );
      },

      // ---------------------------
      // Settings Actions
      // ---------------------------

      setSettings: (settings: Partial<WizardSettings>) => {
        set(
          (state) => ({
            settings: {
              allowLateSubmission:
                settings.allowLateSubmission !== undefined
                  ? settings.allowLateSubmission
                  : state.settings.allowLateSubmission,
              showLeaderboard:
                settings.showLeaderboard !== undefined
                  ? settings.showLeaderboard
                  : state.settings.showLeaderboard,
              showResultsImmediately:
                settings.showResultsImmediately !== undefined
                  ? settings.showResultsImmediately
                  : state.settings.showResultsImmediately,
              resultsReleaseDate:
                settings.resultsReleaseDate !== undefined
                  ? normalizeEmptyString(settings.resultsReleaseDate)
                  : state.settings.resultsReleaseDate,
              shuffleQuestions:
                settings.shuffleQuestions !== undefined
                  ? settings.shuffleQuestions
                  : state.settings.shuffleQuestions,
              enableProctoring:
                settings.enableProctoring !== undefined
                  ? settings.enableProctoring
                  : state.settings.enableProctoring,
              proctoringSettings:
                settings.proctoringSettings !== undefined
                  ? settings.proctoringSettings
                  : state.settings.proctoringSettings,
            },
          }),
          false,
          'setSettings'
        );
      },

      // ---------------------------
      // Module Actions
      // ---------------------------

      setModules: (modules: WizardModule[]) => {
        set({ modules }, false, 'setModules');
      },

      addModule: (moduleType: MockDriveModuleType) => {
        const { modules } = get();
        const newModuleCount = modules.length + 1;
        const weightages = calculateWeightages(newModuleCount);
        const defaults = getDefaultModuleConfig(moduleType);

        const updatedModules = modules.map((module, index) => ({
          ...module,
          weightage: weightages[index] ?? 0,
        }));

        const newModule: WizardModule = {
          id: uuidv4(),
          moduleType,
          order: newModuleCount,
          name: defaults.name,
          timeLimit: defaults.timeLimit,
          weightage: weightages[newModuleCount - 1] ?? 0,
          config: defaults.config,
          passingScore: null,
          instructions: '',
        };

        set({ modules: [...updatedModules, newModule] }, false, 'addModule');
      },

      updateModule: (id: string, updates: Partial<WizardModule>) => {
        set(
          (state) => ({
            modules: state.modules.map((module) =>
              module.id === id ? { ...module, ...updates } : module
            ),
          }),
          false,
          'updateModule'
        );
      },

      removeModule: (id: string) => {
        const { modules } = get();
        const filteredModules = modules.filter((module) => module.id !== id);
        const weightages = calculateWeightages(filteredModules.length);

        const updatedModules = filteredModules.map((module, index) => ({
          ...module,
          order: index + 1,
          weightage: weightages[index] ?? 0,
        }));

        set({ modules: updatedModules }, false, 'removeModule');
      },

      reorderModules: (startIndex: number, endIndex: number) => {
        const { modules } = get();

        // Validate indices
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

        if (!removed) {
          return;
        }

        result.splice(endIndex, 0, removed);

        const updatedModules = result.map((module, index) => ({
          ...module,
          order: index + 1,
        }));

        set({ modules: updatedModules }, false, 'reorderModules');
      },

      // ---------------------------
      // Utility Actions
      // ---------------------------

      reset: () => {
        set(
          {
            currentStep: 0,
            basicInfo: initialBasicInfo,
            schedule: initialSchedule,
            eligibility: initialEligibility,
            modules: [],
            settings: initialSettings,
          },
          false,
          'reset'
        );
      },

      getFormData: (): WizardFormData => {
        const { basicInfo, schedule, eligibility, modules, settings } = get();

        return {
          // Basic Info
          title: basicInfo.title,
          description: basicInfo.description,
          instructions: basicInfo.instructions,

          // Schedule
          registrationStartDate: schedule.registrationStartDate,
          registrationEndDate: schedule.registrationEndDate,
          driveStartDate: schedule.driveStartDate,
          driveEndDate: schedule.driveEndDate,
          maxRegistrations: schedule.maxRegistrations,

          // Settings
          allowLateSubmission: settings.allowLateSubmission,
          showLeaderboard: settings.showLeaderboard,
          showResultsImmediately: settings.showResultsImmediately,
          resultsReleaseDate: settings.resultsReleaseDate,
          shuffleQuestions: settings.shuffleQuestions,
          enableProctoring: settings.enableProctoring,
          proctoringSettings: settings.enableProctoring
            ? settings.proctoringSettings
            : null,

          // Eligibility
          eligibility: {
            minCgpa: eligibility.minCgpa,
            maxCgpa: eligibility.maxCgpa,
            minMarks10: eligibility.minMarks10,
            minMarks12: eligibility.minMarks12,
            allowedDepartments: eligibility.allowedDepartments,
            allowedCourseYears: eligibility.allowedCourseYears,
            requiredSkills: eligibility.requiredSkills,
            maxBacklogs: eligibility.maxBacklogs,
          },

          // Modules
          modules: modules.map((module) => ({
            id: module.id,
            moduleType: module.moduleType,
            order: module.order,
            name: module.name,
            timeLimit: module.timeLimit,
            weightage: module.weightage,
            config: module.config,
            passingScore: module.passingScore,
            instructions: module.instructions,
          })),
        };
      },

     isStepValid: (step: number): boolean => {
  const { basicInfo, schedule, modules } = get();

  switch (step) {
    case 0: // Basic Info
      return validateBasicInfo(basicInfo);

    case 1: // Schedule
      return validateSchedule(schedule);

    case 2: // Eligibility
      return true; // Eligibility is optional

    case 3: // Modules
      return validateModules(modules);

    case 4: // Settings
      return true; // Settings always valid (has defaults)

    case 5: // Review
      return (
        validateBasicInfo(basicInfo) &&
        validateSchedule(schedule) &&
        validateModules(modules)
      );

    default:
      return false;
  }
},
    }),
    { name: 'create-wizard-store' }
  )
);

// ---------------------------
// Selector Hooks
// ---------------------------

export const useWizardCurrentStep = () =>
  useCreateWizardStore((state) => state.currentStep);
export const useWizardBasicInfo = () =>
  useCreateWizardStore((state) => state.basicInfo);
export const useWizardSchedule = () =>
  useCreateWizardStore((state) => state.schedule);
export const useWizardEligibility = () =>
  useCreateWizardStore((state) => state.eligibility);
export const useWizardModules = () => useCreateWizardStore((state) => state.modules);
export const useWizardSettings = () =>
  useCreateWizardStore((state) => state.settings);
export const useWizardActions = () =>
  useCreateWizardStore((state) => ({
    setCurrentStep: state.setCurrentStep,
    nextStep: state.nextStep,
    prevStep: state.prevStep,
    setBasicInfo: state.setBasicInfo,
    setSchedule: state.setSchedule,
    setEligibility: state.setEligibility,
    setSettings: state.setSettings,
    setModules: state.setModules,
    addModule: state.addModule,
    updateModule: state.updateModule,
    removeModule: state.removeModule,
    reorderModules: state.reorderModules,
    reset: state.reset,
    getFormData: state.getFormData,
    isStepValid: state.isStepValid,
  }));
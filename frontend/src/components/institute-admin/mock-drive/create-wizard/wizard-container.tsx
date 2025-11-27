// src/components/institute-admin/mock-drive/create-wizard/wizard-container.tsx

'use client';

import { useCreateWizardStore } from '@/lib/store/institute-admin/mockdrive-store';
import { Card, CardContent } from '@/components/ui/card';
import { WizardProgress } from './wizard-progress';
import { WizardNavigation } from './wizard-navigation';
import { StepBasicInfo } from './step-basic-info';
import { StepSchedule } from './step-schedule';
import { StepEligibility } from './step-eligibility';
import { StepModules } from './step-modules';
import { StepSettings } from './step-settings';
import { StepReview } from './step-review';

// ============================================
// Types
// ============================================

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

interface WizardContainerProps {
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

// ============================================
// Constants
// ============================================

const WIZARD_STEPS: WizardStep[] = [
  { id: 0, title: 'Basic Info', description: 'Title and description' },
  { id: 1, title: 'Schedule', description: 'Dates and timing' },
  { id: 2, title: 'Eligibility', description: 'Student criteria' },
  { id: 3, title: 'Modules', description: 'Test configuration' },
  { id: 4, title: 'Settings', description: 'Display and proctoring' },
  { id: 5, title: 'Review', description: 'Confirm details' },
];

// ============================================
// Step Components Map
// ============================================

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  0: StepBasicInfo,
  1: StepSchedule,
  2: StepEligibility,
  3: StepModules,
  4: StepSettings,
  5: StepReview,
};

// ============================================
// Validation Helpers (matching store logic)
// ============================================

const isValidDateString = (value: string | null): boolean => {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return !isNaN(timestamp);
};

// ============================================
// Component
// ============================================

export function WizardContainer({
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Create Mock Drive',
}: WizardContainerProps) {
  const currentStep = useCreateWizardStore((state) => state.currentStep);
  const nextStep = useCreateWizardStore((state) => state.nextStep);
  const prevStep = useCreateWizardStore((state) => state.prevStep);

  // Compute validity inside selector so component re-renders when data changes
  const isCurrentStepValid = useCreateWizardStore((state) => {
    const { basicInfo, schedule, modules } = state;
    const step = state.currentStep;

    switch (step) {
      case 0: // Basic Info
        return basicInfo.title.trim().length >= 3;

      case 1: // Schedule
        const { registrationStartDate, registrationEndDate, driveStartDate, driveEndDate } = schedule;
        if (!registrationStartDate || !registrationEndDate || !driveStartDate || !driveEndDate) {
          return false;
        }
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
        if (regStart > regEnd) return false;
        if (driveStart > driveEnd) return false;
        return true;

      case 2: // Eligibility
        return true; // Optional

      case 3: // Modules
        if (modules.length === 0) return false;
        const totalWeightage = modules.reduce((sum, m) => sum + (m.weightage ?? 0), 0);
        if (Math.abs(totalWeightage - 100) >= 0.01) return false;
        for (const module of modules) {
          if (!module.name.trim()) return false;
          if (module.timeLimit < 1) return false;
        }
        return true;

      case 4: // Settings
        return true; // Has defaults

      case 5: // Review
        // Re-validate all required steps
        const basicValid = basicInfo.title.trim().length >= 3;
        const scheduleValid = !!(
          schedule.registrationStartDate &&
          schedule.registrationEndDate &&
          schedule.driveStartDate &&
          schedule.driveEndDate
        );
        const modulesValid = modules.length > 0;
        return basicValid && scheduleValid && modulesValid;

      default:
        return false;
    }
  });

  const actualTotalSteps = WIZARD_STEPS.length;
  const isLastStep = currentStep === actualTotalSteps - 1;

  const handleNext = async () => {
    if (isLastStep) {
      await onSubmit();
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    prevStep();
  };

  // Get the current step component
  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <WizardProgress steps={WIZARD_STEPS} currentStep={currentStep} />

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {StepComponent ? <StepComponent /> : null}
        </CardContent>
      </Card>

      {/* Navigation */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={actualTotalSteps}
        isStepValid={isCurrentStepValid}
        isSubmitting={isSubmitting}
        onNext={handleNext}
        onPrevious={handlePrevious}
        submitLabel={submitLabel}
      />
    </div>
  );
}
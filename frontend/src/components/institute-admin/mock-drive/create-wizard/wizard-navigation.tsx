// src/components/institute-admin/mock-drive/create-wizard/wizard-navigation.tsx

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  isStepValid: boolean;
  isSubmitting?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  submitLabel?: string;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  isStepValid,
  isSubmitting = false,
  onNext,
  onPrevious,
  submitLabel = 'Create Mock Drive',
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      {/* Step Indicator */}
      <div className="hidden items-center gap-2 sm:flex">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentStep
                ? 'bg-primary'
                : index < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Mobile Step Counter */}
      <span className="text-sm text-muted-foreground sm:hidden">
        {currentStep + 1} / {totalSteps}
      </span>

      {/* Next/Submit Button */}
      <Button
        onClick={onNext}
        disabled={!isStepValid || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isLastStep ? 'Creating...' : 'Please wait...'}
          </>
        ) : isLastStep ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            {submitLabel}
          </>
        ) : (
          <>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
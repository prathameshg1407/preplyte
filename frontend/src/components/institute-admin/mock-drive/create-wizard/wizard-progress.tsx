// src/components/institute-admin/mock-drive/create-wizard/wizard-progress.tsx

'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
}

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex w-full items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn('relative', !isLast && 'flex-1 pr-4 sm:pr-8')}
            >
              <div className="flex items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-all duration-200',
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'border-primary bg-background text-primary shadow-sm'
                        : 'border-muted bg-background text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span>{step.id + 1}</span>
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-10 top-5 h-0.5 w-[calc(100%-2.5rem)] -translate-y-1/2 transition-colors duration-200',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Step Label (Desktop) */}
              <div className="mt-3 hidden min-w-0 sm:block">
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isCurrent || isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
                <p className="truncate text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
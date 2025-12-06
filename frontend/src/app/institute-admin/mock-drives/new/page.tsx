// src/app/institute-admin/mock-drives/new/page.tsx

'use client';

import { Suspense, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WizardContainer } from '@/components/institute-admin/mock-drive/create-wizard/wizard-container';
import {
  useCreateWizardStore,
  WizardFormData,
} from '@/lib/store/institute-admin/mockdrive-store';
import { useCreateMockDrive } from '@/lib/hooks/institute-admin/use-mockdrive';
import { CreateMockDriveInput } from '@/types/admin.mockdrive.types';
import { ArrowLeft, Loader2 } from 'lucide-react';

/**
 * Transform wizard form data to API input format
 */
function transformFormDataToInput(formData: WizardFormData): CreateMockDriveInput {
  return {
    title: formData.title,
    description: formData.description,
    instructions: formData.instructions,
    registrationStartDate: formData.registrationStartDate,
    registrationEndDate: formData.registrationEndDate,
    driveStartDate: formData.driveStartDate,
    driveEndDate: formData.driveEndDate,
    maxRegistrations: formData.maxRegistrations,
    allowLateSubmission: formData.allowLateSubmission,
    showLeaderboard: formData.showLeaderboard,
    showResultsImmediately: formData.showResultsImmediately,
    resultsReleaseDate: formData.resultsReleaseDate,
    shuffleQuestions: formData.shuffleQuestions,
    enableProctoring: formData.enableProctoring,
    proctoringSettings: formData.proctoringSettings,
  };
}

// Loading fallback component
function WizardLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

// Separate component that uses client-side hooks
function NewMockDriveContent() {
  const router = useRouter();
  const reset = useCreateWizardStore((state) => state.reset);
  const getFormData = useCreateWizardStore((state) => state.getFormData);
  const createMutation = useCreateMockDrive();

  // Reset store on mount
  useEffect(() => {
    reset();

    // Cleanup on unmount
    return () => {
      reset();
    };
  }, [reset]);

  const handleSubmit = useCallback(async () => {
    const formData = getFormData();
    const input = transformFormDataToInput(formData);

    try {
      const result = await createMutation.mutateAsync(input);

      // Navigate to the newly created drive
      if (result?.id) {
        router.push(`/institute-admin/mock-drives/${result.id}`);
      } else {
        router.push('/institute-admin/mock-drives');
      }
    } catch (error) {
      // Error is handled by the mutation hook (toast notification)
      console.error('Failed to create mock drive:', error);
    }
  }, [getFormData, createMutation, router]);

  return (
    <WizardContainer
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      submitLabel="Create Mock Drive"
    />
  );
}

export default function NewMockDrivePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/institute-admin/mock-drives">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to mock drives</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Mock Drive</h1>
          <p className="text-muted-foreground">
            Set up a new mock placement drive for your students.
          </p>
        </div>
      </div>

      {/* Wizard wrapped in Suspense */}
      <Suspense fallback={<WizardLoading />}>
        <NewMockDriveContent />
      </Suspense>
    </div>
  );
}
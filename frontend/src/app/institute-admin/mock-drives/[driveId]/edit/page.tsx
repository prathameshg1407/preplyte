// src/app/institute-admin/mock-drives/[driveId]/edit/page.tsx

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WizardContainer } from '@/components/institute-admin/mock-drive/create-wizard/wizard-container';
import {
  useCreateWizardStore,
  WizardModule,
} from '@/lib/store/institute-admin/mockdrive-store';
import { useMockDriveDetail } from '@/lib/hooks/institute-admin/use-mockdrive';
import { useUpdateFullMockDrive } from '@/lib/hooks/institute-admin/use-create-full-mockdrive';
import { 
  getMockDrivePermissions, 
  ModuleConfig,
  MockDriveModule,
} from '@/types/admin.mockdrive.types';
import { DEFAULT_PROCTORING_SETTINGS } from '@/lib/constants/admin.mockdrive.constants';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';

// ============================================
// Helper Functions
// ============================================

/**
 * Convert ModuleConfig to plain record for wizard store
 */
function moduleConfigToRecord(config: ModuleConfig): Record<string, unknown> {
  return { ...config };
}

/**
 * Convert API module to wizard module format
 */
function apiModuleToWizardModule(module: MockDriveModule): WizardModule {
  return {
    id: module.id,
    moduleType: module.moduleType,
    order: module.order,
    name: module.name || '',
    timeLimit: module.timeLimit,
    weightage: module.weightage,
    config: moduleConfigToRecord(module.config),
    passingScore: module.passingScore,
    instructions: module.instructions || '',
  };
}

// ============================================
// Loading Skeleton
// ============================================

function EditPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-[500px] w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function EditMockDrivePage() {
  const router = useRouter();
  const params = useParams();
  const driveId = params.driveId as string;

  // Store actions
  const reset = useCreateWizardStore((state) => state.reset);
  const setBasicInfo = useCreateWizardStore((state) => state.setBasicInfo);
  const setSchedule = useCreateWizardStore((state) => state.setSchedule);
  const setEligibility = useCreateWizardStore((state) => state.setEligibility);
  const setModules = useCreateWizardStore((state) => state.setModules);
  const setSettings = useCreateWizardStore((state) => state.setSettings);
  const getFormData = useCreateWizardStore((state) => state.getFormData);

  // API hooks
  const { data: drive, isLoading, isError, error } = useMockDriveDetail(driveId);
  
  // Use the full update hook that handles modules
  const updateMutation = useUpdateFullMockDrive();

  // Track original module IDs for update logic
  const originalModuleIds = useMemo(() => {
    if (!drive?.modules) return [];
    return drive.modules.map(m => m.id);
  }, [drive]);

  // Check permissions
  const permissions = useMemo(() => {
    if (!drive) return null;
    return getMockDrivePermissions(drive.status);
  }, [drive]);

  // Reset store on mount and unmount
  useEffect(() => {
    reset();
    return () => {
      reset();
    };
  }, [reset]);

  // Hydrate store when data is fetched
  useEffect(() => {
    if (!drive) return;

    // Basic Info
    setBasicInfo({
      title: drive.title,
      description: drive.description,
      instructions: drive.instructions,
    });

    // Schedule
    setSchedule({
      registrationStartDate: drive.registrationStartDate,
      registrationEndDate: drive.registrationEndDate,
      driveStartDate: drive.driveStartDate,
      driveEndDate: drive.driveEndDate,
      maxRegistrations: drive.maxRegistrations,
    });

    // Eligibility
    if (drive.eligibilityCriteria) {
      setEligibility({
        minCgpa: drive.eligibilityCriteria.minCgpa,
        maxCgpa: drive.eligibilityCriteria.maxCgpa,
        minMarks10: drive.eligibilityCriteria.minMarks10,
        minMarks12: drive.eligibilityCriteria.minMarks12,
        maxBacklogs: drive.eligibilityCriteria.maxBacklogs,
        allowedDepartmentIds: drive.eligibilityCriteria.allowedDepartmentIds || [],
        allowedCourseYears: drive.eligibilityCriteria.allowedCourseYears || [],
        requiredSkills: drive.eligibilityCriteria.requiredSkills || [],
      });
    }

    // Modules - Convert API modules to wizard modules
    if (drive.modules && Array.isArray(drive.modules)) {
      const mappedModules = drive.modules.map(apiModuleToWizardModule);
      setModules(mappedModules);
    }

    // Settings
    setSettings({
      allowLateSubmission: drive.allowLateSubmission,
      showLeaderboard: drive.showLeaderboard,
      showResultsImmediately: drive.showResultsImmediately,
      resultsReleaseDate: drive.resultsReleaseDate,
      shuffleQuestions: drive.shuffleQuestions,
      enableProctoring: drive.enableProctoring,
      proctoringSettings: drive.proctoringSettings || DEFAULT_PROCTORING_SETTINGS,
    });
  }, [drive, setBasicInfo, setSchedule, setEligibility, setModules, setSettings]);

  // Handle submit with full update (including modules)
  const handleSubmit = useCallback(async () => {
    if (!drive) return;

    const formData = getFormData();

    try {
      // Use the full update mutation that handles modules
      const result = await updateMutation.mutateAsync({
        mockDriveId: driveId,
        formData: formData,
        existingModuleIds: originalModuleIds,
      });

      // Show additional info if there were issues
      if (result.failedOperations.length > 0) {
        console.warn('Some operations failed during update:', result.failedOperations);
      }

      // Navigate back to the drive details
      router.push(`/institute-admin/mock-drives/${driveId}`);
    } catch (err) {
      // Error is handled by the mutation hook
      console.error('Failed to update mock drive:', err);
    }
  }, [driveId, drive, getFormData, updateMutation, originalModuleIds, router]);

  // Loading state
  if (isLoading) {
    return <EditPageSkeleton />;
  }

  // Error state
  if (isError || !drive) {
    return (
      <div className="mx-auto max-w-4xl pt-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Mock Drive</AlertTitle>
          <AlertDescription>
            {error?.message || 'Failed to load mock drive details. Please try again later.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/institute-admin/mock-drives">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mock Drives
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if editing is allowed
  if (!permissions?.canEdit) {
    return (
      <div className="mx-auto max-w-4xl pt-10">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Editing Not Allowed</AlertTitle>
          <AlertDescription>
            This mock drive cannot be edited because it is currently{' '}
            <strong className="capitalize">
              {drive.status.toLowerCase().replace(/_/g, ' ')}
            </strong>
            . Only drives in <strong>Draft</strong> or <strong>Published</strong> status can be modified.
            {drive.status === 'PUBLISHED' && (
              <span className="mt-2 block text-sm">
                Note: Published drives have limited editing capabilities. You cannot modify modules or core schedule settings.
              </span>
            )}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/institute-admin/mock-drives/${driveId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
          <Button asChild>
            <Link href="/institute-admin/mock-drives">
              Back to All Mock Drives
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild
          className="shrink-0"
        >
          <Link href={`/institute-admin/mock-drives/${driveId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to mock drive</span>
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Mock Drive</h1>
          <p className="text-muted-foreground">
            Update the details for{' '}
            <span className="font-medium text-foreground">{drive.title}</span>
          </p>
        </div>
      </div>

      {/* Status warning for published drives */}
      {drive.status === 'PUBLISHED' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limited Editing</AlertTitle>
          <AlertDescription>
            This mock drive is published. Some fields may be restricted to maintain data integrity.
            You can still update descriptions, instructions, and some settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Wizard Container - Pass simple string for submitLabel */}
      <WizardContainer
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel={updateMutation.isPending ? 'Updating...' : 'Update Mock Drive'}
      />

      {/* Show error if update fails */}
      {updateMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Update Failed</AlertTitle>
          <AlertDescription>
            {updateMutation.error?.message || 'Failed to update mock drive. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
// src/components/institute-admin/mock-drive/create-wizard/step-review.tsx

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useCreateWizardStore } from '@/lib/store/institute-admin/mockdrive-store';
import { useCreateFullMockDrive } from '@/lib/hooks/institute-admin/use-create-full-mockdrive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MODULE_TYPE_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Layers,
  Clock,
  FileText,
  Settings,
  GraduationCap,
  Shield,
  Loader2,
  Rocket,
} from 'lucide-react';

// ============================================
// Helper Functions
// ============================================

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Not set';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  try {
    return format(date, 'PPP p');
  } catch {
    return date.toString();
  }
}

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

// ============================================
// Section Components
// ============================================

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function ReviewSection({ title, icon, children }: ReviewSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface ReviewItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

function ReviewItem({ label, value, className }: ReviewItemProps) {
  return (
    <div className={className}>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function StepReview() {
  const router = useRouter();
  
  // Store selectors
  const basicInfo = useCreateWizardStore((state) => state.basicInfo);
  const schedule = useCreateWizardStore((state) => state.schedule);
  const eligibility = useCreateWizardStore((state) => state.eligibility);
  const modules = useCreateWizardStore((state) => state.modules);
  const settings = useCreateWizardStore((state) => state.settings);
  const getFormData = useCreateWizardStore((state) => state.getFormData);
  const reset = useCreateWizardStore((state) => state.reset);

  // Mutation hook
  const {
    mutateAsync: createMockDrive,
    isPending,
    isError,
    error,
  } = useCreateFullMockDrive();

  // Calculated values
  const { totalWeightage, totalDuration, validationIssues, hasEligibility } = useMemo(() => {
    const weightage = modules.reduce((sum, m) => sum + (m.weightage ?? 0), 0);
    const duration = modules.reduce((sum, m) => sum + (m.timeLimit ?? 0), 0);

    const issues: string[] = [];

    // Basic info validation
    if (!basicInfo.title || basicInfo.title.trim().length < 3) {
      issues.push('Title must be at least 3 characters');
    }

    // Schedule validation
    if (!schedule.registrationStartDate || !schedule.registrationEndDate) {
      issues.push('Registration dates are required');
    }
    if (!schedule.driveStartDate || !schedule.driveEndDate) {
      issues.push('Drive dates are required');
    }

    // Module validation
    if (modules.length === 0) {
      issues.push('At least one module is required');
    }
    if (modules.length > 0 && Math.abs(weightage - 100) >= 0.01) {
      issues.push('Module weightages must sum to 100%');
    }

    // Module-specific validation
    for (const module of modules) {
      if (module.moduleType === 'APTITUDE') {
        const questionTypes = module.config.questionTypes as string[] | undefined;
        if (!questionTypes || questionTypes.length === 0) {
          issues.push(`${module.name}: At least one question type required`);
        }
      }
      if (module.moduleType === 'MACHINE_CODING') {
        const languages = module.config.allowedLanguages as string[] | undefined;
        if (!languages || languages.length === 0) {
          issues.push(`${module.name}: At least one programming language required`);
        }
      }
      if (module.moduleType === 'AI_INTERVIEW') {
        const jobTitle = module.config.jobTitle as string | undefined;
        if (!jobTitle?.trim()) {
          issues.push(`${module.name}: Job title is required`);
        }
      }
    }

    // Check if any eligibility criteria is set
    const hasElig =
      eligibility.allowedDepartments.length > 0 ||
      eligibility.allowedCourseYears.length > 0 ||
      eligibility.requiredSkills.length > 0 ||
      eligibility.minCgpa != null ||
      eligibility.maxCgpa != null ||
      eligibility.minMarks10 != null ||
      eligibility.minMarks12 != null ||
      eligibility.maxBacklogs != null;

    return {
      totalWeightage: weightage,
      totalDuration: duration,
      validationIssues: issues,
      hasEligibility: hasElig,
    };
  }, [basicInfo, schedule, modules, eligibility]);

  const isValid = validationIssues.length === 0;

  // Handle form submission
  const handleSubmit = async () => {
    if (!isValid || isPending) return;

    try {
      const formData = getFormData();
      const result = await createMockDrive(formData);

      // Reset wizard state on success
      reset();

      // Navigate to the created mock drive
      router.push(`/institute-admin/mock-drives/${result.mockDrive.id}`);
    } catch (err) {
      // Error is already handled by the mutation hook's onError
      console.error('Failed to create mock drive:', err);

      // If partial creation happened, optionally redirect
      const errorWithId = err as Error & { mockDriveId?: string };
      if (errorWithId.mockDriveId) {
        // Optionally redirect to the partially created drive
        // router.push(`/institute-admin/mock-drives/${errorWithId.mockDriveId}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Review & Create</h2>
        <p className="text-sm text-muted-foreground">
          Review all the details before creating the mock drive.
        </p>
      </div>

      {/* Validation Issues */}
      {!isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Please fix the following issues</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {validationIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {isValid && !isError && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            Ready to create
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            All required information has been provided. You can now create the mock
            drive.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Creation Failed</AlertTitle>
          <AlertDescription>
            {error?.message || 'An error occurred while creating the mock drive. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Info Section */}
      <ReviewSection
        title="Basic Information"
        icon={<FileText className="h-4 w-4" />}
      >
        <div className="space-y-4">
          <ReviewItem
            label="Title"
            value={
              <span className="text-lg font-semibold">
                {basicInfo.title || (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </span>
            }
          />
          {basicInfo.description && (
            <ReviewItem
              label="Description"
              value={<p className="text-sm">{basicInfo.description}</p>}
            />
          )}
          {basicInfo.instructions && (
            <ReviewItem
              label="Instructions"
              value={<p className="text-sm whitespace-pre-wrap">{basicInfo.instructions}</p>}
            />
          )}
        </div>
      </ReviewSection>

      {/* Schedule Section */}
      <ReviewSection title="Schedule" icon={<Calendar className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewItem
            label="Registration Period"
            value={
              <span className="text-sm">
                {formatDateRange(
                  schedule.registrationStartDate,
                  schedule.registrationEndDate
                )}
              </span>
            }
          />
          <ReviewItem
            label="Drive Period"
            value={
              <span className="text-sm">
                {formatDateRange(schedule.driveStartDate, schedule.driveEndDate)}
              </span>
            }
          />
          {schedule.maxRegistrations != null && (
            <ReviewItem
              label="Max Registrations"
              value={<span className="font-medium">{schedule.maxRegistrations}</span>}
            />
          )}
        </div>
      </ReviewSection>

      {/* Eligibility Section */}
      <ReviewSection
        title="Eligibility Criteria"
        icon={<GraduationCap className="h-4 w-4" />}
      >
        {hasEligibility ? (
          <div className="space-y-4">
            {/* CGPA & Marks */}
            {(eligibility.minCgpa != null ||
              eligibility.maxCgpa != null ||
              eligibility.minMarks10 != null ||
              eligibility.minMarks12 != null) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {(eligibility.minCgpa != null || eligibility.maxCgpa != null) && (
                  <ReviewItem
                    label="CGPA Range"
                    value={`${eligibility.minCgpa ?? '0'} - ${eligibility.maxCgpa ?? '10'}`}
                  />
                )}
                {(eligibility.minMarks10 != null ||
                  eligibility.minMarks12 != null) && (
                  <ReviewItem
                    label="Minimum Marks"
                    value={
                      <span className="text-sm">
                        10th: {eligibility.minMarks10 ?? '-'}%, 12th:{' '}
                        {eligibility.minMarks12 ?? '-'}%
                      </span>
                    }
                  />
                )}
                {eligibility.maxBacklogs != null && (
                  <ReviewItem
                    label="Maximum Backlogs"
                    value={eligibility.maxBacklogs}
                  />
                )}
              </div>
            )}

            {/* Departments */}
            {eligibility.allowedDepartments.length > 0 && (
              <ReviewItem
                label="Allowed Departments"
                value={
                  <div className="mt-1 flex flex-wrap gap-1">
                    {eligibility.allowedDepartments.map((dept) => (
                      <Badge key={dept} variant="secondary">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                }
              />
            )}

            {/* Course Years */}
            {eligibility.allowedCourseYears.length > 0 && (
              <ReviewItem
                label="Allowed Course Years"
                value={
                  <div className="mt-1 flex flex-wrap gap-1">
                    {eligibility.allowedCourseYears.map((year) => (
                      <Badge key={year} variant="secondary">
                        {year}
                      </Badge>
                    ))}
                  </div>
                }
              />
            )}

            {/* Skills */}
            {eligibility.requiredSkills.length > 0 && (
              <ReviewItem
                label="Required Skills"
                value={
                  <div className="mt-1 flex flex-wrap gap-1">
                    {eligibility.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                }
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No eligibility restrictions — open to all students
          </p>
        )}
      </ReviewSection>

      {/* Modules Section */}
      <ReviewSection
        title={`Modules (${modules.length})`}
        icon={<Layers className="h-4 w-4" />}
      >
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No modules added</p>
        ) : (
          <div className="space-y-4">
            {/* Module List */}
            <div className="space-y-3">
              {modules.map((module, index) => {
                const config = MODULE_TYPE_CONFIG[module.moduleType] ?? {
                  label: 'Module',
                  bgColor: 'bg-gray-100',
                  color: 'text-gray-800',
                };

                return (
                  <div
                    key={module.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor}`}
                      >
                        <span className={`text-sm font-bold ${config.color}`}>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{module.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {config.label}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {module.timeLimit} min
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {(module.weightage ?? 0).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Duration</span>
                <span>{totalDuration} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Weightage</span>
                <span
                  className={
                    Math.abs(totalWeightage - 100) < 0.01
                      ? 'text-green-600'
                      : 'text-destructive'
                  }
                >
                  {totalWeightage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </ReviewSection>

      {/* Settings Section */}
      <ReviewSection title="Settings" icon={<Settings className="h-4 w-4" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Show Leaderboard</span>
            <Badge variant={settings.showLeaderboard ? 'default' : 'secondary'}>
              {settings.showLeaderboard ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Show Results Immediately</span>
            <Badge
              variant={settings.showResultsImmediately ? 'default' : 'secondary'}
            >
              {settings.showResultsImmediately ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Shuffle Questions</span>
            <Badge variant={settings.shuffleQuestions ? 'default' : 'secondary'}>
              {settings.shuffleQuestions ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Allow Late Submission</span>
            <Badge variant={settings.allowLateSubmission ? 'default' : 'secondary'}>
              {settings.allowLateSubmission ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        {/* Proctoring Summary */}
        <div className="mt-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Proctoring</span>
            <Badge variant={settings.enableProctoring ? 'default' : 'secondary'}>
              {settings.enableProctoring ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          {settings.enableProctoring && (
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tab Switch Detection</span>
                <span>
                  {settings.proctoringSettings.detectTabSwitch
                    ? `Yes (max ${settings.proctoringSettings.maxTabSwitches})`
                    : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Require Fullscreen</span>
                <span>
                  {settings.proctoringSettings.requireFullscreen ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Copy/Paste Detection</span>
                <span>
                  {settings.proctoringSettings.detectCopyPaste ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Webcam Required</span>
                <span>
                  {settings.proctoringSettings.webcamRequired ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}
        </div>
      </ReviewSection>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!isValid || isPending}
          className="min-w-[200px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Mock Drive...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Create Mock Drive
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
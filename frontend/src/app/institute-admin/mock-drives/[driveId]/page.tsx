// src/app/institute-admin/mock-drives/[driveId]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DriveStatusBadge } from '@/components/institute-admin/mock-drive/drive-status-badge';
import { DriveStatsCards } from '@/components/institute-admin/mock-drive/drive-stats-cards';
import {
  useMockDriveDetail,
  useMockDriveStats,
  usePublishMockDrive,
  useCancelMockDrive,
  useDeleteMockDrive,
  useDuplicateMockDrive,
} from '@/lib/hooks/institute-admin/use-mockdrive';
import { getMockDrivePermissions } from '@/types/admin.mockdrive.types';
import { MODULE_TYPE_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import {
  ArrowLeft,
  Edit,
  Rocket,
  XCircle,
  Trash2,
  Users,
  Layers,
  Calendar,
  Clock,
  BarChart3,
  Trophy,
  Settings,
  AlertCircle,
  Copy,
} from 'lucide-react';

// ============================================
// Helper Functions
// ============================================

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'Not set';

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    try {
      return format(new Date(date), 'PPP p');
    } catch {
      return 'Invalid date';
    }
  };

  return `${formatDate(start)} — ${formatDate(end)}`;
}

// ============================================
// Quick Action Card
// ============================================

interface QuickActionCardProps {
  href: string;
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

function QuickActionCard({
  href,
  title,
  value,
  description,
  icon,
  disabled,
}: QuickActionCardProps) {
  const content = (
    <Card
      className={`h-full transition-shadow ${
        disabled ? 'opacity-50' : 'cursor-pointer hover:shadow-md'
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

// ============================================
// Loading Skeleton
// ============================================

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

// ============================================
// Setting Row Component
// ============================================

interface SettingRowProps {
  label: string;
  value: boolean | number | string;
  isNumber?: boolean;
}

function SettingRow({ label, value, isNumber }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {isNumber ? (
        <span className="font-medium">{value}</span>
      ) : (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function MockDriveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driveId = params.driveId as string;

  // API Hooks
  const { data: drive, isLoading, isError, error } = useMockDriveDetail(driveId);
  const { data: stats, isLoading: isLoadingStats } = useMockDriveStats(driveId);
  const publishMutation = usePublishMockDrive();
  const cancelMutation = useCancelMockDrive();
  const deleteMutation = useDeleteMockDrive();
  const duplicateMutation = useDuplicateMockDrive();

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(driveId);
      router.push('/institute-admin/mock-drives');
    } catch {
      // Error handled by mutation
    }
  };

  // Handle duplicate
  const handleDuplicate = async () => {
    try {
      const result = await duplicateMutation.mutateAsync({ id: driveId });
      if (result?.id) {
        router.push(`/institute-admin/mock-drives/${result.id}`);
      }
    } catch {
      // Error handled by mutation
    }
  };

  // Loading state
  if (isLoading) {
    return <DetailSkeleton />;
  }

  // Error state
  if (isError || !drive) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || 'Failed to load mock drive details. Please try again.'}
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/institute-admin/mock-drives">Back to Mock Drives</Link>
        </Button>
      </div>
    );
  }

  // Get permissions based on status
  const permissions = getMockDrivePermissions(drive.status);

  // Calculate totals
  const totalDuration = drive.modules.reduce((sum, m) => sum + m.timeLimit, 0);
  const totalQuestions = drive.modules.reduce(
    (sum, m) => sum + (m.questionsCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/institute-admin/mock-drives">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{drive.title}</h1>
                <DriveStatusBadge status={drive.status} />
              </div>
              {drive.description && (
                <p className="mt-1 text-muted-foreground">{drive.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {permissions.canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/institute-admin/mock-drives/${driveId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}

          {permissions.canDuplicate && (
            <Button
              variant="outline"
              onClick={handleDuplicate}
              disabled={duplicateMutation.isPending}
            >
              <Copy className="mr-2 h-4 w-4" />
              {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate'}
            </Button>
          )}

          {permissions.canPublish && (
            <Button
              onClick={() => publishMutation.mutate(driveId)}
              disabled={publishMutation.isPending}
            >
              <Rocket className="mr-2 h-4 w-4" />
              {publishMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          )}

          {permissions.canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={cancelMutation.isPending}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Mock Drive</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this mock drive? This action
                    cannot be undone. All registered students will be notified.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Active</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelMutation.mutate(driveId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancel Drive
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {permissions.canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleteMutation.isPending}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Mock Drive</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{drive.title}"? This action
                    cannot be undone. All associated data will be permanently
                    removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <DriveStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          href={`/institute-admin/mock-drives/${driveId}/registrations`}
          title="Registrations"
          value={stats?.totalRegistrations ?? 0}
          description="Manage student registrations"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />

        <QuickActionCard
          href={`/institute-admin/mock-drives/${driveId}/batches`}
          title="Batches"
          value={stats?.totalBatches ?? 0}
          description="Manage drive batches"
          icon={<Layers className="h-4 w-4 text-muted-foreground" />}
        />

        <QuickActionCard
          href={`/institute-admin/mock-drives/${driveId}/results`}
          title="Results"
          value={stats?.completedAttempts ?? 0}
          description="View student results"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />

        <QuickActionCard
          href={`/institute-admin/mock-drives/${driveId}/analytics`}
          title="Analytics"
          value="View"
          description="Performance analytics"
          icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules ({drive.modules.length})</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Schedule Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Registration Period
                  </div>
                  <div className="text-sm">
                    {formatDateRange(
                      drive.registrationStartDate,
                      drive.registrationEndDate
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Drive Period
                  </div>
                  <div className="text-sm">
                    {formatDateRange(drive.driveStartDate, drive.driveEndDate)}
                  </div>
                </div>
                {drive.maxRegistrations && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Registration Limit
                    </div>
                    <div className="text-sm">
                      {stats?.totalRegistrations ?? 0} / {drive.maxRegistrations}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Duration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Duration & Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">{totalDuration} min</div>
                  <p className="text-sm text-muted-foreground">
                    Total time across {drive.modules.length} module
                    {drive.modules.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Questions
                  </div>
                  <div className="text-2xl font-semibold">{totalQuestions}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          {drive.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{drive.instructions}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Modules ({drive.modules.length})
            </h3>
            {permissions.canEdit && (
              <Button asChild size="sm">
                <Link href={`/institute-admin/mock-drives/${driveId}/edit`}>
                  Manage Modules
                </Link>
              </Button>
            )}
          </div>

          {drive.modules.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Layers className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No modules configured
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {drive.modules.map((module, index) => {
                const config = MODULE_TYPE_CONFIG[module.moduleType];
                return (
                  <Card key={module.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            config?.bgColor || 'bg-gray-100'
                          }`}
                        >
                          <span
                            className={`font-bold ${config?.color || 'text-gray-800'}`}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {module.name || config?.label || 'Module'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {config?.label || module.moduleType}
                            </Badge>
                            <span>{module.timeLimit} min</span>
                            <span>•</span>
                            <span>{module.weightage}% weightage</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {module.questionsCount || 0} questions
                        </div>
                        {module.passingScore && (
                          <div className="text-xs text-muted-foreground">
                            Pass: {module.passingScore}%
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Eligibility Tab */}
        <TabsContent value="eligibility" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Eligibility Criteria</h3>
            {permissions.canEdit && (
              <Button asChild size="sm">
                <Link href={`/institute-admin/mock-drives/${driveId}/edit`}>
                  Edit Eligibility
                </Link>
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              {drive.eligibilityCriteria ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* CGPA */}
                  {(drive.eligibilityCriteria.minCgpa != null ||
                    drive.eligibilityCriteria.maxCgpa != null) && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        CGPA Range
                      </div>
                      <div className="mt-1 text-lg font-medium">
                        {drive.eligibilityCriteria.minCgpa ?? '0'} -{' '}
                        {drive.eligibilityCriteria.maxCgpa ?? '10'}
                      </div>
                    </div>
                  )}

                  {/* Marks */}
                  {(drive.eligibilityCriteria.minMarks10 != null ||
                    drive.eligibilityCriteria.minMarks12 != null) && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Minimum Marks
                      </div>
                      <div className="mt-1">
                        {drive.eligibilityCriteria.minMarks10 != null && (
                          <div>10th: {drive.eligibilityCriteria.minMarks10}%</div>
                        )}
                        {drive.eligibilityCriteria.minMarks12 != null && (
                          <div>12th: {drive.eligibilityCriteria.minMarks12}%</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Backlogs */}
                  {drive.eligibilityCriteria.maxBacklogs != null && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Maximum Backlogs
                      </div>
                      <div className="mt-1 text-lg font-medium">
                        {drive.eligibilityCriteria.maxBacklogs}
                      </div>
                    </div>
                  )}

                  {/* Departments */}
                  {drive.eligibilityCriteria.allowedDepartmentIds.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Allowed Departments
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {drive.eligibilityCriteria.allowedDepartmentIds.map((dept) => (
                          <Badge key={dept} variant="secondary">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Years */}
                  {drive.eligibilityCriteria.allowedCourseYears.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Allowed Course Years
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {drive.eligibilityCriteria.allowedCourseYears.map((year) => (
                          <Badge key={year} variant="secondary">
                            {year}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {drive.eligibilityCriteria.requiredSkills.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Required Skills
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {drive.eligibilityCriteria.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No eligibility restrictions — open to all students
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                Drive Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <SettingRow label="Show Leaderboard" value={drive.showLeaderboard} />
                <SettingRow
                  label="Show Results Immediately"
                  value={drive.showResultsImmediately}
                />
                <SettingRow
                  label="Shuffle Questions"
                  value={drive.shuffleQuestions}
                />
                <SettingRow
                  label="Allow Late Submission"
                  value={drive.allowLateSubmission}
                />
                <SettingRow
                  label="Proctoring Enabled"
                  value={drive.enableProctoring}
                />
              </div>

              {drive.enableProctoring && drive.proctoringSettings && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="mb-4 font-medium">Proctoring Settings</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <SettingRow
                      label="Detect Tab Switch"
                      value={drive.proctoringSettings.detectTabSwitch}
                    />
                    <SettingRow
                      label="Max Tab Switches"
                      value={drive.proctoringSettings.maxTabSwitches}
                      isNumber
                    />
                    <SettingRow
                      label="Require Fullscreen"
                      value={drive.proctoringSettings.requireFullscreen}
                    />
                    <SettingRow
                      label="Detect Copy/Paste"
                      value={drive.proctoringSettings.detectCopyPaste}
                    />
                    <SettingRow
                      label="Webcam Required"
                      value={drive.proctoringSettings.webcamRequired}
                    />
                    <SettingRow
                      label="Screen Share Required"
                      value={drive.proctoringSettings.screenshareRequired}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
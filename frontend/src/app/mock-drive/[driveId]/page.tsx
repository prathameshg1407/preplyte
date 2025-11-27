// src/app/mock-drive/[driveId]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  Building2,
  ChevronRight,
  PlayCircle,
  ArrowLeft,
  Loader2,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  useMockDriveDetail,
  useEligibilityCheck,
} from '@/lib/hooks/mock-drive/use-discovery';
import { EligibilityStatus } from '@/components/mock-drive/discovery/eligibility-status';
import { RegistrationButton } from '@/components/mock-drive/discovery/registration-button';
import {
  MOCKDRIVE_STATUS_CONFIG,
  MODULE_TYPE_CONFIG,
} from '@/lib/constants/mockdrive.constants';

export default function MockDriveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driveId = params.driveId as string;

  const { data: drive, isLoading: driveLoading } = useMockDriveDetail(driveId);
  const { data: eligibility, isLoading: eligibilityLoading } = useEligibilityCheck(driveId);

  if (driveLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Mock drive not found</p>
          <Link href="/mock-drive">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mock Drives
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = MOCKDRIVE_STATUS_CONFIG[drive.status];
  const canStart =
    drive.isRegistered &&
    drive.registrationStatus === 'APPROVED' &&
    drive.batchInfo &&
    drive.status === 'IN_PROGRESS';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/mock-drive" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Mock Drives
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{drive.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{drive.institute.name}</span>
                </div>
              </div>
              <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
            </div>

            {drive.description && (
              <p className="mt-4 text-muted-foreground">{drive.description}</p>
            )}
          </div>

          {/* Key Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {drive.driveStartDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Drive Date</p>
                      <p className="font-medium">
                        {format(new Date(drive.driveStartDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Duration</p>
                    <p className="font-medium">{drive.totalTimeLimit} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Modules</p>
                    <p className="font-medium">{drive.modules.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Registered</p>
                    <p className="font-medium">{drive.registrationCount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drive.modules.map((module, index) => {
                  const typeConfig = MODULE_TYPE_CONFIG[module.moduleType];
                  return (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className={`font-medium ${typeConfig.color}`}>
                            {module.name || typeConfig.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {module.timeLimit} minutes • {module.weightage}% weightage
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{typeConfig.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          {drive.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{drive.instructions}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Eligibility Criteria */}
          {drive.eligibilityCriteria && (
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {drive.eligibilityCriteria.minCgpa && (
                    <div>
                      <span className="text-muted-foreground">Minimum CGPA:</span>
                      <span className="ml-2 font-medium">{drive.eligibilityCriteria.minCgpa}</span>
                    </div>
                  )}
                  {drive.eligibilityCriteria.minMarks10 && (
                    <div>
                      <span className="text-muted-foreground">Min 10th Marks:</span>
                      <span className="ml-2 font-medium">{drive.eligibilityCriteria.minMarks10}%</span>
                    </div>
                  )}
                  {drive.eligibilityCriteria.minMarks12 && (
                    <div>
                      <span className="text-muted-foreground">Min 12th Marks:</span>
                      <span className="ml-2 font-medium">{drive.eligibilityCriteria.minMarks12}%</span>
                    </div>
                  )}
                  {drive.eligibilityCriteria.allowedDepartments.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Departments:</span>
                      <span className="ml-2 font-medium">
                        {drive.eligibilityCriteria.allowedDepartments.join(', ')}
                      </span>
                    </div>
                  )}
                  {drive.eligibilityCriteria.allowedCourseYears.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Course Years:</span>
                      <span className="ml-2 font-medium">
                        {drive.eligibilityCriteria.allowedCourseYears.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Registration Period */}
              {(drive.registrationStartDate || drive.registrationEndDate) && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Registration Period</p>
                  <p className="text-muted-foreground">
                    {drive.registrationStartDate &&
                      format(new Date(drive.registrationStartDate), 'MMM d, yyyy')}
                    {' - '}
                    {drive.registrationEndDate &&
                      format(new Date(drive.registrationEndDate), 'MMM d, yyyy')}
                  </p>
                </div>
              )}

              {/* Batch Info if registered */}
              {drive.isRegistered && drive.batchInfo && (
                <div className="p-3 bg-green-50 rounded-lg text-sm">
                  <p className="font-medium mb-1 text-green-800">Your Batch</p>
                  <p className="text-green-700">{drive.batchInfo.name}</p>
                  <p className="text-green-600 text-xs mt-1">
                    {format(new Date(drive.batchInfo.scheduledStartTime), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}

              <Separator />

              {/* Registration Button */}
              <RegistrationButton
                driveId={driveId}
                isRegistered={drive.isRegistered}
                registrationStatus={drive.registrationStatus}
                canRegister={eligibility?.canRegister || false}
              />

              {/* Start Button */}
              {canStart && (
                <Link href={`/mock-drive/${driveId}/attempt`} className="block">
                  <Button className="w-full" size="lg">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Mock Drive
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Eligibility Check */}
          <EligibilityStatus data={eligibility} isLoading={eligibilityLoading} />

          {/* Quick Links */}
          {drive.isRegistered && drive.registrationStatus === 'APPROVED' && (
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Link href={`/mock-drive/${driveId}/result`}>
                  <Button variant="outline" className="w-full justify-between">
                    View Results
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/mock-drive/${driveId}/leaderboard`}>
                  <Button variant="outline" className="w-full justify-between">
                    Leaderboard
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
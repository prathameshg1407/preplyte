// src/app/institute-admin/mock-drives/[driveId]/results/[attemptId]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AttemptStatusBadge } from '@/components/institute-admin/mock-drive/results/attempt-status-badge';
import { useResultDetailPage } from '@/lib/hooks/institute-admin/use-mockdrive-results';
import { MODULE_TYPE_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Loader2,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react';

export default function ResultDetailPage() {
  const params = useParams();
  const driveId = params.driveId as string;
  const attemptId = params.attemptId as string;

  const {
    result,
    isLoading,
    isError,
    error,
    generateReport,
    isGeneratingReport,
    hasReport,
  } = useResultDetailPage(driveId, attemptId);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !result) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || 'Failed to load result details.'}
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href={`/institute-admin/mock-drives/${driveId}/results`}>
            Back to Results
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/institute-admin/mock-drives/${driveId}/results`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Result Details</h1>
            <p className="text-sm text-muted-foreground">
              {result.student.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!hasReport && (
            <Button
              variant="outline"
              onClick={generateReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Generate Report
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AttemptStatusBadge status={result.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result.percentageScore !== null
                ? `${result.percentageScore.toFixed(1)}%`
                : '-'}
            </div>
            {result.totalScore !== null && (
              <p className="text-xs text-muted-foreground">
                {result.totalScore} points
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rank
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {result.rank && result.rank <= 3 && (
                <Trophy
                  className={`h-5 w-5 ${
                    result.rank === 1
                      ? 'text-yellow-500'
                      : result.rank === 2
                        ? 'text-gray-400'
                        : 'text-amber-600'
                  }`}
                />
              )}
              <span className="text-2xl font-bold">
                {result.rank ? `#${result.rank}` : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Result
            </CardTitle>
            {result.isPassed ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            {result.isPassed !== null ? (
              <Badge
                className={
                  result.isPassed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {result.isPassed ? 'Passed' : 'Failed'}
              </Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Student & Timing Info */}
        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Name" value={result.student.name} />
              <DetailRow label="Email" value={result.student.email} />
              <DetailRow label="Student ID" value={result.student.studentId || '-'} />
              <DetailRow label="Department" value={result.student.department || '-'} />
            </CardContent>
          </Card>

          {/* Timing Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                label="Started"
                value={
                  result.startedAt
                    ? format(new Date(result.startedAt), 'PPP p')
                    : '-'
                }
              />
              <DetailRow
                label="Completed"
                value={
                  result.completedAt
                    ? format(new Date(result.completedAt), 'PPP p')
                    : '-'
                }
              />
              {result.batch && (
                <DetailRow
                  label="Batch"
                  value={<Badge variant="outline">{result.batch.name}</Badge>}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Module Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Module Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.modules.map((module, index) => {
                const config = MODULE_TYPE_CONFIG[module.moduleType];
                const percentage =
                  module.maxScore && module.score !== null
                    ? (module.score / module.maxScore) * 100
                    : module.percentage || 0;

                return (
                  <div
                    key={module.moduleId}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
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
                          <div className="font-medium">{module.moduleName}</div>
                          <div className="text-sm text-muted-foreground">
                            {config?.label || module.moduleType}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {percentage.toFixed(1)}%
                        </div>
                        {module.score !== null && module.maxScore !== null && (
                          <div className="text-sm text-muted-foreground">
                            {module.score} / {module.maxScore}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Time: {Math.round(module.timeSpentSeconds / 60)} min
                      </span>
                      {module.isPassed !== null && (
                        <Badge
                          variant="outline"
                          className={
                            module.isPassed
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }
                        >
                          {module.isPassed ? 'Passed' : 'Failed'}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Report */}
          {result.report && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  AI Performance Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="mb-2 font-medium">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.report.performanceSummary}
                  </p>
                </div>

                <Separator />

                {/* Strengths */}
                {result.report.strengths.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-medium text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {result.report.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {result.report.weaknesses.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-medium text-red-700">
                      <XCircle className="h-4 w-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {result.report.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.report.recommendations.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-700">
                      <Target className="h-4 w-4" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {result.report.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  );
}
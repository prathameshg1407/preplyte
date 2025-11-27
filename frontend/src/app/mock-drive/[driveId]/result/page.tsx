// src/app/mock-drive/[driveId]/result/page.tsx

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDetailedReport } from '@/lib/hooks/mock-drive/use-attempt-result';
import { ResultOverview } from '@/components/mock-drive/results/result-overview';
import { ScoreBreakdown } from '@/components/mock-drive/results/score-breakdown';
import { Recommendations } from '@/components/mock-drive/results/recommendations';

export default function MockDriveResultPage() {
  const params = useParams();
  const driveId = params.driveId as string;

  const { data: report, isLoading, error } = useDetailedReport(driveId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {error?.message || 'Results not available yet'}
          </p>
          <Link href={`/mock-drive/${driveId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mock Drive
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/mock-drive/${driveId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mock Drive
          </Link>
          <h1 className="text-3xl font-bold">{report.overview.mockDriveTitle}</h1>
          <p className="text-muted-foreground">Your Performance Report</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ResultOverview result={report.overview} />
        </TabsContent>

        <TabsContent value="breakdown">
          <ScoreBreakdown moduleReports={report.moduleReports} />
        </TabsContent>

        <TabsContent value="feedback">
          <Recommendations
            strengths={report.strengths}
            weaknesses={report.weaknesses}
            recommendations={report.recommendations}
            overallFeedback={report.overallFeedback}
          />
        </TabsContent>
      </Tabs>

      {/* Comparison Stats */}
      <div className="mt-8 grid md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Your Percentile</p>
          <p className="text-2xl font-bold">{report.comparisonStats.percentile.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Batch Rank</p>
          <p className="text-2xl font-bold">
            {report.comparisonStats.rankInBatch}/{report.comparisonStats.totalInBatch}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Average Score</p>
          <p className="text-2xl font-bold">{report.comparisonStats.averageScore.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Highest Score</p>
          <p className="text-2xl font-bold">{report.comparisonStats.highestScore.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
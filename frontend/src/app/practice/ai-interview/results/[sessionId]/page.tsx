// src/app/practice/ai-interview/results/[sessionId]/page.tsx (continued)

'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, RefreshCw, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FeedbackOverview,
  CategoryScores,
  QuestionFeedbackList,
  RecommendationsCard,
} from '@/components/practice/ai-interview';
import {
  useInterviewFeedback,
  useInterviewSessionDetail,
  useRegenerateFeedback,
} from '@/lib/hooks/use-interview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function InterviewResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { 
    data: sessionDetail, 
    isLoading: sessionLoading,
    error: sessionError,
  } = useInterviewSessionDetail(sessionId);
  
  const { 
    data: feedback, 
    isLoading: feedbackLoading,
    error: feedbackError,
  } = useInterviewFeedback(sessionId);
  
  const { 
    mutate: regenerate, 
    isPending: isRegenerating 
  } = useRegenerateFeedback();

  const isLoading = sessionLoading || feedbackLoading;
  const error = sessionError || feedbackError;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load interview results. Please try again later.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-8">
          <Button onClick={() => router.push('/practice/ai-interview')}>
            Back to Interviews
          </Button>
        </div>
      </div>
    );
  }

  // No feedback available
  if (!feedback) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Generating Feedback</h1>
          <p className="text-muted-foreground mb-6">
            Your interview feedback is being generated. This may take a moment.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/practice/ai-interview')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Interview Feedback</h1>
            <p className="text-muted-foreground">
              {sessionDetail?.session.config.jobTitle || 'Interview'} 
              {sessionDetail?.session.config.companyName && 
                ` at ${sessionDetail.session.config.companyName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerate(sessionId)}
            disabled={isRegenerating}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`}
            />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <FeedbackOverview feedback={feedback} />

        <div className="grid lg:grid-cols-2 gap-6">
          <CategoryScores categoryScores={feedback.categoryScores} />
          <RecommendationsCard recommendations={feedback.recommendations} />
        </div>

        <QuestionFeedbackList questions={feedback.questionFeedback} />

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-8 pb-4">
          <Button
            variant="outline"
            onClick={() => router.push('/practice/ai-interview')}
          >
            Back to Interviews
          </Button>
          <Button onClick={() => router.push('/practice/ai-interview')}>
            Start New Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
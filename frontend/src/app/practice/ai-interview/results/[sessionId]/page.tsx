// src/app/practice/ai-interview/results/[sessionId]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, RefreshCw, Share2 } from 'lucide-react';
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

export default function InterviewResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { data: sessionDetail, isLoading: sessionLoading } =
    useInterviewSessionDetail(sessionId);
  const { data: feedback, isLoading: feedbackLoading } =
    useInterviewFeedback(sessionId);
  const { mutate: regenerate, isPending: isRegenerating } =
    useRegenerateFeedback();

  const isLoading = sessionLoading || feedbackLoading;

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Feedback Not Available</h1>
          <p className="text-muted-foreground mb-6">
            The feedback for this interview session is not available yet.
          </p>
          <Button onClick={() => router.push('/practice/ai-interview')}>
            Start New Interview
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
              {sessionDetail?.session.config.jobTitle} Interview
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
            Regenerate
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
        <div className="flex justify-center gap-4 pt-8">
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
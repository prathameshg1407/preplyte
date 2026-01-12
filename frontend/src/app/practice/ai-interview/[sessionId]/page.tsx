// src/app/practice/ai-interview/[sessionId]/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InterviewRoom } from '@/components/practice/ai-interview';
import { useInterviewSession } from '@/lib/hooks/use-interview';
import { useInterviewStore } from '@/lib/store/interview-store';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { data: session, isLoading, error } = useInterviewSession(sessionId);
  const { reset } = useInterviewStore();

  // Reset store on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Redirect if session is completed
  useEffect(() => {
    if (session?.status === 'COMPLETED') {
      router.replace(`/practice/ai-interview/results/${sessionId}`);
    } else if (session?.status === 'CANCELLED' || session?.status === 'FAILED') {
      router.replace('/practice/ai-interview');
    }
  }, [session?.status, sessionId, router]);

  // Loading state
  if (isLoading && !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading interview session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || (!session && !isLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Session Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The interview session you're looking for doesn't exist or has expired.
          </p>
        </div>
        <Button onClick={() => router.push('/practice/ai-interview')}>
          Start a New Interview
        </Button>
      </div>
    );
  }

  return <InterviewRoom sessionId={sessionId} />;
}
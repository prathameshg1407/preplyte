// src/app/practice/ai-interview/[sessionId]/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InterviewRoom } from '@/components/practice/ai-interview';
import { useInterviewSession } from '@/lib/hooks/use-interview';
import { useInterviewStore } from '@/lib/store/interview-store';
import { Loader2 } from 'lucide-react';

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { data: session, isLoading, error } = useInterviewSession(sessionId);
  const { reset } = useInterviewStore();

  // Reset store on mount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Redirect if session is completed
  useEffect(() => {
    if (session?.status === 'COMPLETED') {
      router.replace(`/practice/ai-interview/results/${sessionId}`);
    }
  }, [session?.status, sessionId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Session Not Found</h1>
        <p className="text-muted-foreground">
          The interview session you're looking for doesn't exist or has expired.
        </p>
        <button
          onClick={() => router.push('/practice/ai-interview')}
          className="text-primary hover:underline"
        >
          Start a new interview
        </button>
      </div>
    );
  }

  return <InterviewRoom sessionId={sessionId} />;
}
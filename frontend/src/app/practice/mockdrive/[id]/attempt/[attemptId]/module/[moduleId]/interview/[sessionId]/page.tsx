'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInterviewSession } from '@/lib/hooks/use-interview';
import { useInterviewStore } from '@/lib/store/interview-store';
import { ResumeSelector } from '@/components/practice/ai-interview/session/resume-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Mic } from 'lucide-react';
import { MockDriveInterviewRoom } from '@/components/mock-drive/attempt/ai-interview/interview/mockdrive-interview-room';

export default function IndividualMockDriveInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [resumeSelected, setResumeSelected] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string | undefined>();

  const sessionId = params.sessionId as string;
  const mockDriveId = params.id as string;
  const attemptId = params.attemptId as string;
  const attemptPath = `/practice/mockdrive/${mockDriveId}/attempt?attemptId=${attemptId}`;

  const { data: session, isLoading, error } = useInterviewSession(sessionId);
  const { reset } = useInterviewStore();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // FIX: Redirect if session is terminal — regardless of resumeSelected
  useEffect(() => {
    if (
      session?.status === 'COMPLETED' ||
      session?.status === 'CANCELLED' ||
      session?.status === 'FAILED'
    ) {
      router.replace(attemptPath);
    }
  }, [attemptPath, router, session?.status]);

  // FIX: Loading & error checks moved BEFORE the resumeSelected gate
  if (isLoading && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (error || (!session && !isLoading)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Session Not Found</h1>
          <p className="max-w-md text-muted-foreground">
            The interview session could not be loaded. Return to your mockdrive attempt.
          </p>
        </div>
        <Button onClick={() => router.push(attemptPath)}>Back to Attempt</Button>
      </div>
    );
  }

  // Resume selection screen
  if (!resumeSelected) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI Interview</CardTitle>
                <CardDescription>
                  Select a resume to personalize your interview
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Resume (Optional)
              </label>
              <ResumeSelector value={selectedResume} onChange={setSelectedResume} />
              <p className="text-xs text-muted-foreground mt-2">
                Your resume will be used to personalize the interview questions
                and provide contextual feedback.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => router.push(attemptPath)}>
                Back
              </Button>
              <Button onClick={() => setResumeSelected(true)}>
                Continue to Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MockDriveInterviewRoom
      sessionId={sessionId}
      backPath={attemptPath}
      resultsPath={attemptPath}
    />
  );
}

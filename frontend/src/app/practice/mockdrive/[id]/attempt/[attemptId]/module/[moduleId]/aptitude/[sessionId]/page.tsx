// src/app/practice/mockdrive/[id]/attempt/[attemptId]/module/[moduleId]/aptitude/[sessionId]/page.tsx

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  QuestionDisplay,
  QuestionNavigator,
  SubmitDialog,
  TestTimer,
} from '@/components/practice/aptitude';
import { useAptitude } from '@/lib/hooks/use-aptitude';
import { useAptitudeStore } from '@/lib/store/aptitude-store';
import { aptitudeService } from '@/lib/api/services/aptitude.service';
import { toast } from 'sonner';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  SkipForward,
} from 'lucide-react';

export default function IndividualMockDriveAptitudePage() {
  const params = useParams();
  const router = useRouter();

  const mockDriveId = params.id as string;
  const attemptId = params.attemptId as string;
  const sessionId = params.sessionId as string;

  const attemptPath = `/practice/mockdrive/${mockDriveId}/attempt?attemptId=${attemptId}`;

  const {
    questions,
    currentQuestionIndex,
    selectedAnswers,
    expiresAt,
    timeLimit,
    sessionStatus,
    isLoading,
    isSubmitting,
    isSavingAnswer,
    resumeSession,
    saveAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    goToFirstUnanswered,
    getAnsweredCount,
    getUnansweredCount,
    getCurrentQuestion,
    canGoNext,
    canGoPrevious,
  } = useAptitude();

  const { updateTimeRemaining } = useAptitudeStore();
  const resetSession = useAptitudeStore((state) => state.resetSession);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      if (!sessionId) {
        router.push(attemptPath);
        return;
      }

      const storeSessionId = useAptitudeStore.getState().sessionId;
      const storeQuestions = useAptitudeStore.getState().questions;

      // Rehydrate from API when session differs OR store is missing questions
      // for the same session (can happen after reset/hydration race).
      if (storeSessionId !== sessionId || storeQuestions.length === 0) {
        try {
          const resumed = await resumeSession(sessionId, {
            navigate: false,
            showToast: false,
          });

          if (!resumed) {
            router.push(attemptPath);
            return;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load round session';
          setInitError(message);
          router.push(attemptPath);
          return;
        }
      }

      setIsInitialized(true);
    };

    initSession();
  }, [attemptPath, resumeSession, router, sessionId]);

  if (initError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <p className="mt-4 text-sm text-muted-foreground">{initError}</p>
          <Button variant="outline" className="mt-6" onClick={() => router.push(attemptPath)}>
            Back to Attempt
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!isInitialized || !sessionStatus) return;
    if (sessionStatus === 'completed' || sessionStatus === 'expired') {
      router.push(attemptPath);
    }
  }, [attemptPath, isInitialized, router, sessionStatus]);

  const submitCurrentSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await aptitudeService.submitSession(sessionId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to submit test');
      }

      resetSession();
      toast.success('Round submitted successfully');
      router.push(attemptPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit test';
      toast.error(message);
      throw error;
    }
  }, [attemptPath, resetSession, router, sessionId]);

  const handleTimeExpire = useCallback(async () => {
    if (isAutoSubmitting || isSubmitting) return;

    setIsAutoSubmitting(true);
    try {
      await submitCurrentSession();
    } finally {
      setIsAutoSubmitting(false);
    }
  }, [isAutoSubmitting, isSubmitting, submitCurrentSession]);

  const handleSubmit = useCallback(async () => {
    try {
      await submitCurrentSession();
      setShowSubmitDialog(false);
    } catch {
      // Toast already shown in submitCurrentSession.
    }
  }, [submitCurrentSession]);

  const handleTimeUpdate = useCallback(
    (seconds: number) => {
      updateTimeRemaining(seconds);
    },
    [updateTimeRemaining]
  );

  const handleSelectAnswer = useCallback(
    (optionId: string) => {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion) {
        saveAnswer(currentQuestion.id, optionId);
      }
    },
    [getCurrentQuestion, saveAnswer]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (canGoPrevious()) previousQuestion();
          break;
        case 'ArrowRight':
          if (canGoNext()) nextQuestion();
          break;
        case '1':
        case '2':
        case '3':
        case '4': {
          const question = getCurrentQuestion();
          if (!question) break;
          const optionIndex = Number.parseInt(e.key, 10) - 1;
          const option = question.options[optionIndex];
          if (option) {
            handleSelectAnswer(option.id);
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoNext, canGoPrevious, getCurrentQuestion, handleSelectAnswer, nextQuestion, previousQuestion]);

  if (!isInitialized || isLoading || questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading round questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const answeredCount = getAnsweredCount();
  const unansweredCount = getUnansweredCount();

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No questions found</p>
          <Button variant="outline" className="mt-6" onClick={() => router.push(attemptPath)}>
            Back to Attempt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-6 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">MockDrive Aptitude Round</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length} · {answeredCount} answered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TestTimer
            expiresAt={expiresAt}
            timeLimit={timeLimit}
            onExpire={handleTimeExpire}
            onTimeUpdate={handleTimeUpdate}
            showProgress
          />
          <Button
            variant="outline"
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitting || isAutoSubmitting}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline">Submit Round</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-3">
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswers[currentQuestion.id]}
            onSelectAnswer={handleSelectAnswer}
            isSaving={isSavingAnswer}
            disabled={isSubmitting || isAutoSubmitting}
          />

          <Card className="border-border">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={previousQuestion}
                  disabled={!canGoPrevious() || isSubmitting || isAutoSubmitting}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {unansweredCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={goToFirstUnanswered}
                    disabled={isSubmitting || isAutoSubmitting}
                    className="gap-2 text-muted-foreground"
                  >
                    <SkipForward className="h-4 w-4" />
                    <span className="hidden sm:inline">Skip to Unanswered ({unansweredCount})</span>
                    <span className="sm:hidden">{unansweredCount} left</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={nextQuestion}
                  disabled={!canGoNext() || isSubmitting || isAutoSubmitting}
                  className="gap-2"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-1">
          <Card className="sticky top-6 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionNavigator
                questions={questions}
                currentIndex={currentQuestionIndex}
                selectedAnswers={selectedAnswers}
                onNavigate={goToQuestion}
                disabled={isSubmitting || isAutoSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting || isAutoSubmitting}
      />
    </div>
  );
}

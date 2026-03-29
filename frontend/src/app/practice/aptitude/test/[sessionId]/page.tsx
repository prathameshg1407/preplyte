// src/app/practice/aptitude/test/[sessionId]/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import {
  QuestionDisplay,
  QuestionNavigator,
  TestTimer,
  SubmitDialog,
} from '../../../../../components/practice/aptitude';
import { useAptitude } from '../../../../../lib/hooks/use-aptitude';
import { useAptitudeStore } from '../../../../../lib/store/aptitude-store';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  SkipForward,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function AptitudeTestPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

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
    submitSession,
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

  const { timeRemaining, updateTimeRemaining } = useAptitudeStore();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      if (!sessionId) {
        router.push('/practice/aptitude');
        return;
      }

      const storeSessionId = useAptitudeStore.getState().sessionId;

      if (storeSessionId !== sessionId) {
        try {
          await resumeSession(sessionId, { navigate: false, showToast: false });
        } catch {
          router.push('/practice/aptitude');
          return;
        }
      }

      setIsInitialized(true);
    };

    initSession();
  }, [sessionId, router, resumeSession]);

  // Redirect if session is not active
  useEffect(() => {
    if (isInitialized && sessionStatus && sessionStatus !== 'in_progress') {
      if (sessionStatus === 'completed') {
        router.push(`/practice/aptitude/result/${sessionId}`);
      } else {
        router.push('/practice/aptitude');
      }
    }
  }, [isInitialized, sessionStatus, sessionId, router]);

  // Handle time expiration
  const handleTimeExpire = useCallback(async () => {
    if (isAutoSubmitting || isSubmitting) return;

    setIsAutoSubmitting(true);
    try {
      await submitSession();
    } catch {
      setIsAutoSubmitting(false);
    }
  }, [submitSession, isAutoSubmitting, isSubmitting]);

  // Handle time update
  const handleTimeUpdate = useCallback(
    (seconds: number) => {
      updateTimeRemaining(seconds);
    },
    [updateTimeRemaining]
  );

  // Handle answer selection
  const handleSelectAnswer = useCallback(
    (optionId: string) => {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion) {
        saveAnswer(currentQuestion.id, optionId);
      }
    },
    [getCurrentQuestion, saveAnswer]
  );

  // Handle manual submit
  const handleSubmit = async () => {
    try {
      await submitSession();
      setShowSubmitDialog(false);
    } catch {
      // Error handled in hook
    }
  };

  // Keyboard navigation
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
        case '4':
          const question = getCurrentQuestion();
          if (question) {
            const optionIndex = parseInt(e.key) - 1;
            const option = question.options[optionIndex];
            if (option) handleSelectAnswer(option.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoPrevious, canGoNext, previousQuestion, nextQuestion, getCurrentQuestion, handleSelectAnswer]);

  // Loading state
  if (!isInitialized || isLoading || questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading questions...</p>
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
          <Button variant="outline" className="mt-6" onClick={() => router.push('/practice/aptitude')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Aptitude Test</h1>
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
            <span className="hidden sm:inline">Submit</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Question Area */}
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

          {/* Navigation Controls */}
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
                    <span className="hidden sm:inline">
                      Skip to Unanswered ({unansweredCount})
                    </span>
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

              {/* Keyboard Shortcuts */}
              <div className="mt-4 hidden items-center justify-center gap-6 border-t border-border pt-4 text-xs text-muted-foreground md:flex">
                <span>
                  <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">←</kbd>
                  {' '}
                  <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">→</kbd>
                  {' '}Navigate
                </span>
                <span>
                  <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">1</kbd>
                  {'-'}
                  <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">4</kbd>
                  {' '}Select
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
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

          {/* Mobile Submit */}
          <Card className="border-border lg:hidden">
            <CardContent className="py-4">
              <Button
                className="w-full gap-2"
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting || isAutoSubmitting}
              >
                <Flag className="h-4 w-4" />
                Submit Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auto-submit overlay */}
      {isAutoSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="mx-4 max-w-sm border-border">
            <CardContent className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Time&apos;s Up!</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Your test is being submitted automatically...
              </p>
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submit Dialog */}
      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
        timeRemaining={timeRemaining}
      />
    </div>
  );
}
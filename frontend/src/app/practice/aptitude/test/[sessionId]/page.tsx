// src/app/practice/aptitude/test/[sessionId]/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  QuestionDisplay,
  QuestionNavigator,
  TestTimer,
  SubmitDialog,
} from '@/components/practice/aptitude';
import { useAptitude } from '@/lib/hooks/use-aptitude';
import { useAptitudeStore } from '@/lib/store/aptitude-store';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  SkipForward,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    progress,
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

      // Check if we already have this session loaded
      const storeSessionId = useAptitudeStore.getState().sessionId;

      if (storeSessionId !== sessionId) {
        try {
          await resumeSession(sessionId);
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
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (canGoPrevious()) {
            previousQuestion();
          }
          break;
        case 'ArrowRight':
          if (canGoNext()) {
            nextQuestion();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          const question = getCurrentQuestion();
          if (question) {
            const optionIndex = parseInt(e.key) - 1;
            const option = question.options[optionIndex];
            if (option) {
              handleSelectAnswer(option.id);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    canGoPrevious,
    canGoNext,
    previousQuestion,
    nextQuestion,
    getCurrentQuestion,
    handleSelectAnswer,
  ]);

  // Loading state
  if (!isInitialized || isLoading || questions.length === 0) {
    return (
      <div

        className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const answeredCount = getAnsweredCount();
  const unansweredCount = getUnansweredCount();

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">No questions found</p>
          <Button onClick={() => router.push('/practice/aptitude')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Aptitude Test</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Question {currentQuestionIndex + 1} of {questions.length} •{' '}
            {answeredCount} answered
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
            variant="destructive"
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitting || isAutoSubmitting}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline">Submit Test</span>
            <span className="sm:hidden">Submit</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area */}
        <div className="lg:col-span-3 space-y-4">
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
          <Card className="border-2">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
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
                  onClick={nextQuestion}
                  disabled={!canGoNext() || isSubmitting || isAutoSubmitting}
                  className="gap-2"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="hidden md:flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd>{' '}
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd>{' '}
                  Navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">1</kbd>
                  -
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">4</kbd>{' '}
                  Select Option
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Question Navigator */}
          <Card className="border-2 sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Question Navigator</CardTitle>
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

          {/* Quick Submit Card (Mobile Friendly) */}
          <Card className="border-2 lg:hidden">
            <CardContent className="py-4">
              <Button
                variant="destructive"
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="border-2 max-w-sm mx-4">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Time&apos;s Up!</h3>
              <p className="text-muted-foreground mb-4">
                Your test is being submitted automatically...
              </p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
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
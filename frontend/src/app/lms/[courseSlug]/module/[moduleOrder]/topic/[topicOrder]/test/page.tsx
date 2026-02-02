// src/app/lms/[courseSlug]/module/[moduleOrder]/test/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Flag,
  Send,
  Loader2,
} from 'lucide-react';
import {
  useModuleDetails,
  useStartModuleTest,
  useSubmitModuleTest,
} from '@/lib/hooks/lms/use-lms';
import { useLmsStore } from '@/lib/store/lms-store';
import type { LmsTestQuestion } from '@/types/lms.types';

export default function ModuleTestPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const moduleOrder = parseInt(params.moduleOrder as string);

  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<LmsTestQuestion[]>([]);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);

  const {
    testState,
    initTestState,
    setAnswer,
    setCurrentQuestion,
    updateTimeRemaining,
    clearTestState,
  } = useLmsStore();

  const { data: moduleData } = useModuleDetails(courseSlug, moduleOrder);
  const startTest = useStartModuleTest(courseSlug, moduleOrder);
  const submitTest = useSubmitModuleTest(courseSlug, moduleOrder);

  const moduleTest = moduleData?.moduleTest;

  // Timer effect
  useEffect(() => {
    if (!testStarted || !testState) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (testState.startTime || 0)) / 1000);
      const remaining = (moduleTest?.timeLimitMinutes || 30) * 60 - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);
        setShowTimeUpDialog(true);
        handleAutoSubmit();
      } else {
        updateTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [testStarted, testState?.startTime]);

  const handleStartTest = async () => {
    try {
      const response = await startTest.mutateAsync();
      setQuestions(response.questions);
      initTestState(
        response.attempt.id,
        response.questions.length,
        (moduleTest?.timeLimitMinutes || 30) * 60
      );
      setTestStarted(true);
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const handleAutoSubmit = async () => {
    await handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!testState) return;

    const answers = Object.entries(testState.answers).map(([questionId, optionId]) => ({
      questionId,
      selectedOptionId: optionId,
    }));

    try {
      const result = await submitTest.mutateAsync({ answers });
      clearTestState();
      router.push(
        `/lms/${courseSlug}/module/${moduleOrder}/test/result?passed=${result.passed}&score=${result.attempt.score}&points=${result.pointsEarned}`
      );
    } catch (error) {
      console.error('Failed to submit test:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[testState?.currentQuestionIndex || 0];
  const answeredCount = Object.keys(testState?.answers || {}).length;
  const isLastQuestion = (testState?.currentQuestionIndex || 0) === questions.length - 1;
  const isFirstQuestion = (testState?.currentQuestionIndex || 0) === 0;

  // Pre-test instructions view
  if (!testStarted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Module {moduleOrder} Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {moduleTest && (
                  <>
                    <div className="text-center text-muted-foreground">
                      {moduleTest.instructions || 'Complete this test to finish the module.'}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{moduleTest.totalQuestions}</div>
                        <div className="text-xs text-muted-foreground">Questions</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{moduleTest.timeLimitMinutes}</div>
                        <div className="text-xs text-muted-foreground">Minutes</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{moduleTest.passingScore}%</div>
                        <div className="text-xs text-muted-foreground">Passing Score</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{moduleTest.totalPoints}</div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-800 dark:text-yellow-200">
                            Important Instructions
                          </p>
                          <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                            <li>Once started, the timer cannot be paused</li>
                            <li>You can navigate between questions freely</li>
                            <li>Unanswered questions will be marked as incorrect</li>
                            <li>
                              You have {moduleTest.maxAttempts} attempt(s) for this test
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/lms/${courseSlug}/module/${moduleOrder}`)
                        }
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Module
                      </Button>
                      <Button
                        onClick={handleStartTest}
                        disabled={startTest.isPending}
                        size="lg"
                      >
                        {startTest.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>Start Test</>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Test in progress view
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold">Module {moduleOrder} Test</h1>
              <Badge variant="outline">
                {answeredCount} / {questions.length} answered
              </Badge>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                (testState?.timeRemaining || 0) < 300
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  : 'bg-muted'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold">
                {formatTime(testState?.timeRemaining || 0)}
              </span>
            </div>
          </div>

          {/* Progress */}
          <Progress
            value={((testState?.currentQuestionIndex || 0) + 1) / questions.length * 100}
            className="mt-2 h-1"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={testState?.currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge>Question {(testState?.currentQuestionIndex || 0) + 1}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {currentQuestion?.points} points
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Text */}
                    <div
                      className="text-lg"
                      dangerouslySetInnerHTML={{
                        __html: currentQuestion?.questionText || '',
                      }}
                    />

                    {/* Options */}
                    <RadioGroup
                      value={testState?.answers[currentQuestion?.id] || ''}
                      onValueChange={(value) =>
                        currentQuestion && setAnswer(currentQuestion.id, value)
                      }
                      className="space-y-3"
                    >
                      {currentQuestion?.options.map((option, index) => (
                        <div
                          key={option.id}
                          className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                            testState?.answers[currentQuestion.id] === option.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setAnswer(currentQuestion.id, option.id)}
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentQuestion((testState?.currentQuestionIndex || 0) - 1)
                        }
                        disabled={isFirstQuestion}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      {isLastQuestion ? (
                        <Button onClick={() => setShowSubmitDialog(true)}>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Test
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            setCurrentQuestion((testState?.currentQuestionIndex || 0) + 1)
                          }
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => {
                    const isAnswered = !!testState?.answers[q.id];
                    const isCurrent = testState?.currentQuestionIndex === index;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground'
                            : isAnswered
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-100 dark:bg-green-900" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <span>Unanswered ({questions.length - answeredCount})</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  variant="destructive"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Submit Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount < questions.length ? (
                <>
                  You have {questions.length - answeredCount} unanswered question(s).
                  Unanswered questions will be marked as incorrect.
                </>
              ) : (
                <>You have answered all questions. Are you ready to submit?</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitTest}
              disabled={submitTest.isPending}
            >
              {submitTest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Submit</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
      <AlertDialog open={showTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's Up!</AlertDialogTitle>
            <AlertDialogDescription>
              Your time has expired. Your test is being submitted automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
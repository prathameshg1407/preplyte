// src/app/lms/[courseSlug]/final-test/page.tsx

'use client';

import { useState, useEffect } from 'react';
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
  AlertTriangle,
  Send,
  Loader2,
  Trophy,
  Award,
} from 'lucide-react';
import {
  useCourseDetails,
  useStartFinalTest,
  useSubmitFinalTest,
} from '@/lib/hooks/lms/use-lms';
import { useLmsStore } from '@/lib/store/lms-store';
import type { LmsTestQuestion } from '@/types/lms.types';

export default function FinalTestPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;

  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<LmsTestQuestion[]>([]);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(true);

  const {
    testState,
    initTestState,
    setAnswer,
    setCurrentQuestion,
    updateTimeRemaining,
    clearTestState,
  } = useLmsStore();

  const { data: courseData } = useCourseDetails(courseSlug);
  const startTest = useStartFinalTest(courseSlug);
  const submitTest = useSubmitFinalTest(courseSlug);

  const finalTest = courseData?.finalTest;
  const enrollment = courseData?.enrollment;
  const allModulesCompleted = enrollment?.completedModules === courseData?.course.totalModules;

  // Check if already attempted
  if (enrollment?.finalTestAttempted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-8">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Test Already Attempted</h2>
            <p className="text-muted-foreground mb-4">
              You have already taken the final test for this course.
              {enrollment.finalTestPassed
                ? ` You passed with ${enrollment.finalTestScore}%!`
                : ' Unfortunately, you did not pass.'}
            </p>
            <Button asChild>
              <a href={`/lms/${courseSlug}`}>Back to Course</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if all modules completed
  if (!allModulesCompleted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-8">
            <AlertCircle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Modules Not Complete</h2>
            <p className="text-muted-foreground mb-4">
              You must complete all modules before taking the final test.
              <br />
              Progress: {enrollment?.completedModules || 0} / {courseData?.course.totalModules} modules
            </p>
            <Button asChild>
              <a href={`/lms/${courseSlug}`}>Continue Learning</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Timer effect (same as module test)
  useEffect(() => {
    if (!testStarted || !testState) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (testState.startTime || 0)) / 1000);
      const remaining = (finalTest?.timeLimitMinutes || 120) * 60 - elapsed;

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
        (finalTest?.timeLimitMinutes || 120) * 60
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
        `/lms/${courseSlug}/final-test/result?passed=${result.passed}&score=${result.attempt.score}&points=${result.pointsEarned}&marks=${result.attempt.marksObtained}&total=${result.attempt.totalMarks}`
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

  // Pre-test warning and instructions
  if (!testStarted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* One Attempt Warning Dialog */}
          <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Important: One Attempt Only!
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left space-y-2">
                  <p>
                    This is your <strong>FINAL TEST</strong> for this course. Please note:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You only have <strong>ONE ATTEMPT</strong> at this test</li>
                    <li>Once started, you cannot pause or restart the test</li>
                    <li>Your score will be final and cannot be changed</li>
                    <li>Passing this test is required for certification</li>
                  </ul>
                  <p className="font-medium pt-2">
                    Make sure you are ready before proceeding!
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => router.push(`/lms/${courseSlug}`)}>
                  Go Back
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => setShowWarningDialog(false)}>
                  I Understand
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Final Assessment</CardTitle>
                <p className="text-muted-foreground">
                  {courseData?.course.title}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {finalTest && (
                  <>
                    <div className="text-center text-muted-foreground">
                      {finalTest.instructions ||
                        'Complete this final assessment to earn your certificate.'}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{finalTest.totalQuestions}</div>
                        <div className="text-xs text-muted-foreground">Questions</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{finalTest.timeLimitMinutes}</div>
                        <div className="text-xs text-muted-foreground">Minutes</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{finalTest.passingScore}%</div>
                        <div className="text-xs text-muted-foreground">Passing Score</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{finalTest.totalPoints}</div>
                        <div className="text-xs text-muted-foreground">Points</div>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-red-800 dark:text-red-200">
                            Final Test - One Attempt Only
                          </p>
                          <ul className="list-disc list-inside text-red-700 dark:text-red-300 mt-2 space-y-1">
                            <li>This test can only be taken ONCE</li>
                            <li>You need {finalTest.passingScore}% to pass and get certified</li>
                            <li>Make sure you have reviewed all modules</li>
                            <li>Ensure you have a stable internet connection</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/lms/${courseSlug}`)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Review Course
                      </Button>
                      <Button
                        onClick={handleStartTest}
                        disabled={startTest.isPending}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-primary/80"
                      >
                        {startTest.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Award className="h-4 w-4 mr-2" />
                            Start Final Test
                          </>
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

  // Test in progress - same UI as module test but with different styling
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h1 className="font-semibold">Final Assessment</h1>
              <Badge variant="outline">
                {answeredCount} / {questions.length} answered
              </Badge>
            </div>
// src/app/lms/[courseSlug]/final-test/page.tsx (continued)

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                (testState?.timeRemaining || 0) < 600
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse'
                  : 'bg-muted'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold text-lg">
                {formatTime(testState?.timeRemaining || 0)}
              </span>
            </div>
          </div>

          {/* Progress */}
          <Progress
            value={((testState?.currentQuestionIndex || 0) + 1) / questions.length * 100}
            className="mt-2 h-1.5"
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
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        Question {(testState?.currentQuestionIndex || 0) + 1} of {questions.length}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {currentQuestion?.points} points
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Text */}
                    <div
                      className="text-lg leading-relaxed"
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
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            testState?.answers[currentQuestion.id] === option.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                          onClick={() => setAnswer(currentQuestion.id, option.id)}
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer text-base"
                          >
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-sm font-medium mr-3">
                              {String.fromCharCode(65 + index)}
                            </span>
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {/* Navigation */}
                    <div className="flex justify-between pt-6 border-t">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() =>
                          setCurrentQuestion((testState?.currentQuestionIndex || 0) - 1)
                        }
                        disabled={isFirstQuestion}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      {isLastQuestion ? (
                        <Button
                          size="lg"
                          onClick={() => setShowSubmitDialog(true)}
                          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Final Test
                        </Button>
                      ) : (
                        <Button
                          size="lg"
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

          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Question Navigator
                </CardTitle>
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
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
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

                <div className="mt-4 p-3 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-green-500" />
                      <span>Answered</span>
                    </div>
                    <span className="font-medium">{answeredCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-muted-foreground/30" />
                      <span>Unanswered</span>
                    </div>
                    <span className="font-medium">{questions.length - answeredCount}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Test
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  This is a one-time test. Submit only when ready.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Submit Final Test?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {answeredCount < questions.length ? (
                <p className="text-red-600 font-medium">
                  Warning: You have {questions.length - answeredCount} unanswered question(s).
                  Unanswered questions will be marked as incorrect.
                </p>
              ) : (
                <p>You have answered all {questions.length} questions.</p>
              )}
              <p className="font-medium">
                Remember: This is a ONE-TIME test. You cannot retake it after submission.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitTest}
              disabled={submitTest.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitTest.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Confirm Submit
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
      <AlertDialog open={showTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Clock className="h-5 w-5" />
              Time's Up!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your time has expired. Your test is being submitted automatically with your current answers.
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
            
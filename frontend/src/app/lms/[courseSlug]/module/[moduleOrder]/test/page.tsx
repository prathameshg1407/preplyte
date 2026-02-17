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
    BookOpen,
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
    const progress = moduleData?.progress;

    // Timer effect
    useEffect(() => {
        if (!testStarted || !testState) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - (testState.startTime || 0)) / 1000);
            const remaining = (moduleTest?.timeLimitMinutes || 15) * 60 - elapsed;

            if (remaining <= 0) {
                clearInterval(interval);
                setShowTimeUpDialog(true);
                handleAutoSubmit();
            } else {
                updateTimeRemaining(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [testStarted, testState?.startTime, moduleTest?.timeLimitMinutes]);

    // Check if previously passed
    if (progress?.testPassed) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <Card className="max-w-lg mx-auto">
                    <CardContent className="pt-8">
                        <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Module Test Passed!</h2>
                        <p className="text-muted-foreground mb-4">
                            You have already passed this module test with a score of {progress.testScore}%.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button asChild variant="outline">
                                <a href={`/lms/${courseSlug}/module/${moduleOrder}`}>Back to Module</a>
                            </Button>
                            <Button asChild>
                                <a href={`/lms/${courseSlug}/module/${moduleOrder + 1}`}>Next Module</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleStartTest = async () => {
        try {
            const response = await startTest.mutateAsync();
            setQuestions(response.questions);
            initTestState(
                response.attempt.id,
                response.questions.length,
                (moduleTest?.timeLimitMinutes || 15) * 60
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

            if (result.passed) {
                router.push(`/lms/${courseSlug}/module/${moduleOrder}`);
            } else {
                // Just reload to show result or failed state (simplified for now)
                router.refresh(); // Or redirect to a result summary
                setTestStarted(false);
            }
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

    // Loading state
    if (!moduleData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Pre-test instructions
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
                                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <BookOpen className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">Module Assessment</CardTitle>
                                <p className="text-muted-foreground">
                                    {moduleData.module.title}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {moduleTest ? (
                                    <>
                                        <div className="text-center text-muted-foreground">
                                            {moduleTest.instructions ||
                                                'Complete this test to verify your understanding of the module.'}
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

                                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-blue-800 dark:text-blue-200">
                                                        Test Guidelines
                                                    </p>
                                                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                                                        <li>You have {moduleTest.maxAttempts} attempts allowed</li>
                                                        <li>You need {moduleTest.passingScore}% to pass this module</li>
                                                        <li>Ensure you have reviewed the module content</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push(`/lms/${courseSlug}/module/${moduleOrder}`)}
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
                                                    <>
                                                        <Award className="h-4 w-4 mr-2" />
                                                        Start Test
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No test configured for this module.</p>
                                        <Button
                                            className="mt-4"
                                            onClick={() => router.push(`/lms/${courseSlug}/module/${moduleOrder}`)}
                                        >
                                            Back to Module
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Test in progress
    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Trophy className="h-5 w-5 text-primary" />
                            <h1 className="font-semibold hidden sm:block">{moduleData.module.title} Test</h1>
                            <Badge variant="outline">
                                {answeredCount} / {questions.length} answered
                            </Badge>
                        </div>

                        {/* Timer */}
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${(testState?.timeRemaining || 0) < 600
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
                                                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${testState?.answers[currentQuestion.id] === option.id
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
                                                    Submit Test
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
                                    Navigator
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
                                                className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${isCurrent
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
                                        <span className="text-muted-foreground">Answered</span>
                                        <span className="font-medium">{answeredCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Remaining</span>
                                        <span className="font-medium">{questions.length - answeredCount}</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-4"
                                    size="lg"
                                    onClick={() => setShowSubmitDialog(true)}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit
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
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Submit Module Test?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                {answeredCount < questions.length && (
                                    <div className="text-red-600 font-medium">
                                        Warning: You have {questions.length - answeredCount} unanswered question(s).
                                    </div>
                                )}
                                <div>
                                    Are you sure you want to submit? This counts as an attempt.
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Working</AlertDialogCancel>
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
                                'Confirm Submit'
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
                            Your time has expired. Submitting your answers...
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

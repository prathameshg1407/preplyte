// src/app/practice/mockdrive/[id]/attempt/[attemptId]/module/[moduleId]/machine/[sessionId]/page.tsx

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMachineConfigInit } from '@/lib/hooks/use-machine';
import { machineService } from '@/lib/api/services/machine.service';
import { useMachineStore, DEFAULT_CODE_TEMPLATES } from '@/lib/store/machine-store';
import { MonacoEditor } from '@/components/practice/machine/monaco-editor';
import { ProblemDescription } from '@/components/practice/machine/problem-description';
import { ExecutionPanel } from '@/components/practice/machine/execution-panel';
import { QuestionTabs } from '@/components/practice/machine/question-tabs';
import { TestTimer } from '@/components/practice/machine/test-timer';
import { SubmitDialog } from '@/components/practice/machine/submit-dialog';
import type { ActiveTab } from '@/types/machine.types';
import { Loader2, Flag, RotateCcw, Code2 } from 'lucide-react';
import { toast } from 'sonner';

export default function IndividualMockDriveMachinePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const mockDriveId = params.id as string;
  const attemptId = params.attemptId as string;
  const attemptPath = `/practice/mockdrive/${mockDriveId}/attempt?attemptId=${attemptId}`;

  const { hasHydrated } = useMachineConfigInit();

  const {
    difficulty,
    questions,
    currentQuestionIndex,
    currentQuestion,
    selectedLanguageId,
    languages,
    isRunning,
    isSubmitting,
    runResult,
    submitResult,
    submitResults,
    solvedQuestionIds,
    isLoading,
    activeTab,
    expiresAt,
    sessionId: storeSessionId,
  } = useMachineStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const setCode = useMachineStore((state) => state.setCode);
  const goToQuestion = useMachineStore((state) => state.goToQuestion);
  const setActiveTab = useMachineStore((state) => state.setActiveTab);
  const setSelectedLanguageId = useMachineStore((state) => state.setSelectedLanguageId);
  const getCodeForQuestion = useMachineStore((state) => state.getCodeForQuestion);
  const getSolvedCount = useMachineStore((state) => state.getSolvedCount);
  const getSelectedLanguageMonacoId = useMachineStore((state) => state.getSelectedLanguageMonacoId);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const currentQuestionData = questions[currentQuestionIndex];
  const currentCode = currentQuestionData ? getCodeForQuestion(currentQuestionData.id) : '';
  const monacoLanguage = getSelectedLanguageMonacoId();
  const attemptedCount = useMachineStore((state) => state.getAttemptedCount());

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();

    timerRef.current = setInterval(() => {
      const store = useMachineStore.getState();
      const { expiresAt: expiry, status, updateTimeRemaining, setSessionStatus } = store;

      if (!expiry || status === 'completed' || status === 'expired') {
        stopTimer();
        return;
      }

      const remainingSeconds = Math.max(0, Math.floor((new Date(expiry).getTime() - Date.now()) / 1000));
      updateTimeRemaining(remainingSeconds);

      if (remainingSeconds <= 0) {
        setSessionStatus('expired');
        stopTimer();
      }
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const fetchQuestion = useCallback(async (questionId: string) => {
    const store = useMachineStore.getState();
    const activeSessionId = store.sessionId;
    if (!activeSessionId) return null;

    try {
      store.setLoading(true);
      const response = await machineService.getQuestion(activeSessionId, questionId);
      if (response.success && response.data) {
        store.setCurrentQuestion(response.data.question);
        return response.data;
      }
      return null;
    } finally {
      store.setLoading(false);
    }
  }, []);

  const runCode = useCallback(async (questionId: string, customInput?: string) => {
    const store = useMachineStore.getState();
    const activeSessionId = store.sessionId;

    if (!activeSessionId) {
      toast.error('No active session');
      return null;
    }

    if (!store.canRunCode()) {
      toast.error('Cannot run code at this time');
      return null;
    }

    const code = store.codeState[questionId]?.code || '';
    if (!code.trim()) {
      toast.error('Please write some code first');
      return null;
    }

    try {
      store.setRunning(true);
      store.setRunResult(null);
      store.setError(null);

      const response = await machineService.runCode(activeSessionId, questionId, {
        code,
        languageId: store.selectedLanguageId,
        customInput,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to run code');
      }

      store.setRunResult(response.data);
      return response.data;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to run code');
      return null;
    } finally {
      store.setRunning(false);
    }
  }, []);

  const submitCode = useCallback(async (questionId: string) => {
    const store = useMachineStore.getState();
    const activeSessionId = store.sessionId;

    if (!activeSessionId) {
      toast.error('No active session');
      return null;
    }

    if (!store.canSubmitCode()) {
      toast.error('Cannot submit code at this time');
      return null;
    }

    const code = store.codeState[questionId]?.code || '';
    if (!code.trim()) {
      toast.error('Please write some code first');
      return null;
    }

    try {
      store.setSubmitting(true);
      store.setError(null);

      const response = await machineService.submitCode(activeSessionId, questionId, {
        code,
        languageId: store.selectedLanguageId,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to submit code');
      }

      store.addSubmitResult(questionId, response.data);
      return response.data;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit code');
      return null;
    } finally {
      store.setSubmitting(false);
    }
  }, []);

  const resumeMockDriveSession = useCallback(async (): Promise<boolean> => {
    const store = useMachineStore.getState();

    try {
      store.setLoading(true);
      store.setError(null);

      const sessionResponse = await machineService.getSession(sessionId);
      if (!sessionResponse.success || !sessionResponse.data) {
        throw new Error(sessionResponse.message || 'Failed to fetch session');
      }

      const session = sessionResponse.data;
      if (session.status === 'completed' || session.status === 'expired') {
        router.push(attemptPath);
        return false;
      }

      store.initSession({
        sessionId: session.id,
        difficulty: session.difficulty,
        status: session.status,
        numberOfQuestions: session.numberOfQuestions,
        timeLimit: session.timeLimit,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
      });

      const questionsResponse = await machineService.getSessionQuestions(sessionId);
      if (questionsResponse.success && questionsResponse.data) {
        store.setQuestions(questionsResponse.data.questions);
      }

      startTimer();
      return true;
    } finally {
      store.setLoading(false);
    }
  }, [attemptPath, router, sessionId, startTimer]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (initialized && storeSessionId === sessionId) return;

    const init = async () => {
      if (questions.length > 0 && storeSessionId === sessionId) {
        startTimer();
        setInitialized(true);
        return;
      }

      try {
        const success = await resumeMockDriveSession();
        if (!success) return;
        setInitialized(true);
      } catch (error: any) {
        setInitError(error?.message || 'Failed to load session');
        setTimeout(() => {
          router.push(attemptPath);
        }, 1500);
      }
    };

    init();
  }, [attemptPath, hasHydrated, initialized, questions.length, resumeMockDriveSession, router, sessionId, startTimer, storeSessionId]);

  useEffect(() => {
    if (initialized && currentQuestionData && !currentQuestion) {
      fetchQuestion(currentQuestionData.id);
    }
  }, [initialized, currentQuestionData?.id, currentQuestion, fetchQuestion]);

  const handleCodeChange = useCallback((value: string) => {
    if (currentQuestionData) {
      setCode(currentQuestionData.id, value);
    }
  }, [currentQuestionData, setCode]);

  const handleRun = useCallback((customInput?: string) => {
    if (currentQuestionData) {
      runCode(currentQuestionData.id, customInput);
    }
  }, [currentQuestionData, runCode]);

  const handleSubmitCode = useCallback(() => {
    if (currentQuestionData) {
      submitCode(currentQuestionData.id);
    }
  }, [currentQuestionData, submitCode]);

  const handleResetCode = useCallback(() => {
    if (currentQuestionData) {
      const defaultCode = DEFAULT_CODE_TEMPLATES[monacoLanguage] || '';
      setCode(currentQuestionData.id, defaultCode);
      toast.info('Code reset to template');
    }
  }, [currentQuestionData, monacoLanguage, setCode]);

  const handleCompleteSession = useCallback(async () => {
    if (isCompleting) return;

    setShowSubmitDialog(false);
    setIsCompleting(true);

    try {
      stopTimer();
      const response = await machineService.completeSession(sessionId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to complete session');
      }

      useMachineStore.getState().setSessionStatus('completed');
      toast.success('Round completed successfully');
      router.push(attemptPath);
    } catch (error: any) {
      startTimer();
      toast.error(error?.message || 'Failed to complete session');
    } finally {
      setIsCompleting(false);
    }
  }, [attemptPath, isCompleting, router, sessionId, startTimer, stopTimer]);

  const handleTimeExpire = useCallback(() => {
    toast.warning("Time's up! Completing your round...");
    handleCompleteSession();
  }, [handleCompleteSession]);

  const handleQuestionSelect = useCallback((index: number) => {
    goToQuestion(index);
  }, [goToQuestion]);

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
  }, [setActiveTab]);

  if (initError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-2 text-destructive">{initError}</p>
          <p className="text-sm text-muted-foreground">Redirecting to attempt...</p>
        </div>
      </div>
    );
  }

  if (!hasHydrated || !initialized || isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading round...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestionData) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-6 text-muted-foreground">No questions available</p>
          <Button onClick={() => router.push(attemptPath)}>Back to Attempt</Button>
        </div>
      </div>
    );
  }

  const sampleInput = currentQuestion?.sampleTestCases?.[0]?.input || '';

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-semibold leading-none">MockDrive Machine Round</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {getSolvedCount()}/{questions.length} solved • {difficulty}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TestTimer expiresAt={expiresAt} onExpire={handleTimeExpire} />

          <Select
            value={selectedLanguageId.toString()}
            onValueChange={(v) => setSelectedLanguageId(Number.parseInt(v, 10))}
          >
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages
                .filter((l) => l.isActive)
                .map((lang) => (
                  <SelectItem key={lang.id} value={lang.judge0Id.toString()}>
                    {lang.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setShowSubmitDialog(true)} disabled={isCompleting} size="sm" className="gap-2">
            {isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
            <span className="hidden sm:inline">Finish</span>
          </Button>
        </div>
      </header>

      <div className="shrink-0 border-b bg-muted/30">
        <QuestionTabs
          questions={questions}
          currentIndex={currentQuestionIndex}
          submitResults={submitResults}
          solvedQuestionIds={solvedQuestionIds}
          onSelect={handleQuestionSelect}
        />
      </div>

      <div className="min-h-0 flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="h-full overflow-hidden">
              {currentQuestion ? (
                <ProblemDescription question={currentQuestion} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60} minSize={35}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="flex h-full flex-col">
                  <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/50 px-3">
                    <span className="text-sm text-muted-foreground">
                      {languages.find((l) => l.judge0Id === selectedLanguageId)?.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleResetCode} className="h-7 gap-2 text-xs">
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </Button>
                  </div>

                  <div className="min-h-0 flex-1">
                    <MonacoEditor
                      value={currentCode}
                      onChange={handleCodeChange}
                      language={monacoLanguage}
                      height="100%"
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={40} minSize={20}>
                <ExecutionPanel
                  sampleInput={sampleInput}
                  onRun={handleRun}
                  onSubmit={handleSubmitCode}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  runResult={runResult}
                  submitResult={submitResults[currentQuestionData.id] || submitResult}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleCompleteSession}
        isSubmitting={isCompleting}
        totalQuestions={questions.length}
        solvedCount={getSolvedCount()}
        attemptedCount={attemptedCount}
      />
    </div>
  );
}

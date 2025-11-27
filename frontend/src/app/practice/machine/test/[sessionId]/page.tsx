// src/app/practice/machine/test/[sessionId]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../../../../components/ui/resizable";
import { Button } from "../../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { useMachine, useMachineConfigInit } from "../../../../../lib/hooks/use-machine";
import { useMachineStore, DEFAULT_CODE_TEMPLATES } from "../../../../../lib/store/machine-store";
import { MonacoEditor } from "../../../../../components/practice/machine/monaco-editor";
import { ProblemDescription } from "../../../../../components/practice/machine/problem-description";
import { ExecutionPanel } from "../../../../../components/practice/machine/execution-panel";
import { QuestionTabs } from "../../../../../components/practice/machine/question-tabs";
import { TestTimer } from "../../../../../components/practice/machine/test-timer";
import { SubmitDialog } from "../../../../../components/practice/machine/submit-dialog";
import type { ActiveTab } from "../../../../../types/machine.types";
import { Loader2, Flag, RotateCcw, Code2 } from "lucide-react";
import { toast } from "sonner";

export default function MachineTestPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

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

  const {
    resumeSession,
    fetchQuestion,
    setSelectedLanguageId,
    runCode,
    submitCode,
    completeSession,
    getSolvedCount,
    getAttemptedCount,
    getSelectedLanguageMonacoId,
    startTimer,
  } = useMachine();

  const setCode = useMachineStore((state) => state.setCode);
  const goToQuestion = useMachineStore((state) => state.goToQuestion);
  const setActiveTab = useMachineStore((state) => state.setActiveTab);
  const getCodeForQuestion = useMachineStore((state) => state.getCodeForQuestion);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const currentQuestionData = questions[currentQuestionIndex];
  const currentCode = currentQuestionData
    ? getCodeForQuestion(currentQuestionData.id)
    : "";
  const monacoLanguage = getSelectedLanguageMonacoId();

  // Initialize session
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
        const success = await resumeSession(sessionId);
        if (!success) return;
        setInitialized(true);
      } catch (error: any) {
        console.error("Failed to resume session:", error);
        setInitError(error.message || "Failed to load session");
        setTimeout(() => {
          router.push("/practice/machine");
        }, 2000);
      }
    };

    init();
  }, [hasHydrated, sessionId, storeSessionId, questions.length, initialized, resumeSession, startTimer, router]);

  // Fetch question detail
  useEffect(() => {
    if (initialized && currentQuestionData && !currentQuestion) {
      fetchQuestion(currentQuestionData.id);
    }
  }, [initialized, currentQuestionData?.id, currentQuestion, fetchQuestion]);

  const handleCodeChange = useCallback(
    (value: string) => {
      if (currentQuestionData) {
        setCode(currentQuestionData.id, value);
      }
    },
    [currentQuestionData, setCode]
  );

  const handleRun = useCallback(
    (customInput?: string) => {
      if (currentQuestionData) {
        runCode(currentQuestionData.id, customInput);
      }
    },
    [currentQuestionData, runCode]
  );

  const handleSubmitCode = useCallback(() => {
    if (currentQuestionData) {
      submitCode(currentQuestionData.id);
    }
  }, [currentQuestionData, submitCode]);

  const handleResetCode = useCallback(() => {
    if (currentQuestionData) {
      const defaultCode = DEFAULT_CODE_TEMPLATES[monacoLanguage] || "";
      setCode(currentQuestionData.id, defaultCode);
      toast.info("Code reset to template");
    }
  }, [currentQuestionData, monacoLanguage, setCode]);

  const handleCompleteSession = useCallback(async () => {
    setShowSubmitDialog(false);
    setIsCompleting(true);
    try {
      await completeSession();
    } finally {
      setIsCompleting(false);
    }
  }, [completeSession]);

  const handleTimeExpire = useCallback(() => {
    toast.warning("Time's up! Completing your session...");
    completeSession();
  }, [completeSession]);

  const handleQuestionSelect = useCallback(
    (index: number) => {
      goToQuestion(index);
    },
    [goToQuestion]
  );

  const handleTabChange = useCallback(
    (tab: ActiveTab) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  // Error state
  if (initError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-sm text-muted-foreground">{initError}</p>
          <p className="text-xs text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!hasHydrated || !initialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  // No questions state
  if (!currentQuestionData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">No questions available</p>
          <Button variant="outline" onClick={() => router.push("/practice/machine")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const sampleInput = currentQuestion?.sampleTestCases?.[0]?.input || "";

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Machine Coding</h1>
              <p className="text-xs text-muted-foreground">
                {getSolvedCount()}/{questions.length} solved · {difficulty}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TestTimer expiresAt={expiresAt} onExpire={handleTimeExpire} />

          {/* Language Selector - Desktop */}
          <div className="hidden items-center gap-2 md:flex">
            <Select
              value={selectedLanguageId.toString()}
              onValueChange={(v) => setSelectedLanguageId(parseInt(v))}
            >
              <SelectTrigger className="h-9 w-[140px]">
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
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSubmitDialog(true)}
            disabled={isCompleting}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline">Complete</span>
          </Button>
        </div>
      </header>

      {/* Question Tabs */}
      <QuestionTabs
        questions={questions}
        currentIndex={currentQuestionIndex}
        submitResults={submitResults}
        solvedQuestionIds={solvedQuestionIds}
        onSelect={handleQuestionSelect}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Problem Description */}
          <ResizablePanel defaultSize={35} minSize={25}>
            {currentQuestion ? (
              <ProblemDescription question={currentQuestion} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Code Editor & Execution */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="flex h-full flex-col">
                  {/* Editor Toolbar */}
                  <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
                    {/* Language Selector - Mobile */}
                    <div className="flex items-center gap-2 md:hidden">
                      <Select
                        value={selectedLanguageId.toString()}
                        onValueChange={(v) => setSelectedLanguageId(parseInt(v))}
                      >
                        <SelectTrigger className="h-8 w-[120px]">
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
                    </div>
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={handleResetCode} className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden sm:inline">Reset</span>
                    </Button>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1">
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

              {/* Execution Panel */}
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

      {/* Submit Dialog */}
      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        totalQuestions={questions.length}
        solvedCount={getSolvedCount()}
        attemptedCount={getAttemptedCount()}
        onConfirm={handleCompleteSession}
        isSubmitting={isCompleting}
      />
    </div>
  );
}
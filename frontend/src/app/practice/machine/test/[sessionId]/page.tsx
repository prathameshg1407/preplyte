// src/app/practice/machine/test/[sessionId]/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMachine, useMachineConfigInit } from "@/lib/hooks/use-machine";
import { useMachineStore, DEFAULT_CODE_TEMPLATES } from "@/lib/store/machine-store";
import { MonacoEditor } from "@/components/practice/machine/monaco-editor";
import { ProblemDescription } from "@/components/practice/machine/problem-description";
import { ExecutionPanel } from "@/components/practice/machine/execution-panel";
import { QuestionTabs } from "@/components/practice/machine/question-tabs";
import { TestTimer } from "@/components/practice/machine/test-timer";
import { SubmitDialog } from "@/components/practice/machine/submit-dialog";
import type { DifficultyLevel, ActiveTab } from "@/types/machine.types";
import { Loader2, Send, RotateCcw } from "lucide-react";
import { toast } from "sonner";

// Difficulty colors mapping
const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  EASY: "text-green-500 border-green-500/30 bg-green-500/10",
  MEDIUM: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  HARD: "text-red-500 border-red-500/30 bg-red-500/10",
};

export default function MachineTestPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // Use config init hook for proper initialization
  const { isReady: configReady, hasHydrated } = useMachineConfigInit();

  // Get state from store - using correct property names
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
    solvedQuestionIds, // Changed from solvedQuestions
    isLoading,
    activeTab,
    expiresAt,
    sessionId: storeSessionId,
  } = useMachineStore();

  // Get actions from hook
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

  // Get store actions directly
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
    // Wait for hydration
    if (!hasHydrated) {
      return;
    }

    // If already initialized for this session, skip
    if (initialized && storeSessionId === sessionId) {
      return;
    }

    const init = async () => {
      // Check if we need to resume or if session is already loaded
      if (questions.length > 0 && storeSessionId === sessionId) {
        // Session already in store, just start timer
        startTimer();
        setInitialized(true);
        return;
      }

      // Need to resume session
      try {
        const success = await resumeSession(sessionId);
        if (!success) {
          // resumeSession handles redirect for completed/expired sessions
          return;
        }
        setInitialized(true);
      } catch (error: any) {
        console.error("Failed to resume session:", error);
        setInitError(error.message || "Failed to load session");
        // Redirect after short delay
        setTimeout(() => {
          router.push("/practice/machine");
        }, 2000);
      }
    };

    init();
  }, [
    hasHydrated,
    sessionId,
    storeSessionId,
    questions.length,
    initialized,
    resumeSession,
    startTimer,
    router,
  ]);

  // Fetch question detail when question changes
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

  // Show error state
  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{initError}</p>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!hasHydrated || !initialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No questions available</p>
          <Button onClick={() => router.push("/practice/machine")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const sampleInput = currentQuestion?.sampleTestCases?.[0]?.input || "";

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg">Machine Coding</h1>
          <Badge variant="outline" className={DIFFICULTY_COLORS[difficulty]}>
            {difficulty}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {getSolvedCount()}/{questions.length} solved
          </span>
        </div>

        <div className="flex items-center gap-4">
          <TestTimer expiresAt={expiresAt} onExpire={handleTimeExpire} />

          <div className="hidden md:flex items-center gap-2">
            <Select
              value={selectedLanguageId.toString()}
              onValueChange={(v) => setSelectedLanguageId(parseInt(v))}
            >
              <SelectTrigger className="w-[150px]">
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
            variant="destructive"
            size="sm"
            onClick={() => setShowSubmitDialog(true)}
            disabled={isCompleting}
          >
            <Send className="h-4 w-4 mr-2" />
            Complete
          </Button>
        </div>
      </header>

      {/* Question Tabs */}
      <QuestionTabs
        questions={questions}
        currentIndex={currentQuestionIndex}
        submitResults={submitResults}
        solvedQuestionIds={solvedQuestionIds} // Changed from solvedQuestions
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
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Code Editor & Execution */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="h-full flex flex-col">
                  {/* Editor Toolbar */}
                  <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                    <div className="flex items-center gap-2 md:hidden">
                      <Select
                        value={selectedLanguageId.toString()}
                        onValueChange={(v) => setSelectedLanguageId(parseInt(v))}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages
                            .filter((l) => l.isActive)
                            .map((lang) => (
                              <SelectItem
                                key={lang.id}
                                value={lang.judge0Id.toString()}
                              >
                                {lang.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={handleResetCode}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
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
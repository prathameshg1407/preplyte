// src/components/mock-drive/attempt/modules/machine-module.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Flag, RotateCcw, Code2 } from "lucide-react";
import { toast } from "sonner";

// Import duplicated store and components from mock-drive/attempt
import { useMockMachineStore, DEFAULT_CODE_TEMPLATES } from "../machine/mock-machine-store";
import { MonacoEditor } from "../machine/monaco-editor";
import { ProblemDescription } from "../machine/problem-description";
import { ExecutionPanel } from "../machine/execution-panel";
import { QuestionTabs } from "../machine/question-tabs";
import { SubmitDialog } from "../machine/submit-dialog";

// Import Mock Drive types and hooks
import {
  MachineModuleData,
  ModuleAttemptState,
  CurrentModuleState
} from "@/types/mockdrive.types";
import {
  useMachineRun,
  useMachineSubmit
} from "@/lib/hooks/mock-drive/use-attempt";
import type { ActiveTab } from "@/types/machine.types";

interface MachineModuleProps {
  module: CurrentModuleState; // Was ModuleAttemptState
  data: MachineModuleData;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function MachineModule({
  module,
  data,
  isSubmitting: isGlobalSubmitting,
  onSubmit
}: MachineModuleProps) {
  const params = useParams();
  const driveId = params.driveId as string;
  const moduleId = module.moduleId;

  // Mock Machine Store state
  const {
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
    activeTab,
  } = useMockMachineStore();

  const store = useMockMachineStore();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Mutations
  const { mutateAsync: runCodeMutation } = useMachineRun();
  const { mutateAsync: submitCodeMutation } = useMachineSubmit();

  // Initialization map
  useEffect(() => {
    if (initialized) return;

    // Hardcode a list of languages since useLanguages isn't exported from the original practice hooks in this file.
    const allLanguages = [
      { id: "1", judge0Id: 54, monacoId: 'cpp', name: 'C++ (GCC 11)', version: '11.4.0', isActive: true },
      { id: "2", judge0Id: 91, monacoId: 'java', name: 'Java (OpenJDK 17)', version: '17.0.0', isActive: true },
      { id: "3", judge0Id: 92, monacoId: 'python', name: 'Python (3.11)', version: '3.11.0', isActive: true },
      { id: "4", judge0Id: 93, monacoId: 'javascript', name: 'JavaScript (Node.js 18)', version: '18.15.0', isActive: true },
    ];

    store.setLanguages(allLanguages);

    // Filter allowed languages if specified in module config
    const allowed = (module.config as any)?.allowedLanguages || [];
    if (allowed.length > 0) {
      const filtered = allLanguages.filter((l: any) =>
        allowed.includes(l.judge0Id.toString()) || allowed.includes(l.monacoId)
      );
      if (filtered.length > 0) {
        store.setLanguages(filtered);
        // Default to first allowed language if current is not in allowed
        if (!filtered.some((l: any) => l.judge0Id === store.selectedLanguageId)) {
          store.setSelectedLanguageId(filtered[0].judge0Id);
        }
      }
    }

    // Map MachineModuleData to store's questions format
    // Store expects QuestionListItem
    const storeQuestions = data.questions.map(q => ({
      id: q.questionId,
      sessionQuestionId: q.questionId,
      order: q.displayOrder,
      title: q.title,
      difficulty: 'MEDIUM' as any, // Mock data
      tags: [],
      isSolved: q.isSolved,
      submissionCount: q.submissions?.length || 0,
      bestSubmission: q.bestSubmissionId ? {
        status: 'ACCEPTED' as any,
        testCasesPassed: 1,
        testCasesTotal: 1,
        submittedAt: new Date().toISOString()
      } : null
    }));

    store.initSession({
      sessionId: module.moduleAttemptId,
      difficulty: 'MEDIUM',
      status: 'in_progress',
      numberOfQuestions: data.questions.length,
      timeLimit: module.timeLimit,
      startedAt: module.startedAt || new Date().toISOString(),
      expiresAt: module.expiresAt || new Date().toISOString()
    });

    store.setQuestions(storeQuestions);

    // set first question as current detail
    if (data.questions.length > 0) {
      const firstQ = data.questions[0];
      store.setCurrentQuestion({
        id: firstQ.questionId,
        title: firstQ.title,
        description: firstQ.description,
        difficulty: 'MEDIUM',
        inputFormat: null,
        outputFormat: null,
        constraints: null,
        tags: [],
        sampleTestCases: firstQ.testCases.map((tc, idx) => ({
          id: String(idx),
          input: tc.input,
          expectedOutput: tc.expectedOutput
        })),
        totalTestCases: firstQ.testCases.length
      });
      // Set existing code if any (from default or previous save)
      if (firstQ.defaultCode) {
        store.setCode(firstQ.questionId, firstQ.defaultCode);
      }
    }

    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, module, initialized]);

  // Fetch question detail when tab changes
  useEffect(() => {
    if (!initialized) return;
    const qData = data.questions[currentQuestionIndex];
    if (qData && (!currentQuestion || currentQuestion.id !== qData.questionId)) {
      store.setCurrentQuestion({
        id: qData.questionId,
        title: qData.title,
        description: qData.description,
        difficulty: 'MEDIUM',
        inputFormat: null,
        outputFormat: null,
        constraints: null,
        tags: [],
        sampleTestCases: qData.testCases.map((tc, idx) => ({
          id: String(idx),
          input: tc.input,
          expectedOutput: tc.expectedOutput
        })),
        totalTestCases: qData.testCases.length
      });
    }
  }, [currentQuestionIndex, initialized, data.questions, currentQuestion, store]);

  const currentQuestionData = questions[currentQuestionIndex];
  const currentCode = currentQuestionData
    ? store.getCodeForQuestion(currentQuestionData.id)
    : "";
  const monacoLanguage = store.getSelectedLanguageMonacoId();

  const handleCodeChange = useCallback((value: string) => {
    if (currentQuestionData) {
      store.setCode(currentQuestionData.id, value);
    }
  }, [currentQuestionData, store]);

  const handleRun = useCallback(async (customInput?: string) => {
    if (!currentQuestionData) return;
    store.setRunning(true);
    try {
      const res = await runCodeMutation({
        driveId,
        moduleId,
        payload: {
          questionId: currentQuestionData.id,
          code: currentCode,
          languageId: selectedLanguageId,
          customInput
        }
      });
      if (res.updatedData) {
        const d = res.updatedData as MachineModuleData;
        if (d._runResult) {
          store.setRunResult(d._runResult as any);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      store.setRunning(false);
    }
  }, [currentQuestionData, currentCode, selectedLanguageId, driveId, moduleId, runCodeMutation, store]);

  const handleSubmitCode = useCallback(async () => {
    if (!currentQuestionData) return;
    store.setSubmitting(true);
    try {
      const res = await submitCodeMutation({
        driveId,
        moduleId,
        payload: {
          questionId: currentQuestionData.id,
          code: currentCode,
          languageId: selectedLanguageId
        }
      });
      if (res.updatedData) {
        const _qData = (res.updatedData as MachineModuleData).questions.find(q => q.questionId === currentQuestionData.id);
        if (_qData && _qData.submissions.length > 0) {
          // grab the latest submission and shape it to the expected mock format
          const latestSub = _qData.submissions[0];
          const resultShape = {
            status: latestSub.status,
            testCasesPassed: latestSub.testCasesPassed,
            testCasesTotal: latestSub.testCasesTotal,
            testCaseResults: latestSub.testCaseResults,
            executionTime: latestSub.executionTime,
            memoryUsed: latestSub.memoryUsed,
            compileError: latestSub.compileError,
          };
          store.addSubmitResult(currentQuestionData.id, resultShape as any);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      store.setSubmitting(false);
    }
  }, [currentQuestionData, currentCode, selectedLanguageId, driveId, moduleId, submitCodeMutation, store]);

  const handleResetCode = useCallback(() => {
    if (currentQuestionData) {
      const defaultCode = DEFAULT_CODE_TEMPLATES[monacoLanguage] || "";
      store.setCode(currentQuestionData.id, defaultCode);
      toast.info("Code reset to default");
    }
  }, [currentQuestionData, monacoLanguage, store]);

  const handleQuestionSelect = useCallback((index: number) => {
    store.goToQuestion(index);
  }, [store]);

  const handleTabChange = useCallback((tab: ActiveTab) => {
    store.setActiveTab(tab);
  }, [store]);

  if (!initialized) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center bg-background border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sampleInput = currentQuestion?.sampleTestCases?.[0]?.input || "";

  return (
    <div className="flex h-[800px] w-full flex-col overflow-hidden bg-background border rounded-lg shadow-sm">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold leading-none">Machine Coding</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {store.getSolvedCount()} / {questions.length} solved
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Select
            value={selectedLanguageId.toString()}
            onValueChange={(v) => store.setSelectedLanguageId(parseInt(v))}
          >
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {store.languages
                .filter((l: any) => l.isActive)
                .map((lang: any) => (
                  <SelectItem key={lang.id} value={lang.judge0Id.toString()}>
                    {lang.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowSubmitDialog(true)}
            disabled={isGlobalSubmitting}
            size="sm"
            className="gap-2"
          >
            {isGlobalSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Flag className="h-4 w-4" />
            )}
            Finish Module
          </Button>
        </div>
      </header>

      {/* Question Tabs */}
      <div className="shrink-0 border-b bg-muted/30">
        <QuestionTabs
          questions={questions}
          currentIndex={currentQuestionIndex}
          submitResults={submitResults}
          solvedQuestionIds={solvedQuestionIds}
          onSelect={handleQuestionSelect}
        />
      </div>

      {/* Main Content */}
      <div className="min-h-0 flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Problem Description */}
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

          {/* Code Editor & Execution */}
          <ResizablePanel defaultSize={60} minSize={35}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Editor */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="flex h-full flex-col">
                  {/* Editor Toolbar */}
                  <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/50 px-3">
                    <span className="text-sm text-muted-foreground">
                      {languages.find((l: any) => l.judge0Id === selectedLanguageId)?.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetCode}
                      className="h-7 gap-2 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </Button>
                  </div>

                  {/* Monaco Editor */}
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

              {/* Execution Panel */}
              <ResizablePanel defaultSize={40} minSize={20}>
                {currentQuestionData && (
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
                )}
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
        solvedCount={store.getSolvedCount()}
        attemptedCount={store.getAttemptedCount()}
        onConfirm={() => {
          setShowSubmitDialog(false);
          onSubmit();
        }}
        isSubmitting={isGlobalSubmitting}
      />
    </div>
  );
}
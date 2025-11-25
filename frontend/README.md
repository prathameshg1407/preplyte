// src/components/practice/machine/execution-panel.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  RunCodeResponse,
  SubmitCodeResponse,
  TestCaseResult,
} from "@/types/machine.types";
import {
  Play,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Terminal,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionPanelProps {
  sampleInput: string;
  onRun: (customInput?: string) => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  runResult: RunCodeResponse | null;
  submitResult: SubmitCodeResponse | null;
  activeTab: "description" | "submissions" | "output";
  onTabChange: (tab: "description" | "submissions" | "output") => void;
}

export function ExecutionPanel({
  sampleInput,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  runResult,
  submitResult,
  activeTab,
  onTabChange,
}: ExecutionPanelProps) {
  const [customInput, setCustomInput] = useState(sampleInput);

  const handleRunWithSamples = () => {
    onRun();
  };

  const handleRunWithCustomInput = () => {
    onRun(customInput);
  };

  const handleSubmit = () => {
    onSubmit();
  };

  // Get execution stats from run result
  const getExecutionStats = () => {
    if (!runResult) return null;

    if (runResult.executionType === "custom_input") {
      return {
        time: runResult.result.executionTime,
        memory: runResult.result.memoryUsed,
      };
    }

    if (runResult.executionType === "sample_test_cases") {
      return {
        time: runResult.summary.averageExecutionTime,
        memory: runResult.summary.maxMemoryUsed,
      };
    }

    return null;
  };

  const stats = getExecutionStats();

  return (
    <div className="flex flex-col h-full border-t">
      {/* Actions Bar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunWithSamples}
            disabled={isRunning || isSubmitting}
          >
            {isRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit
          </Button>
        </div>

        {stats && (
          <div className="flex gap-3 text-xs text-muted-foreground">
            {stats.time !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stats.time.toFixed(2)}ms
              </span>
            )}
            {stats.memory !== undefined && (
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {(stats.memory / 1024).toFixed(1)}MB
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as any)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
          <TabsTrigger
            value="input"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
          >
            <Terminal className="h-4 w-4 mr-2" />
            Custom Input
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
          >
            Output
            {runResult && (
              <Badge
                variant={
                  runResult.compilationStatus === "COMPILATION_ERROR"
                    ? "destructive"
                    : runResult.executionType === "sample_test_cases" &&
                      runResult.summary.failed === 0
                    ? "default"
                    : "secondary"
                }
                className="ml-2 h-5"
              >
                {runResult.compilationStatus === "COMPILATION_ERROR"
                  ? "CE"
                  : runResult.executionType === "sample_test_cases"
                  ? `${runResult.summary.passed}/${runResult.summary.totalTestCases}`
                  : "✓"}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2"
          >
            Result
            {submitResult && (
              <Badge
                variant={submitResult.isSolved ? "default" : "destructive"}
                className="ml-2 h-5"
              >
                {submitResult.testCasesPassed}/{submitResult.testCasesTotal}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Custom Input Tab */}
        <TabsContent value="input" className="flex-1 m-0 p-0">
          <div className="p-3 h-full flex flex-col">
            <div className="text-xs text-muted-foreground mb-2">
              Custom Input (stdin)
            </div>
            <Textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter your test input..."
              className="font-mono text-sm flex-1 resize-none min-h-[100px]"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2 self-start"
              onClick={handleRunWithCustomInput}
              disabled={isRunning || isSubmitting}
            >
              {isRunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run with Custom Input
            </Button>
          </div>
        </TabsContent>

        {/* Output Tab */}
        <TabsContent value="output" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              {!runResult ? (
                <div className="text-center text-muted-foreground py-8">
                  Run your code to see output
                </div>
              ) : (
                <RunResultDisplay result={runResult} />
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Submission Result Tab */}
        <TabsContent value="submissions" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              {!submitResult ? (
                <div className="text-center text-muted-foreground py-8">
                  Submit your code to see results
                </div>
              ) : (
                <SubmitResultDisplay result={submitResult} />
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Run Result Display Component
function RunResultDisplay({ result }: { result: RunCodeResponse }) {
  // Compilation Error
  if (result.compilationStatus === "COMPILATION_ERROR") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-500">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Compilation Error</span>
        </div>
        {result.compileOutput && (
          <pre className="p-3 bg-red-500/10 rounded font-mono text-sm text-red-500 whitespace-pre-wrap overflow-x-auto">
            {result.compileOutput}
          </pre>
        )}
      </div>
    );
  }

  // Custom Input Result
  if (result.executionType === "custom_input") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="font-medium">Execution Complete</span>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Output:</div>
          <pre className="p-3 bg-muted rounded font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {result.result.output || "(no output)"}
          </pre>
        </div>
      </div>
    );
  }

  // Sample Test Cases Result
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4">
        {result.summary.failed === 0 ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <XCircle className="h-6 w-6 text-red-500" />
        )}
        <div>
          <div className="font-medium">
            {result.summary.passed} / {result.summary.totalTestCases} Passed
          </div>
          <div className="text-xs text-muted-foreground">
            Sample test cases
          </div>
        </div>
      </div>

      {/* Individual Results */}
      <div className="space-y-2">
        {result.results.map((tc, index) => (
          <TestCaseResultItem key={index} result={tc} index={index} />
        ))}
      </div>
    </div>
  );
}

// Test Case Result Item
function TestCaseResultItem({
  result,
  index,
}: {
  result: TestCaseResult;
  index: number;
}) {
  const isPassed = result.status === "PASSED";

  return (
    <div
      className={cn(
        "p-3 rounded-lg border",
        isPassed
          ? "bg-green-500/5 border-green-500/20"
          : "bg-red-500/5 border-red-500/20"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">Test Case {index + 1}</span>
        <Badge variant={isPassed ? "default" : "destructive"} className="text-xs">
          {result.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Expected:</div>
          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">
            {result.expectedOutput}
          </pre>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Your Output:</div>
          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">
            {result.actualOutput || "(no output)"}
          </pre>
        </div>
      </div>

      {result.stderr && (
        <div className="mt-2">
          <div className="text-xs text-red-500 mb-1">Error:</div>
          <pre className="p-2 bg-red-500/10 rounded text-xs text-red-500 overflow-x-auto">
            {result.stderr}
          </pre>
        </div>
      )}

      {result.executionTime !== null && (
        <div className="mt-2 text-xs text-muted-foreground">
          Time: {result.executionTime.toFixed(2)}ms | Memory:{" "}
          {result.memoryUsed ? (result.memoryUsed / 1024).toFixed(1) : 0}MB
        </div>
      )}
    </div>
  );
}

// Submit Result Display Component
function SubmitResultDisplay({ result }: { result: SubmitCodeResponse }) {
  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div
        className={cn(
          "p-4 rounded-lg flex items-center gap-4",
          result.isSolved ? "bg-green-500/10" : "bg-red-500/10"
        )}
      >
        {result.isSolved ? (
          <CheckCircle className="h-8 w-8 text-green-500" />
        ) : (
          <XCircle className="h-8 w-8 text-red-500" />
        )}
        <div>
          <div
            className={cn(
              "text-lg font-bold",
              result.isSolved ? "text-green-500" : "text-red-500"
            )}
          >
            {result.status.replace("_", " ")}
          </div>
          <div className="text-sm text-muted-foreground">{result.message}</div>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <span>Test Cases</span>
        <span className="font-bold">
          {result.testCasesPassed} / {result.testCasesTotal}
        </span>
      </div>

      {/* Execution Stats */}
      {(result.executionTime !== null || result.memoryUsed !== null) && (
        <div className="flex gap-4 text-sm">
          {result.executionTime !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {result.executionTime.toFixed(2)}ms
            </div>
          )}
          {result.memoryUsed !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Cpu className="h-4 w-4" />
              {(result.memoryUsed / 1024).toFixed(1)}MB
            </div>
          )}
        </div>
      )}

      {/* Failed Test Case Info */}
      {result.failedTestCase && (
        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium text-sm">
              {result.failedTestCase.message}
            </span>
          </div>

          {result.failedTestCase.input !== "[Hidden]" && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Expected:
                </div>
                <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                  {result.failedTestCase.expectedOutput}
                </pre>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Your Output:
                </div>
                <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                  {result.failedTestCase.actualOutput || "(no output)"}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}// src/components/practice/machine/monaco-editor.tsx

"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

export function MonacoEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = "100%",
  className,
}: MonacoEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;

    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontLigatures: true,
      lineNumbers: "on",
      renderLineHighlight: "all",
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: "on",
      folding: true,
      bracketPairColorization: { enabled: true },
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
    });

    editor.focus();
  }, []);

  const handleChange: OnChange = useCallback(
    (newValue) => {
      onChange(newValue || "");
    },
    [onChange]
  );

  return (
    <div className={className} style={{ height }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        loading={
          <div className="flex items-center justify-center h-full bg-muted/30">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading editor...</span>
          </div>
        }
        options={{
          readOnly,
          domReadOnly: readOnly,
        }}
      />
    </div>
  );
}// src/components/practice/machine/problem-description.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QuestionDetail } from "@/types/machine.types";
import { DIFFICULTY_COLORS } from "@/types/machine.types";
import { FileInput, FileOutput, AlertCircle, TestTube } from "lucide-react";

interface ProblemDescriptionProps {
  question: QuestionDetail;
}

export function ProblemDescription({ question }: ProblemDescriptionProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold mb-2">{question.title}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={DIFFICULTY_COLORS[question.difficulty]}
            >
              {question.difficulty}
            </Badge>
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Description */}
        {question.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: question.description }}
            />
          </div>
        )}

        {/* Input Format */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <FileInput className="h-4 w-4" />
            Input Format
          </h3>
          <Card>
            <CardContent className="p-3 text-sm font-mono bg-muted/30 whitespace-pre-wrap">
              {question.inputFormat}
            </CardContent>
          </Card>
        </div>

        {/* Output Format */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <FileOutput className="h-4 w-4" />
            Output Format
          </h3>
          <Card>
            <CardContent className="p-3 text-sm font-mono bg-muted/30 whitespace-pre-wrap">
              {question.outputFormat}
            </CardContent>
          </Card>
        </div>

        {/* Constraints */}
        {question.constraints.length > 0 && (
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              Constraints
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {question.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sample Test Cases */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <TestTube className="h-4 w-4" />
            Sample Test Cases
          </h3>
          <div className="space-y-4">
            {question.sampleTestCases.map((tc, index) => (
              <Card key={tc.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Example {index + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Input:
                      </div>
                      <pre className="p-2 bg-muted rounded text-sm overflow-x-auto whitespace-pre-wrap">
                        {tc.input}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Output:
                      </div>
                      <pre className="p-2 bg-muted rounded text-sm overflow-x-auto whitespace-pre-wrap">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {question.totalTestCases > question.sampleTestCases.length && (
           // src/components/practice/machine/problem-description.tsx (continued)

            <p className="text-sm text-muted-foreground mt-3">
              + {question.totalTestCases - question.sampleTestCases.length} hidden test case
              {question.totalTestCases - question.sampleTestCases.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
              // src/components/practice/machine/question-tabs.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuestionListItem, SubmitCodeResponse } from "@/types/machine.types";
import { CheckCircle, Circle, XCircle, AlertCircle } from "lucide-react";

interface QuestionTabsProps {
  questions: QuestionListItem[];
  currentIndex: number;
  submitResults: Record<string, SubmitCodeResponse>;
  solvedQuestionIds: string[];
  onSelect: (index: number) => void;
}

export function QuestionTabs({
  questions,
  currentIndex,
  submitResults,
  solvedQuestionIds,
  onSelect,
}: QuestionTabsProps) {
  const getStatusIcon = (question: QuestionListItem) => {
    // Check if solved (from store or question itself)
    if (solvedQuestionIds.includes(question.id) || question.isSolved) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    // Check submit results
    const result = submitResults[question.id];
    if (result) {
      if (result.isSolved) {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      }
      if (result.testCasesPassed > 0) {
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      }
      return <XCircle className="h-4 w-4 text-red-500" />;
    }

    // Check if has any submissions from question data
    if (question.submissionCount > 0) {
      if (question.bestSubmission?.status === "ACCEPTED") {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      }
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }

    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-muted/30 border-b overflow-x-auto">
      {questions.map((question, index) => (
        <button
          key={question.id}
          onClick={() => onSelect(index)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
            currentIndex === index
              ? "bg-background shadow-sm border"
              : "hover:bg-muted"
          )}
        >
          {getStatusIcon(question)}
          <span>Q{question.order}</span>
        </button>
      ))}
    </div>
  );
}// src/components/practice/machine/session-result.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { SessionResultsResponse, ResultQuestion } from "@/types/machine.types";
import { DIFFICULTY_COLORS, STATUS_COLORS } from "@/types/machine.types";
import {
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Code2,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Trophy,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SessionResultProps {
  result: SessionResultsResponse;
}

const RANK_COLORS: Record<string, string> = {
  EXCELLENT: "text-green-500",
  GOOD: "text-blue-500",
  AVERAGE: "text-yellow-500",
  NEEDS_IMPROVEMENT: "text-red-500",
};

const RANK_ICONS: Record<string, string> = {
  EXCELLENT: "🏆",
  GOOD: "🎯",
  AVERAGE: "📈",
  NEEDS_IMPROVEMENT: "💪",
};

export function SessionResult({ result }: SessionResultProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div
              className={cn(
                "text-6xl font-bold",
                RANK_COLORS[result.performance.rank]
              )}
            >
              {result.summary.solvedPercentage.toFixed(0)}%
            </div>
            <div className="flex items-center justify-center gap-2 text-xl text-muted-foreground mt-2">
              <span>{RANK_ICONS[result.performance.rank]}</span>
              <span>{result.performance.rank.replace("_", " ")}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {result.performance.message}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-500">
                {result.summary.totalSolved}
              </div>
              <div className="text-sm text-muted-foreground">Solved</div>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <Target className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-500">
                {result.summary.totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-500">
                {result.summary.totalScore}
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-lg">
              <Code2 className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-500">
                {result.summary.totalSubmissions}
              </div>
              <div className="text-sm text-muted-foreground">Submissions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Time Taken</span>
            <span className="font-medium">{formatTime(result.timeTaken)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span>Time Limit</span>
            <span className="font-medium">{formatTime(result.timeLimit)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span>Difficulty</span>
            <Badge variant="outline" className={DIFFICULTY_COLORS[result.difficulty]}>
              {result.difficulty}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span>Completed</span>
            <span className="font-medium">
              {new Date(result.completedAt).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Card */}
      {result.performance.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.performance.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Question Results */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.questions.map((question) => (
            <QuestionResultItem
              key={question.id}
              question={question}
              isExpanded={expandedQuestions.has(question.id)}
              onToggle={() => toggleQuestion(question.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/practice/machine">
            <RotateCcw className="mr-2 h-4 w-4" />
            Practice Again
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Question Result Item Component
function QuestionResultItem({
  question,
  isExpanded,
  onToggle,
}: {
  question: ResultQuestion;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {question.isSolved ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <div>
            <span className="font-medium">
              Q{question.order}: {question.title}
            </span>
            <div className="flex gap-2 mt-1">
              <Badge
                variant="outline"
                className={cn("text-xs", DIFFICULTY_COLORS[question.difficulty])}
              >
                {question.difficulty}
              </Badge>
              {question.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {question.submissionCount} submission
            {question.submissionCount !== 1 ? "s" : ""}
          </span>
          <span
            className={cn(
              "font-medium",
              question.isSolved ? "text-green-500" : "text-red-500"
            )}
          >
            {question.score} pts
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && question.bestSubmission && (
        <div className="p-4 border-t bg-muted/20">
          <h4 className="text-sm font-medium mb-3">Best Submission</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1",
                  question.bestSubmission.status === "ACCEPTED"
                    ? "text-green-500 border-green-500/30"
                    : "text-red-500 border-red-500/30"
                )}
              >
                {question.bestSubmission.status}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Language</div>
              <div className="mt-1 font-medium">
                {question.bestSubmission.language}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="mt-1 font-medium">
                {question.bestSubmission.executionTime?.toFixed(2) || "N/A"} ms
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Memory</div>
              <div className="mt-1 font-medium">
                {question.bestSubmission.memoryUsed
                  ? (question.bestSubmission.memoryUsed / 1024).toFixed(1)
                  : "N/A"}{" "}
                MB
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}// src/components/practice/machine/submit-dialog.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Code2, Loader2 } from "lucide-react";

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalQuestions: number;
  solvedCount: number;
  attemptedCount: number;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function SubmitDialog({
  open,
  onOpenChange,
  totalQuestions,
  solvedCount,
  attemptedCount,
  onConfirm,
  isSubmitting,
}: SubmitDialogProps) {
  const unattempted = totalQuestions - attemptedCount;
  const allAttempted = unattempted === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Complete Session
          </DialogTitle>
          <DialogDescription>
            {allAttempted ? (
              "You have attempted all problems. Are you sure you want to complete?"
            ) : (
              <>
                You have{" "}
                <span className="font-semibold text-yellow-500">
                  {unattempted} unattempted
                </span>{" "}
                problem{unattempted > 1 ? "s" : ""}. Are you sure you want to
                complete?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-green-500">
                {solvedCount}
              </div>
              <div className="text-xs text-muted-foreground">Solved</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-yellow-500">
                {attemptedCount - solvedCount}
              </div>
              <div className="text-xs text-muted-foreground">Attempted</div>
            </div>
            <div className="text-center p-3 bg-gray-500/10 rounded-lg">
              <Code2 className="h-6 w-6 text-gray-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-500">
                {unattempted}
              </div>
              <div className="text-xs text-muted-foreground">Unattempted</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Continue Coding
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              "Complete Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}// src/components/practice/machine/test-selector.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useMachine } from "@/lib/hooks/use-machine";
import type { DifficultyLevel } from "@/types/machine.types";
import { DIFFICULTY_COLORS } from "@/types/machine.types";
import {
  Code2,
  Clock,
  Loader2,
  Zap,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  EASY: "Basic problems suitable for beginners. Focus on fundamental concepts.",
  MEDIUM: "Intermediate challenges requiring good problem-solving skills.",
  HARD: "Advanced problems for experienced developers. Complex algorithms.",
};

export function TestSelector() {
  const {
    languages,
    selectedLanguageId,
    config,
    difficultyLevels,
    isLoading,
    initializeApp,
    setSelectedLanguageId,
    createSession,
    checkActiveSession,
  } = useMachine();

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLevel>("MEDIUM");
  const [numberOfQuestions, setNumberOfQuestions] = useState(3);
  const [timeLimit, setTimeLimit] = useState(90);
  const [isStarting, setIsStarting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Initialize app
  useEffect(() => {
    const init = async () => {
      await initializeApp();
      
      // Check for active session
      const activeSession = await checkActiveSession();
      if (activeSession) {
        toast.info("You have an active session", {
          action: {
            label: "Resume",
            onClick: () => {
              window.location.href = `/practice/machine/test/${activeSession.id}`;
            },
          },
        });
      }
      setCheckingSession(false);
    };

    init();
  }, [initializeApp, checkActiveSession]);

  // Update time limit when config loads
  useEffect(() => {
    if (config?.machine) {
      const recommended =
        config.machine.recommendedTimeLimits[selectedDifficulty]?.recommended ||
        config.machine.defaultTimeLimit;
      setTimeLimit(recommended);
    }
  }, [config, selectedDifficulty]);

  // Get config limits
  const questionLimits = config?.questionLimits?.machine || {
    min: 1,
    max: 10,
    default: 3,
  };

  const timeLimitConfig = config?.machine || {
    minTimeLimit: 30,
    maxTimeLimit: 180,
    defaultTimeLimit: 90,
  };

  // Calculate estimated duration
  const estimatedDuration = useMemo(() => {
    const hours = Math.floor(timeLimit / 60);
    const minutes = timeLimit % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  }, [timeLimit]);

  // Validate selection
  const canStart = useMemo(() => {
    return (
      selectedLanguageId > 0 &&
      numberOfQuestions >= questionLimits.min &&
      numberOfQuestions <= questionLimits.max &&
      timeLimit >= timeLimitConfig.minTimeLimit &&
      timeLimit <= timeLimitConfig.maxTimeLimit
    );
  }, [
    selectedLanguageId,
    numberOfQuestions,
    timeLimit,
    questionLimits,
    timeLimitConfig,
  ]);

  const handleStartTest = async () => {
    if (!canStart) {
      toast.error("Please complete your selection");
      return;
    }

    try {
      setIsStarting(true);
      await createSession({
        difficulty: selectedDifficulty,
        numberOfQuestions,
        timeLimit,
      });
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsStarting(false);
    }
  };

  // Get selected language info
  const selectedLanguage = languages.find(
    (l) => l.judge0Id === selectedLanguageId
  );

  if (checkingSession || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step 1: Select Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
              1
            </span>
            Select Difficulty
          </CardTitle>
          <CardDescription>
            Choose the difficulty level for your practice session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedDifficulty}
            onValueChange={(v) => setSelectedDifficulty(v as DifficultyLevel)}
            className="grid gap-3 md:grid-cols-3"
          >
            {(["EASY", "MEDIUM", "HARD"] as DifficultyLevel[]).map((level) => {
              const levelInfo = difficultyLevels.find((d) => d.value === level);

              return (
                <div key={level}>
                  <RadioGroupItem
                    value={level}
                    id={`difficulty-${level}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`difficulty-${level}`}
                    className={cn(
                      "flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all h-full",
                      "hover:bg-muted/50",
                      selectedDifficulty === level
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={DIFFICULTY_COLORS[level]}>
                        {levelInfo?.label || level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {levelInfo?.description || DIFFICULTY_DESCRIPTIONS[level]}
                    </p>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Step 2: Number of Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
              2
            </span>
            Number of Questions
          </CardTitle>
          <CardDescription>
            Choose how many questions you want to attempt (
            {questionLimits.min}-{questionLimits.max})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Questions</span>
              <span className="text-2xl font-bold">{numberOfQuestions}</span>
            </div>
            <Slider
              value={[numberOfQuestions]}
              onValueChange={([value]) => setNumberOfQuestions(value)}
              min={questionLimits.min}
              max={questionLimits.max}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{questionLimits.min}</span>
              <span>{questionLimits.max}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Time Limit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
              3
            </span>
            Time Limit
          </CardTitle>
          <CardDescription>
            Set the time limit for your session (
            {timeLimitConfig.minTimeLimit}-{timeLimitConfig.maxTimeLimit} minutes)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Minutes</span>
              <span className="text-2xl font-bold">{timeLimit}</span>
            </div>
            <Slider
              value={[timeLimit]}
              onValueChange={([value]) => setTimeLimit(value)}
              min={timeLimitConfig.minTimeLimit}
              max={timeLimitConfig.maxTimeLimit}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{timeLimitConfig.minTimeLimit} min</span>
              <span>{timeLimitConfig.maxTimeLimit} min</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Session duration:{" "}
              <span className="font-medium">{estimatedDuration}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Select Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
              4
            </span>
            Select Language
          </CardTitle>
          <CardDescription>
            Choose your preferred programming language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedLanguageId.toString()}
            onValueChange={(v) => setSelectedLanguageId(parseInt(v))}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select language" />
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
        </CardContent>
      </Card>

      {/* Summary & Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ready to Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Difficulty
              </div>
              <Badge variant="outline" className={DIFFICULTY_COLORS[selectedDifficulty]}>
                {selectedDifficulty}
              </Badge>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Questions
              </div>
              <div className="font-medium">{numberOfQuestions}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Duration</div>
              <div className="font-medium">{estimatedDuration}</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Language</div>
              <div className="font-medium truncate">
                {selectedLanguage?.name || "Not selected"}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Once you start, the timer will begin. Make sure you have a stable
              internet connection and enough time to complete the session.
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleStartTest}
            disabled={!canStart || isStarting || isLoading}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Session...
              </>
            ) : (
              <>
                <Code2 className="mr-2 h-4 w-4" />
                Start Coding Session
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}// src/components/practice/machine/test-timer.tsx

"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/lib/hooks/use-machine";

interface TestTimerProps {
  onExpire?: () => void;
}

export function TestTimer({ onExpire }: TestTimerProps) {
  const { formattedTime, isLowTime, isCriticalTime, isExpired } = useTimer();

  useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-lg font-mono px-4 py-2 transition-colors",
        isExpired && "bg-red-500 text-white border-red-500",
        isCriticalTime &&
          !isExpired &&
          "bg-red-500/10 text-red-500 border-red-500 animate-pulse",
        isLowTime &&
          !isCriticalTime &&
          "bg-yellow-500/10 text-yellow-500 border-yellow-500"
      )}
    >
      {isCriticalTime || isExpired ? (
        <AlertTriangle className="h-4 w-4 mr-2" />
      ) : (
        <Clock className="h-4 w-4 mr-2" />
      )}
      {isExpired ? "Time's Up!" : formattedTime}
    </Badge>
  );
}// src/app/practice/machine/result/[sessionId]/page.tsx

"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMachine } from "@/lib/hooks/use-machine";
import { SessionResult } from "@/components/practice/machine/session-result";
import { Loader2 } from "lucide-react";

export default function MachineResultPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { sessionResult, isLoading, fetchSessionResults, resetSession } =
    useMachine();

  useEffect(() => {
    if (!sessionResult || sessionResult.sessionId !== sessionId) {
      fetchSessionResults(sessionId).catch(() => {
        router.push("/practice/machine");
      });
    }
  }, [sessionId, sessionResult, fetchSessionResults, router]);

  useEffect(() => {
    return () => {
      resetSession();
    };
  }, [resetSession]);

  if (isLoading || !sessionResult) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <SessionResult result={sessionResult} />
    </div>
  );
}// src/app/practice/machine/test/[sessionId]/page.tsx

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
import { useMachine } from "@/lib/hooks/use-machine";
import { useMachineStore, DEFAULT_CODE_TEMPLATES } from "@/lib/store/machine-store";
import { MonacoEditor } from "@/components/practice/machine/monaco-editor";
import { ProblemDescription } from "@/components/practice/machine/problem-description";
import { ExecutionPanel } from "@/components/practice/machine/execution-panel";
import { QuestionTabs } from "@/components/practice/machine/question-tabs";
import { TestTimer } from "@/components/practice/machine/test-timer";
import { SubmitDialog } from "@/components/practice/machine/submit-dialog";
import { DIFFICULTY_COLORS } from "@/types/machine.types";
import { Loader2, Send, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function MachineTestPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const {
    difficulty,
    questions,
    currentQuestionIndex,
    currentQuestionDetail,
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
    initializeApp,
    resumeSession,
    fetchQuestionDetail,
    setSelectedLanguageId,
    setCode,
    goToQuestion,
    runCode,
    submitCode,
    completeSession,
    getCodeForQuestion,
    getSolvedCount,
    getAttemptedCount,
    getLanguageMonacoId,
    setActiveTab,
  } = useMachine();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentCode = currentQuestion
    ? getCodeForQuestion(currentQuestion.id)
    : "";
  const monacoLanguage = getLanguageMonacoId(selectedLanguageId);

  // Initialize
  useEffect(() => {
    const init = async () => {
      await initializeApp();

      if (questions.length === 0) {
        try {
          const success = await resumeSession(sessionId);
          if (!success) return;
        } catch (error) {
          router.push("/practice/machine");
          return;
        }
      }

      setInitialized(true);
    };

    init();
  }, [sessionId, initializeApp, resumeSession, router, questions.length]);

  // Fetch question detail when question changes
  useEffect(() => {
    if (initialized && currentQuestion && !currentQuestionDetail) {
      fetchQuestionDetail(currentQuestion.id);
    }
  }, [initialized, currentQuestion, currentQuestionDetail, fetchQuestionDetail]);

  const handleCodeChange = useCallback(
    (value: string) => {
      if (currentQuestion) {
        setCode(currentQuestion.id, value);
      }
    },
    [currentQuestion, setCode]
  );

  const handleRun = useCallback(
    (customInput?: string) => {
      if (currentQuestion) {
        runCode(currentQuestion.id, customInput);
      }
    },
    [currentQuestion, runCode]
  );

  const handleSubmitCode = useCallback(() => {
    if (currentQuestion) {
      submitCode(currentQuestion.id);
    }
  }, [currentQuestion, submitCode]);

  const handleResetCode = useCallback(() => {
    if (currentQuestion) {
      const defaultCode = DEFAULT_CODE_TEMPLATES[monacoLanguage] || "";
      setCode(currentQuestion.id, defaultCode);
      toast.info("Code reset to template");
    }
  }, [currentQuestion, monacoLanguage, setCode]);

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

  if (!initialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentQuestion) {
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

  const sampleInput =
    currentQuestionDetail?.sampleTestCases[0]?.input || "";

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
          <TestTimer onExpire={handleTimeExpire} />

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
        solvedQuestionIds={solvedQuestionIds}
        onSelect={handleQuestionSelect}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Problem Description */}
          <ResizablePanel defaultSize={35} minSize={25}>
            {currentQuestionDetail ? (
              <ProblemDescription question={currentQuestionDetail} />
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
                  submitResult={submitResults[currentQuestion.id] || submitResult}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
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
}// src/app/practice/machine/layout.tsx

export default function MachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}// src/app/practice/machine/page.tsx

import { TestSelector } from "@/components/practice/machine/test-selector";

export default function MachinePracticePage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Machine Coding Practice</h1>
        <p className="text-muted-foreground">
          Improve your coding skills with real-world programming challenges
        </p>
      </div>

      <TestSelector />
    </div>
  );
}update ,clean,clear and give me full files
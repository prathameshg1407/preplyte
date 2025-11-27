// src/components/practice/machine/execution-panel.tsx

"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { ScrollArea } from "../../ui/scroll-area";
import type {
  RunCodeResponse,
  SubmitCodeResponse,
  TestCaseResult,
  ActiveTab,
} from "../../../types/machine.types";
import {
  isRunCodeSampleTestCases,
  isRunCodeCustomInput,
} from "../../../types/machine.types";
import {
  Play,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  MemoryStick,
  Terminal,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface ExecutionPanelProps {
  sampleInput: string;
  onRun: (customInput?: string) => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  runResult: RunCodeResponse | null;
  submitResult: SubmitCodeResponse | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
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
  const [inputTab, setInputTab] = useState<"input" | "output" | "result">("input");

  const handleRunWithSamples = () => onRun();
  const handleRunWithCustomInput = () => onRun(customInput);
  const handleSubmit = () => onSubmit();

  // Get execution stats from run result
  const getExecutionStats = () => {
    if (!runResult) return null;

    if (isRunCodeCustomInput(runResult)) {
      return {
        time: runResult.result.executionTime,
        memory: runResult.result.memoryUsed,
      };
    }

    if (isRunCodeSampleTestCases(runResult)) {
      return {
        time: runResult.summary.averageExecutionTime,
        memory: runResult.summary.maxMemoryUsed,
      };
    }

    return null;
  };

  const stats = getExecutionStats();

  const getInternalTab = (): "input" | "output" | "result" => {
    if (activeTab === "output" && runResult) return "output";
    if (activeTab === "submissions" && submitResult) return "result";
    return inputTab;
  };

  const handleInternalTabChange = (tab: "input" | "output" | "result") => {
    setInputTab(tab);
    if (tab === "output") {
      onTabChange("output");
    } else if (tab === "result") {
      onTabChange("submissions");
    } else {
      onTabChange("description");
    }
  };

  // Get result status for output tab
  const getOutputStatus = () => {
    if (!runResult) return null;
    if (runResult.compilationStatus === "COMPILATION_ERROR") return "error";
    if (isRunCodeSampleTestCases(runResult)) {
      return runResult.summary.failed === 0 ? "success" : "partial";
    }
    return "success";
  };

  const outputStatus = getOutputStatus();

  return (
    <div className="flex h-full flex-col border-t border-border">
      {/* Actions Bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunWithSamples}
            disabled={isRunning || isSubmitting}
            className="gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit
          </Button>
        </div>

        {stats && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {stats.time !== undefined && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {stats.time.toFixed(2)}ms
              </span>
            )}
            {stats.memory !== undefined && (
              <span className="flex items-center gap-1.5">
                <MemoryStick className="h-3.5 w-3.5" />
                {(stats.memory / 1024).toFixed(1)}MB
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        value={getInternalTab()}
        onValueChange={(v) => handleInternalTabChange(v as "input" | "output" | "result")}
        className="flex flex-1 flex-col"
      >
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="input"
            className="gap-2 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-foreground data-[state=active]:bg-transparent"
          >
            <Terminal className="h-4 w-4" />
            Input
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="gap-2 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-foreground data-[state=active]:bg-transparent"
          >
            Output
            {runResult && (
              <span
                className={cn(
                  "ml-1 rounded px-1.5 py-0.5 text-xs font-medium",
                  outputStatus === "error"
                    ? "bg-secondary text-muted-foreground"
                    : outputStatus === "success"
                    ? "bg-secondary text-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {runResult.compilationStatus === "COMPILATION_ERROR"
                  ? "CE"
                  : isRunCodeSampleTestCases(runResult)
                  ? `${runResult.summary.passed}/${runResult.summary.totalTestCases}`
                  : "✓"}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="result"
            className="gap-2 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-foreground data-[state=active]:bg-transparent"
          >
            Result
            {submitResult && (
              <span
                className={cn(
                  "ml-1 rounded px-1.5 py-0.5 text-xs font-medium",
                  submitResult.isSolved
                    ? "bg-secondary text-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {submitResult.testCasesPassed}/{submitResult.testCasesTotal}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Custom Input Tab */}
        <TabsContent value="input" className="m-0 flex-1 p-0">
          <div className="flex h-full flex-col p-4">
            <label className="mb-2 text-xs font-medium text-muted-foreground">
              Custom Input (stdin)
            </label>
            <Textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter your test input..."
              className="min-h-[120px] flex-1 resize-none font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-2 self-start"
              onClick={handleRunWithCustomInput}
              disabled={isRunning || isSubmitting}
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run with Custom Input
            </Button>
          </div>
        </TabsContent>

        {/* Output Tab */}
        <TabsContent value="output" className="m-0 flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {!runResult ? (
                <EmptyState message="Run your code to see output" />
              ) : (
                <RunResultDisplay result={runResult} />
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Submission Result Tab */}
        <TabsContent value="result" className="m-0 flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {!submitResult ? (
                <EmptyState message="Submit your code to see results" />
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

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
        <Terminal className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Run Result Display Component
function RunResultDisplay({ result }: { result: RunCodeResponse }) {
  // Compilation Error
  if (result.compilationStatus === "COMPILATION_ERROR") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Compilation Error</span>
        </div>
        {result.compileOutput && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-secondary p-4 font-mono text-sm">
            {result.compileOutput}
          </pre>
        )}
      </div>
    );
  }

  // Custom Input Result
  if (isRunCodeCustomInput(result)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Execution Complete</span>
        </div>

        <div className="space-y-3">
          <OutputBlock label="Input" content={result.result.input || "(no input)"} />
          <OutputBlock label="Output" content={result.result.output || "(no output)"} />
        </div>

        <ExecutionMeta
          time={result.result.executionTime}
          memory={result.result.memoryUsed}
        />
      </div>
    );
  }

  // Sample Test Cases Result
  if (isRunCodeSampleTestCases(result)) {
    const allPassed = result.summary.failed === 0;

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center gap-3">
          {allPassed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <div>
            <div className="font-medium">
              {result.summary.passed} / {result.summary.totalTestCases} Passed
            </div>
            <div className="text-xs text-muted-foreground">Sample test cases</div>
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

  return null;
}

// Output Block Component
function OutputBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-secondary p-3 font-mono text-sm">
        {content}
      </pre>
    </div>
  );
}

// Execution Meta Component
function ExecutionMeta({ time, memory }: { time?: number; memory?: number }) {
  if (!time && !memory) return null;

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {time !== undefined && (
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {time.toFixed(2)}ms
        </span>
      )}
      {memory !== undefined && (
        <span className="flex items-center gap-1.5">
          <MemoryStick className="h-3.5 w-3.5" />
          {(memory / 1024).toFixed(1)}MB
        </span>
      )}
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
  const [isExpanded, setIsExpanded] = useState(!result.status.includes("PASSED"));
  const isPassed = result.status === "PASSED";

  return (
    <div className="rounded-lg border border-border">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-secondary/50"
      >
        <div className="flex items-center gap-3">
          {isPassed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            Test Case {result.testCaseNumber ?? index + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-xs font-medium",
              isPassed ? "bg-secondary" : "bg-secondary text-muted-foreground"
            )}
          >
            {result.status.replace(/_/g, " ")}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <OutputBlock label="Input" content={result.input} />
            <OutputBlock label="Expected" content={result.expectedOutput} />
          </div>

          {!isPassed && (
            <div className="mt-3">
              <OutputBlock
                label="Your Output"
                content={result.actualOutput || "(no output)"}
              />
            </div>
          )}

          {result.stderr && (
            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Error
              </label>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-secondary p-3 font-mono text-sm">
                {result.stderr}
              </pre>
            </div>
          )}

          {(result.executionTime !== null || result.memoryUsed) && (
            <div className="mt-3">
              <ExecutionMeta time={result.executionTime ?? undefined} memory={result.memoryUsed ?? undefined} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Submit Result Display Component
function SubmitResultDisplay({ result }: { result: SubmitCodeResponse }) {
  const statusDisplay = result.status.replace(/_/g, " ");

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/50 p-4">
        {result.isSolved ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <XCircle className="h-5 w-5" />
          </div>
        )}
        <div>
          <div className="font-semibold">{statusDisplay}</div>
          <div className="text-sm text-muted-foreground">{result.message}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-3 text-center">
          <div className="text-lg font-semibold">
            {result.testCasesPassed}/{result.testCasesTotal}
          </div>
          <div className="text-xs text-muted-foreground">Test Cases</div>
        </div>
        {result.executionTime !== null && (
          <div className="rounded-lg border border-border p-3 text-center">
            <div className="text-lg font-semibold">
              {result.executionTime.toFixed(0)}ms
            </div>
            <div className="text-xs text-muted-foreground">Runtime</div>
          </div>
        )}
        {result.memoryUsed !== null && (
          <div className="rounded-lg border border-border p-3 text-center">
            <div className="text-lg font-semibold">
              {(result.memoryUsed / 1024).toFixed(1)}MB
            </div>
            <div className="text-xs text-muted-foreground">Memory</div>
          </div>
        )}
      </div>

      {/* Failed Test Case Info */}
      {result.failedTestCase && (
        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">{result.failedTestCase.message}</span>
          </div>

          {result.failedTestCase.input !== "[Hidden]" && (
            <div className="space-y-3">
              <OutputBlock label="Input" content={result.failedTestCase.input} />
              <div className="grid gap-3 sm:grid-cols-2">
                <OutputBlock
                  label="Expected"
                  content={result.failedTestCase.expectedOutput}
                />
                <OutputBlock
                  label="Your Output"
                  content={result.failedTestCase.actualOutput || "(no output)"}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
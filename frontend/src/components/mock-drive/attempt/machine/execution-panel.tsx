// src/components/practice/machine/execution-panel.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type {
  RunCodeResponse,
  SubmitCodeResponse,
  TestCaseResult,
  ActiveTab,
} from "@/types/machine.types";
import {
  isRunCodeSampleTestCases,
  isRunCodeCustomInput,
} from "@/types/machine.types";
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
  Zap,
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

  const getExecutionStats = () => {
    // If we're viewing submissions, prefer submit stats
    if (activeTab === "submissions" && submitResult) {
      return {
        time: submitResult.executionTime ?? undefined,
        memory: submitResult.memoryUsed ?? undefined,
      };
    }

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
    if (tab === "output") onTabChange("output");
    else if (tab === "result") onTabChange("submissions");
    else onTabChange("description");
  };

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
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit
          </Button>
        </div>

        <AnimatePresence>
          {stats && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-4 text-xs"
            >
              {stats.time !== undefined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="font-mono">{stats.time.toFixed(2)}ms</span>
                </div>
              )}
              {stats.memory !== undefined && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MemoryStick className="h-3.5 w-3.5" />
                  <span className="font-mono">{(stats.memory / 1024).toFixed(1)}MB</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <Tabs
        value={getInternalTab()}
        onValueChange={(v) => handleInternalTabChange(v as "input" | "output" | "result")}
        className="flex flex-1 flex-col min-h-0"
      >
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="input"
            className="gap-2 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Terminal className="h-4 w-4" />
            Input
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="gap-2 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Output
            {runResult && (
              <Badge
                variant="secondary"
                className={cn(
                  "ml-1 px-1.5 py-0 text-xs",
                  outputStatus === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  outputStatus === "error" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                  outputStatus === "partial" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                )}
              >
                {runResult.compilationStatus === "COMPILATION_ERROR"
                  ? "CE"
                  : isRunCodeSampleTestCases(runResult)
                    ? `${runResult.summary.passed}/${runResult.summary.totalTestCases}`
                    : "✓"}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="result"
            className="gap-2 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Result
            {submitResult && (
              <Badge
                variant="secondary"
                className={cn(
                  "ml-1 px-1.5 py-0 text-xs",
                  submitResult.isSolved
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
              >
                {submitResult.testCasesPassed}/{submitResult.testCasesTotal}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Custom Input Tab */}
        <TabsContent value="input" className="m-0 flex-1 flex-col p-0 min-h-0 data-[state=active]:flex">
          <div className="flex h-full flex-col p-4">
            <label className="mb-2 text-xs font-medium text-muted-foreground">
              Custom Input (stdin)
            </label>
            <Textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter your test input..."
              className="min-h-[100px] flex-1 resize-none font-mono text-sm"
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
        <TabsContent value="output" className="m-0 flex-1 flex-col p-0 min-h-0 data-[state=active]:flex">
          <ScrollArea className="h-full">
            <div className="p-4">
              {!runResult ? (
                <EmptyState message="Run your code to see output" icon={Play} />
              ) : (
                <RunResultDisplay result={runResult} />
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Submission Result Tab */}
        <TabsContent value="result" className="m-0 flex-1 flex-col p-0 min-h-0 data-[state=active]:flex">
          <ScrollArea className="h-full">
            <div className="p-4">
              {!submitResult ? (
                <EmptyState message="Submit your code to see results" icon={Send} />
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
function EmptyState({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </motion.div>
  );
}

// Run Result Display Component
function RunResultDisplay({ result }: { result: RunCodeResponse }) {
  if (result.compilationStatus === "COMPILATION_ERROR") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10">
            <XCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              Compilation Error
            </span>
            <p className="text-xs text-muted-foreground">Fix the errors and try again</p>
          </div>
        </div>
        {result.compileOutput && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 font-mono text-sm text-rose-700 dark:text-rose-300">
            {result.compileOutput}
          </pre>
        )}
      </motion.div>
    );
  }

  if (isRunCodeCustomInput(result)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="font-semibold">Execution Complete</span>
        </div>

        <div className="space-y-3">
          <OutputBlock label="Input" content={result.result.input || "(no input)"} />
          <OutputBlock label="Output" content={result.result.output || "(no output)"} />
        </div>

        <ExecutionMeta time={result.result.executionTime} memory={result.result.memoryUsed} />
      </motion.div>
    );
  }

  if (isRunCodeSampleTestCases(result)) {
    const allPassed = result.summary.failed === 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              allPassed ? "bg-emerald-500/10" : "bg-amber-500/10"
            )}
          >
            {allPassed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div>
            <div className="font-semibold">
              {result.summary.passed} / {result.summary.totalTestCases} Passed
            </div>
            <div className="text-xs text-muted-foreground">Sample test cases</div>
          </div>
        </div>

        <div className="space-y-2">
          {result.results.map((tc, index) => (
            <TestCaseResultItem key={index} result={tc} index={index} />
          ))}
        </div>
      </motion.div>
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
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-muted/50 p-4 font-mono text-sm">
        {content}
      </pre>
    </div>
  );
}

// Execution Meta Component
function ExecutionMeta({ time, memory }: { time?: number; memory?: number }) {
  if (!time && !memory) return null;

  return (
    <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-3 text-sm">
      {time !== undefined && (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span className="font-mono">{time.toFixed(2)}ms</span>
        </span>
      )}
      {memory !== undefined && (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MemoryStick className="h-4 w-4" />
          <span className="font-mono">{(memory / 1024).toFixed(1)}MB</span>
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
  const isHidden = result.input === "[Hidden]";
  const [isExpanded, setIsExpanded] = useState(!result.status.includes("PASSED") && !isHidden);
  const isPassed = result.status === "PASSED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "overflow-hidden rounded-xl border-2",
        isPassed
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-rose-500/30 bg-rose-500/5"
      )}
    >
      <button
        onClick={() => !isHidden && setIsExpanded(!isExpanded)}
        disabled={isHidden}
        className={cn(
          "flex w-full items-center justify-between p-3 text-left transition-colors",
          isHidden ? "cursor-default" : "hover:bg-muted/30"
        )}
      >
        <div className="flex items-center gap-3">
          {isPassed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-rose-500" />
          )}
          <span className="text-sm font-medium">
            Test Case {result.testCaseNumber ?? index + 1}
            {isHidden && <span className="ml-2 text-xs font-normal text-muted-foreground">(Hidden)</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              isPassed
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {result.status.replace(/_/g, " ")}
          </Badge>
          {!isHidden && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50"
          >
            <div className="p-3">
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
                  <label className="mb-1.5 block text-xs font-medium text-rose-500">
                    Error
                  </label>
                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 font-mono text-sm text-rose-700 dark:text-rose-300">
                    {result.stderr}
                  </pre>
                </div>
              )}

              {(result.executionTime !== null || result.memoryUsed) && (
                <div className="mt-3">
                  <ExecutionMeta
                    time={result.executionTime ?? undefined}
                    memory={result.memoryUsed ?? undefined}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Submit Result Display Component
function SubmitResultDisplay({ result }: { result: SubmitCodeResponse }) {
  const statusDisplay = result.status.replace(/_/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Status Banner */}
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl p-4",
          result.isSolved
            ? "bg-emerald-500/10"
            : "bg-rose-500/10"
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            result.isSolved ? "bg-emerald-500" : "bg-rose-500"
          )}
        >
          {result.isSolved ? (
            <CheckCircle2 className="h-6 w-6 text-white" />
          ) : (
            <XCircle className="h-6 w-6 text-white" />
          )}
        </div>
        <div>
          <div
            className={cn(
              "font-semibold",
              result.isSolved
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300"
            )}
          >
            {statusDisplay}
          </div>
          <div className="text-sm text-muted-foreground">{result.message}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Test Cases"
          value={`${result.testCasesPassed}/${result.testCasesTotal}`}
          icon={CheckCircle2}
        />
        {result.executionTime !== null && (
          <StatCard
            label="Runtime"
            value={`${result.executionTime.toFixed(0)}ms`}
            icon={Zap}
          />
        )}
        {result.memoryUsed !== null && (
          <StatCard
            label="Memory"
            value={`${(result.memoryUsed / 1024).toFixed(1)}MB`}
            icon={MemoryStick}
          />
        )}
      </div>

      {/* Failed Test Case Info */}
      {result.failedTestCase && !result.testCaseResults && (
        <div className="rounded-xl border-2 border-rose-500/30 bg-rose-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
              {result.failedTestCase.message}
            </span>
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

      {/* Test Case Results Grid (From updated backend response) */}
      {result.testCaseResults && result.testCaseResults.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Detailed Test Cases</h4>
          {result.testCaseResults.map((tc, index) => (
            <TestCaseResultItem
              key={tc.testCaseId || index}
              result={{
                ...tc,
                status: (tc as any).passed ? "PASSED" : ((tc as any).error ? "RUNTIME_ERROR" : "FAILED")
              }}
              index={index}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

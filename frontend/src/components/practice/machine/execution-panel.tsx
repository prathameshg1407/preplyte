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

  // Determine internal tab based on activeTab prop
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
        value={getInternalTab()}
        onValueChange={(v) => handleInternalTabChange(v as "input" | "output" | "result")}
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
                    : isRunCodeSampleTestCases(runResult) &&
                      runResult.summary.failed === 0
                    ? "default"
                    : "secondary"
                }
                className="ml-2 h-5"
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
        <TabsContent value="result" className="flex-1 m-0 p-0">
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
  if (isRunCodeCustomInput(result)) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="font-medium">Execution Complete</span>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Input:</div>
          <pre className="p-3 bg-muted rounded font-mono text-sm whitespace-pre-wrap overflow-x-auto mb-3">
            {result.result.input || "(no input)"}
          </pre>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Output:</div>
          <pre className="p-3 bg-muted rounded font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {result.result.output || "(no output)"}
          </pre>
        </div>
        <div className="text-xs text-muted-foreground">
          Time: {result.result.executionTime.toFixed(2)}ms | Memory:{" "}
          {(result.result.memoryUsed / 1024).toFixed(1)}MB
        </div>
      </div>
    );
  }

  // Sample Test Cases Result
  if (isRunCodeSampleTestCases(result)) {
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

  return null;
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
        <span className="font-medium text-sm">
          Test Case {result.testCaseNumber ?? index + 1}
        </span>
        <Badge variant={isPassed ? "default" : "destructive"} className="text-xs">
          {result.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Input:</div>
          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">
            {result.input}
          </pre>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Expected:</div>
          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">
            {result.expectedOutput}
          </pre>
        </div>
      </div>

      {!isPassed && (
        <div className="mt-2">
          <div className="text-xs text-muted-foreground mb-1">Your Output:</div>
          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">
            {result.actualOutput || "(no output)"}
          </pre>
        </div>
      )}

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
  const statusDisplay = result.status.replace(/_/g, " ");

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
            {statusDisplay}
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
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Input:</div>
                <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                  {result.failedTestCase.input}
                </pre>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
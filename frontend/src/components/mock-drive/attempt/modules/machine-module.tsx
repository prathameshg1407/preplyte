// src/components/mock-drive/attempt/modules/machine-module.tsx (fixed payload types)

'use client';

import { FC, useState, useEffect } from 'react';
import { Play, Send, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import {
  MachineModuleConfig,
  MachineModuleData,
  ModuleConfig,
  ModuleData,
  MachineSubmitPayload,
  MachineRunPayload,
} from '@/types/mockdrive.types';
import { useMachineSubmit, useMachineRun } from '@/lib/hooks/mock-drive/use-attempt';
import { useAttemptStore } from '@/lib/store/mock-drive/attempt-store';

interface MachineModuleProps {
  driveId: string;
  moduleId: string;
  config: ModuleConfig;
  data: Partial<ModuleData> | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const LANGUAGES = [
  { id: 71, name: 'Python', monacoId: 'python' },
  { id: 62, name: 'Java', monacoId: 'java' },
  { id: 54, name: 'C++', monacoId: 'cpp' },
  { id: 63, name: 'JavaScript', monacoId: 'javascript' },
];

export const MachineModule: FC<MachineModuleProps> = ({
  driveId,
  moduleId,
  config,
  data,
  onSubmit,
  isSubmitting,
}) => {
  const machineConfig = config as MachineModuleConfig;
  const machineData = data as MachineModuleData | null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState('');
  const [languageId, setLanguageId] = useState(71);
  const [activeTab, setActiveTab] = useState('description');
  const [runResult, setRunResult] = useState<any>(null); // Type this properly later if needed

  const { localModuleData, updateLocalModuleData } = useAttemptStore();
  const localData = localModuleData as MachineModuleData | null;

  const submitCodeMutation = useMachineSubmit();
  const runCodeMutation = useMachineRun();

  useEffect(() => {
    if (machineData && !localData) {
      updateLocalModuleData(machineData);
    }
  }, [machineData, localData, updateLocalModuleData]);

  const questions = localData?.questions || machineData?.questions || [];
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (currentQuestion) {
      const lastSubmission = currentQuestion.submissions[currentQuestion.submissions.length - 1];
      if (lastSubmission) {
        setCode(lastSubmission.code);
        setLanguageId(lastSubmission.languageId);
      } else {
        setCode(currentQuestion.defaultCode || '// Write your code here\n');
      }
    }
  }, [currentQuestion]);

  const handleRunCode = () => {
    if (!currentQuestion) return;

    setActiveTab('output');
    setRunResult(null);

    const payload: MachineRunPayload = {
      questionId: currentQuestion.questionId,
      code,
      languageId,
    };

    runCodeMutation.mutate(
      {
        driveId,
        moduleId,
        payload,
      },
      {
        onSuccess: (response) => {
          const data = response.updatedData as Partial<MachineModuleData>;
          if (data?._runResult) {
            setRunResult(data._runResult);
          }
        },
      }
    );
  };

  const handleSubmitCode = () => {
    if (!currentQuestion) return;

    const payload: MachineSubmitPayload = {
      questionId: currentQuestion.questionId,
      code,
      languageId,
    };

    submitCodeMutation.mutate(
      {
        driveId,
        moduleId,
        payload,
      },
      {
        onSuccess: (response) => {
          if (response.updatedData) {
            updateLocalModuleData(response.updatedData);
            setActiveTab('submissions');
          }
        },
      }
    );
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
      {/* Left Panel - Problem Description */}
      <div className="flex flex-col">
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-lg">
                  Problem {currentIndex + 1} of {questions.length}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                  disabled={currentIndex === questions.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant={currentQuestion.isSolved ? 'default' : 'outline'}>
                {currentQuestion.isSolved
                  ? 'Solved'
                  : currentQuestion.bestScore > 0
                    ? `Partial: ${currentQuestion.bestScore}%`
                    : 'Not Attempted'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto h-full pb-20">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="submissions">
                  Submissions ({currentQuestion.submissions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4 mt-4">
                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="font-medium mb-2">{currentQuestion.title}</h3>
                  <ReactMarkdown>{currentQuestion.description}</ReactMarkdown>
                </div>
              </TabsContent>

              <TabsContent value="testcases" className="mt-4">
                <div className="space-y-4">
                  {currentQuestion.testCases?.map((tc, idx) => (
                    <div key={idx} className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Sample Case {idx + 1}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Input</div>
                          <pre className="bg-background p-2 rounded text-sm">{tc.input}</pre>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Expected Output</div>
                          <pre className="bg-background p-2 rounded text-sm">{tc.expectedOutput}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!currentQuestion.testCases?.length && (
                    <p className="text-muted-foreground text-center py-8">No sample test cases available.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="output" className="space-y-4 mt-4">
                {runCodeMutation.isPending ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Running code...</span>
                  </div>
                ) : runResult ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Standard Output</h4>
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm disabled:cursor-not-allowed">
                        {runResult.stdout || <span className="text-muted-foreground italic">No output</span>}
                      </pre>
                    </div>
                    {runResult.stderr && (
                      <div>
                        <h4 className="font-medium mb-1 text-red-500">Error Output</h4>
                        <pre className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md overflow-x-auto text-sm">
                          {runResult.stderr}
                        </pre>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Execution Time: {runResult.executionTime}s
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Run your code to see output here
                  </div>
                )}
              </TabsContent>

              <TabsContent value="submissions" className="mt-4">
                {currentQuestion.submissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No submissions yet</p>
                ) : (
                  <div className="space-y-2">
                    {currentQuestion.submissions.map((submission, idx) => (
                      <div
                        key={submission.id}
                        className={cn(
                          'p-3 rounded-lg border',
                          submission.status === 'ACCEPTED'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            #{idx + 1} - {submission.languageName}
                          </span>
                          <Badge
                            variant={submission.status === 'ACCEPTED' ? 'default' : 'destructive'}
                          >
                            {submission.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Test Cases: {submission.testCasesPassed}/{submission.testCasesTotal}
                          {submission.executionTime && ` • ${submission.executionTime}ms`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="flex flex-col gap-4">
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-2 flex-none">
            <div className="flex items-center justify-between">
              <Select value={languageId.toString()} onValueChange={(v) => setLanguageId(parseInt(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.filter((l) => {
                    // Filter logic: Check if language name or monacoId is in allowedLanguages (case-insensitive)
                    if (!machineConfig.allowedLanguages?.length) return true;
                    return machineConfig.allowedLanguages.some(allowed =>
                      allowed.toLowerCase() === l.name.toLowerCase() ||
                      allowed.toLowerCase() === l.monacoId.toLowerCase()
                    );
                  }).map((lang) => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunCode}
                  disabled={runCodeMutation.isPending || isSubmitting}
                >
                  {runCodeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  Run
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitCode}
                  disabled={submitCodeMutation.isPending || isSubmitting}
                >
                  {submitCodeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  Submit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-full p-0 flex-1 relative min-h-[400px]">
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.id === languageId)?.monacoId || 'javascript'}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.questionId}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'w-8 h-8 rounded text-sm font-medium transition-all',
                  idx === currentIndex && 'ring-2 ring-primary ring-offset-2',
                  q.isSolved && 'bg-green-500 text-white',
                  q.bestScore > 0 && !q.isSolved && 'bg-yellow-500 text-white',
                  q.submissions.length === 0 && 'bg-gray-200'
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Submit Module
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
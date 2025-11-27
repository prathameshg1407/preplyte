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
import {
  MachineModuleConfig,
  MachineModuleData,
  ModuleConfig,
  ModuleData,
  MachineSubmitPayload,
} from '@/types/mockdrive.types';
import { useMachineSubmit } from '@/lib/hooks/mock-drive/use-attempt';
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

  const { localModuleData, updateLocalModuleData } = useAttemptStore();
  const localData = localModuleData as MachineModuleData | null;

  const submitCodeMutation = useMachineSubmit();

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
        setCode('# Write your code here\n');
      }
    }
  }, [currentQuestion]);

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
                <TabsTrigger value="submissions">
                  Submissions ({currentQuestion.submissions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4 mt-4">
                <div>
                  <h3 className="font-medium mb-2">Problem Statement</h3>
                  <p className="text-muted-foreground">
                    Sample problem description for question {currentQuestion.machineQuestionId}.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Example</h3>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <p>Input: [1, 2, 3]</p>
                    <p>Output: 6</p>
                  </div>
                </div>
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
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Select value={languageId.toString()} onValueChange={(v) => setLanguageId(parseInt(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.filter((l) =>
                    machineConfig.allowedLanguages?.includes(l.monacoId) ||
                    !machineConfig.allowedLanguages?.length
                  ).map((lang) => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitCode}
                  disabled={submitCodeMutation.isPending}
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
          <CardContent className="h-full pb-20">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full font-mono text-sm p-4 bg-muted rounded-lg resize-none"
              placeholder="Write your code here..."
            />
          </CardContent>
        </Card>

        {/* Question Navigator & Submit */}
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
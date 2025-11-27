// src/components/practice/ai-interview/interview-session.tsx

"use client";

import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import {
  MicOff,
  Volume2,
  Loader2,
  AlertCircle,
  Square,
  Send,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { MicButton } from "./mic-button";
import { StatusIndicator } from "./status-indicator";
import { TranscriptDisplay } from "./transcript-display";
import { AudioVisualizer } from "./audio-visualizer";
import {
  InterviewUIStatus,
  TranscriptMessage,
  AiInterviewQuestionCategory,
  Progress as ProgressType,
} from "../../../types/aiInterview.types";

interface InterviewSessionProps {
  status: InterviewUIStatus;
  currentQuestionText: string;
  currentCategory: AiInterviewQuestionCategory;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentTranscript: string;
  fullTranscript: TranscriptMessage[];
  silenceTimer: number;
  error: string | null;
  isRecording: boolean;
  isAiSpeaking: boolean;
  isProcessing: boolean;
  micPermission: boolean | null;
  progress?: ProgressType | null;
  context?: { jobTitle: string; companyName?: string } | null;
  onStopRecording: () => void;
  onStartRecording: () => void;
  onSubmitAnswer: () => void;
  onEndSession: () => void;
}

const categoryLabels: Record<AiInterviewQuestionCategory, string> = {
  [AiInterviewQuestionCategory.INTRODUCTORY]: "Intro",
  [AiInterviewQuestionCategory.TECHNICAL]: "Technical",
  [AiInterviewQuestionCategory.BEHAVIORAL]: "Behavioral",
  [AiInterviewQuestionCategory.SITUATIONAL]: "Situational",
  [AiInterviewQuestionCategory.CLOSING]: "Closing",
};

export function InterviewSession({
  status,
  currentQuestionText,
  currentCategory,
  currentQuestionIndex,
  totalQuestions,
  currentTranscript,
  fullTranscript,
  silenceTimer,
  error,
  isRecording,
  isAiSpeaking,
  isProcessing,
  micPermission,
  progress,
  context,
  onStopRecording,
  onStartRecording,
  onSubmitAnswer,
  onEndSession,
}: InterviewSessionProps) {
  const progressPercent = progress?.percentComplete ?? ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const canRecord = !isAiSpeaking && !isProcessing && micPermission !== false;
  const questionNumber = progress?.questionNumber ?? currentQuestionIndex + 1;
  const total = progress?.estimatedTotal ?? totalQuestions;

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="shrink-0 border-b border-border p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Badge variant="outline" className="shrink-0">
              {categoryLabels[currentCategory]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {questionNumber} / {total}
            </span>
            {context && (
              <span className="text-sm text-muted-foreground truncate hidden sm:block">
                {context.jobTitle}
                {context.companyName && ` • ${context.companyName}`}
              </span>
            )}
          </div>
          <StatusIndicator status={status} />
        </div>
        <Progress value={progressPercent} className="h-1" />
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Question Panel */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col border-border overflow-hidden">
            <CardContent className="flex-1 flex flex-col p-6 overflow-auto">
              {/* AI Speaking */}
              {isAiSpeaking && (
                <div className="flex items-center justify-center gap-2 p-3 mb-4 rounded-lg bg-secondary/50">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">AI is speaking...</span>
                </div>
              )}

              {/* Question */}
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-lg md:text-xl font-medium text-center leading-relaxed max-w-lg">
                  "{currentQuestionText}"
                </p>
              </div>

              {/* Recording Section */}
              <div className="space-y-4">
                {/* Timer */}
                {isRecording && silenceTimer > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      silenceTimer <= 3 ? "bg-foreground animate-pulse" : "bg-muted-foreground"
                    )} />
                    <span className="text-xs text-muted-foreground tabular-nums">
                      Auto-submit in {silenceTimer}s
                    </span>
                  </div>
                )}

                {/* Visualizer */}
                <AudioVisualizer isActive={isRecording} className="h-12" />

                {/* Transcript Preview */}
                {currentTranscript && (
                  <div className="p-3 rounded-lg bg-secondary/50 max-h-24 overflow-auto">
                    <p className="text-sm">{currentTranscript}</p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <MicButton
                    isRecording={isRecording}
                    isDisabled={!canRecord}
                    isLoading={isProcessing}
                    onToggle={isRecording ? onStopRecording : onStartRecording}
                  />
                  {isRecording && (
                    <Button onClick={onSubmitAnswer} size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Submit
                    </Button>
                  )}
                </div>

                {/* Processing */}
                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/50">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processing...</span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-secondary/30">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Mic Permission */}
                {micPermission === false && (
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-secondary/30">
                    <MicOff className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Microphone access denied. Enable it in browser settings.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transcript Panel */}
        <div className="lg:col-span-2 flex flex-col min-h-0 hidden lg:flex">
          <Card className="flex-1 flex flex-col border-border overflow-hidden">
            <CardContent className="flex-1 flex flex-col p-4 min-h-0">
              <h3 className="text-sm font-medium mb-3 shrink-0">Transcript</h3>
              <TranscriptDisplay
                messages={fullTranscript}
                className="flex-1 min-h-0"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Take your time and speak clearly
          </p>
          <Button variant="outline" size="sm" onClick={onEndSession}>
            <Square className="h-3 w-3 mr-2" />
            End Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
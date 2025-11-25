"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  MicOff,
  Volume2,
  Loader2,
  AlertCircle,
  StopCircle,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MicButton } from "./mic-button";
import { StatusIndicator } from "./status-indicator";
import { TranscriptDisplay } from "./transcript-display";
import { AudioVisualizer } from "./audio-visualizer";
import {
  InterviewUIStatus,
  TranscriptMessage,
  AiInterviewQuestionCategory,
} from "@/types/aiInterview.types";

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
  onStopRecording: () => void;
  onStartRecording: () => void;
  onSubmitAnswer: () => void;
  onCancel: () => void;
}

const categoryLabels: Record<AiInterviewQuestionCategory, string> = {
  [AiInterviewQuestionCategory.INTRODUCTORY]: "Introduction",
  [AiInterviewQuestionCategory.TECHNICAL]: "Technical",
  [AiInterviewQuestionCategory.CLOSING]: "Closing",
};

const categoryColors: Record<AiInterviewQuestionCategory, string> = {
  [AiInterviewQuestionCategory.INTRODUCTORY]: "bg-blue-500",
  [AiInterviewQuestionCategory.TECHNICAL]: "bg-purple-500",
  [AiInterviewQuestionCategory.CLOSING]: "bg-green-500",
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
  onStopRecording,
  onStartRecording,
  onSubmitAnswer,
  onCancel,
}: InterviewSessionProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const canRecord = !isAiSpeaking && !isProcessing && micPermission !== false;

  return (
    <div className="flex flex-col h-full max-h-screen p-4 space-y-4">
      {/* Header with Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge className={cn(categoryColors[currentCategory], "text-white")}>
              {categoryLabels[currentCategory]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
          <StatusIndicator status={status} />
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left: Current Question & Status */}
        <Card className="flex flex-col overflow-hidden">
          <CardContent className="flex-1 flex flex-col p-6 space-y-6 overflow-auto">
            {/* AI Speaking Indicator */}
            {isAiSpeaking && (
              <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Volume2 className="w-5 h-5 text-blue-500 animate-pulse" />
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  AI is speaking...
                </span>
              </div>
            )}

            {/* Current Question */}
            <div className="flex-1 flex flex-col justify-center min-h-[120px]">
              <p className="text-lg md:text-xl font-medium text-center leading-relaxed">
                &ldquo;{currentQuestionText}&rdquo;
              </p>
            </div>

            {/* Recording Status */}
            <div className="space-y-4">
              {/* Silence Timer */}
              {isRecording && (
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      silenceTimer <= 3
                        ? "bg-red-500 animate-pulse"
                        : "bg-green-500 animate-pulse"
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    {silenceTimer > 0
                      ? `Auto-submit in ${silenceTimer}s`
                      : "Submitting..."}
                  </span>
                </div>
              )}

              {/* Audio Visualizer */}
              <AudioVisualizer isActive={isRecording} />

              {/* Current Transcript Preview */}
              {currentTranscript && (
                <div className="p-4 bg-muted rounded-lg max-h-32 overflow-auto">
                  <p className="text-sm text-muted-foreground mb-1">
                    Your answer:
                  </p>
                  <p className="text-sm">{currentTranscript}</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <MicButton
                  isRecording={isRecording}
                  isDisabled={!canRecord}
                  isLoading={isProcessing}
                  onToggle={isRecording ? onStopRecording : onStartRecording}
                />

                {isRecording && (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={onSubmitAnswer}
                    className="gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Submit Answer
                  </Button>
                )}
              </div>

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Processing your answer...
                  </span>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </span>
                </div>
              )}

              {/* Microphone Permission Warning */}
              {micPermission === false && (
                <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <MicOff className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                    Microphone access denied. Please enable it in your browser
                    settings and refresh the page.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Transcript History */}
        <Card className="flex flex-col overflow-hidden">
          <CardContent className="flex-1 flex flex-col p-4 min-h-0">
            <h3 className="font-semibold mb-4 shrink-0">Interview Transcript</h3>
            <TranscriptDisplay
              messages={fullTranscript}
              className="flex-1 min-h-0"
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground hidden sm:block">
          Speak clearly and take your time with each answer
        </p>
        <Button variant="outline" onClick={onCancel}>
          <StopCircle className="w-4 h-4 mr-2" />
          End Interview
        </Button>
      </div>
    </div>
  );
}
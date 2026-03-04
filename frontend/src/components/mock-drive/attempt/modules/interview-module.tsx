// src/components/mock-drive/attempt/modules/interview-module.tsx
"use client";

import { FC, useEffect, useRef, useCallback, useState } from "react";
import { Check, Loader2, User, Bot, Mic, MicOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";
import {
  AiInterviewModuleConfig,
  AiInterviewModuleData,
  ModuleConfig,
  ModuleData,
} from "@/types/mockdrive.types";
import { useAttemptStore } from "@/lib/store/mock-drive/attempt-store";
import { useAudioRecorder } from "@/lib/hooks/use-audio-recorder";
import { useAudioPlayer } from "@/lib/hooks/use-audio-player";
import {
  MockInterviewProvider,
  useMockInterviewWS,
} from "@/lib/contexts/mock-interview-ws-context";
import { AIAvatar } from "../ai-interview/interview/ai-avatar";
import { AudioVisualizer } from "../ai-interview/interview/audio-visualizer";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface InterviewModuleProps {
  driveId: string;
  moduleId: string;
  config: ModuleConfig;
  data: Partial<ModuleData> | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// INNER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const InterviewModuleInner: FC<InterviewModuleProps> = ({
  config,
  data,
  onSubmit,
  isSubmitting,
}) => {
  const interviewConfig = config as AiInterviewModuleConfig;
  const interviewData = data as AiInterviewModuleData | null;

  const bottomRef = useRef<HTMLDivElement>(null);
  const { localModuleData, updateLocalModuleData } = useAttemptStore();
  const localData = localModuleData as AiInterviewModuleData | null;
  const moduleAttemptId = useAttemptStore((s) => s.currentModule?.moduleAttemptId);

  // ─── WS Context ───────────────────────────────────────────────────────────
  const {
    connect, disconnect,
    sendAudio, sendStartRecording, sendStopRecording, endInterview,
    isConnected, isConnecting,
    interviewState, currentQuestion, transcription,
    registerAudioHandler, registerAiDoneHandler,
  } = useMockInterviewWS();

  // ─── Connect on mount ─────────────────────────────────────────────────────
  const hasConnectedRef = useRef(false);
  useEffect(() => {
    if (moduleAttemptId && !hasConnectedRef.current) {
      hasConnectedRef.current = true;
      connect(moduleAttemptId);
    }
    return () => {
      hasConnectedRef.current = false;
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleAttemptId]);

  // ─── Derived state (computed early so refs stay in sync) ──────────────────
  const conversation = localData?.conversation || interviewData?.conversation || [];
  const responses = localData?.responses || interviewData?.responses || [];
  const targetQuestions = interviewConfig.targetQuestions;
  const questionsAnswered = responses.length;
  const isComplete = questionsAnswered >= targetQuestions;

  const isCompleteRef = useRef(false);
  isCompleteRef.current = isComplete;

  // ─── Recording ────────────────────────────────────────────────────────────
  const isTransitioningRef = useRef(false);

  // ─── Audio Recorder (must come before handlers that reference it) ─────────
  const { isRecording, startRecording, stopRecording, volume } = useAudioRecorder({
    onAudioData: (audioData) => { if (isConnected) sendAudio(audioData); },
  });

  // ─── Silence timer helpers (must come before handleStopRecording) ──────────
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearSilenceTimers = useCallback(() => {
    if (silenceTimeoutRef.current) { clearTimeout(silenceTimeoutRef.current); silenceTimeoutRef.current = null; }
    if (silenceIntervalRef.current) { clearInterval(silenceIntervalRef.current); silenceIntervalRef.current = null; }
    silenceStartRef.current = null;
    setSilenceCountdown(null);
  }, []);

  const handleStartRecording = useCallback(async () => {
    // Only block double-starts, NOT isAudioPlaying.
    // onPlaybackEnd fires while React state still shows isAudioPlaying=true
    // (batch update hasn't settled). Checking isAudioPlaying here would block
    // mic start for every question after the first.
    if (isTransitioningRef.current || isCompleteRef.current) return;
    isTransitioningRef.current = true;
    try {
      await startRecording();
      sendStartRecording();
    } catch {
      // mic permission denied → handle gracefully
    } finally {
      isTransitioningRef.current = false;
    }
  }, [startRecording, sendStartRecording]);

  const handleStopRecording = useCallback(() => {
    if (!isRecording || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    clearSilenceTimers();
    stopRecording();
    sendStopRecording();
    setTimeout(() => { isTransitioningRef.current = false; }, 600);
  }, [isRecording, stopRecording, sendStopRecording, clearSilenceTimers]);

  // ─── Audio Player ─────────────────────────────────────────────────────────
  const { isPlaying: isAudioPlaying, queueAudio, playAccumulated, isBuffering } = useAudioPlayer({
    onPlaybackEnd: () => {
      // Audio just finished — start mic.
      // Small delay so React can flush isPlaying=false before any state checks.
      setTimeout(() => {
        if (!isCompleteRef.current && !isTransitioningRef.current) {
          handleStartRecording();
        }
      }, 150);
    },
  });

  useEffect(() => registerAudioHandler((d) => queueAudio(d)), [registerAudioHandler, queueAudio]);
  useEffect(() => registerAiDoneHandler(() => playAccumulated()), [registerAiDoneHandler, playAccumulated]);




  useEffect(() => {
    const canVAD = isRecording && !isAudioPlaying && !isBuffering
      && interviewState !== "AI_PROCESSING" && !isSubmitting && !isCompleteRef.current
      && !isTransitioningRef.current;

    if (canVAD) {
      if (volume < 0.05) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
          setSilenceCountdown(3);
          silenceIntervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - (silenceStartRef.current ?? Date.now())) / 1000;
            setSilenceCountdown(Math.ceil(Math.max(0, 3 - elapsed)));
          }, 200);
          silenceTimeoutRef.current = setTimeout(() => {
            clearSilenceTimers();
            handleStopRecording();
          }, 3000);
        }
      } else {
        clearSilenceTimers();
      }
    } else {
      clearSilenceTimers();
    }
    return clearSilenceTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, isRecording, isAudioPlaying, isBuffering, interviewState, isSubmitting]);

  // ─── Conversation sync: commit user answer when next AI question arrives ──
  // This ensures ONLY the final submitted answer appears in the right panel.
  // Interim TRANSCRIPTION events update `transcription` state but are NOT pushed
  // to conversation — only shown in the italic bubble below the avatar.
  const pendingUserAnswerRef = useRef<string>("");
  const lastCommittedAiQuestionRef = useRef<string | null>(null);

  // Accumulate the latest transcription into the pending answer ref.
  // `transcription` is overwritten by each TRANSCRIPTION event, so the last
  // value before AI_PROCESSING transitions is the full final transcript.
  useEffect(() => {
    if (transcription) {
      pendingUserAnswerRef.current = transcription;
    }
  }, [transcription]);

  // When AI_SPEAKING fires with a new question:
  // 1. Commit the pending user answer to conversation (if any)
  // 2. Commit the new AI question to conversation
  useEffect(() => {
    if (!currentQuestion || currentQuestion === lastCommittedAiQuestionRef.current) return;

    lastCommittedAiQuestionRef.current = currentQuestion;
    const conv = localData?.conversation || interviewData?.conversation || [];
    const newEntries = [];

    // Commit user's answer first (if we have a pending one)
    const userAnswer = pendingUserAnswerRef.current.trim();
    if (userAnswer && !conv.some((m) => m.content === userAnswer && m.role === "user")) {
      newEntries.push({ id: nanoid(), role: "user" as const, content: userAnswer, timestamp: new Date().toISOString() });
    }
    pendingUserAnswerRef.current = ""; // Clear after committing

    // Commit the AI question
    if (!conv.some((m) => m.content === currentQuestion && m.role === "assistant")) {
      newEntries.push({ id: nanoid(), role: "assistant" as const, content: currentQuestion, timestamp: new Date().toISOString() });
    }

    if (newEntries.length > 0) {
      updateLocalModuleData({
        ...localData,
        conversation: [...conv, ...newEntries],
      } as Partial<AiInterviewModuleData>);
    }
  }, [currentQuestion]);

  // ─── Local data init ──────────────────────────────────────────────────────
  const isInitializedRef = useRef(false);
  useEffect(() => {
    if (!localData && interviewData && !isInitializedRef.current) {
      isInitializedRef.current = true;
      updateLocalModuleData(interviewData);
    }
  }, [localData, interviewData, updateLocalModuleData]);

  // ─── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [conversation.length]);

  // ─── Status helpers ───────────────────────────────────────────────────────
  type MicState = "connecting" | "disconnected" | "ai_speaking" | "ai_thinking" | "listening" | "idle";

  const getMicState = (): MicState => {
    if (!isConnected && isConnecting) return "connecting";
    if (!isConnected) return "disconnected";
    if (isAudioPlaying || isBuffering) return "ai_speaking";
    if (interviewState === "AI_PROCESSING") return "ai_thinking";
    if (isRecording) return "listening";
    return "idle";
  };

  const micState = getMicState();

  const STATUS: Record<MicState, { text: string; cls: string }> = {
    connecting: { text: "Connecting to server...", cls: "text-yellow-500 animate-pulse" },
    disconnected: { text: "Connection lost", cls: "text-red-500" },
    ai_speaking: { text: "AI is speaking...", cls: "text-primary animate-pulse" },
    ai_thinking: { text: "AI is thinking...", cls: "text-primary/70 animate-pulse" },
    listening: {
      text: silenceCountdown !== null
        ? `Listening — auto-submits in ${silenceCountdown}s`
        : "Listening... speak your answer",
      cls: silenceCountdown !== null && silenceCountdown <= 1
        ? "text-orange-500 font-semibold"
        : "text-red-500 animate-pulse",
    },
    idle: { text: "Tap mic to respond", cls: "text-muted-foreground" },
  };

  const currentStatus = STATUS[micState];
  const micDisabled = (micState === "ai_speaking" || micState === "ai_thinking"
    || micState === "connecting" || micState === "disconnected" || isSubmitting) && !isRecording;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-4 overflow-hidden">

      {/* ── Header ── */}
      <Card className="flex-shrink-0">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">AI Interview — {interviewConfig.jobTitle}</CardTitle>
              {interviewConfig.companyName && (
                <p className="text-xs text-muted-foreground">at {interviewConfig.companyName}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full transition-colors",
                isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-400 animate-pulse" : "bg-red-500"
              )} />
              <Badge variant="outline" className="text-xs">
                {questionsAnswered}/{targetQuestions} answered
              </Badge>
              {isComplete && <Badge className="bg-green-500 text-xs">Complete</Badge>}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ── Main Grid — fixed height, content scrolls inside ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">

        {/* ── Left: Avatar + Controls ── */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardContent className="flex-1 flex flex-col items-center justify-between p-6 min-h-0 overflow-hidden">

            {/* Status label */}
            <p className={cn("text-sm font-medium text-center transition-all flex-shrink-0 min-h-[1.5rem]", currentStatus.cls)}>
              {currentStatus.text}
            </p>

            {/* Avatar area */}
            <div className="flex flex-col items-center gap-3 flex-1 justify-center min-h-0 overflow-hidden py-2">
              <AIAvatar
                isSpeaking={isAudioPlaying || isBuffering}
                isListening={isRecording && !isAudioPlaying}
                isProcessing={interviewState === "AI_PROCESSING"}
              />

              <AudioVisualizer
                isActive={isRecording || isAudioPlaying}
                volume={isRecording ? volume : isAudioPlaying ? 0.5 : 0}
                className="w-full max-w-xs"
              />

              {/* Live transcription — ONLY here, italic + small */}
              {isRecording && transcription && (
                <div className="max-w-xs w-full px-3 py-1.5 bg-muted/60 rounded-xl border border-muted-foreground/15 animate-in fade-in">
                  <p className="text-xs text-muted-foreground italic line-clamp-2">
                    "{transcription}"
                  </p>
                </div>
              )}
            </div>

            {/* Mic controls */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              {!isComplete ? (
                <>
                  {/* Silence countdown ring */}
                  {silenceCountdown !== null && isRecording ? (
                    <div className="relative flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor"
                          className="text-muted-foreground/20" strokeWidth="4" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor"
                          className={silenceCountdown <= 1 ? "text-orange-500" : "text-red-500"}
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 26}`}
                          strokeDashoffset={`${2 * Math.PI * 26 * (silenceCountdown / 3)}`}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 0.2s linear" }}
                        />
                      </svg>
                      <span className={cn("absolute text-base font-bold",
                        silenceCountdown <= 1 ? "text-orange-500" : "text-red-500")}>
                        {silenceCountdown}
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      {isRecording && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-red-400/40" />
                      )}
                      <Button
                        variant={isRecording ? "destructive" : "default"}
                        size="icon"
                        className={cn("h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105",
                          isRecording ? "bg-red-500 hover:bg-red-600" : "")}
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        disabled={micDisabled}
                      >
                        {interviewState === "AI_PROCESSING" && !isRecording
                          ? <Loader2 className="h-5 w-5 animate-spin" />
                          : isRecording
                            ? <MicOff className="h-5 w-5 text-white" />
                            : <Mic className="h-5 w-5" />
                        }
                      </Button>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground text-center max-w-[160px] leading-tight">
                    {isRecording ? "3s pause = auto-submit" : "Tap mic to respond"}
                  </p>

                  <Button variant="ghost" size="sm"
                    onClick={() => { endInterview(); setTimeout(onSubmit, 500); }}
                    disabled={isSubmitting}
                    className="text-xs text-destructive hover:text-destructive mt-1">
                    End Interview Early
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-green-500 font-semibold text-sm">All questions answered!</p>
                  <Button onClick={onSubmit} disabled={isSubmitting} className="mt-2">
                    {isSubmitting
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                      : <><Check className="mr-2 h-4 w-4" />Submit Interview</>
                    }
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Right: Transcript ── scrolls internally, never grows the grid ── */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="py-3 flex-shrink-0 border-b">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Conversation Transcript
            </CardTitle>
          </CardHeader>

          {/* CardContent fills remaining height and clips overflow */}
          <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4 pb-6">
                {conversation.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    The conversation will appear here as the interview progresses.
                  </p>
                )}

                {conversation.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}>
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {msg.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>
                    <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "assistant" ? "bg-muted rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm")}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn("text-[10px] mt-1",
                        msg.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/60")}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* AI thinking indicator */}
                {interviewState === "AI_PROCESSING" && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Thinking</span>
                      <span className="flex gap-1 ml-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* ── Footer ── */}
      {!isComplete && (
        <div className="flex-shrink-0 flex justify-end">
          <Button variant="outline" size="sm"
            onClick={onSubmit}
            disabled={isSubmitting || interviewState === "AI_PROCESSING"}>
            {isSubmitting
              ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Submitting...</>
              : "Finish & Submit"
            }
          </Button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
export const InterviewModule: FC<InterviewModuleProps> = (props) => (
  <MockInterviewProvider>
    <InterviewModuleInner {...props} />
  </MockInterviewProvider>
);

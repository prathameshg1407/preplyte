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

  const scrollAreaRef = useRef<HTMLDivElement>(null);
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

  // ─── Audio Player ─────────────────────────────────────────────────────────
  const isTransitioningRef = useRef(false);
  const isCompleteRef = useRef(false);

  const {
    isPlaying: isAudioPlaying,
    queueAudio,
    playAccumulated,
    isBuffering,
  } = useAudioPlayer({
    onPlaybackEnd: () => {
      if (!isCompleteRef.current && !isTransitioningRef.current) {
        handleStartRecording();
      }
    },
  });

  useEffect(() => registerAudioHandler((d) => queueAudio(d)), [registerAudioHandler, queueAudio]);
  useEffect(() => registerAiDoneHandler(() => playAccumulated()), [registerAiDoneHandler, playAccumulated]);

  // ─── Audio Recorder ───────────────────────────────────────────────────────
  const { isRecording, startRecording, stopRecording, volume } = useAudioRecorder({
    onAudioData: (audioData) => {
      if (isConnected) sendAudio(audioData);
    },
  });

  // ─── Silence VAD with countdown ───────────────────────────────────────────
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

  useEffect(() => {
    const isComplete_ = isCompleteRef.current;
    const shouldRunVAD = isRecording && !isAudioPlaying && !isBuffering
      && interviewState !== "AI_PROCESSING" && !isSubmitting && !isComplete_
      && !isTransitioningRef.current;

    if (shouldRunVAD) {
      if (volume < 0.05) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
          setSilenceCountdown(3);
          // Tick the countdown every 200ms
          silenceIntervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - (silenceStartRef.current ?? Date.now())) / 1000;
            const remaining = Math.ceil(Math.max(0, 3 - elapsed));
            setSilenceCountdown(remaining);
          }, 200);
          // Auto-submit after 3s silence
          silenceTimeoutRef.current = setTimeout(() => {
            clearSilenceTimers();
            handleStopRecording();
          }, 3000);
        }
      } else {
        // Voice detected — reset silence timer
        clearSilenceTimers();
      }
    } else {
      clearSilenceTimers();
    }
    return clearSilenceTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, isRecording, isAudioPlaying, isBuffering, interviewState, isSubmitting]);

  // ─── Recording handlers ───────────────────────────────────────────────────
  const handleStartRecording = useCallback(async () => {
    if (isAudioPlaying || isBuffering || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    try {
      await startRecording();
      sendStartRecording();
    } finally {
      isTransitioningRef.current = false;
    }
  }, [isAudioPlaying, isBuffering, startRecording, sendStartRecording]);

  const handleStopRecording = useCallback(() => {
    if (!isRecording || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    clearSilenceTimers();
    stopRecording();
    sendStopRecording();
    setTimeout(() => { isTransitioningRef.current = false; }, 600);
  }, [isRecording, stopRecording, sendStopRecording, clearSilenceTimers]);

  // ─── Auto-start mic when INTERVIEWING state (reconnect resume) ────────────
  const prevInterviewStateRef = useRef("");
  useEffect(() => {
    const changed = interviewState !== prevInterviewStateRef.current;
    prevInterviewStateRef.current = interviewState;
    if (
      changed && interviewState === "INTERVIEWING"
      && !isAudioPlaying && !isBuffering && !isRecording
      && !isTransitioningRef.current && !isCompleteRef.current
    ) {
      const t = setTimeout(() => handleStartRecording(), 400);
      return () => clearTimeout(t);
    }
  }, [interviewState]);

  // ─── Real-time conversation sync from WS events ───────────────────────────
  const lastAiQuestionRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      currentQuestion && currentQuestion !== lastAiQuestionRef.current
      && interviewState === "AI_SPEAKING"
    ) {
      lastAiQuestionRef.current = currentQuestion;
      const conv = localData?.conversation || interviewData?.conversation || [];
      if (!conv.some((m) => m.content === currentQuestion && m.role === "assistant")) {
        updateLocalModuleData({
          ...localData,
          conversation: [...conv, { id: nanoid(), role: "assistant", content: currentQuestion, timestamp: new Date().toISOString() }],
        } as Partial<AiInterviewModuleData>);
      }
    }
  }, [currentQuestion, interviewState]);

  const lastUserTranscriptRef = useRef<string | null>(null);
  useEffect(() => {
    // Only push user message to conversation when FINAL transcript + AI starts processing
    if (
      transcription && transcription !== lastUserTranscriptRef.current
      && interviewState === "AI_PROCESSING"
    ) {
      lastUserTranscriptRef.current = transcription;
      const conv = localData?.conversation || interviewData?.conversation || [];
      if (!conv.some((m) => m.content === transcription && m.role === "user")) {
        updateLocalModuleData({
          ...localData,
          conversation: [...conv, { id: nanoid(), role: "user", content: transcription, timestamp: new Date().toISOString() }],
        } as Partial<AiInterviewModuleData>);
      }
    }
  }, [transcription, interviewState]);

  // ─── Local data sync ──────────────────────────────────────────────────────
  const isInitializedRef = useRef(false);
  useEffect(() => {
    if (!localData && interviewData && !isInitializedRef.current) {
      isInitializedRef.current = true;
      updateLocalModuleData(interviewData);
    }
  }, [localData, interviewData, updateLocalModuleData]);

  // ─── Derived state ────────────────────────────────────────────────────────
  const conversation = localData?.conversation || interviewData?.conversation || [];
  const responses = localData?.responses || interviewData?.responses || [];
  const targetQuestions = interviewConfig.targetQuestions;
  const questionsAnswered = responses.length;
  const isComplete = questionsAnswered >= targetQuestions;
  isCompleteRef.current = isComplete;

  // Auto-scroll transcript when conversation grows
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [conversation.length]);

  // ─── Status helpers ───────────────────────────────────────────────────────
  const getMicState = () => {
    if (!isConnected && isConnecting) return "connecting";
    if (!isConnected) return "disconnected";
    if (isAudioPlaying || isBuffering) return "ai_speaking";
    if (interviewState === "AI_PROCESSING") return "ai_thinking";
    if (isRecording) return "listening";
    return "idle";
  };

  const micState = getMicState();

  const statusLabel: Record<string, { text: string; cls: string }> = {
    connecting: { text: "Connecting to server...", cls: "text-yellow-500 animate-pulse" },
    disconnected: { text: "Connection lost", cls: "text-red-500" },
    ai_speaking: { text: "AI is speaking...", cls: "text-primary animate-pulse" },
    ai_thinking: { text: "AI is thinking...", cls: "text-primary/70 animate-pulse" },
    listening: {
      text: silenceCountdown !== null
        ? `Listening — auto-submits in ${silenceCountdown}s`
        : "Listening... (speak your answer)",
      cls: silenceCountdown !== null && silenceCountdown <= 1 ? "text-orange-500 font-semibold" : "text-red-500 animate-pulse",
    },
    idle: { text: "Click mic or speak to respond", cls: "text-muted-foreground" },
  };

  const currentStatus = statusLabel[micState] ?? statusLabel.idle;
  const micDisabled = micState === "ai_speaking" || micState === "ai_thinking"
    || micState === "connecting" || micState === "disconnected" || isSubmitting;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-4">
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
              <div
                className={cn("w-2 h-2 rounded-full transition-colors",
                  isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-400 animate-pulse" : "bg-red-500"
                )}
                title={isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
              />
              <Badge variant="outline" className="text-xs">
                {questionsAnswered}/{targetQuestions} answered
              </Badge>
              {isComplete && <Badge className="bg-green-500 text-xs">Complete</Badge>}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ── Main Grid ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">

        {/* ── Left: Avatar + Controls ── */}
        <Card className="flex flex-col overflow-hidden">
          <CardContent className="flex-1 flex flex-col items-center justify-between p-6 min-h-0">

            {/* Top: status label */}
            <p className={cn("text-sm font-medium text-center transition-all min-h-[1.5rem]", currentStatus.cls)}>
              {currentStatus.text}
            </p>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4 flex-1 justify-center">
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

              {/* Live transcription bubble — ONLY here, not in right panel */}
              {isRecording && transcription && (
                <div className="max-w-xs w-full px-4 py-2 bg-muted rounded-xl border border-muted-foreground/20 animate-in fade-in">
                  <p className="text-xs text-muted-foreground italic truncate">
                    "{transcription}"
                  </p>
                </div>
              )}
            </div>

            {/* Bottom: Mic button + silence ring */}
            {!isComplete ? (
              <div className="flex flex-col items-center gap-3">
                {/* Silence countdown ring */}
                {silenceCountdown !== null && isRecording && (
                  <div className="relative flex items-center justify-center">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor"
                        className="text-muted-foreground/20" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="none"
                        stroke="currentColor"
                        className={silenceCountdown <= 1 ? "text-orange-500" : "text-red-500"}
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (silenceCountdown / 3)}`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.2s linear" }}
                      />
                    </svg>
                    <span className={cn("absolute text-lg font-bold",
                      silenceCountdown <= 1 ? "text-orange-500" : "text-red-500"
                    )}>
                      {silenceCountdown}
                    </span>
                  </div>
                )}

                {/* Mic button */}
                {silenceCountdown === null && (
                  <div className="relative">
                    {isRecording && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-red-400/50" />
                    )}
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      size="icon"
                      className={cn(
                        "h-16 w-16 rounded-full shadow-lg transition-all hover:scale-105",
                        isRecording ? "bg-red-500 hover:bg-red-600" : "",
                      )}
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      disabled={micDisabled && !isRecording}
                    >
                      {interviewState === "AI_PROCESSING" && !isRecording ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : isRecording ? (
                        <MicOff className="h-6 w-6 text-white" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground text-center leading-tight max-w-[180px]">
                  {isRecording
                    ? "Speak now — pausing 3s will auto-submit"
                    : "Tap mic or speak to answer"}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { endInterview(); setTimeout(onSubmit, 500); }}
                  disabled={isSubmitting}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  End Interview Early
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-green-500 font-semibold">All questions answered!</p>
                <Button onClick={onSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Submit Interview
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Right: Conversation Transcript ── */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="py-3 flex-shrink-0 border-b">
            <CardTitle className="text-sm text-muted-foreground font-medium">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4 pb-6">
                {conversation.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    The conversation will appear here as the interview progresses.
                  </p>
                )}

                {conversation.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2.5",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    {/* Avatar icon */}
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                      message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {message.role === "assistant"
                        ? <Bot className="h-3.5 w-3.5" />
                        : <User className="h-3.5 w-3.5" />
                      }
                    </div>

                    {/* Message bubble */}
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      message.role === "assistant"
                        ? "bg-muted rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={cn(
                        "text-[10px] mt-1",
                        message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/60"
                      )}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* AI thinking indicator */}
                {interviewState === "AI_PROCESSING" && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Thinking</span>
                      <span className="flex gap-1">
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

      {/* ── Footer submit ── */}
      {!isComplete && (
        <div className="flex-shrink-0 flex justify-end pt-1">
          <Button variant="outline" onClick={onSubmit} disabled={isSubmitting || interviewState === "AI_PROCESSING"} size="sm">
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
// EXPORTED WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
export const InterviewModule: FC<InterviewModuleProps> = (props) => (
  <MockInterviewProvider>
    <InterviewModuleInner {...props} />
  </MockInterviewProvider>
);

// src/components/mock-drive/attempt/modules/interview-module.tsx
"use client";

import { FC, useEffect, useRef, useCallback, useState } from "react";
import { Check, Loader2, User, Bot, Mic, MicOff, Play } from "lucide-react";
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
    isPlaying: isAudioPlaying, isBuffering, isPendingPlayback,
    resumeContext,
  } = useMockInterviewWS();

  // ─── Derived state ────────────────────────────────────────────────────────
  const conversation = localData?.conversation || interviewData?.conversation || [];
  const responses = localData?.responses || interviewData?.responses || [];
  const targetQuestions = interviewConfig.targetQuestions;
  const questionsAnswered = responses.length;
  const isComplete = questionsAnswered >= targetQuestions;
  const isCompleteRef = useRef(false);
  isCompleteRef.current = isComplete;

  // ─── Begin Interview state ─────────────────────────────────────────────────
  // "hasBegun" shows the Begin overlay. Clicking Begin is a user gesture = AudioContext unlocked.
  const [hasBegun, setHasBegun] = useState(false);
  const micStartedRef = useRef(false);

  // ─── Persistent mic ────────────────────────────────────────────────────────
  // The mic starts ONCE when the user clicks "Begin Interview" and stays open.
  // IMPORTANT: We only send audio to the backend when isAnswering=true.
  // Sending audio while AI is speaking caused backend WS instability (1005 closes)
  // because the binary message handler ran concurrently with async TTS streaming.
  const { isRecording, startRecording, stopRecording, volume } = useAudioRecorder({
    onAudioData: (audioData) => {
      // Only send audio when it's the user's turn — backend gates it too,
      // but sending always caused WS instability during AI speaking
      if (isConnected && isAnsweringRef.current) sendAudio(audioData);
    },
  });

  // ─── isAnswering: backend is listening to our answer ──────────────────────
  // This replaces using isRecording as a proxy for "user's turn".
  // isRecording is always true once mic starts; isAnswering tracks conversation state.
  const [isAnswering, setIsAnswering] = useState(false);
  const isAnsweringRef = useRef(false);
  isAnsweringRef.current = isAnswering;

  // ─── Connection ────────────────────────────────────────────────────────────
  const hasConnectedRef = useRef(false);
  // Connection is initiated inside handleBeginInterview (below), NOT on mount.
  // This ensures the AudioContext is unlocked by a user gesture BEFORE the WS
  // connects and before the backend sends first-question audio chunks.

  useEffect(() => {
    return () => {
      hasConnectedRef.current = false;
      // Release mic on unmount
      if (micStartedRef.current) stopRecording();
      disconnect();
    };
  }, [disconnect, stopRecording]);

  // ─── Begin Interview ────────────────────────────────────────────────────────
  const handleBeginInterview = useCallback(async () => {
    if (hasConnectedRef.current) return; // prevent double-click
    setHasBegun(true);

    // Step 1: Resume AudioContext WITH this user gesture.
    // This MUST happen before the WS connects so that when audio chunks
    // arrive (first question TTS), the AudioContext is already running.
    try { await resumeContext(); } catch { /* ignore */ }

    // Step 2: Start mic permanently (keeps it warm between turns)
    if (!micStartedRef.current && !isRecording) {
      micStartedRef.current = true;
      try { await startRecording(); } catch { micStartedRef.current = false; }
    }

    // Step 3: Connect AFTER AudioContext is unlocked.
    // Backend will immediately start generating + speaking the first question.
    // By then AudioContext is ready, so audio chunks will actually play.
    if (moduleAttemptId && !hasConnectedRef.current) {
      hasConnectedRef.current = true;
      connect(moduleAttemptId);
    }
  }, [resumeContext, startRecording, connect, isRecording, moduleAttemptId]);

  // ─── Silence timers ────────────────────────────────────────────────────────
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

  // ─── Submit answer (stop current answer turn) ─────────────────────────────
  const handleSubmitAnswer = useCallback(() => {
    if (!isAnsweringRef.current) return;
    clearSilenceTimers();
    setIsAnswering(false);
    sendStopRecording();
  }, [clearSilenceTimers, sendStopRecording]);

  // ─── Auto-send START_RECORDING when user's turn begins ────────────────────
  // isUserTurn = conditions for when the user should be speaking
  const isUserTurn =
    hasBegun &&
    isConnected &&
    isRecording && // mic must be active
    !isAudioPlaying &&
    !isPendingPlayback &&
    interviewState === "INTERVIEWING" &&
    !isSubmitting &&
    !isComplete;

  const prevIsUserTurnRef = useRef(false);
  useEffect(() => {
    if (isUserTurn && !prevIsUserTurnRef.current) {
      console.log("[InterviewModule] Transitioning to User Turn", {
        hasBegun, isConnected, isRecording, isAudioPlaying, isPendingPlayback, interviewState
      });
      setIsAnswering(true);
      sendStartRecording();
    }
    prevIsUserTurnRef.current = isUserTurn;
  }, [isUserTurn, sendStartRecording, hasBegun, isConnected, isRecording, isAudioPlaying, isPendingPlayback, interviewState]);

  // ─── Clear isAnswering when AI takes over ─────────────────────────────────
  useEffect(() => {
    if (interviewState === "AI_PROCESSING" || interviewState === "AI_SPEAKING") {
      if (isAnsweringRef.current) {
        setIsAnswering(false);
        clearSilenceTimers();
      }
    }
  }, [interviewState, clearSilenceTimers]);

  // ─── VAD: silence-based auto-submit ───────────────────────────────────────
  useEffect(() => {
    const canVAD = isAnswering && !isAudioPlaying && !isPendingPlayback
      && !isSubmitting && !isCompleteRef.current;

    if (canVAD) {
      if (volume < 0.05) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
          setSilenceCountdown(5);
          silenceIntervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - (silenceStartRef.current ?? Date.now())) / 1000;
            setSilenceCountdown(Math.ceil(Math.max(0, 5 - elapsed)));
          }, 200);
          silenceTimeoutRef.current = setTimeout(() => {
            clearSilenceTimers();
            handleSubmitAnswer();
          }, 5000);
        }
      } else {
        clearSilenceTimers();
      }
    } else {
      clearSilenceTimers();
    }
    return clearSilenceTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, isAnswering, isAudioPlaying, isPendingPlayback, isSubmitting]);

  // ─── Conversation sync ────────────────────────────────────────────────────
  const pendingUserAnswerRef = useRef<string>("");
  const lastCommittedAiQuestionRef = useRef<string | null>(null);

  // Accumulate transcription into pending answer ref
  useEffect(() => {
    if (transcription && transcription.trim().length > 0) {
      pendingUserAnswerRef.current = transcription;
    }
  }, [transcription]);

  // Commit entries when a new AI question arrives
  useEffect(() => {
    const qTrim = currentQuestion?.trim();
    if (!qTrim || qTrim === lastCommittedAiQuestionRef.current?.trim()) return;
    lastCommittedAiQuestionRef.current = qTrim;
    
    const conv = localData?.conversation || interviewData?.conversation || [];
    const newEntries = [];

    const userAnswer = pendingUserAnswerRef.current.trim();
    if (userAnswer && !conv.some((m) => m.role === "user" && m.content.trim() === userAnswer)) {
      newEntries.push({ id: nanoid(), role: "user" as const, content: userAnswer, timestamp: new Date().toISOString() });
    }
    pendingUserAnswerRef.current = "";

    if (!conv.some((m) => m.role === "assistant" && m.content.trim() === qTrim)) {
      newEntries.push({ id: nanoid(), role: "assistant" as const, content: qTrim, timestamp: new Date().toISOString() });
    }

    if (newEntries.length > 0) {
      updateLocalModuleData({
        ...localData,
        conversation: [...conv, ...newEntries],
      } as Partial<AiInterviewModuleData>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ─── Status helpers ────────────────────────────────────────────────────────
  type MicState = "connecting" | "disconnected" | "ai_speaking" | "ai_thinking" | "answering" | "waiting";

  const getMicState = (): MicState => {
    if (isConnecting) return "connecting";
    if (!isConnected) return "disconnected";
    if (isAudioPlaying || isBuffering || isPendingPlayback) return "ai_speaking";
    if (interviewState === "AI_PROCESSING") return "ai_thinking";
    if (isAnswering) return "answering";
    return "waiting";
  };

  const micState = getMicState();

  const STATUS: Record<MicState, { text: string; cls: string }> = {
    connecting: { text: "Connecting to server...", cls: "text-yellow-500 animate-pulse" },
    disconnected: { text: "Connection lost", cls: "text-red-500" },
    ai_speaking: { text: "AI is speaking...", cls: "text-primary animate-pulse" },
    ai_thinking: { text: "AI is thinking...", cls: "text-primary/70 animate-pulse" },
    answering: {
      text: silenceCountdown !== null
        ? `Listening — auto-submits in ${silenceCountdown}s`
        : "Listening... speak your answer",
      cls: silenceCountdown !== null && silenceCountdown <= 1
        ? "text-orange-500 font-semibold"
        : "text-red-500 animate-pulse",
    },
    waiting: { text: "Waiting for AI...", cls: "text-muted-foreground animate-pulse" },
  };

  const currentStatus = STATUS[micState];

  // ─────────────────────────────────────────────────────────────────────────
  // BEGIN OVERLAY — shown until user clicks "Begin Interview"
  // ─────────────────────────────────────────────────────────────────────────
  if (!hasBegun) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-6 p-6">
        <div className="max-w-md w-full p-8 bg-card rounded-2xl border shadow-lg text-center space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Ready to Begin?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Make sure your <strong>microphone is connected</strong> and your <strong>volume is turned up</strong>.
              The AI will speak the first question automatically once you click Begin.
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-sm text-muted-foreground space-y-1">
            <p>🎤 Speak your answer clearly</p>
            <p>⏱️ 5 seconds of silence = auto-submit</p>
            <p>🔘 Tap mic button to submit early</p>
          </div>
          <Button
            size="lg"
            className="w-full h-12 text-base gap-2"
            onClick={handleBeginInterview}
            disabled={hasBegun}
          >
            {isConnecting ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Connecting...</>
            ) : (
              <><Play className="h-4 w-4" />Begin Interview</>
            )}
          </Button>
          {/* Connection dot */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className={cn("w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-400 animate-pulse" : "bg-muted"
            )} />
            {isConnected ? "Connected" : isConnecting ? "Connecting to server..." : "System Ready"}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN INTERVIEW UI
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

      {/* ── Main Grid ── */}
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
                isSpeaking={isAudioPlaying || isBuffering || isPendingPlayback}
                isListening={isAnswering}
                isProcessing={interviewState === "AI_PROCESSING"}
              />

              <AudioVisualizer
                isActive={isAnswering || isAudioPlaying}
                volume={isAnswering ? volume : isAudioPlaying ? 0.5 : 0}
                className="w-full max-w-xs"
              />

              {/* Live transcription — shows while listening */}
              {isAnswering && transcription && (
                <div className="max-w-xs w-full px-3 py-1.5 bg-muted/60 rounded-xl border border-muted-foreground/15 animate-in fade-in">
                  <p className="text-xs text-muted-foreground italic line-clamp-2">
                    &ldquo;{transcription}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              {!isComplete ? (
                <>
                  {/* Silence countdown ring — replaces mic button when counting down */}
                  {silenceCountdown !== null && isAnswering ? (
                    <div className="relative flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor"
                          className="text-muted-foreground/20" strokeWidth="4" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor"
                          className={silenceCountdown <= 1 ? "text-orange-500" : "text-red-500"}
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 26}`}
                          strokeDashoffset={`${2 * Math.PI * 26 * (silenceCountdown / 5)}`}
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
                      {/* Pulsing ring while listening */}
                      {isAnswering && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-red-400/40" />
                      )}
                      <Button
                        variant={isAnswering ? "destructive" : "default"}
                        size="icon"
                        className={cn("h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105",
                          isAnswering ? "bg-red-500 hover:bg-red-600" : "")}
                        onClick={isAnswering ? handleSubmitAnswer : undefined}
                        disabled={!isAnswering || isSubmitting || micState === "ai_speaking" || micState === "ai_thinking"}
                        title={isAnswering ? "Submit answer now" : currentStatus.text}
                      >
                        {micState === "ai_thinking" && !isAnswering
                          ? <Loader2 className="h-5 w-5 animate-spin" />
                          : isAnswering
                            ? <MicOff className="h-5 w-5 text-white" />
                            : <Mic className="h-5 w-5" />
                        }
                      </Button>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground text-center max-w-[160px] leading-tight">
                    {isAnswering ? "5s pause = auto-submit" : currentStatus.text}
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

        {/* ── Right: Transcript ── */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="py-3 flex-shrink-0 border-b">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Conversation Transcript
            </CardTitle>
          </CardHeader>

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

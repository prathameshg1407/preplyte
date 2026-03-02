// src/components/mock-drive/attempt/modules/interview-module.tsx
// Mirrors practice interview (interview-room.tsx) architecture for real-time conversation

"use client";

import { FC, useEffect, useRef, useCallback } from "react";
import { Square, Check, Loader2, User, Bot, Mic, MicOff } from "lucide-react";
import { nanoid } from "nanoid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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

// =====================================================
// PROPS
// =====================================================

interface InterviewModuleProps {
  driveId: string;
  moduleId: string;
  config: ModuleConfig;
  data: Partial<ModuleData> | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// =====================================================
// INNER COMPONENT (wrapped by MockInterviewProvider)
// =====================================================

export const InterviewModuleInner: FC<InterviewModuleProps> = ({
  driveId,
  moduleId,
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

  // The WS gateway queries MockDriveModuleAttempt by its ID
  const moduleAttemptId = useAttemptStore((s) => s.currentModule?.moduleAttemptId);

  // =====================================================
  // WS CONTEXT
  // =====================================================

  const {
    connect,
    disconnect,
    sendAudio,
    sendStartRecording,
    sendStopRecording,
    endInterview,
    isConnected,
    isConnecting,
    interviewState,
    currentQuestion,
    transcription,
    registerAudioHandler,
    registerAiDoneHandler,
  } = useMockInterviewWS();

  // =====================================================
  // CONNECT ON MOUNT
  // =====================================================

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

  // =====================================================
  // AUDIO PLAYER
  // =====================================================

  const isTransitioningRef = useRef(false);
  // Track isComplete with a ref to avoid stale closure inside useAudioPlayer callbacks
  const isCompleteRef = useRef(false);
  // isComplete is derived below but we need an early ref update pattern;
  // we set this after deriving conversation/responses.
  const {
    isPlaying: isAudioPlaying,
    queueAudio,
    playAccumulated,
    stop: stopAudio,
    isBuffering,
  } = useAudioPlayer({
    onPlaybackEnd: () => {
      // AI finished speaking — auto-start mic for user's response
      if (!isCompleteRef.current && !isTransitioningRef.current) {
        handleStartRecording();
      }
    },
  });

  // Queue audio chunks as they stream from the server
  useEffect(() => {
    return registerAudioHandler((data) => {
      queueAudio(data);
    });
  }, [registerAudioHandler, queueAudio]);

  // When server signals AI is done streaming, play all queued audio
  useEffect(() => {
    return registerAiDoneHandler(() => {
      playAccumulated();
    });
  }, [registerAiDoneHandler, playAccumulated]);

  // =====================================================
  // AUDIO RECORDER — streams binary chunks in real-time
  // =====================================================

  const { isRecording, startRecording, stopRecording, volume } = useAudioRecorder({
    onAudioData: (audioData) => {
      // Mirror practice interview: stream binary chunks directly to gateway
      if (isConnected) {
        sendAudio(audioData);
      }
    },
  });

  // =====================================================
  // SILENCE DETECTION (VAD)
  // =====================================================

  const silenceStartRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isComplete_ = (localData?.responses?.length ?? 0) >= (interviewConfig?.targetQuestions ?? 0);

    if (
      isRecording &&
      !isAudioPlaying &&
      interviewState !== "AI_PROCESSING" &&
      !isSubmitting &&
      !isComplete_ &&
      !isTransitioningRef.current
    ) {
      if (volume < 0.05) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
          silenceTimeoutRef.current = setTimeout(() => {
            silenceStartRef.current = null;
            handleStopRecording();
          }, 3000); // 3-second silence → stop recording
        }
      } else {
        // User is speaking — reset silence timer
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        silenceStartRef.current = null;
      }
    } else {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      silenceStartRef.current = null;
    }

    return () => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, [volume, isRecording, isAudioPlaying, interviewState, isSubmitting]);

  // =====================================================
  // RECORDING HANDLERS
  // =====================================================

  const handleStartRecording = useCallback(async () => {
    if (isAudioPlaying || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    await startRecording();
    sendStartRecording(); // Tell server we're listening
    isTransitioningRef.current = false;
  }, [isAudioPlaying, startRecording, sendStartRecording]);

  const handleStopRecording = useCallback(() => {
    if (!isRecording || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    stopRecording();
    sendStopRecording(); // Tell server to process accumulated transcript
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 500);
  }, [isRecording, stopRecording, sendStopRecording]);

  // Auto-start mic when interview transitions to INTERVIEWING state without audio
  // (e.g., after a reconnect where session_state fires but no audio plays)
  const prevInterviewStateRef = useRef<string>("");
  useEffect(() => {
    const changed = interviewState !== prevInterviewStateRef.current;
    prevInterviewStateRef.current = interviewState;
    if (
      changed &&
      interviewState === "INTERVIEWING" &&
      !isAudioPlaying &&
      !isBuffering &&
      !isRecording &&
      !isTransitioningRef.current &&
      !isComplete
    ) {
      // Short delay to let UI settle before starting mic
      const t = setTimeout(() => handleStartRecording(), 300);
      return () => clearTimeout(t);
    }
  }, [interviewState]);

  // =====================================================
  // REAL-TIME CONVERSATION SYNC FROM WS EVENTS
  // =====================================================

  // The Zustand store only updates via REST. To show real-time conversation,
  // we push messages to localModuleData as WS events arrive.

  const lastAiQuestionRef = useRef<string | null>(null);

  useEffect(() => {
    // When AI_SPEAKING fires, currentQuestion updates
    // Push the new assistant message to the local conversation immediately
    if (
      currentQuestion &&
      currentQuestion !== lastAiQuestionRef.current &&
      interviewState === "AI_SPEAKING"
    ) {
      lastAiQuestionRef.current = currentQuestion;
      const currentConv = localData?.conversation || interviewData?.conversation || [];
      const alreadyExists = currentConv.some((m) => m.content === currentQuestion && m.role === "assistant");
      if (!alreadyExists) {
        const newMsg = {
          id: nanoid(),
          role: "assistant" as const,
          content: currentQuestion,
          timestamp: new Date().toISOString(),
        };
        updateLocalModuleData({
          ...localData,
          conversation: [...currentConv, newMsg],
        } as Partial<AiInterviewModuleData>);
      }
    }
  }, [currentQuestion, interviewState]);

  const lastUserTranscriptRef = useRef<string | null>(null);

  useEffect(() => {
    // When TRANSCRIPTION_FINAL fires and AI starts processing, push user message
    if (
      transcription &&
      transcription !== lastUserTranscriptRef.current &&
      interviewState === "AI_PROCESSING"
    ) {
      lastUserTranscriptRef.current = transcription;
      const currentConv = localData?.conversation || interviewData?.conversation || [];
      const alreadyExists = currentConv.some((m) => m.content === transcription && m.role === "user");
      if (!alreadyExists) {
        const newMsg = {
          id: nanoid(),
          role: "user" as const,
          content: transcription,
          timestamp: new Date().toISOString(),
        };
        updateLocalModuleData({
          ...localData,
          conversation: [...currentConv, newMsg],
        } as Partial<AiInterviewModuleData>);
      }
    }
  }, [transcription, interviewState]);

  const isInitializedRef = useRef(false);
  useEffect(() => {
    if (!localData && interviewData && !isInitializedRef.current) {
      isInitializedRef.current = true;
      updateLocalModuleData(interviewData);
    }
  }, [localData, interviewData, updateLocalModuleData]);

  // Auto-scroll transcript
  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const conversation = localData?.conversation || interviewData?.conversation || [];
  const responses = localData?.responses || interviewData?.responses || [];
  const targetQuestions = interviewConfig.targetQuestions;
  const questionsAnswered = responses.length;
  const isComplete = questionsAnswered >= targetQuestions;
  // Keep ref in sync so callbacks always have the latest value
  isCompleteRef.current = isComplete;

  useEffect(() => {
    scrollToBottom();
  }, [conversation.length]);

  // =====================================================
  // STATE LABELS
  // =====================================================

  const getStatusLabel = () => {
    if (!isConnected && isConnecting) return { text: "Connecting...", cls: "text-yellow-500 animate-pulse" };
    if (!isConnected) return { text: "Disconnected", cls: "text-red-500" };
    if (isAudioPlaying || isBuffering) return { text: "AI Speaking...", cls: "text-primary animate-pulse" };
    if (interviewState === "AI_PROCESSING") return { text: "AI Thinking...", cls: "text-primary animate-pulse" };
    if (isRecording) return { text: "Listening... (3s silence to submit)", cls: "text-red-500 animate-pulse" };
    if (transcription) return { text: "Processing your response...", cls: "text-yellow-500" };
    if (interviewState === "READY" || interviewState === "INTERVIEWING") return { text: "Your turn to speak", cls: "text-muted-foreground" };
    return { text: "Initializing...", cls: "text-muted-foreground" };
  };

  const status = getStatusLabel();
  const isInteractionDisabled = interviewState === "AI_PROCESSING" || isAudioPlaying || isBuffering || isSubmitting || !isConnected;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">AI Interview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {interviewConfig.jobTitle}
                {interviewConfig.companyName && ` at ${interviewConfig.companyName}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection status indicator */}
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500 animate-pulse" : "bg-red-500"
              )} title={isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"} />
              <Badge variant="outline">
                {questionsAnswered}/{targetQuestions} Questions
              </Badge>
              {isComplete && (
                <Badge variant="default" className="bg-green-500">Complete</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
        {/* Left pane: Avatar + Visualizer + Controls */}
        <Card className="h-full flex flex-col justify-center items-center p-8 bg-muted/20 relative">
          {/* Status label */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-sm font-medium">
            <span className={status.cls}>{status.text}</span>
            <span className="text-muted-foreground text-xs">Voice Mode</span>
          </div>

          {/* AI Avatar */}
          <AIAvatar
            isSpeaking={isAudioPlaying || isBuffering}
            isListening={isRecording}
            isProcessing={interviewState === "AI_PROCESSING" || isTransitioningRef.current}
          />

          {/* Waveform */}
          <div className="mt-8 h-20 w-full max-w-sm flex items-center justify-center">
            <AudioVisualizer
              isActive={isRecording || isAudioPlaying}
              volume={isRecording ? volume : isAudioPlaying ? 0.5 : 0}
            />
          </div>

          {/* Live transcription bubble */}
          {transcription && isRecording && (
            <div className="mt-4 px-4 py-2 bg-muted rounded-lg max-w-sm animate-in fade-in">
              <p className="text-sm text-muted-foreground italic">"{transcription}"</p>
            </div>
          )}

          {/* Buffering indicator */}
          {isBuffering && !isAudioPlaying && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Receiving audio...</span>
            </div>
          )}

          {!isComplete ? (
            <div className="mt-8 flex flex-col items-center gap-4">
              {/* Mic button */}
              <div className="relative">
                {isRecording && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" />
                )}
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="icon"
                  className={cn(
                    "h-20 w-20 rounded-full shadow-lg transition-all transform hover:scale-105",
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90",
                  )}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isInteractionDisabled && !isRecording}
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8 text-white" />
                  ) : interviewState === "AI_PROCESSING" ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Mic className="h-8 w-8 text-white" />
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {isRecording
                  ? "Speak your answer — auto-submits after 3s silence"
                  : "Click mic to start your response"}
              </p>

              <Button
                variant="outline"
                onClick={() => onSubmit()}
                disabled={isSubmitting}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                End Interview Early
              </Button>
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center">
              <span className="text-green-500 font-medium text-lg">Interview Complete!</span>
              <p className="text-muted-foreground">You may now submit the module.</p>
            </div>
          )}
        </Card>

        {/* Right pane: Conversation Transcript */}
        <Card className="h-full flex flex-col border-l">
          <CardContent className="flex-1 p-0 min-h-0 relative">
            <ScrollArea className="h-full w-full p-4">
              <div className="space-y-4 pb-4">
                {conversation.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" && "flex-row-reverse",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        message.role === "assistant"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-4",
                        message.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-2",
                          message.role === "assistant"
                            ? "text-muted-foreground"
                            : "text-primary-foreground/70",
                        )}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator while AI processes */}
                {interviewState === "AI_PROCESSING" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">AI is thinking</span>
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}

                {/* Live transcript while recording */}
                {isRecording && transcription && (
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="max-w-[80%] rounded-lg p-4 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800">
                      <p className="text-sm italic text-muted-foreground">{transcription}...</p>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} className="h-px w-full" />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || interviewState === "AI_PROCESSING"}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {isComplete ? "Submit Interview" : "End Interview Early"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// =====================================================
// EXPORTED COMPONENT (with provider)
// =====================================================

export const InterviewModule: FC<InterviewModuleProps> = (props) => {
  return (
    <MockInterviewProvider>
      <InterviewModuleInner {...props} />
    </MockInterviewProvider>
  );
};

// src/components/mock-drive/attempt/modules/interview-module.tsx

"use client";

import { FC, useState, useEffect, useRef } from "react";
import { Square, Check, Loader2, User, Bot } from "lucide-react";
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
  InterviewRespondPayload,
  InterviewSkipPayload,
} from "@/types/mockdrive.types";
import { useAttemptStore } from "@/lib/store/mock-drive/attempt-store";
import { useAudioRecorder } from "@/lib/hooks/use-audio-recorder";
import { useAudioPlayer } from "@/lib/hooks/use-audio-player";
import {
  MockInterviewProvider,
  useMockInterviewWS,
} from "@/lib/contexts/mock-interview-ws-context";

// Import newly copied visualization components
import { AIAvatar } from "../ai-interview/interview/ai-avatar";
import { AudioVisualizer } from "../ai-interview/interview/audio-visualizer";

interface InterviewModuleProps {
  driveId: string;
  moduleId: string;
  config: ModuleConfig;
  data: Partial<ModuleData> | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

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
  const audioChunks = useRef<ArrayBuffer[]>([]);

  const {
    connect,
    disconnect,
    sendAnswer,
    endInterview,
    connectionState,
    interviewState,
    currentQuestion,
    registerAudioHandler,
  } = useMockInterviewWS();

  // Attempt ID comes from the hook args which is available globally or we can extract it from the URL.
  // We can pass it into the `MockInterviewProvider` or just use the attemptId from the attempt store.
  // Let's grab the attemptId and connect.
  const attemptId = useAttemptStore((s) => s.attemptState?.attemptId);

  const hasConnectedRef = useRef(false);

  useEffect(() => {
    if (attemptId && !hasConnectedRef.current) {
      hasConnectedRef.current = true;
      connect(attemptId);
    }
    return () => {
      hasConnectedRef.current = false;
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  // Auto-recording tracking
  const silenceStartRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playedAudioForQuestionIdRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);

  const { isRecording, startRecording, stopRecording, volume } =
    useAudioRecorder({
      onAudioData: (data) => {
        audioChunks.current.push(data);
      },
    });

  const {
    isPlaying: isAudioPlaying,
    queueAudio,
    playAccumulated,
    stop: stopAudio,
  } = useAudioPlayer({
    onPlaybackEnd: () => {
      if (!isComplete && !isTransitioningRef.current) {
        // AI finished speaking, auto-start mic
        handleStartRecording();
      }
    },
  });

  // Register WebSocket audio streaming
  useEffect(() => {
    const unsubscribe = registerAudioHandler((data) => {
      queueAudio(data);
    });
    return unsubscribe;
  }, [registerAudioHandler, queueAudio]);

  // The parent `AttemptContainer` already hydrates `localModuleData` via `setCurrentModule`.
  // However, if the module mounts rapidly before the store synchronizes, we do a one-time setup.
  const isInitializedRef = useRef(false);
  useEffect(() => {
    if (!localData && interviewData && !isInitializedRef.current) {
      isInitializedRef.current = true;
      updateLocalModuleData(interviewData);
    }
  }, [localData, interviewData, updateLocalModuleData]);

  const conversation =
    localData?.conversation || interviewData?.conversation || [];
  const responses = localData?.responses || interviewData?.responses || [];
  const targetQuestions = interviewConfig.targetQuestions;
  const questionsAnswered = responses.length;
  // Determine if complete: when the number of responses meets the target
  const isComplete = questionsAnswered >= targetQuestions;

  // Auto-scroll to bottom when conversation updates
  const scrollToBottom = () => {
    setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.length]);

  // ============================================
  // Audio Handling
  // ============================================

  const handleStartRecording = async () => {
    isTransitioningRef.current = true;
    audioChunks.current = [];
    await startRecording();
    isTransitioningRef.current = false;
  };

  const handleStopRecording = () => {
    isTransitioningRef.current = true;
    stopRecording();

    // Small delay to ensure all chunks are captured
    setTimeout(() => {
      const chunks = audioChunks.current;
      if (chunks.length === 0) return;

      const totalLength = chunks.reduce(
        (acc: number, chunk: ArrayBuffer) => acc + chunk.byteLength,
        0,
      );
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      const buffer = result.buffer;
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = window.btoa(binary);

      // WebSockets currently accept text. We could extend the gateway to accept audio,
      // but if the backend uses SpeechToTextService, we can just send the audio base64.
      // Wait, practice interview WS expects 'USER_ANSWER' to have text, or we do transcription on frontend?
      // Mock Drive WS expects 'USER_ANSWER', which right now isn't handling audio in `processUserResponse`.
      // Actually, if we're sending audio, we need to send it to the WS. I'll pass the base64 as the answer for now,
      // and if the backend gets base64 it tries to transcend it. If not, the frontend transcriber is missing.
      // Wait, let's just use `sendAnswer(base64Audio)`.

      sendAnswer(base64Audio);
      isTransitioningRef.current = false;
    }, 200);
  };

  // Voice Activity Detection (VAD) Auto-Submit
  useEffect(() => {
    // Only detect silence if we are actively recording and waiting for user input
    if (
      isRecording &&
      !isAudioPlaying &&
      interviewState !== "AI_PROCESSING" &&
      !isSubmitting &&
      !isComplete &&
      !isTransitioningRef.current
    ) {
      if (volume < 0.05) {
        // Meaningful silence threshold on 0-1 scale
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
          // Start a 3-second countdown to submit
          silenceTimeoutRef.current = setTimeout(() => {
            silenceStartRef.current = null;
            handleStopRecording();
          }, 3000);
        }
      } else {
        // User spoke! Reset silence tracking
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        silenceStartRef.current = null;
      }
    } else {
      // Clear out running timeouts if state changes
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      silenceStartRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [
    volume,
    isRecording,
    isAudioPlaying,
    interviewState,
    isSubmitting,
    isComplete,
  ]);

  // Auto-fetch audio for new AI questions
  // In the real Practice Interview, audio plays directly from WS buffers.
  // Here we still rely on `getAudioMutation` or `pendingTranscription` base64.
  // The backend was modified to do TTS if we call getAudioMutation, but wait!
  // Our WS `mock-interview.gateway.ts` calls `speakQuestion` which sets `pendingTranscription`.
  // So we don't need `getAudioMutation` polling at all!
  // The WS will push `pendingTranscription: "AUDIO:base64..."` in the session state!

  useEffect(() => {
    // Initial fetch of audio for the first message if needed, or if a pending transcription is pushed
    const pending = localData?.pendingTranscription;
    if (pending && pending.startsWith("AUDIO:")) {
      const lastMessage = conversation[conversation.length - 1];
      const isAssistant = lastMessage?.role === "assistant";

      // Ensure we only play this specific question's audio ONCE
      if (
        isAssistant &&
        lastMessage.id === playedAudioForQuestionIdRef.current
      ) {
        return;
      }

      if (isAssistant) {
        playedAudioForQuestionIdRef.current = lastMessage.id;
      }

      const base64 = pending.substring(6);
      try {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        queueAudio(bytes.buffer);
        playAccumulated();

        // Still update local store for cleanliness, but the ref prevents looping on polls
        if (localData) {
          const newData = { ...localData, pendingTranscription: undefined };
          updateLocalModuleData(newData);
        }
      } catch (e) {
        console.error("Failed to decode audio", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localData?.pendingTranscription, queueAudio, playAccumulated]);

  // Prevent accidental submission while AI is "thinking"
  const isInteractionDisabled =
    interviewState === "AI_PROCESSING" || isSubmitting || isAudioPlaying;

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
                {interviewConfig.companyName &&
                  ` at ${interviewConfig.companyName}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {questionsAnswered}/{targetQuestions} Questions
              </Badge>
              {isComplete && (
                <Badge variant="default" className="bg-green-500">
                  Complete
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
        {/* Left pane: Visualizer and Interaction */}
        <Card className="h-full flex flex-col justify-center items-center p-8 bg-muted/20 relative">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-sm font-medium text-muted-foreground">
            {isRecording ? (
              <span className="text-red-500 animate-pulse">
                Listening... (Auto-submits after 3s of silence, or click
                microphone)
              </span>
            ) : isAudioPlaying ? (
              <span className="text-primary animate-pulse">AI Speaking...</span>
            ) : interviewState === "AI_PROCESSING" ? (
              <span className="text-primary animate-pulse">AI Thinking...</span>
            ) : (
              <span>Your turn to speak</span>
            )}
            <span>Voice Mode Active</span>
          </div>

          {/* AI Avatar */}
          <AIAvatar
            isSpeaking={isAudioPlaying}
            isListening={isRecording}
            isProcessing={
              interviewState === "AI_PROCESSING" || isTransitioningRef.current
            }
          />

          {/* Visualizer */}
          <div className="mt-8 h-20 w-full max-w-sm flex items-center justify-center">
            <AudioVisualizer
              isActive={isRecording || isAudioPlaying}
              volume={isRecording ? volume : 0.5}
            />
          </div>

          {!isComplete ? (
            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="relative">
                {isRecording && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" />
                )}
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="icon"
                  className={cn(
                    "h-20 w-20 rounded-full shadow-lg transition-all transform hover:scale-105",
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-primary hover:bg-primary/90",
                  )}
                  onClick={
                    isRecording ? handleStopRecording : handleStartRecording
                  }
                  disabled={
                    (isInteractionDisabled && !isRecording) ||
                    isTransitioningRef.current
                  }
                >
                  {isRecording ? (
                    <Square className="h-8 w-8 text-white" />
                  ) : interviewState === "AI_PROCESSING" ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <span className="text-4xl text-white">🎤</span>
                  )}
                </Button>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  disabled={true} // Skip not supported currently via WS
                  className="text-muted-foreground hover:text-foreground line-through opacity-50"
                  title="Skip not available in websocket mode yet"
                >
                  Skip Question
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSubmit()}
                  disabled={isSubmitting}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  End Interview Early
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center">
              <span className="text-green-500 font-medium text-lg">
                Interview Complete!
              </span>
              <p className="text-muted-foreground">
                You may now submit the module.
              </p>
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
                      {message.content === "[AUDIO_RESPONSE]" ? (
                        <div className="flex items-center gap-2">
                          <span className="italic opacity-80">
                            Listening to specific audio response...
                          </span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}

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

                {/* Typing Indicator */}
                {interviewState === "AI_PROCESSING" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        AI is thinking
                      </span>
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"></span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} className="h-px w-full" />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Submit Module */}
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

export const InterviewModule: FC<InterviewModuleProps> = (props) => {
  return (
    <MockInterviewProvider>
      <InterviewModuleInner {...props} />
    </MockInterviewProvider>
  );
};

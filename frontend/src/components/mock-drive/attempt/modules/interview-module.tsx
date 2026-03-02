// src/components/mock-drive/attempt/modules/interview-module.tsx

'use client';

import { FC, useState, useEffect, useRef } from 'react';
import { Square, Check, Loader2, User, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  AiInterviewModuleConfig,
  AiInterviewModuleData,
  ModuleConfig,
  ModuleData,
  InterviewRespondPayload,
  InterviewSkipPayload,
} from '@/types/mockdrive.types';
import { useInterviewRespond, useInterviewSkip, useGetInterviewAudioQuestion } from '@/lib/hooks/mock-drive/use-attempt';
import { useAttemptStore } from '@/lib/store/mock-drive/attempt-store';
import { useAudioRecorder } from '@/lib/hooks/use-audio-recorder';
import { useAudioPlayer } from '@/lib/hooks/use-audio-player';

// Import newly copied visualization components
import { AIAvatar } from '../ai-interview/interview/ai-avatar';
import { AudioVisualizer } from '../ai-interview/interview/audio-visualizer';

interface InterviewModuleProps {
  driveId: string;
  moduleId: string;
  config: ModuleConfig;
  data: Partial<ModuleData> | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const InterviewModule: FC<InterviewModuleProps> = ({
  driveId,
  moduleId,
  config,
  data,
  onSubmit,
  isSubmitting,
}) => {
  const interviewConfig = config as AiInterviewModuleConfig;
  const interviewData = data as AiInterviewModuleData | null;

  const [answer, setAnswer] = useState('');
  const [answerStartTime, setAnswerStartTime] = useState<number>(Date.now());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { localModuleData, updateLocalModuleData } = useAttemptStore();
  const localData = localModuleData as AiInterviewModuleData | null;

  const respondMutation = useInterviewRespond();
  const skipMutation = useInterviewSkip();

  // Audio Hooks
  const getAudioMutation = useGetInterviewAudioQuestion();
  const audioChunks = useRef<ArrayBuffer[]>([]);

  // Auto-recording tracking
  const silenceStartRef = useRef<number | null>(null);
  const lastProcessedQuestionId = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);

  const {
    isRecording,
    startRecording,
    stopRecording,
    volume,
  } = useAudioRecorder({
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
        handleStartRecording();
      }
    }
  });

  useEffect(() => {
    if (interviewData && !localData) {
      updateLocalModuleData(interviewData);
    }
  }, [interviewData, localData, updateLocalModuleData]);

  const conversation = localData?.conversation || interviewData?.conversation || [];
  const responses = localData?.responses || interviewData?.responses || [];
  const targetQuestions = interviewConfig.targetQuestions;
  const questionsAnswered = responses.length;
  // Determine if complete: when the number of responses meets the target
  const isComplete = questionsAnswered >= targetQuestions;

  // Auto-scroll to bottom when conversation updates
  const scrollToBottom = () => {
    setTimeout(() => {
      const scrollableNode = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollableNode) {
        scrollableNode.scrollTop = scrollableNode.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.length, respondMutation.isPending, skipMutation.isPending]);

  useEffect(() => {
    setAnswerStartTime(Date.now());
  }, [conversation.length]);

  const handleSkip = () => {
    const payload: InterviewSkipPayload = {
      reason: 'User skipped',
    };

    skipMutation.mutate(
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

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      const buffer = result.buffer;
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = window.btoa(binary);

      const timeTaken = Math.floor((Date.now() - answerStartTime) / 1000);

      const payload: InterviewRespondPayload = {
        answer: '[AUDIO_RESPONSE]',
        audioBuffer: base64Audio,
        timeTaken,
      };

      respondMutation.mutate(
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
            setAnswer('');
            isTransitioningRef.current = false;
          },
          onError: () => {
            isTransitioningRef.current = false;
          }
        }
      );
    }, 200);
  };

  // Silence Detection for Auto-Submit
  useEffect(() => {
    if (isRecording && !isAudioPlaying && !respondMutation.isPending && !isSubmitting && !isComplete && !isTransitioningRef.current) {
      if (volume < 5) { // Silence threshold
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        } else if (Date.now() - silenceStartRef.current >= 2500) { // 2.5 seconds of silence
          silenceStartRef.current = null;
          handleStopRecording();
        }
      } else {
        silenceStartRef.current = null;
      }
    } else {
      silenceStartRef.current = null;
    }
  }, [volume, isRecording, isAudioPlaying, respondMutation.isPending, isSubmitting, isComplete]);

  // Auto-fetch audio for new AI questions
  useEffect(() => {
    if (isComplete || respondMutation.isPending || skipMutation.isPending) return;

    const lastMessage = conversation[conversation.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastProcessedQuestionId.current !== lastMessage.id) {
      lastProcessedQuestionId.current = lastMessage.id;
      // Start thinking/fetching audio state
      getAudioMutation.mutate(
        { driveId, moduleId },
        {
          onSuccess: (response) => {
            if (response.updatedData) {
              updateLocalModuleData(response.updatedData);
            }
          },
        }
      );
    }
  }, [conversation, isComplete, respondMutation.isPending, skipMutation.isPending, getAudioMutation, driveId, moduleId]);

  useEffect(() => {
    // Initial fetch of audio for the first message if needed, or if a pending transcription is pushed
    const pending = localData?.pendingTranscription;
    if (pending && pending.startsWith('AUDIO:')) {
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

        if (localData) {
          const newData = { ...localData, pendingTranscription: undefined };
          updateLocalModuleData(newData);
        }

      } catch (e) {
        console.error("Failed to decode audio", e);
      }
    }
  }, [localData?.pendingTranscription, queueAudio, playAccumulated, updateLocalModuleData, localData]);

  // Prevent accidental submission while AI is "thinking"
  const isInteractionDisabled = respondMutation.isPending || skipMutation.isPending || isSubmitting || isAudioPlaying;

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
              <span className="text-red-500 animate-pulse">Listening...</span>
            ) : isAudioPlaying ? (
              <span className="text-primary animate-pulse">AI Speaking...</span>
            ) : respondMutation.isPending ? (
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
            isProcessing={respondMutation.isPending || skipMutation.isPending || getAudioMutation.isPending || isTransitioningRef.current}
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
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                  )}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isInteractionDisabled && !isRecording || isTransitioningRef.current || getAudioMutation.isPending}
                >
                  {isRecording ? (
                    <Square className="h-8 w-8 text-white" />
                  ) : respondMutation.isPending || getAudioMutation.isPending ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <span className="text-4xl text-white">🎤</span>
                  )}
                </Button>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isInteractionDisabled || isTransitioningRef.current || getAudioMutation.isPending}
                  className="text-muted-foreground hover:text-foreground"
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
              <span className="text-green-500 font-medium text-lg">Interview Complete!</span>
              <p className="text-muted-foreground">You may now submit the module.</p>
            </div>
          )}
        </Card>

        {/* Right pane: Conversation Transcript */}
        <Card className="h-full flex flex-col border-l">
          <CardContent className="flex-1 p-0 overflow-hidden relative">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              <div className="space-y-4 pb-4">
                {conversation.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' && 'flex-row-reverse'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        message.role === 'assistant'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg p-4',
                        message.role === 'assistant'
                          ? 'bg-muted'
                          : 'bg-primary text-primary-foreground'
                      )}
                    >
                      {message.content === '[AUDIO_RESPONSE]' ? (
                        <div className="flex items-center gap-2">
                          <span className="italic opacity-80">Listening to specific audio response...</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}

                      <p
                        className={cn(
                          'text-xs mt-2',
                          message.role === 'assistant'
                            ? 'text-muted-foreground'
                            : 'text-primary-foreground/70'
                        )}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {(respondMutation.isPending || skipMutation.isPending) && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">AI is thinking</span>
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"></span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Submit Module */}
      <div className="flex justify-end pt-4">
        <Button onClick={onSubmit} disabled={isSubmitting || respondMutation.isPending} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {isComplete ? 'Submit Interview' : 'End Interview Early'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
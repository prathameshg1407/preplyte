// src/components/mock-drive/attempt/modules/interview-module.tsx (fixed payload types)

'use client';

import { FC, useState, useEffect, useRef } from 'react';
import { Send, SkipForward, Check, Loader2, User, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const scrollViewportRef = useRef<HTMLDivElement>(null); // Ref for the viewport inside ScrollArea

  const { localModuleData, updateLocalModuleData } = useAttemptStore();
  const localData = localModuleData as AiInterviewModuleData | null;

  const respondMutation = useInterviewRespond();
  const skipMutation = useInterviewSkip();

  // Audio Hooks
  const getAudioMutation = useGetInterviewAudioQuestion();
  const audioChunks = useRef<ArrayBuffer[]>([]);

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
  } = useAudioPlayer();

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
    // Small timeout to allow DOM to update
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

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;

    const timeTaken = Math.floor((Date.now() - answerStartTime) / 1000);

    const payload: InterviewRespondPayload = {
      answer: answer.trim(),
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
        },
      }
    );
  };

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
    audioChunks.current = [];
    await startRecording();
  };

  const handleStopRecording = () => {
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
          },
        }
      );
    }, 200);
  };

  const handlePlayQuestion = () => {
    getAudioMutation.mutate(
      { driveId, moduleId },
      {
        onSuccess: (response) => {
          if (response.updatedData && (response.updatedData as any).pendingTranscription) {
            updateLocalModuleData(response.updatedData);
          }
        }
      }
    );
  };

  useEffect(() => {
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
    <div className="max-w-4xl mx-auto space-y-4">
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

      {/* Conversation */}
      <Card className="h-[500px] flex flex-col">
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
                    <p className="whitespace-pre-wrap">{message.content}</p>
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

        {!isComplete && (
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[80px] resize-none"
                disabled={isInteractionDisabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSubmitAnswer();
                  }
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">Press Ctrl+Enter to submit</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  disabled={isInteractionDisabled}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || isInteractionDisabled}
                >
                  {respondMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  Submit Answer
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Submit Module */}
      <div className="flex justify-end">
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
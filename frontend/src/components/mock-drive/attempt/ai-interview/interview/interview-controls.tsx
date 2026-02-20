// src/components/practice/ai-interview/interview/interview-controls.tsx

'use client';

import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InterviewControlsProps {
  isRecording: boolean;
  isAISpeaking: boolean;
  isProcessing: boolean;
  onToggleRecording: () => void;
  disabled?: boolean;
}

export function InterviewControls({
  isRecording,
  isAISpeaking,
  isProcessing,
  onToggleRecording,
  disabled,
}: InterviewControlsProps) {
  const canRecord = !disabled && !isAISpeaking && !isProcessing;

  const getStatusText = (): string => {
    if (isAISpeaking) return 'AI is speaking...';
    if (isProcessing) return 'Processing your response...';
    if (isRecording) return 'Recording... Click to stop';
    return 'Click the mic to respond';
  };

  const getStatusColor = (): string => {
    if (isAISpeaking) return 'text-blue-500';
    if (isProcessing) return 'text-yellow-500';
    if (isRecording) return 'text-green-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Recording Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            variant={isRecording ? 'destructive' : 'default'}
            className={cn(
              'w-16 h-16 rounded-full transition-all shadow-lg',
              isRecording && 'animate-pulse shadow-red-500/25',
              !canRecord && 'opacity-50 cursor-not-allowed'
            )}
            onClick={onToggleRecording}
            disabled={!canRecord}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </TooltipContent>
      </Tooltip>

      {/* Status Text */}
      <div className="text-center min-w-[180px]">
        <p className={cn('text-sm font-medium transition-colors', getStatusColor())}>
          {getStatusText()}
        </p>
        {isRecording && (
          <p className="text-xs text-muted-foreground mt-1">
            Speak clearly into your microphone
          </p>
        )}
      </div>
    </div>
  );
}
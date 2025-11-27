// src/components/practice/ai-interview/interview/interview-controls.tsx

'use client';

import { Mic, MicOff, Pause, Play, PhoneOff } from 'lucide-react';
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
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Recording Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            variant={isRecording ? 'destructive' : 'default'}
            className={cn(
              'w-16 h-16 rounded-full transition-all',
              isRecording && 'animate-pulse'
            )}
            onClick={onToggleRecording}
            disabled={disabled || isAISpeaking || isProcessing}
          >
            {isRecording ? (
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
      <div className="text-center min-w-[150px]">
        {isAISpeaking && (
          <p className="text-sm text-blue-500 font-medium">AI is speaking...</p>
        )}
        {isProcessing && (
          <p className="text-sm text-yellow-500 font-medium">Processing...</p>
        )}
        {isRecording && !isAISpeaking && !isProcessing && (
          <p className="text-sm text-green-500 font-medium">Recording...</p>
        )}
        {!isRecording && !isAISpeaking && !isProcessing && (
          <p className="text-sm text-muted-foreground">
            Click the mic to respond
          </p>
        )}
      </div>
    </div>
  );
}
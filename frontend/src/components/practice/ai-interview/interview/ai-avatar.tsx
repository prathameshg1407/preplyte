// src/components/practice/ai-interview/interview/ai-avatar.tsx

'use client';

import { cn } from '@/lib/utils';
import { Bot, Mic, Loader2 } from 'lucide-react';

interface AIAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  className?: string;
}

export function AIAvatar({
  isSpeaking,
  isListening,
  isProcessing,
  className,
}: AIAvatarProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Main Avatar */}
      <div
        className={cn(
          'relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300',
          'bg-gradient-to-br from-primary/20 to-primary/40',
          isSpeaking && 'animate-pulse scale-110',
          isListening && 'ring-4 ring-green-500/50',
          isProcessing && 'opacity-75'
        )}
      >
        {/* Pulse rings when speaking */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div
              className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
              style={{ animationDelay: '0.2s' }}
            />
          </>
        )}

        {/* Icon */}
        <div className="relative z-10">
          {isProcessing ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <Bot className="h-12 w-12 text-primary" />
          )}
        </div>
      </div>// src/components/practice/ai-interview/interview/ai-avatar.tsx (continued)

      {/* Status Indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <div
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors',
            isSpeaking && 'bg-blue-500 text-white',
            isListening && 'bg-green-500 text-white',
            isProcessing && 'bg-yellow-500 text-white',
            !isSpeaking && !isListening && !isProcessing && 'bg-muted text-muted-foreground'
          )}
        >
          {isSpeaking && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Speaking...
            </>
          )}
          {isListening && (
            <>
              <Mic className="h-3 w-3" />
              Listening...
            </>
          )}
          {isProcessing && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking...
            </>
          )}
          {!isSpeaking && !isListening && !isProcessing && 'Ready'}
        </div>
      </div>
    </div>
  );
}
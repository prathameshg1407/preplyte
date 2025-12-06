// src/components/practice/ai-interview/interview/transcript-display.tsx

'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ConversationMessage, QuestionCategory, CATEGORY_COLORS } from '@/types/interview.types';

interface TranscriptDisplayProps {
  messages: ConversationMessage[];
  className?: string;
}

const CATEGORY_BADGE_COLORS: Record<QuestionCategory, string> = {
  INTRODUCTORY: 'bg-green-500/10 text-green-700 border-green-500/20',
  TECHNICAL: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  BEHAVIORAL: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  SITUATIONAL: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  CLOSING: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
};

export function TranscriptDisplay({ messages, className }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 className="font-semibold">Conversation</h2>
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Conversation will appear here</p>
              <p className="text-sm mt-1">The AI interviewer will begin shortly</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-3 animate-in slide-in-from-bottom-2 duration-300',
        isAssistant ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isAssistant ? 'bg-primary/10' : 'bg-muted'
        )}
      >
        {isAssistant ? (
          <Bot className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 space-y-1 max-w-[85%]',
          !isAssistant && 'flex flex-col items-end'
        )}
      >
        {/* Category Badge */}
        {isAssistant && message.category && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-xs', CATEGORY_BADGE_COLORS[message.category])}
            >
              {message.category}
            </Badge>
            {message.isFollowUp && (
              <Badge variant="secondary" className="text-xs">
                Follow-up
              </Badge>
            )}
          </div>
        )}

        {/* Message */}
        <div
          className={cn(
            'rounded-lg px-4 py-2.5',
            isAssistant
              ? 'bg-muted text-foreground'
              : 'bg-primary text-primary-foreground'
          )}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
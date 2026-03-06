// src/components/practice/ai-interview/interview/transcript-display.tsx

'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ConversationMessage, QuestionCategory } from '@/types/interview.types';

interface TranscriptDisplayProps {
  messages: ConversationMessage[];
  className?: string;
}

// Define colors properly to avoid lookup errors
const CATEGORY_BADGE_COLORS: Record<string, string> = {
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
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className={cn('flex flex-col h-full bg-background border-l', className)}>
      <div className="px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <h2 className="font-semibold text-sm">Conversation Transcript</h2>
        <p className="text-xs text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* FIX: Added flex-1 and min-h-0 to ensure ScrollArea takes available space 
         and actually scrolls instead of growing infinitely. 
      */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full w-full p-4">
            <div className="space-y-6 pb-4">
            {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
                <Bot className="h-10 w-10 mb-3 opacity-20" />
                <p>No messages yet</p>
                <p className="text-xs mt-1 opacity-70">The AI interviewer will begin shortly</p>
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
    </div>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isAssistant = message.role === 'assistant';
  
  // Safe badge color lookup
  const badgeClass = message.category ? 
    (CATEGORY_BADGE_COLORS[message.category] || 'bg-gray-100 text-gray-800') 
    : '';

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
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1',
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
          'flex-1 space-y-1 max-w-[90%]',
          !isAssistant && 'flex flex-col items-end'
        )}
      >
        {/* Category Badge (Assistant only) */}
        {isAssistant && message.category && (
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className={cn('text-[10px] px-2 py-0 h-5', badgeClass)}
            >
              {message.category}
            </Badge>
            {message.isFollowUp && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
                Follow-up
              </Badge>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-2.5 shadow-sm text-sm leading-relaxed',
            isAssistant
              ? 'bg-muted/50 text-foreground border'
              : 'bg-primary text-primary-foreground'
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
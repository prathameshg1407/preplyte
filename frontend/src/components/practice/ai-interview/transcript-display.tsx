// src/components/practice/ai-interview/transcript-display.tsx

"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "../../ui/scroll-area";
import { Bot, User } from "lucide-react";
import { cn } from "../../../lib/utils";
import { TranscriptMessage } from "../../../types/aiInterview.types";

interface TranscriptDisplayProps {
  messages: TranscriptMessage[];
  className?: string;
  autoScroll?: boolean;
}

export function TranscriptDisplay({
  messages,
  className,
  autoScroll = true,
}: TranscriptDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  if (messages.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center h-full",
        className
      )}>
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center mx-auto">
            <Bot className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Transcript will appear here
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="space-y-4 py-2">
        {messages.map((message, index) => {
          const isUser = message.speaker === "USER";
          const isConsecutive = index > 0 && messages[index - 1].speaker === message.speaker;
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                isUser && "flex-row-reverse"
              )}
            >
              {/* Avatar - hide for consecutive messages */}
              <div className="w-7 shrink-0">
                {!isConsecutive && (
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center",
                      isUser 
                        ? "bg-foreground text-background" 
                        : "border border-border"
                    )}
                  >
                    {isUser ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  "flex-1 min-w-0 max-w-[85%]",
                  isUser && "flex flex-col items-end"
                )}
              >
                {/* Label - only show for first in group */}
                {!isConsecutive && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {isUser ? "You" : "Interviewer"}
                  </p>
                )}

                {/* Message */}
                <div
                  className={cn(
                    "px-3 py-2 rounded-lg",
                    isUser
                      ? "bg-foreground text-background rounded-tr-sm"
                      : "bg-secondary rounded-tl-sm"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                </div>

                {/* Timestamp */}
                <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

// Compact variant for inline display
export function TranscriptPreview({
  messages,
  maxMessages = 3,
  className,
}: {
  messages: TranscriptMessage[];
  maxMessages?: number;
  className?: string;
}) {
  const recentMessages = messages.slice(-maxMessages);
  
  if (recentMessages.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {recentMessages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex items-start gap-2 text-sm",
            message.speaker === "USER" && "flex-row-reverse text-right"
          )}
        >
          <span className="text-muted-foreground shrink-0">
            {message.speaker === "AI" ? "AI:" : "You:"}
          </span>
          <span className="truncate">{message.text}</span>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useEffect, useRef, useLayoutEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TranscriptMessage } from "@/types/aiInterview.types";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-muted-foreground h-full",
          className
        )}
      >
        <div className="text-center space-y-2">
          <Bot className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="text-sm">Interview transcript will appear here...</p>
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
      <div ref={containerRef} className="space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.speaker === "USER" && "flex-row-reverse"
            )}
          >
            {/* Avatar */}
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback
                className={cn(
                  message.speaker === "AI"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {message.speaker === "AI" ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div
              className={cn(
                "flex-1 space-y-1 max-w-[85%]",
                message.speaker === "USER" && "flex flex-col items-end"
              )}
            >
              {/* Sender Label */}
              <p className="text-xs text-muted-foreground">
                {message.speaker === "AI" ? "Interviewer" : "You"}
              </p>

              {/* Message Bubble */}
              <div
                className={cn(
                  "inline-block p-3 rounded-lg",
                  message.speaker === "AI"
                    ? "bg-muted text-foreground rounded-tl-none"
                    : "bg-primary text-primary-foreground rounded-tr-none"
                )}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </p>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
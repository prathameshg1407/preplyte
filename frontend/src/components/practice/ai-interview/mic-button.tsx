// src/components/practice/ai-interview/mic-button.tsx

"use client";

import { Button } from "../../ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface MicButtonProps {
  isRecording: boolean;
  isDisabled: boolean;
  isLoading?: boolean;
  onToggle: () => void;
  size?: "default" | "lg";
  className?: string;
}

export function MicButton({
  isRecording,
  isDisabled,
  isLoading,
  onToggle,
  size = "lg",
  className,
}: MicButtonProps) {
  const sizeClasses = {
    default: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="relative">
      {/* Outer ring animation when recording */}
      {isRecording && (
        <span 
          className={cn(
            "absolute inset-0 rounded-full border-2 border-foreground/20 animate-ping",
            sizeClasses[size]
          )} 
        />
      )}
      
      {/* Secondary pulse ring */}
      {isRecording && (
        <span 
          className={cn(
            "absolute -inset-1 rounded-full border border-foreground/10 animate-pulse",
          )} 
        />
      )}

      <Button
        variant={isRecording ? "default" : "outline"}
        size="icon"
        className={cn(
          "rounded-full relative transition-all duration-200",
          sizeClasses[size],
          isRecording && "bg-foreground text-background hover:bg-foreground/90",
          !isRecording && "hover:bg-secondary",
          isDisabled && "opacity-50",
          className
        )}
        onClick={onToggle}
        disabled={isDisabled || isLoading}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSizes[size], "animate-spin")} />
        ) : isRecording ? (
          <MicOff className={iconSizes[size]} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </Button>
    </div>
  );
}
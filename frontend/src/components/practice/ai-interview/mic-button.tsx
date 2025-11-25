"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicButtonProps {
  isRecording: boolean;
  isDisabled: boolean;
  isLoading?: boolean;
  onToggle: () => void;
  className?: string;
}

export function MicButton({
  isRecording,
  isDisabled,
  isLoading,
  onToggle,
  className,
}: MicButtonProps) {
  return (
    <Button
      variant={isRecording ? "destructive" : "default"}
      size="lg"
      className={cn(
        "w-16 h-16 rounded-full p-0 relative",
        isRecording && "animate-pulse",
        className
      )}
      onClick={onToggle}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-6 h-6" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
      
      {/* Recording indicator ring */}
      {isRecording && (
        <span className="absolute inset-0 rounded-full border-4 border-destructive animate-ping opacity-75" />
      )}
    </Button>
  );
}
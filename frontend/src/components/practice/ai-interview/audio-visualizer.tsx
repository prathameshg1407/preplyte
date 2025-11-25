"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  isActive: boolean;
  className?: string;
}

// Create initial bars array outside component to avoid recreation
const createInitialBars = (): number[] => Array.from({ length: 20 }, () => 10);

export function AudioVisualizer({ isActive, className }: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(createInitialBars);
  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      setBars(createInitialBars());
      return;
    }

    const animate = () => {
      setBars((prev) =>
        prev.map(() => Math.random() * 40 + 10)
      );
    };

    // Throttle animation to ~30fps
    intervalRef.current = setInterval(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 33);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive]);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 h-12 px-4",
        className
      )}
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-75",
            isActive ? "bg-primary" : "bg-muted"
          )}
          style={{
            height: `${height}px`,
            opacity: isActive ? 0.8 : 0.3,
          }}
        />
      ))}
    </div>
  );
}
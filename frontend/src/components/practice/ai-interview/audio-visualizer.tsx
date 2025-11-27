// src/components/practice/ai-interview/audio-visualizer.tsx

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "../../../lib/utils";

interface AudioVisualizerProps {
  isActive: boolean;
  className?: string;
  barCount?: number;
}

const createInitialBars = (count: number): number[] => 
  Array.from({ length: count }, () => 4);

export function AudioVisualizer({ 
  isActive, 
  className,
  barCount = 24 
}: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(() => createInitialBars(barCount));
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const animate = useCallback((timestamp: number) => {
    // Throttle updates to ~30fps for performance
    if (timestamp - lastUpdateRef.current < 33) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastUpdateRef.current = timestamp;

    setBars(prev =>
      prev.map((_, i) => {
        // Create wave-like pattern from center
        const centerDistance = Math.abs(i - prev.length / 2) / (prev.length / 2);
        const baseHeight = 4;
        const maxVariation = 28;
        const variation = maxVariation * (1 - centerDistance * 0.3);
        return baseHeight + Math.random() * variation;
      })
    );

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setBars(createInitialBars(barCount));
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, animate, barCount]);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-[3px] h-16 px-6",
        className
      )}
      role="img"
      aria-label={isActive ? "Audio active" : "Audio inactive"}
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-[3px] rounded-full transition-all",
            isActive 
              ? "bg-foreground duration-75" 
              : "bg-border duration-300"
          )}
          style={{
            height: `${height}px`,
            opacity: isActive ? 0.8 + (height / 128) * 0.2 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
// src/components/practice/ai-interview/interview/audio-visualizer.tsx

'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isActive: boolean;
  volume: number;
  className?: string;
}

export function AudioVisualizer({ isActive, volume, className }: AudioVisualizerProps) {
  const barsCount = 5;

  return (
    <div className={cn('flex items-center justify-center gap-1 h-12', className)}>
      {Array.from({ length: barsCount }).map((_, index) => {
        const delay = index * 0.1;
        const baseHeight = 8;
        const maxAdditionalHeight = 32;
        const height = isActive
          ? baseHeight + volume * maxAdditionalHeight * (0.5 + Math.random() * 0.5)
          : baseHeight;

        return (
          <div
            key={index}
            className={cn(
              'w-1.5 rounded-full transition-all duration-150',
              isActive ? 'bg-primary' : 'bg-muted'
            )}
            style={{
              height: `${height}px`,
              transitionDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

// Alternative: Canvas-based visualizer for smoother animation
export function CanvasAudioVisualizer({
  isActive,
  volume,
  className,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined); // Fixed: Added type and initial value

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barCount = 32;
    const barWidth = width / barCount - 2;
    const bars: number[] = new Array(barCount).fill(0);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      bars.forEach((_, i) => {
        if (isActive) {
          bars[i] = Math.max(
            4,
            bars[i] * 0.9 + volume * height * Math.random() * 0.3
          );
        } else {
          bars[i] *= 0.95;
        }

        const x = i * (barWidth + 2);
        const barHeight = Math.max(4, bars[i]);
        const y = (height - barHeight) / 2;

        ctx.fillStyle = isActive
          ? `hsl(var(--primary))`
          : `hsl(var(--muted-foreground))`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current !== undefined) { // Updated check
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, volume]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={48}
      className={cn('rounded-lg', className)}
    />
  );
}
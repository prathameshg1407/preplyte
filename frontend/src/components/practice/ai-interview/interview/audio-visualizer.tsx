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
        // Add some randomness for visual effect
        const randomFactor = 0.5 + Math.sin(Date.now() / 200 + index) * 0.5;
        const height = isActive
          ? baseHeight + volume * maxAdditionalHeight * randomFactor
          : baseHeight;

        return (
          <div
            key={index}
            className={cn(
              'w-1.5 rounded-full transition-all duration-150',
              isActive ? 'bg-primary' : 'bg-muted'
            )}
            style={{
              height: `${Math.max(baseHeight, height)}px`,
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
  const animationRef = useRef<number | undefined>(undefined);
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barCount = 32;
    const barWidth = width / barCount - 2;
    
    // Initialize bars if empty
    if (barsRef.current.length === 0) {
      barsRef.current = new Array(barCount).fill(4);
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      barsRef.current.forEach((barHeight, i) => {
        if (isActive) {
          // Smoothly animate towards target height
          const target = Math.max(4, volume * height * (0.3 + Math.random() * 0.3));
          barsRef.current[i] = barHeight * 0.85 + target * 0.15;
        } else {
          // Decay when inactive
          barsRef.current[i] = Math.max(4, barHeight * 0.92);
        }

        const x = i * (barWidth + 2);
        const currentHeight = Math.max(4, barsRef.current[i]);
        const y = (height - currentHeight) / 2;

        // Get CSS variable color
        ctx.fillStyle = isActive
          ? 'hsl(var(--primary))'
          : 'hsl(var(--muted-foreground))';
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, currentHeight, 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current !== undefined) {
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
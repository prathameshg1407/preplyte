'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface LottieLoaderProps {
  animationPath?: string;
  size?: number;
  fallbackIcon?: boolean;
  isComplete?: boolean;
  onStatusChange?: (status: string) => void; // Callback for status updates
}

export function LottieLoader({ 
  animationPath = '/animations/analyzing-resume.json',
  size = 128,
  fallbackIcon = true,
  isComplete = false,
  onStatusChange
}: LottieLoaderProps) {
  const [Lottie, setLottie] = useState<any>(null);
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Dynamically import lottie-react
    import('lottie-react')
      .then((module) => {
        setLottie(() => module.default);
      })
      .catch(() => {
        setError(true);
      });

    // Fetch animation data
    fetch(animationPath)
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data);
      })
      .catch(() => {
        setError(true);
      });
  }, [animationPath]);

  // Handle animation loop complete
  const handleLoopComplete = () => {
    if (!isComplete && onStatusChange) {
      onStatusChange('loop-complete');
    }
  };

  // Show fallback if error or not loaded
  if (error || !Lottie || !animationData) {
    if (fallbackIcon) {
      return (
        <div className="h-32 w-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <RefreshCw className="h-16 w-16 text-primary animate-spin" />
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex justify-center">
      <Lottie
        animationData={animationData}
        loop={!isComplete}
        autoplay
        onLoopComplete={handleLoopComplete}
        style={{ height: size, width: size }}
      />
    </div>
  );
}

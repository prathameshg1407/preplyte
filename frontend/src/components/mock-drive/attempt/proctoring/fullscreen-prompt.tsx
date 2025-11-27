// src/components/mock-drive/attempt/proctoring/fullscreen-prompt.tsx

'use client';

import { FC, useEffect, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface FullscreenPromptProps {
  required?: boolean;
}

export const FullscreenPrompt: FC<FullscreenPromptProps> = ({ required = false }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    checkFullscreen();

    // Show prompt if not in fullscreen after a delay
    const timer = setTimeout(() => {
      if (!document.fullscreenElement) {
        setShowPrompt(true);
      }
    }, 2000);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      clearTimeout(timer);
    };
  }, []);

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setShowPrompt(false);
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  if (isFullscreen) return null;

  return (
    <>
      {/* Floating Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
        onClick={requestFullscreen}
      >
        <Maximize2 className="h-4 w-4 mr-2" />
        Enter Fullscreen
      </Button>

      {/* Prompt Dialog */}
      <AlertDialog open={showPrompt} onOpenChange={setShowPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5" />
              Fullscreen Recommended
            </AlertDialogTitle>
            <AlertDialogDescription>
              For the best experience and to minimize distractions, we recommend taking
              this test in fullscreen mode.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!required && (
              <Button variant="outline" onClick={() => setShowPrompt(false)}>
                Continue Without
              </Button>
            )}
            <AlertDialogAction onClick={requestFullscreen}>
              Enter Fullscreen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
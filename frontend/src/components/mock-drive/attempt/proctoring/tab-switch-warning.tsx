// src/components/mock-drive/attempt/proctoring/tab-switch-warning.tsx (fixed)

'use client';

import { FC, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAttemptStore } from '@/lib/store/mock-drive/attempt-store';

interface TabSwitchWarningProps {
  maxWarnings?: number;
  onMaxWarningsReached?: () => void;
}

export const TabSwitchWarning: FC<TabSwitchWarningProps> = ({
  maxWarnings = 5,
  onMaxWarningsReached,
}) => {
  const { tabSwitchCount, incrementTabSwitchCount } = useAttemptStore();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementTabSwitchCount();
        setShowWarning(true);

        if (tabSwitchCount + 1 >= maxWarnings) {
          onMaxWarningsReached?.();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tabSwitchCount, maxWarnings, incrementTabSwitchCount, onMaxWarningsReached]);

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            Tab Switch Detected
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You have switched away from this tab. This action has been recorded.
            </p>
            <p className="font-medium text-red-600">
              Warning {tabSwitchCount} of {maxWarnings}
            </p>
            <p className="text-sm">
              Excessive tab switching may result in automatic submission of your test.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowWarning(false)}>
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
// src/components/mock-drive/attempt/auto-submit-warning.tsx

'use client';

import { FC } from 'react';
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

interface AutoSubmitWarningProps {
  remainingTime: string;
}

export const AutoSubmitWarning: FC<AutoSubmitWarningProps> = ({ remainingTime }) => {
  const { showTimeWarning, setShowTimeWarning } = useAttemptStore();

  return (
    <AlertDialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Time Running Out!
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You have approximately <strong>{remainingTime}</strong> remaining for this module.
            </p>
            <p>
              The module will be automatically submitted when time runs out. Please review your
              answers and submit before the timer ends.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowTimeWarning(false)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
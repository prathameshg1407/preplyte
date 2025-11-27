// src/components/mock-drive/attempt/attempt-header.tsx

'use client';

import { FC } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttemptHeaderProps {
  driveTitle: string;
  currentModuleName: string | null;
  currentModuleOrder: number;
  totalModules: number;
  remainingTime: string;
  isWarning: boolean;
  progress: number;
}

export const AttemptHeader: FC<AttemptHeaderProps> = ({
  driveTitle,
  currentModuleName,
  currentModuleOrder,
  totalModules,
  remainingTime,
  isWarning,
  progress,
}) => {
  return (
    <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Title & Module Info */}
          <div className="space-y-1">
            <h1 className="font-semibold text-lg">{driveTitle}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Module {currentModuleOrder + 1} of {totalModules}
              </span>
              {currentModuleName && (
                <>
                  <span>•</span>
                  <span>{currentModuleName}</span>
                </>
              )}
            </div>
          </div>

          {/* Right - Timer */}
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              isWarning ? 'bg-red-100 text-red-700' : 'bg-muted'
            )}
          >
            {isWarning ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            <span className="font-mono text-lg font-semibold">{remainingTime}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
};
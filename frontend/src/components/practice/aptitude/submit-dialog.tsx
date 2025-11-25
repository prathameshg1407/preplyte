// src/components/practice/aptitude/submit-dialog.tsx

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/constants/aptitude.constants';

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalQuestions: number;
  answeredCount: number;
  onConfirm: () => void;
  isSubmitting: boolean;
  timeRemaining?: number;
}

export function SubmitDialog({
  open,
  onOpenChange,
  totalQuestions,
  answeredCount,
  onConfirm,
  isSubmitting,
  timeRemaining,
}: SubmitDialogProps) {
  const unanswered = totalQuestions - answeredCount;
  const allAnswered = unanswered === 0;
  const progressPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-xl">
            {allAnswered ? (
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-yellow-500/10">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
            )}
            Submit Test
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            {allAnswered
              ? 'Great job! You have answered all questions. Ready to submit?'
              : `You have ${unanswered} unanswered question${
                  unanswered > 1 ? 's' : ''
                }. Are you sure you want to submit?`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-6 space-y-6">
          {/* Time Remaining */}
          {timeRemaining !== undefined && timeRemaining > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Time Remaining</span>
              </div>
              <Badge variant="outline" className="font-mono">
                {formatTime(timeRemaining)}
              </Badge>
            </div>
          )}

          {/* Progress Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Questions Answered</span>
              <span className="font-medium">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressPercentage}% complete</span>
              {unanswered > 0 && (
                <span className="text-yellow-500">
                  {unanswered} unanswered
                </span>
              )}
            </div>
          </div>

          {/* Warning for unanswered */}
          {!allAnswered && (
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600">
                  Unanswered questions will be marked as incorrect.
                </p>
                <p className="text-muted-foreground mt-1">
                  You can go back and answer them before submitting.
                </p>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>
            Go Back
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              allAnswered
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-yellow-500 hover:bg-yellow-600'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Test
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
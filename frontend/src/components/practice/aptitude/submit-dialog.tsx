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
} from '../../ui/alert-dialog';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { AlertCircle, Check, Loader2, Send, Clock } from 'lucide-react';
import { formatTime } from '../../../lib/constants/aptitude.constants';

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
          <AlertDialogTitle className="flex items-center gap-3">
            {allAnswered ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground">
                <Check className="h-5 w-5 text-background" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
            )}
            <span>Submit Test</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            {allAnswered
              ? 'You have answered all questions. Ready to submit?'
              : `You have ${unanswered} unanswered question${
                  unanswered > 1 ? 's' : ''
                }. Are you sure you want to submit?`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Time Remaining */}
          {timeRemaining !== undefined && timeRemaining > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Time Remaining</span>
              </div>
              <Badge variant="outline" className="font-mono">
                {formatTime(timeRemaining)}
              </Badge>
            </div>
          )}

          {/* Progress Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Questions Answered</span>
              <span className="font-medium">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressPercentage}% complete</span>
              {unanswered > 0 && (
                <span>{unanswered} unanswered</span>
              )}
            </div>
          </div>

          {/* Warning for unanswered */}
          {!allAnswered && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  Unanswered questions will be marked as incorrect.
                </p>
                <p className="text-muted-foreground">
                  You can go back and answer them before submitting.
                </p>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Go Back</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
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
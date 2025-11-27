// src/components/practice/aptitude/submit-dialog.tsx

'use client';

import { motion } from 'framer-motion';
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
import { AlertTriangle, CheckCircle2, Loader2, Send, Clock } from 'lucide-react';
import { formatTime } from '../../../lib/constants/aptitude.constants';
import { cn } from '../../../lib/utils';

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
  const progressPercentage = totalQuestions > 0 
    ? Math.round((answeredCount / totalQuestions) * 100) 
    : 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md overflow-hidden p-0">
        {/* Header with Icon */}
        <div className={cn(
          'flex flex-col items-center px-6 pb-4 pt-8',
          allAnswered ? 'bg-emerald-500/10' : 'bg-amber-500/10'
        )}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={cn(
              'mb-4 flex h-16 w-16 items-center justify-center rounded-full',
              allAnswered ? 'bg-emerald-500' : 'bg-amber-500'
            )}
          >
            {allAnswered ? (
              <CheckCircle2 className="h-8 w-8 text-white" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-white" />
            )}
          </motion.div>

          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-xl">
              {allAnswered ? 'Ready to Submit?' : 'Submit Incomplete Test?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {allAnswered
                ? "You've answered all questions. Let's see how you did!"
                : `You still have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Time Remaining */}
          {timeRemaining !== undefined && timeRemaining > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Time Remaining</span>
              </div>
              <Badge variant="outline" className="font-mono text-base">
                {formatTime(timeRemaining)}
              </Badge>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Questions Answered</span>
              <span className="font-semibold">
                {answeredCount} / {totalQuestions}
              </span>
            </div>

            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full',
                  allAnswered ? 'bg-emerald-500' : 'bg-amber-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Warning for unanswered */}
          {!allAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  Unanswered questions count as incorrect
                </p>
                <p className="mt-1 text-muted-foreground">
                  You can go back to answer the remaining questions.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <AlertDialogFooter className="border-t border-border bg-muted/30 px-6 py-4">
          <AlertDialogCancel disabled={isSubmitting} className="flex-1">
            Go Back
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              'flex-1 gap-2',
              allAnswered 
                ? 'bg-emerald-500 hover:bg-emerald-600' 
                : 'bg-amber-500 hover:bg-amber-600'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Test
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
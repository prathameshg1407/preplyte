// src/components/practice/machine/submit-dialog.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { CheckCircle2, Circle, Code2, Loader2, AlertCircle } from "lucide-react";

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalQuestions: number;
  solvedCount: number;
  attemptedCount: number;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function SubmitDialog({
  open,
  onOpenChange,
  totalQuestions,
  solvedCount,
  attemptedCount,
  onConfirm,
  isSubmitting,
}: SubmitDialogProps) {
  const unattempted = totalQuestions - attemptedCount;
  const partiallyAttempted = attemptedCount - solvedCount;
  const allAttempted = unattempted === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
              <Code2 className="h-4 w-4" />
            </div>
            Complete Session
          </DialogTitle>
          <DialogDescription>
            {allAttempted
              ? "You have attempted all problems. Ready to complete?"
              : `You have ${unattempted} unattempted problem${unattempted > 1 ? "s" : ""}. Are you sure you want to complete?`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-3 gap-3">
            <StatBlock
              icon={CheckCircle2}
              value={solvedCount}
              label="Solved"
              highlight
            />
            <StatBlock
              icon={AlertCircle}
              value={partiallyAttempted}
              label="Attempted"
            />
            <StatBlock
              icon={Circle}
              value={unattempted}
              label="Unattempted"
              muted
            />
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{solvedCount} of {totalQuestions} solved</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-foreground transition-all"
                style={{ width: `${(solvedCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Continue Coding
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              "Complete Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Stat Block Component
function StatBlock({
  icon: Icon,
  value,
  label,
  highlight,
  muted,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <Icon
        className={cn(
          "mx-auto mb-1.5 h-5 w-5",
          muted ? "text-muted-foreground" : ""
        )}
      />
      <div
        className={cn(
          "text-xl font-semibold",
          muted ? "text-muted-foreground" : ""
        )}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

// Helper for cn
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
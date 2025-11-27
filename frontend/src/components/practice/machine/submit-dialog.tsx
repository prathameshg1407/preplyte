// src/components/practice/machine/submit-dialog.tsx

"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { CheckCircle2, Circle, Code2, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "../../../lib/utils";

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
  const allSolved = solvedCount === totalQuestions;
  const percentage = (solvedCount / totalQuestions) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        {/* Header */}
        <div
          className={cn(
            "flex flex-col items-center px-6 pb-4 pt-8",
            allSolved ? "bg-emerald-500/10" : "bg-amber-500/10"
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
              allSolved ? "bg-emerald-500" : "bg-amber-500"
            )}
          >
            {allSolved ? (
              <CheckCircle2 className="h-8 w-8 text-white" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-white" />
            )}
          </motion.div>

          <DialogHeader className="text-center">
            <DialogTitle className="text-xl">
              {allSolved ? "Great Work!" : "Complete Session?"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {allSolved
                ? "You've solved all problems. Ready to complete?"
                : `You have ${unattempted} unattempted problem${unattempted > 1 ? "s" : ""}.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Stats */}
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-3 gap-3">
            <StatBlock
              icon={CheckCircle2}
              value={solvedCount}
              label="Solved"
              color="text-emerald-500"
            />
            <StatBlock
              icon={AlertTriangle}
              value={attemptedCount - solvedCount}
              label="Attempted"
              color="text-amber-500"
            />
            <StatBlock
              icon={Circle}
              value={unattempted}
              label="Unattempted"
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {solvedCount} of {totalQuestions} solved
              </span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full",
                  allSolved ? "bg-emerald-500" : "bg-amber-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 border-t border-border bg-muted/30 px-6 py-4 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Continue Coding
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              "flex-1 gap-2",
              allSolved
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-amber-600 hover:bg-amber-700"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
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

function StatBlock({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3 text-center">
      <Icon className={cn("mx-auto mb-1 h-5 w-5", color || "text-muted-foreground")} />
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
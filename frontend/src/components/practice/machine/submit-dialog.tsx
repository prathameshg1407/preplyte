// src/components/practice/machine/submit-dialog.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Code2, Loader2 } from "lucide-react";

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
  const allAttempted = unattempted === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Complete Session
          </DialogTitle>
          <DialogDescription>
            {allAttempted ? (
              "You have attempted all problems. Are you sure you want to complete?"
            ) : (
              <>
                You have{" "}
                <span className="font-semibold text-yellow-500">
                  {unattempted} unattempted
                </span>{" "}
                problem{unattempted > 1 ? "s" : ""}. Are you sure you want to
                complete?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-green-500">
                {solvedCount}
              </div>
              <div className="text-xs text-muted-foreground">Solved</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-yellow-500">
                {attemptedCount - solvedCount}
              </div>
              <div className="text-xs text-muted-foreground">Attempted</div>
            </div>
            <div className="text-center p-3 bg-gray-500/10 rounded-lg">
              <Code2 className="h-6 w-6 text-gray-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-500">
                {unattempted}
              </div>
              <div className="text-xs text-muted-foreground">Unattempted</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
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
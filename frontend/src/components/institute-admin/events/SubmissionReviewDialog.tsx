// src/components/institute-admin/events/SubmissionReviewDialog.tsx

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Save, X } from 'lucide-react';

interface SubmissionReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number, feedback: string) => Promise<void>;
  projectName: string;
  initialScore?: number;
  initialFeedback?: string;
}

export function SubmissionReviewDialog({
  isOpen,
  onClose,
  onSubmit,
  projectName,
  initialScore = 0,
  initialFeedback = ''
}: SubmissionReviewDialogProps) {
  const [score, setScore] = useState(initialScore);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSubmit(score, feedback);
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            Review Project
          </DialogTitle>
          <DialogDescription>
            Provide a score and feedback for <span className="font-bold text-foreground">{projectName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="score" className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
              Project Score (0-100)
              <span className="text-primary font-mono">{score}/100</span>
            </Label>
            <div className="flex gap-4 items-center">
               <Input
                id="score"
                type="range"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-20 text-center font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Reviewer Feedback
            </Label>
            <Textarea
              id="feedback"
              placeholder="What did the team do well? What could be improved?"
              className="min-h-[150px] rounded-xl resize-none focus-visible:ring-primary/20 transition-all border-muted-foreground/20"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="rounded-full">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-bold gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? 'Saving...' : 'Save Review'}
            {!loading && <Save className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// src/components/profile/profile-completion-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  ArrowRight,
  X,
  User,
  GraduationCap,
  FileText,
  Briefcase,
  Target,
} from 'lucide-react';
import type { ProfileCompletionStatus } from '@/types/profile.types';
import { cn } from '@/lib/utils';

interface ProfileCompletionDialogProps {
  completion: ProfileCompletionStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

const fieldConfig: Record<string, { label: string; icon: React.ElementType; link: string }> = {
  name: { label: 'Display Name', icon: User, link: '/profile/settings' },
  studentProfile: { label: 'Student Profile', icon: GraduationCap, link: '/profile/student/create' },
  fullName: { label: 'Full Name', icon: User, link: '/profile/student/edit' },
  studentId: { label: 'Student ID', icon: Target, link: '/profile/student/edit' },
  departmentId: { label: 'Department', icon: GraduationCap, link: '/profile/student/edit' },
  courseYear: { label: 'Course Year', icon: GraduationCap, link: '/profile/student/edit' },
  numberOfBacklogs: { label: 'Number of Backlogs', icon: Target, link: '/profile/student/edit' },
  skills: { label: 'Skills', icon: Briefcase, link: '/profile/student/edit' },
  marks10: { label: '10th Marks', icon: Target, link: '/profile/student/edit' },
  marks12: { label: '12th Marks', icon: Target, link: '/profile/student/edit' },
  cgpa: { label: 'CGPA', icon: Target, link: '/profile/student/edit' },
  resume: { label: 'Resume', icon: FileText, link: '/profile/resumes' },
};

export function ProfileCompletionDialog({
  completion,
  isOpen,
  onClose,
}: ProfileCompletionDialogProps) {
  const router = useRouter();
  const [selectedField, setSelectedField] = useState<string | null>(null);

  // Auto-select first missing field
  useEffect(() => {
    if (completion && completion.missingFields.length > 0 && !selectedField) {
      setSelectedField(completion.missingFields[0]);
    }
  }, [completion, selectedField]);

  if (!completion || completion.isComplete) return null;

  const { percentage, missingFields } = completion;

  const handleCompleteProfile = () => {
    if (selectedField) {
      const config = fieldConfig[selectedField] || { link: '/profile' };
      router.push(config.link);
      onClose();
    } else if (missingFields.length > 0) {
      const firstField = missingFields[0];
      const config = fieldConfig[firstField] || { link: '/profile' };
      router.push(config.link);
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">Complete Your Profile</DialogTitle>
              <DialogDescription className="mt-1">
                Your profile is {percentage}% complete. Add more details to unlock all features.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profile Completion</span>
            <Badge variant="secondary">{percentage}%</Badge>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                percentage >= 80
                  ? 'bg-emerald-500'
                  : percentage >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Missing Fields */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Missing Information:</p>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {missingFields.map((field) => {
              const config = fieldConfig[field] || {
                label: field,
                icon: Target,
                link: '/profile',
              };
              const Icon = config.icon;

              return (
                <button
                  key={field}
                  onClick={() => setSelectedField(field)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all',
                    selectedField === field
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg',
                      selectedField === field ? 'bg-primary/10' : 'bg-background'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        selectedField === field ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium">{config.label}</span>
                  {selectedField === field && (
                    <ArrowRight className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">
            <X className="mr-2 h-4 w-4" />
            Skip for Now
          </Button>
          <Button onClick={handleCompleteProfile} className="w-full sm:w-auto">
            Complete Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

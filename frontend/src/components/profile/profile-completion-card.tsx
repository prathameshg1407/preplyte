// src/components/profile/profile-completion-card.tsx

'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ProfileCompletionStatus } from '@/types/profile.types';

interface ProfileCompletionCardProps {
  completion: ProfileCompletionStatus | null;
}

const fieldLabels: Record<string, string> = {
  name: 'Display Name',
  studentProfile: 'Student Profile',
  fullName: 'Full Name',
  studentId: 'Student ID',
  department: 'Department',
  courseYear: 'Course Year',
  skills: 'Skills',
  marks10: '10th Marks',
  marks12: '12th Marks',
  cgpa: 'CGPA',
  resume: 'Resume',
};

export function ProfileCompletionCard({ completion }: ProfileCompletionCardProps) {
  if (!completion) return null;

  const { percentage, missingFields, isComplete } = completion;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          Profile Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {!isComplete && missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Missing information:</p>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <Badge key={field} variant="outline" className="text-xs">
                  {fieldLabels[field] || field}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isComplete && (
          <p className="text-sm text-green-600">
            Your profile is complete! You&apos;re ready for interviews.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
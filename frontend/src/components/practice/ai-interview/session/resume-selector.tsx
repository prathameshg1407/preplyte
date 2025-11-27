// src/components/practice/ai-interview/session/resume-selector.tsx

'use client';

import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useResumes } from '@/lib/hooks/use-profile';

interface ResumeSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ResumeSelector({ value, onChange }: ResumeSelectorProps) {
  const { data, isLoading } = useResumes();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const resumes = data?.resumes || [];

  if (resumes.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 border border-dashed rounded-lg">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">No resumes uploaded</p>
          <p className="text-xs text-muted-foreground">
            Upload a resume for personalized questions
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/profile/resumes">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </a>
        </Button>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a resume (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No resume</SelectItem>
        {resumes.map((resume) => (
          <SelectItem key={resume.id} value={String(resume.id)}>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{resume.fileName}</span>
              {resume.isDefault && (
                <span className="text-xs text-muted-foreground">(Default)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
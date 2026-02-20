// src/components/practice/ai-interview/session/resume-selector.tsx

'use client';

import { FileText, Upload, Check } from 'lucide-react';
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
import Link from 'next/link';

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
      <div className="flex items-center gap-3 p-4 border border-dashed rounded-lg bg-muted/50">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">No resumes uploaded</p>
          <p className="text-xs text-muted-foreground">
            Upload a resume for personalized questions
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile/resumes">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Select value={value || 'none'} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a resume (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">No resume - generic questions</span>
        </SelectItem>
        {resumes.map((resume) => (
          <SelectItem key={resume.id} value={String(resume.id)}>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{resume.fileName}</span>
              {resume.isDefault && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="h-3 w-3" />
                  Default
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
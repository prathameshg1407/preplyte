// src/components/profile/resume-upload-card.tsx

'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function ResumeUploadCard() {
  const { uploadResume, isUploadingResume, canUploadMore, maxResumes, resumeCount } = useProfile();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Only PDF and Word documents are allowed.';
    }
    if (file.size > MAX_SIZE) {
      return 'File size exceeds 5MB limit.';
    }
    return null;
  };

  const handleFile = async (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!canUploadMore) {
      setError(`Maximum ${maxResumes} resumes allowed.`);
      return;
    }

    try {
      await uploadResume(file);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload Resume</CardTitle>
        <CardDescription>
          {resumeCount} of {maxResumes} resumes uploaded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${!canUploadMore ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => canUploadMore && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className="hidden"
            disabled={!canUploadMore || isUploadingResume}
          />

          {isUploadingResume ? (
            <div className="space-y-4">
              <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {canUploadMore
                    ? 'Drop your resume here or click to browse'
                    : 'Maximum resumes reached'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF or Word documents up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm flex items-center gap-2">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
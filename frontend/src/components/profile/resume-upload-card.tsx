// src/components/profile/resume-upload-card.tsx

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  File,
  CloudUpload,
} from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import { cn } from '@/lib/utils';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

export function ResumeUploadCard() {
  const { uploadResume, isUploadingResume, canUploadMore, maxResumes, resumeCount } =
    useProfile();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
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
    setUploadSuccess(false);
    setSelectedFile(file);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    if (!canUploadMore) {
      setError(`Maximum ${maxResumes} resumes allowed. Delete one to upload more.`);
      setSelectedFile(null);
      return;
    }

    try {
      await uploadResume(file);
      setUploadSuccess(true);
      setSelectedFile(null);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload resume');
      setSelectedFile(null);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CloudUpload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Upload Resume</CardTitle>
              <CardDescription>PDF or Word documents up to 5MB</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono">
            {resumeCount}/{maxResumes}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <motion.div
          className={cn(
            'relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200',
            dragActive && canUploadMore && 'border-primary bg-primary/5 scale-[1.02]',
            !dragActive && canUploadMore && 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            !canUploadMore && 'opacity-50 cursor-not-allowed bg-muted/30',
            isUploadingResume && 'pointer-events-none'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => canUploadMore && !isUploadingResume && inputRef.current?.click()}
          whileHover={canUploadMore && !isUploadingResume ? { scale: 1.01 } : {}}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            className="hidden"
            disabled={!canUploadMore || isUploadingResume}
          />

          <AnimatePresence mode="wait">
            {isUploadingResume ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="relative mx-auto h-16 w-16">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-primary/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
                {selectedFile && (
                  <div className="space-y-2">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                )}
              </motion.div>
            ) : uploadSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    Upload successful!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your resume has been added
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted"
                  animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                >
                  <Upload className={cn('h-8 w-8', dragActive ? 'text-primary' : 'text-muted-foreground')} />
                </motion.div>
                <div>
                  <p className="font-medium">
                    {canUploadMore
                      ? dragActive
                        ? 'Drop your file here'
                        : 'Drag & drop or click to browse'
                      : 'Maximum resumes reached'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {canUploadMore
                      ? 'Supports PDF, DOC, DOCX'
                      : 'Delete a resume to upload more'}
                  </p>
                </div>

                {/* File type badges */}
                {canUploadMore && (
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      PDF
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      DOC
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      DOCX
                    </Badge>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
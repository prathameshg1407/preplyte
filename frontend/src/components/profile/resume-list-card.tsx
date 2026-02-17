// src/components/profile/resume-list-card.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FileText,
  MoreVertical,
  Star,
  Trash2,
  Download,
  Link2,
  Loader2,
  Clock,
  CheckCircle2,
  ExternalLink,
  File,
} from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import type { Resume } from '@/types/profile.types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string) {
  if (fileName.endsWith('.pdf')) {
    return <File className="h-5 w-5 text-rose-500" />;
  }
  return <FileText className="h-5 w-5 text-blue-500" />;
}

interface ResumeItemProps {
  resume: Resume;
  index: number;
  onSetDefault: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onLink: (id: string) => Promise<void>;
  isUpdating: boolean;
  hasStudentProfile: boolean;
}

function ResumeItem({
  resume,
  index,
  onSetDefault,
  onDelete,
  onLink,
  isUpdating,
  hasStudentProfile,
}: ResumeItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(resume.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    try {
      await onSetDefault(resume.id);
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleLink = async () => {
    setIsLinking(true);
    try {
      await onLink(resume.id);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'group relative flex items-center justify-between rounded-xl border-2 p-4 transition-all',
          resume.isDefault
            ? 'border-primary/30 bg-primary/5'
            : 'border-transparent bg-muted/50 hover:border-muted-foreground/20 hover:bg-muted'
        )}
      >
        {/* Default indicator */}
        {resume.isDefault && (
          <div className="absolute -right-1 -top-1">
            <Badge className="gap-1 bg-primary text-primary-foreground shadow-lg">
              <Star className="h-3 w-3 fill-current" />
              Default
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-4 min-w-0">
          {/* File Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm">
            {getFileIcon(resume.fileName)}
          </div>

          {/* Info */}
          <div className="min-w-0">
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center gap-1.5 font-medium hover:text-primary"
            >
              <span className="truncate max-w-[200px]">{resume.fileName}</span>
              <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover/link:opacity-100" />
            </a>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <File className="h-3 w-3" />
                {formatFileSize(resume.fileSize)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isUpdating}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a
                href={resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </DropdownMenuItem>

            {!resume.isDefault && (
              <DropdownMenuItem onClick={handleSetDefault} disabled={isSettingDefault}>
                {isSettingDefault ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Star className="h-4 w-4 mr-2" />
                )}
                Set as Default
              </DropdownMenuItem>
            )}

            {hasStudentProfile && (
              <DropdownMenuItem onClick={handleLink} disabled={isLinking}>
                {isLinking ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Link to Profile
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Delete Resume?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to delete "{resume.fileName}"?
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ResumeListCard() {
  const { resumes, deleteResume, setDefaultResume, linkResumeToProfile, isUpdating, hasStudentProfile } =
    useProfile();

  if (resumes.length === 0) {
    return null; // Let ResumeUploadCard handle empty state
  }

  const defaultResume = resumes.find((r) => r.isDefault);
  const otherResumes = resumes.filter((r) => !r.isDefault);
  const sortedResumes = defaultResume ? [defaultResume, ...otherResumes] : resumes;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Resumes
          </CardTitle>
          <Badge variant="secondary">{resumes.length} uploaded</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedResumes.map((resume, index) => (
            <ResumeItem
              key={resume.id}
              resume={resume}
              index={index}
              onSetDefault={setDefaultResume}
              onDelete={deleteResume}
              onLink={linkResumeToProfile}
              isUpdating={isUpdating}
              hasStudentProfile={hasStudentProfile}
            />
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
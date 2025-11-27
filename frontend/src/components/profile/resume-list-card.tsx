// src/components/profile/resume-list-card.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Link,
  Loader2,
} from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import type { Resume } from '@/types/profile.types';
import { formatDistanceToNow } from 'date-fns';

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ResumeItemProps {
  resume: Resume;
  onSetDefault: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onLink: (id: number) => Promise<void>;
  isUpdating: boolean;
}

function ResumeItem({ resume, onSetDefault, onDelete, onLink, isUpdating }: ResumeItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(resume.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{resume.fileName}</p>
              {resume.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(resume.fileSize)} •{' '}
              {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </DropdownMenuItem>
            {!resume.isDefault && (
              <DropdownMenuItem onClick={() => onSetDefault(resume.id)}>
                <Star className="h-4 w-4 mr-2" />
                Set as Default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onLink(resume.id)}>
              <Link className="h-4 w-4 mr-2" />
              Link to Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{resume.fileName}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
  const { resumes, deleteResume, setDefaultResume, linkResumeToProfile, isUpdating } = useProfile();

  if (resumes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Resumes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No resumes uploaded yet</p>
            <p className="text-sm">Upload your first resume to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Resumes ({resumes.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {resumes.map((resume) => (
          <ResumeItem
            key={resume.id}
            resume={resume}
            onSetDefault={setDefaultResume}
            onDelete={deleteResume}
            onLink={linkResumeToProfile}
            isUpdating={isUpdating}
          />
        ))}
      </CardContent>
    </Card>
  );
}
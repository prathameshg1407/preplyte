'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useResumes, useDeleteResume, useDuplicateResume } from '@/lib/hooks/use-resume';
import { ResumeListItem } from '@/types/resume.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  Search,
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Download,
  Eye,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export function ResumeList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);

  const { data, isLoading } = useResumes({
    search: searchQuery || undefined,
    page,
    limit: 12,
  });

  const deleteResume = useDeleteResume();
  const duplicateResume = useDuplicateResume();

  const handleDelete = async () => {
    if (!deleteResumeId) return;
    await deleteResume.mutateAsync(deleteResumeId);
    setDeleteResumeId(null);
  };

  const handleDuplicate = async (resumeId: string) => {
    await duplicateResume.mutateAsync({ resumeId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => router.push('/resume-builder/templates')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Resume
        </Button>
      </div>

      {/* Resume Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.resumes.length === 0 ? (
        <EmptyState onCreateNew={() => router.push('/resume-builder/templates')} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onEdit={() => router.push(`/resume-builder/${resume.id}`)}
                onDuplicate={() => handleDuplicate(resume.id)}
                onDelete={() => setDeleteResumeId(resume.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteResumeId} onOpenChange={() => setDeleteResumeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resume? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ResumeCardProps {
  resume: ResumeListItem;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function ResumeCard({ resume, onEdit, onDuplicate, onDelete }: ResumeCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <div
        className="relative aspect-[8.5/11] cursor-pointer bg-muted"
        onClick={onEdit}
      >
        {resume.templateThumbnail ? (
          <img
            src={resume.templateThumbnail}
            alt={resume.templateName}
            className="h-full w-full object-cover object-top opacity-50"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Overlay with view button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" variant="secondary">
            <Edit className="mr-2 h-4 w-4" />
            Edit Resume
          </Button>
        </div>

        {/* Status Badge */}
        <div className="absolute left-2 top-2">
          {resume.isComplete ? (
            <Badge className="bg-green-500">
              <CheckCircle className="mr-1 h-3 w-3" />
              Complete
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="mr-1 h-3 w-3" />
              Draft
            </Badge>
          )}
        </div>

        {/* ATS Score */}
        {resume.lastAtsScore !== null && (
          <div className="absolute right-2 top-2">
            <Badge
              variant="outline"
              className={
                resume.lastAtsScore >= 80
                  ? 'border-green-500 text-green-600'
                  : resume.lastAtsScore >= 60
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-red-500 text-red-600'
              }
            >
              ATS: {resume.lastAtsScore}%
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{resume.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {resume.templateName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16">
      <FileText className="h-16 w-16 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold">No resumes yet</h3>
      <p className="mt-2 text-center text-muted-foreground">
        Create your first resume to get started
      </p>
      <Button className="mt-6" onClick={onCreateNew}>
        <Plus className="mr-2 h-4 w-4" />
        Create New Resume
      </Button>
    </div>
  );
}
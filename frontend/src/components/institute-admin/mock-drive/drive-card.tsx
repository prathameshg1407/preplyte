// src/components/institute-admin/mock-drive/drive-card.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { DriveStatusBadge } from './drive-status-badge';
import { MockDriveListItem, MockDriveStatus } from '@/types/admin.mockdrive.types';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Rocket,
  XCircle,
  Users,
  Layers,
  Calendar,
  Clock,
} from 'lucide-react';

interface DriveCardProps {
  drive: MockDriveListItem;
  onPublish?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isPublishing?: boolean;
  isCancelling?: boolean;
  isDeleting?: boolean;
  isDuplicating?: boolean;
}

export function DriveCard({
  drive,
  onPublish,
  onCancel,
  onDelete,
  onDuplicate,
  isPublishing,
  isCancelling,
  isDeleting,
  isDuplicating,
}: DriveCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const canPublish = drive.status === MockDriveStatus.DRAFT;
  const canCancel = ![MockDriveStatus.COMPLETED, MockDriveStatus.CANCELLED].includes(
    drive.status
  );
  const canDelete = [MockDriveStatus.DRAFT, MockDriveStatus.CANCELLED].includes(
    drive.status
  );
  const canEdit = drive.status === MockDriveStatus.DRAFT;

  return (
    <>
      <Card className="group transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="line-clamp-1 text-lg">
                <Link
                  href={`/institute-admin/mock-drives/${drive.id}`}
                  className="hover:underline"
                >
                  {drive.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-xs">
                Created {formatDistanceToNow(new Date(drive.createdAt), { addSuffix: true })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DriveStatusBadge status={drive.status} size="sm" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/institute-admin/mock-drives/${drive.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  {canEdit && (
                    <DropdownMenuItem asChild>
                      <Link href={`/institute-admin/mock-drives/${drive.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onDuplicate?.(drive.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canPublish && (
                    <DropdownMenuItem onClick={() => setShowPublishDialog(true)}>
                      <Rocket className="mr-2 h-4 w-4" />
                      Publish
                    </DropdownMenuItem>
                  )}
                  {canCancel && (
                    <DropdownMenuItem
                      onClick={() => setShowCancelDialog(true)}
                      className="text-yellow-600"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{drive.totalRegistrations} registrations</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>{drive.totalBatches} batches</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{drive.totalModules} modules</span>
            </div>
            {drive.driveStartDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(drive.driveStartDate), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3">
          <div className="flex w-full gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/institute-admin/mock-drives/${drive.id}`}>
                View Details
              </Link>
            </Button>
            {canEdit && (
              <Button asChild variant="default" size="sm" className="flex-1">
                <Link href={`/institute-admin/mock-drives/${drive.id}/edit`}>
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mock Drive</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{drive.title}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(drive.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Mock Drive</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{drive.title}"? Students who have
              registered will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Active</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onCancel?.(drive.id);
                setShowCancelDialog(false);
              }}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Drive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Mock Drive</AlertDialogTitle>
            <AlertDialogDescription>
              Publishing "{drive.title}" will generate questions for all modules and
              make the drive visible to students. Make sure all configurations are
              correct before publishing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onPublish?.(drive.id);
                setShowPublishDialog(false);
              }}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
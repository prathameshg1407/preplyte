// src/components/institute-admin/mock-drive/batches/batch-card.tsx

'use client';

import Link from 'next/link';
import { format } from 'date-fns';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BatchStatusBadge } from './batch-status-badge';
import { BatchListItem, MockDriveBatchStatus } from '@/types/admin.mockdrive.types';
import {
  MoreHorizontal,
  Eye,
  Play,
  CheckCircle,
  Trash2,
  Users,
  Calendar,
  Clock,
} from 'lucide-react';

interface BatchCardProps {
  batch: BatchListItem;
  driveId: string;
  onStart: (batchId: string) => void;
  onComplete: (batchId: string) => void;
  onDelete: (batchId: string) => void;
  isStarting?: boolean;
  isCompleting?: boolean;
  isDeleting?: boolean;
}

export function BatchCard({
  batch,
  driveId,
  onStart,
  onComplete,
  onDelete,
  isStarting,
  isCompleting,
  isDeleting,
}: BatchCardProps) {
  const canStart = batch.status === MockDriveBatchStatus.SCHEDULED;
  const canComplete = batch.status === MockDriveBatchStatus.IN_PROGRESS;
  const canDelete = [
    MockDriveBatchStatus.CREATED,
    MockDriveBatchStatus.SCHEDULED,
  ].includes(batch.status);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{batch.name}</CardTitle>
        <div className="flex items-center gap-2">
          <BatchStatusBadge status={batch.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/institute-admin/mock-drives/${driveId}/batches/${batch.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {canStart && (
                <DropdownMenuItem onClick={() => onStart(batch.id)} disabled={isStarting}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Batch
                </DropdownMenuItem>
              )}
              {canComplete && (
                <DropdownMenuItem onClick={() => onComplete(batch.id)} disabled={isCompleting}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Batch
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{batch.name}"? This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(batch.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Schedule */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(batch.scheduledStartTime), 'PPP')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {format(new Date(batch.scheduledStartTime), 'p')} -{' '}
            {format(new Date(batch.scheduledEndTime), 'p')}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-lg font-bold">{batch.assignedCount}</div>
            <div className="text-xs text-muted-foreground">Assigned</div>
          </div>
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-lg font-bold">{batch.inProgressCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="rounded-lg bg-muted p-2 text-center">
            <div className="text-lg font-bold">{batch.completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>

        {/* Capacity */}
        {batch.maxCapacity && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacity</span>
            <span>
              {batch.assignedCount} / {batch.maxCapacity}
            </span>
          </div>
        )}

        {/* View Button */}
        <Button asChild variant="outline" className="w-full">
          <Link href={`/institute-admin/mock-drives/${driveId}/batches/${batch.id}`}>
            <Users className="mr-2 h-4 w-4" />
            View Students
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
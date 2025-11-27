// src/app/institute-admin/mock-drives/[driveId]/batches/[batchId]/page.tsx

'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Checkbox } from '@/components/ui/checkbox';
import { BatchStatusBadge } from '@/components/institute-admin/mock-drive/batches/batch-status-badge';
import { RegistrationStatusBadge } from '@/components/institute-admin/mock-drive/registrations/registration-status-badge';
import { AttemptStatusBadge } from '@/components/institute-admin/mock-drive/results/attempt-status-badge';
import { useMockDriveDetail } from '@/lib/hooks/institute-admin/use-mockdrive';
import { useBatchDetailPage } from '@/lib/hooks/institute-admin/use-mockdrive-batches';
import { useRegistrations } from '@/lib/hooks/institute-admin/use-mockdrive-registrations';
import { MockDriveBatchStatus, MockDriveRegistrationStatus } from '@/types/admin.mockdrive.types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Play,
  CheckCircle,
  Trash2,
  UserPlus,
  UserMinus,
  Search,
  X,
} from 'lucide-react';

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driveId = params.driveId as string;
  const batchId = params.batchId as string;

  const [searchInput, setSearchInput] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // Fetch mock drive details
  const { data: drive } = useMockDriveDetail(driveId);

  // Batch detail hook
  const {
    batch,
    students,
    isLoadingBatch,
    isLoadingStudents,
    updateBatch,
    deleteBatch,
    assignStudents,
    unassignStudents,
    startBatch,
    completeBatch,
    isUpdating,
    isDeleting,
    isAssigning,
    isUnassigning,
    isStarting,
    isCompleting,
  } = useBatchDetailPage(driveId, batchId);

  // Fetch unassigned registrations for assignment
 // Fetch unassigned registrations for assignment
const { data: unassignedData } = useRegistrations(driveId, {
  hasBatch: false,
  status: MockDriveRegistrationStatus.APPROVED,
  limit: 100,
});
  const unassignedRegistrations = unassignedData?.data ?? [];

  // Filter students by search
  const filteredStudents = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchInput.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Handlers
  const handleDelete = async () => {
    await deleteBatch();
    router.push(`/institute-admin/mock-drives/${driveId}/batches`);
  };

  const handleAssignStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    await assignStudents(selectedStudentIds);
    setSelectedStudentIds([]);
    setShowAssignDialog(false);
  };

  const handleUnassignStudent = async (registrationId: string) => {
    await unassignStudents([registrationId]);
  };

  const toggleStudentSelection = useCallback((id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const canStart = batch?.status === MockDriveBatchStatus.SCHEDULED;
  const canComplete = batch?.status === MockDriveBatchStatus.IN_PROGRESS;
  const canDelete = [
    MockDriveBatchStatus.CREATED,
    MockDriveBatchStatus.SCHEDULED,
  ].includes(batch?.status as MockDriveBatchStatus);
  const canModifyStudents = [
    MockDriveBatchStatus.CREATED,
    MockDriveBatchStatus.SCHEDULED,
  ].includes(batch?.status as MockDriveBatchStatus);

  if (isLoadingBatch) {
    return <PageSkeleton />;
  }

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Batch not found</p>
        <Button asChild className="mt-4">
          <Link href={`/institute-admin/mock-drives/${driveId}/batches`}>
            Back to Batches
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/institute-admin/mock-drives/${driveId}/batches`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{batch.name}</h1>
              <BatchStatusBadge status={batch.status} />
            </div>
            <p className="text-sm text-muted-foreground">{drive?.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canStart && (
            <Button onClick={startBatch} disabled={isStarting}>
              <Play className="mr-2 h-4 w-4" />
              Start Batch
            </Button>
          )}
          {canComplete && (
            <Button onClick={completeBatch} disabled={isCompleting}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Batch
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Batch</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{batch.name}"? Students will
                    be unassigned but not removed from the drive.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Schedule
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {format(new Date(batch.scheduledStartTime), 'PPP')}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(batch.scheduledStartTime), 'p')} -{' '}
              {format(new Date(batch.scheduledEndTime), 'p')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batch.stats.totalAssigned}</div>
            {batch.maxCapacity && (
              <p className="text-xs text-muted-foreground">
                of {batch.maxCapacity} capacity
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batch.stats.totalInProgress}</div>
            <p className="text-xs text-muted-foreground">currently attempting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batch.stats.totalCompleted}</div>
            {batch.stats.averageScore !== null && (
              <p className="text-xs text-muted-foreground">
                Avg: {batch.stats.averageScore.toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Students Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Students ({students.length})</CardTitle>
          {canModifyStudents && unassignedRegistrations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignDialog(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Students
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Students Table */}
          {isLoadingStudents ? (
            <Skeleton className="h-64" />
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Users className="h-8 w-8" />
              <p className="mt-2">No students assigned to this batch</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Attempt</TableHead>
                    <TableHead>Score</TableHead>
                    {canModifyStudents && <TableHead className="w-12" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.registrationId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.studentId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {student.department}
                          <span className="text-muted-foreground">
                            {' '}
                            • {student.courseYear}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RegistrationStatusBadge
                          status={student.registrationStatus}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>
                        {student.attemptStatus ? (
                          <AttemptStatusBadge status={student.attemptStatus} size="sm" />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Not started
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.attemptScore !== null ? (
                          <span className="font-medium">
                            {student.attemptScore.toFixed(1)}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      {canModifyStudents && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUnassignStudent(student.registrationId)
                            }
                            disabled={isUnassigning}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Students Dialog */}
      <AlertDialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Students to Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Select students to assign to this batch. Only approved students
              without a batch are shown.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="max-h-96 overflow-y-auto">
            {unassignedRegistrations.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No unassigned students available
              </p>
            ) : (
              <div className="space-y-2">
                {unassignedRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      selectedStudentIds.includes(reg.id)
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                  >
                    <Checkbox
                      checked={selectedStudentIds.includes(reg.id)}
                      onCheckedChange={() => toggleStudentSelection(reg.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{reg.studentName}</div>
                      <div className="text-sm text-muted-foreground">
                        {reg.studentId} • {reg.department}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedStudentIds([])}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAssignStudents}
              disabled={selectedStudentIds.length === 0 || isAssigning}
            >
              Assign {selectedStudentIds.length} Students
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
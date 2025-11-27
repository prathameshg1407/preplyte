// src/components/institute-admin/mock-drive/registrations/registration-detail-sheet.tsx

'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RegistrationStatusBadge } from './registration-status-badge';
import { RegistrationListItem, MockDriveRegistrationStatus } from '@/types/admin.mockdrive.types';
import { format } from 'date-fns';
import {
  User,
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Layers,
} from 'lucide-react';

interface RegistrationDetailSheetProps {
  registration: RegistrationListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isUpdating?: boolean;
}

export function RegistrationDetailSheet({
  registration,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isUpdating,
}: RegistrationDetailSheetProps) {
  if (!registration) return null;

  const isPending = registration.status === MockDriveRegistrationStatus.PENDING;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Registration Details</SheetTitle>
          <SheetDescription>
            View and manage this registration
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <RegistrationStatusBadge status={registration.status} />
          </div>

          <Separator />

          {/* Student Info */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <User className="h-4 w-4" />
              Student Information
            </h4>
            <div className="grid gap-3">
              <DetailRow label="Name" value={registration.studentName} />
              <DetailRow label="Student ID" value={registration.studentId || '-'} />
            </div>
          </div>

          <Separator />

          {/* Academic Info */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <GraduationCap className="h-4 w-4" />
              Academic Details
            </h4>
            <div className="grid gap-3">
              <DetailRow label="Department" value={registration.department || '-'} />
              <DetailRow label="Course Year" value={registration.courseYear || '-'} />
              <DetailRow
                label="Average CGPA"
                value={registration.averageCgpa?.toFixed(2) || '-'}
              />
            </div>
          </div>

          <Separator />

          {/* Batch Info */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <Layers className="h-4 w-4" />
              Batch Assignment
            </h4>
            <div className="grid gap-3">
              <DetailRow
                label="Batch"
                value={
                  registration.batchName ? (
                    <Badge variant="outline">{registration.batchName}</Badge>
                  ) : (
                    'Not assigned'
                  )
                }
              />
            </div>
          </div>

          <Separator />

          {/* Registration Info */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4" />
              Registration Info
            </h4>
            <div className="grid gap-3">
              <DetailRow
                label="Registered At"
                value={format(new Date(registration.registeredAt), 'PPP p')}
              />
              <DetailRow
                label="Eligibility"
                value={
                  registration.isEligible === null ? (
                    'Not checked'
                  ) : registration.isEligible ? (
                    <Badge className="bg-green-100 text-green-800">Eligible</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Not Eligible</Badge>
                  )
                }
              />
            </div>
          </div>

          {/* Actions */}
          {isPending && (
            <>
              <Separator />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => onApprove(registration.id)}
                  disabled={isUpdating}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onReject(registration.id)}
                  disabled={isUpdating}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
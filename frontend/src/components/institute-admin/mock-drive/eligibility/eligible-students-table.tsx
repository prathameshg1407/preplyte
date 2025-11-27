// src/components/institute-admin/mock-drive/eligibility/eligible-students-table.tsx

'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EligibleStudent, PaginationMeta } from '@/types/admin.mockdrive.types';
import { RegistrationStatusBadge } from '../registrations/registration-status-badge';
import { Users, CheckCircle, Clock, Eye } from 'lucide-react';

interface EligibleStudentsTableProps {
  students: EligibleStudent[];
  isLoading?: boolean;
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  driveId: string;
}

export function EligibleStudentsTable({
  students,
  isLoading,
  pagination,
  onPageChange,
  driveId,
}: EligibleStudentsTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No eligible students found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting the eligibility criteria or search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Course Year</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>10th / 12th</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{student.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.studentId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{student.department || '-'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{student.courseYear || '-'}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {student.averageCgpa?.toFixed(2) || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span>{student.marks10 ?? '-'}%</span>
                    <span className="text-muted-foreground"> / </span>
                    <span>{student.marks12 ?? '-'}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {student.skills.length > 0 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {student.skills[0]}
                            </Badge>
                            {student.skills.length > 1 && (
                              <span className="text-xs text-muted-foreground">
                                +{student.skills.length - 1}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-wrap gap-1">
                            {student.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {student.isRegistered ? (
                    student.registrationStatus ? (
                      <RegistrationStatusBadge
                        status={student.registrationStatus}
                        size="sm"
                      />
                    ) : (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Registered
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      Not Registered
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {students.length} of {pagination.total} students
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(pagination.page - 1)}
                  className={
                    !pagination.hasPrevious
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={page === pagination.page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(pagination.page + 1)}
                  className={
                    !pagination.hasNext
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 7 }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 7 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
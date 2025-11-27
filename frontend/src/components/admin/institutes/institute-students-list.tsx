// src/components/admin/institutes/institute-students-list.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Skeleton } from '../../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Pagination } from '../common/pagination';
import { Search, Eye, UserCircle } from 'lucide-react';
import type { User, InstituteStudentFilters, PaginationMeta } from '../../../types/admin.types';

interface InstituteStudentsListProps {
  instituteId: string;
  fetchStudents: (filters?: InstituteStudentFilters) => Promise<{
    students: User[];
    pagination: PaginationMeta;
  }>;
}

export function InstituteStudentsList({
  instituteId,
  fetchStudents,
}: InstituteStudentsListProps) {
  const [students, setStudents] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InstituteStudentFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStudents(filters);
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchStudents, filters]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleFilterChange = (newFilters: Partial<InstituteStudentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="h-9 pl-9"
          />
        </div>

        <Input
          placeholder="Department"
          value={filters.department || ''}
          onChange={(e) => handleFilterChange({ department: e.target.value })}
          className="h-9 w-[130px]"
        />

        <Select
          value={filters.isActive === undefined ? 'all' : String(filters.isActive)}
          onValueChange={(value) =>
            handleFilterChange({
              isActive: value === 'all' ? undefined : value === 'true',
            })
          }
        >
          <SelectTrigger className="h-9 w-[100px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value) =>
            handleFilterChange({ sortBy: value as InstituteStudentFilters['sortBy'] })
          }
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Join Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="averageCgpa">CGPA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <StudentListSkeleton />
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-border rounded-lg">
          <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center mb-3">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="font-medium">No students found</p>
          <p className="text-sm text-muted-foreground mt-1">
            No students match your filters
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-medium">Student</TableHead>
                <TableHead className="font-medium">ID</TableHead>
                <TableHead className="font-medium">Department</TableHead>
                <TableHead className="font-medium">Year</TableHead>
                <TableHead className="font-medium text-center">CGPA</TableHead>
                <TableHead className="font-medium text-center">Sessions</TableHead>
                <TableHead className="font-medium text-center">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="group">
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {student.profile?.fullName || student.name || 'Unnamed'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {student.profile?.studentId || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{student.profile?.department || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{student.profile?.courseYear || '—'}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm tabular-nums">
                      {student.profile?.averageCgpa?.toFixed(2) || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm tabular-nums">
                      {(student._count?.aptitudeSessions || 0) +
                        (student._count?.machineSessions || 0) +
                        (student._count?.aiInterviewSessions || 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex h-2 w-2 rounded-full ${student.isActive ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <Link href={`/admin/users/${student.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

function StudentListSkeleton() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="space-y-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
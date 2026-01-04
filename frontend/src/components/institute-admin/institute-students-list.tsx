'use client';

import { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw, MoreHorizontal, Users,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';

/* ---------------- Types ---------------- */

export type Student = {
  id: string;
  email: string;
  name?: string;
  studentId: string;
  department?: string;
  courseYear?: string;
  averageCgpa?: number;
  isActive: boolean;
  createdAt: string;
};

export type Filters = {
  search?: string;
  department?: string;
  minCgpa?: number;
  status?: 'all' | 'active' | 'inactive';
};

export type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

interface InstituteStudentsListProps {
  students: Student[];
  loading: boolean;
  error?: string;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  onRefresh: () => void;
  showActions?: boolean;
}

export function InstituteStudentsList({
  students,
  loading,
  error,
  filters,
  onFiltersChange,
  pagination,
  onPaginationChange,
  onRefresh,
  showActions = false,
}: InstituteStudentsListProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  /* ---------- Pagination Logic (FIXED) ---------- */

  // FIX: Calculate total pages based on the 'total' count from the API metadata
  const totalPages = Math.max(
    1,
    Math.ceil(pagination.total / pagination.pageSize),
  );

  // FIX: Since the API already handles filtering and pagination, 
  // we use the 'students' prop directly.
  const displayStudents = students;

  /* ---------- Selection ---------- */

  const isAllSelected =
    displayStudents.length > 0 &&
    displayStudents.every(s => selectedStudents.has(s.id));

  const isAnySelected = selectedStudents.size > 0;

  const handleSelectAll = (checked: CheckedState) => {
    const updated = new Set(selectedStudents);
    displayStudents.forEach(s =>
      checked ? updated.add(s.id) : updated.delete(s.id),
    );
    setSelectedStudents(updated);
  };

  const handleStudentSelect = (id: string, checked: CheckedState) => {
    const updated = new Set(selectedStudents);
    checked ? updated.add(id) : updated.delete(id);
    setSelectedStudents(updated);
  };

  /* ---------- Error State ---------- */

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-destructive rounded-lg p-8">
        <p className="text-destructive font-semibold mb-2">Error loading students</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      {/* Toolbar */}
      <div className="p-4 border-b flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
          </Button>

          <Checkbox
            checked={isAllSelected ? true : isAnySelected ? 'indeterminate' : false}
            onCheckedChange={handleSelectAll}
          />

          <span className="text-sm text-muted-foreground">
            {selectedStudents.size} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search..."
            value={filters.search || ''}
            onChange={e =>
              onFiltersChange({ ...filters, search: e.target.value || undefined })
            }
            className="w-40"
          />

          <Input
            type="number"
            placeholder="Min CGPA"
            value={filters.minCgpa ?? ''}
            onChange={e =>
              onFiltersChange({
                ...filters,
                minCgpa: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-24"
          />

          <Select
            value={filters.status || 'all'}
            onValueChange={value =>
              onFiltersChange({
                ...filters,
                status: value as Filters['status'],
              })
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : displayStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p>No students found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Status</TableHead>
                {showActions && <TableHead />}
              </TableRow>
            </TableHeader>

            <TableBody>
              {displayStudents.map(student => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.has(student.id)}
                      onCheckedChange={c => handleStudentSelect(student.id, c)}
                    />
                  </TableCell>
                  <TableCell>{student.name ?? 'Unknown'}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.department ?? 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{(student.averageCgpa ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={student.isActive ? 'default' : 'secondary'}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && (
        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Page {pagination.page} of {totalPages} ({pagination.total} total)
          </span>

          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  onClick={() =>
                    pagination.page > 1 &&
                    onPaginationChange({
                      ...pagination,
                      page: pagination.page - 1,
                    })
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className={pagination.page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  onClick={() =>
                    pagination.page < totalPages &&
                    onPaginationChange({
                      ...pagination,
                      page: pagination.page + 1,
                    })
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
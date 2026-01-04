'use client';

import { useState } from 'react';
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
  year?: string; // Added year filter type
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

  const totalPages = Math.max(
    1,
    Math.ceil(pagination.total / pagination.pageSize),
  );

  const displayStudents = students;

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
            checked={displayStudents.length > 0 && displayStudents.every(s => selectedStudents.has(s.id)) ? true : selectedStudents.size > 0 ? 'indeterminate' : false}
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
            onChange={e => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            className="w-40"
          />

          {/* Department Filter */}
          <Select
            value={filters.department || 'all_depts'}
            onValueChange={value => onFiltersChange({ 
              ...filters, 
              department: value === 'all_depts' ? undefined : value 
            })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_depts">All Departments</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Information Technology">Information Technology</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Mechanical">Mechanical</SelectItem>
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <Select
            value={filters.year || 'all_years'}
            onValueChange={value => onFiltersChange({ 
              ...filters, 
              year: value === 'all_years' ? undefined : value 
            })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_years">All Years</SelectItem>
              <SelectItem value="1st Year">1st Year</SelectItem>
              <SelectItem value="2nd Year">2nd Year</SelectItem>
              <SelectItem value="3rd Year">3rd Year</SelectItem>
              <SelectItem value="4th Year">4th Year</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={value => onFiltersChange({ ...filters, status: value as Filters['status'] })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
                <TableHead className="w-12" />
                <TableHead>Student</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                {showActions && <TableHead className="w-12" />}
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
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium uppercase leading-tight">
                        {student.name || `Student ${student.studentId.slice(-3)}`}
                      </span>
                      <span className="text-xs text-muted-foreground">{student.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {student.studentId || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {student.department || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {student.courseYear || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.isActive ? 'default' : 'secondary'} className="font-normal">
                      {student.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
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
        <div className="p-4 border-t flex justify-between items-center bg-background/50">
          <span className="text-xs text-muted-foreground font-medium">
            Showing {displayStudents.length} of {pagination.total} students (Page {pagination.page} of {totalPages})
          </span>

          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  onClick={() => pagination.page > 1 && onPaginationChange({ ...pagination, page: pagination.page - 1 })}
                />
              </PaginationItem>
              
              {/* Show limited page numbers */}
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                    <PaginationItem key={pageNum}>
                        <Button 
                            variant={pagination.page === pageNum ? "outline" : "ghost"} 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onPaginationChange({ ...pagination, page: pageNum })}
                        >
                            {pageNum}
                        </Button>
                    </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext
                  className={pagination.page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  onClick={() => pagination.page < totalPages && onPaginationChange({ ...pagination, page: pagination.page + 1 })}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
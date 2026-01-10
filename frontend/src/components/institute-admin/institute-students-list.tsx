// Path: frontend/src/components/institute-admin/institute-students-list.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  RefreshCw, MoreHorizontal, Users, Eye,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { StudentProfileSheet } from './student-profile-sheet'; // ✅ New import
import Link from 'next/link';
import type { Student } from '@/types/institute-admin.types'; // ✅ Use shared types

/* ---------------- Types (align with Prisma StudentProfile) ---------------- */
export type Filters = {
  search?: string;
  departmentId?: string;
  year?: string;
  minCgpa?: string; // Backend expects string
  status?: 'all' | 'active' | 'inactive';
};

export type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
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
  instituteId?: string; // ✅ For profile links
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
  showActions = true,
  instituteId,
}: InstituteStudentsListProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const router = useRouter();

  const totalPages = pagination.totalPages || Math.max(
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

  // ✅ Enhanced error UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-destructive rounded-lg p-8">
        <Users className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive font-semibold mb-2 text-lg">Error loading students</p>
        <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">{error}</p>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Load
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg bg-card shadow-sm">
      {/* Toolbar - Enhanced Layout */}
      <div className="p-6 border-b bg-background/50 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onRefresh} 
              disabled={loading}
              className="h-10 w-10 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Checkbox
              checked={
                displayStudents.length > 0 && 
                displayStudents.every(s => selectedStudents.has(s.id)) 
                  ? true 
                  : selectedStudents.size > 0 
                  ? 'indeterminate' 
                  : false
              }
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-foreground">
              {selectedStudents.size} of {displayStudents.length} selected
            </span>
          </div>

          {/* Filters - Responsive */}
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Search by name/email/ID..."
              value={filters.search || ''}
              onChange={e => onFiltersChange({ 
                ...filters, 
                search: e.target.value || undefined 
              })}
              className="w-48 h-10 flex-shrink-0"
              disabled={loading}
            />
            <Select
              value={filters.departmentId || 'all_depts'}
              onValueChange={value => onFiltersChange({ 
                ...filters, 
                departmentId: value === 'all_depts' ? undefined : value 
              })}
              disabled={loading}
            >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_depts">All Departments</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Information Technology">Information Technology</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Mechanical">Mechanical</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.year || 'all_years'}
              onValueChange={value => onFiltersChange({ 
                ...filters, 
                year: value === 'all_years' ? undefined : value 
              })}
              disabled={loading}
            >
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="All Years" />
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
              onValueChange={value => onFiltersChange({ 
                ...filters, 
                status: value as Filters['status'] 
              })}
              disabled={loading}
            >
              <SelectTrigger className="w-32 h-10">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {filters.minCgpa !== undefined && (
              <Badge variant="secondary" className="text-xs">
                CGPA ≥ {filters.minCgpa}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : displayStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 py-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2 text-muted-foreground">
              No students match your filters
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your search criteria or filters above.
            </p>
            <Button variant="outline" onClick={onRefresh} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-border/50">
                  <TableHead className="w-12" />
                  <TableHead className="w-56">Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">CGPA</TableHead>
                  <TableHead>Status</TableHead>
                  {showActions && <TableHead className="w-16 text-right" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayStudents.map((student) => (
                  <TableRow key={student.id} className="border-b hover:bg-accent/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.has(student.id)}
                        onCheckedChange={(c) => handleStudentSelect(student.id, c)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm leading-tight">
                            {student.name || `Student ${student.studentId.slice(-4)}`}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                      {student.studentId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {student.departmentId || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      <Badge variant="secondary" className="text-xs">
                        {student.courseYear || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {student.averageCgpa ? (
                        <div className="font-mono text-sm font-bold text-primary">
                          {student.averageCgpa.toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={student.isActive ? 'default' : 'destructive'} 
                        className="text-xs font-medium"
                      >
                        {student.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                         
                          {/* ✅ Full Profile Page Link */}
                          <Link href={`/institute-admin/students/${student.id}`}>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-primary/5"
                              title="View Full Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                onClick={() => router.push(`/institute-admin/students/${student.id}`)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
                                View Full Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive flex items-center gap-2"
                                disabled
                              >
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination Footer - Enhanced */}
      {!loading && (
        <div className="p-4 border-t bg-background/75 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{displayStudents.length}</strong> of{' '}
              <strong>{pagination.total}</strong> students
              {pagination.totalPages && (
                <span> (Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>)</span>
              )}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    onClick={() => pagination.page > 1 && onPaginationChange({ 
                      ...pagination, 
                      page: pagination.page - 1 
                    })}
                  />
                </PaginationItem>
                
                {/* Dynamic page buttons */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pageNum = pagination.page > 3 
                    ? Math.max(pagination.page - 3, 1) + i 
                    : i + 1;
                  
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <Button
                        variant={pagination.page === pageNum ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-8 gap-0 p-0 mx-0.5"
                        onClick={() => onPaginationChange({ ...pagination, page: pageNum })}
                      >
                        {pageNum}
                      </Button>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    className={pagination.page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    onClick={() => pagination.page < totalPages && onPaginationChange({ 
                      ...pagination, 
                      page: pagination.page + 1 
                    })}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}

// src/components/admin/institutes/institute-list.tsx

'use client';

import Link from 'next/link';
import { Button } from '../../ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2, ToggleLeft, Building2, Plus } from 'lucide-react';
import { Pagination } from '../common/pagination';
import type { Institute, PaginationMeta } from '../../../types/admin.types';

interface InstituteListProps {
  institutes: Institute[];
  loading: boolean;
  pagination: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  statusLoading: string | null;
  deleteLoading: string | null;
}

export function InstituteList({
  institutes,
  loading,
  pagination,
  onPageChange,
  onToggleStatus,
  onDelete,
  statusLoading,
  deleteLoading,
}: InstituteListProps) {
  if (loading && institutes.length === 0) {
    return <InstituteListSkeleton />;
  }

  if (institutes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-lg">
        <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center mb-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium">No institutes found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Get started by creating a new institute
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/admin/institutes/new">
            <Plus className="h-4 w-4 mr-1" />
            Add Institute
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="font-medium">Institute</TableHead>
              <TableHead className="font-medium">Domain</TableHead>
              <TableHead className="font-medium">Location</TableHead>
              <TableHead className="font-medium text-center">Students</TableHead>
              <TableHead className="font-medium text-center">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institutes.map((institute) => (
              <TableRow key={institute.id} className="group">
                <TableCell>
                  <span className="font-medium text-sm">{institute.name}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">
                    {institute.domain}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {institute.profile?.location || '—'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="tabular-nums text-sm">{institute._count.users}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex h-2 w-2 rounded-full ${institute.isActive ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/institutes/${institute.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/institutes/${institute.id}/edit`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(institute.id)}
                        disabled={statusLoading === institute.id}
                      >
                        <ToggleLeft className="h-4 w-4 mr-2" />
                        {institute.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(institute.id)}
                        disabled={deleteLoading === institute.id}
                        className="text-muted-foreground focus:text-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

function InstituteListSkeleton() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="space-y-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
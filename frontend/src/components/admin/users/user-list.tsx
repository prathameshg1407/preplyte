// src/components/admin/users/user-list.tsx

'use client';

import Link from 'next/link';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
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
import { Skeleton } from '../../ui/skeleton';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ToggleLeft,
  KeyRound,
  Users,
  Plus,
} from 'lucide-react';
import { Pagination } from '../common/pagination';
import type { User, PaginationMeta } from '../../../types/admin.types';

interface UserListProps {
  users: User[];
  loading: boolean;
  pagination: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  statusLoading: string | null;
  deleteLoading: string | null;
}

const roleLabels: Record<string, string> = {
  PLATFORM_ADMIN: 'Admin',
  INSTITUTE_ADMIN: 'Inst. Admin',
  USER: 'Student',
};

export function UserList({
  users,
  loading,
  pagination,
  onPageChange,
  onToggleStatus,
  onDelete,
  statusLoading,
  deleteLoading,
}: UserListProps) {
  if (loading && users.length === 0) {
    return <UserListSkeleton />;
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-lg">
        <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center mb-3">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium">No users found</p>
        <p className="text-sm text-muted-foreground mt-1">
          No users match your filters
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/admin/users/new">
            <Plus className="h-4 w-4 mr-1" />
            Add User
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
              <TableHead className="font-medium">User</TableHead>
              <TableHead className="font-medium">Role</TableHead>
              <TableHead className="font-medium">Institute</TableHead>
              <TableHead className="font-medium text-center">Sessions</TableHead>
              <TableHead className="font-medium text-center">Status</TableHead>
              <TableHead className="font-medium">Last Login</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-sm font-medium bg-secondary">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.profile?.fullName || user.name || 'Unnamed'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{roleLabels[user.role]}</span>
                </TableCell>
                <TableCell>
                  {user.institute ? (
                    <Link
                      href={`/admin/institutes/${user.institute.id}`}
                      className="text-sm hover:underline"
                    >
                      {user.institute.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm tabular-nums">
                    {(user._count?.aptitudeSessions || 0) +
                      (user._count?.machineSessions || 0) +
                      (user._count?.aiInterviewSessions || 0)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex h-2 w-2 rounded-full ${user.isActive ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </span>
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
                        <Link href={`/admin/users/${user.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}/reset-password`}>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Reset Password
                        </Link>
                      </DropdownMenuItem>
                      {user.role !== 'PLATFORM_ADMIN' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(user.id)}
                            disabled={statusLoading === user.id}
                          >
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(user.id)}
                            disabled={deleteLoading === user.id}
                            className="text-muted-foreground focus:text-foreground"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
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

function UserListSkeleton() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="space-y-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
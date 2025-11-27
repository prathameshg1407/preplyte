// src/app/admin/users/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUsers } from '../../../lib/hooks/use-admin';
import { UserList } from '../../../components/admin/users/user-list';
import { UserFiltersBar } from '../../../components/admin/users/user-filters';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const {
    users,
    pagination,
    loading,
    filters,
    toggleStatus,
    deleteUser,
    changePage,
    changeFilters,
  } = useUsers();

  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const handleToggleStatus = async (id: string) => {
    setStatusLoading(id);
    try {
      await toggleStatus(id);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setDeleteLoading(id);
    try {
      await deleteUser(id);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage platform users
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/users/new">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <UserFiltersBar filters={filters} onFiltersChange={changeFilters} />

      {/* List */}
      <UserList
        users={users}
        loading={loading}
        pagination={pagination}
        onPageChange={changePage}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        statusLoading={statusLoading}
        deleteLoading={deleteLoading}
      />
    </div>
  );
}
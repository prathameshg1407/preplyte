// src/app/institute-admin/departments/page.tsx

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Upload, Building2 } from 'lucide-react';
import {
  DepartmentStatsCards,
  DepartmentTable,
  DepartmentDialog,
  BulkCreateDialog,
  DepartmentFilters,
} from '@/components/institute-admin/departments';
import { useDepartments } from '@/lib/hooks/institute-admin';
import type { Department, DepartmentQueryParams } from '@/types/department.types';

export default function DepartmentsPage() {
  const [filters, setFilters] = useState<DepartmentQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);

  const { data, isLoading } = useDepartments(filters);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleEdit = (department: Department) => {
    setEditDepartment(department);
  };

  const handleCloseEdit = (open: boolean) => {
    if (!open) {
      setEditDepartment(null);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              Manage your institute's departments
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkCreateOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Create
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <DepartmentStatsCards />

      {/* Main Content */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">All Departments</CardTitle>
            <DepartmentFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <DepartmentTable
            departments={data?.departments ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
          />

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(data.pagination.page - 1)}
                      className={
                        data.pagination.page <= 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {[...Array(data.pagination.totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => handlePageChange(i + 1)}
                        isActive={data.pagination.page === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(data.pagination.page + 1)}
                      className={
                        !data.pagination.hasMore
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <DepartmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        department={null}
      />

      {/* Edit Dialog */}
      <DepartmentDialog
        open={!!editDepartment}
        onOpenChange={handleCloseEdit}
        department={editDepartment}
      />

      {/* Bulk Create Dialog */}
      <BulkCreateDialog
        open={isBulkCreateOpen}
        onOpenChange={setIsBulkCreateOpen}
      />
    </div>
  );
}
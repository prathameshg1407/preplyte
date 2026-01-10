// src/components/institute-admin/departments/department-filters.tsx

'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import type { DepartmentQueryParams } from '@/types/department.types';

interface DepartmentFiltersProps {
  filters: DepartmentQueryParams;
  onFiltersChange: (filters: DepartmentQueryParams) => void;
}

export function DepartmentFilters({ filters, onFiltersChange }: DepartmentFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const handleStatusChange = (value: string) => {
    const isActive = value === 'all' ? undefined : value === 'active';
    onFiltersChange({ ...filters, isActive, page: 1 });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [
      DepartmentQueryParams['sortBy'],
      DepartmentQueryParams['sortOrder']
    ];
    onFiltersChange({ ...filters, sortBy, sortOrder, page: 1 });
  };

  const handleClearFilters = () => {
    setSearch('');
    onFiltersChange({ page: 1, limit: 10 });
  };

  const hasFilters = search || filters.isActive !== undefined;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <Select
        value={
          filters.isActive === undefined
            ? 'all'
            : filters.isActive
              ? 'active'
              : 'inactive'
        }
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={`${filters.sortBy || 'name'}-${filters.sortOrder || 'asc'}`}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-[180px]">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="code-asc">Code (A-Z)</SelectItem>
          <SelectItem value="code-desc">Code (Z-A)</SelectItem>
          <SelectItem value="studentCount-desc">Most Students</SelectItem>
          <SelectItem value="studentCount-asc">Least Students</SelectItem>
          <SelectItem value="createdAt-desc">Newest First</SelectItem>
          <SelectItem value="createdAt-asc">Oldest First</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={handleClearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
// src/components/admin/institutes/institute-filters.tsx

'use client';

import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Search, X } from 'lucide-react';
import type { InstituteFilters } from '../../../types/admin.types';

interface InstituteFiltersBarProps {
  filters: InstituteFilters;
  onFiltersChange: (filters: Partial<InstituteFilters>) => void;
}

export function InstituteFiltersBar({
  filters,
  onFiltersChange,
}: InstituteFiltersBarProps) {
  const hasActiveFilters = 
    filters.search || 
    filters.isActive !== undefined;

  const clearFilters = () => {
    onFiltersChange({
      search: undefined,
      isActive: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search institutes..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="h-9 pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.isActive === undefined ? 'all' : String(filters.isActive)}
        onValueChange={(value) =>
          onFiltersChange({
            isActive: value === 'all' ? undefined : value === 'true',
          })
        }
      >
        <SelectTrigger className="h-9 w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort By */}
      <Select
        value={filters.sortBy || 'createdAt'}
        onValueChange={(value) =>
          onFiltersChange({ sortBy: value as InstituteFilters['sortBy'] })
        }
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Date Added</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="totalStudents">Students</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Order */}
      <Select
        value={filters.sortOrder || 'desc'}
        onValueChange={(value) =>
          onFiltersChange({ sortOrder: value as 'asc' | 'desc' })
        }
      >
        <SelectTrigger className="h-9 w-[100px]">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Newest</SelectItem>
          <SelectItem value="asc">Oldest</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
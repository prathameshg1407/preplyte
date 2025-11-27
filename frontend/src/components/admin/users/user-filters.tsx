// src/components/admin/users/user-filters.tsx

'use client';

import { useEffect, useState } from 'react';
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
import { adminService } from '../../../lib/api/services/admin.service';
import type { UserFilters, Institute } from '../../../types/admin.types';

interface UserFiltersBarProps {
  filters: UserFilters;
  onFiltersChange: (filters: Partial<UserFilters>) => void;
}

export function UserFiltersBar({ filters, onFiltersChange }: UserFiltersBarProps) {
  const [institutes, setInstitutes] = useState<Institute[]>([]);

  useEffect(() => {
    const loadInstitutes = async () => {
      try {
        const data = await adminService.getInstitutes({ limit: 100 });
        setInstitutes(data.institutes);
      } catch (error) {
        console.error('Failed to load institutes:', error);
      }
    };
    loadInstitutes();
  }, []);

  const hasActiveFilters = 
    filters.search || 
    filters.role || 
    filters.instituteId || 
    filters.isActive !== undefined ||
    filters.hasProfile !== undefined;

  const clearFilters = () => {
    onFiltersChange({
      search: undefined,
      role: undefined,
      instituteId: undefined,
      isActive: undefined,
      hasProfile: undefined,
      sortBy: 'createdAt',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="h-9 pl-9"
          />
        </div>

        {/* Role Filter */}
        <Select
          value={filters.role || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              role: value === 'all' ? undefined : (value as UserFilters['role']),
            })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="USER">Student</SelectItem>
            <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
            <SelectItem value="PLATFORM_ADMIN">Platform Admin</SelectItem>
          </SelectContent>
        </Select>

        {/* Institute Filter */}
        <Select
          value={filters.instituteId || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              instituteId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Institute" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Institutes</SelectItem>
            {institutes.map((inst) => (
              <SelectItem key={inst.id} value={inst.id}>
                {inst.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            onFiltersChange({ sortBy: value as UserFilters['sortBy'] })
          }
        >
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Join Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="lastLoginAt">Last Login</SelectItem>
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
    </div>
  );
}
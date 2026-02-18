// src/components/leaderboard/leaderboard-filters.tsx

'use client';

import { Globe, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
  LeaderboardCategory,
  LeaderboardScope,
  LeaderboardConfigResponse,
} from '@/types/leaderboard.types';

interface LeaderboardFiltersProps {
  config: LeaderboardConfigResponse | undefined;
  isLoading: boolean;
  scope: LeaderboardScope;
  category: LeaderboardCategory;
  onScopeChange: (scope: LeaderboardScope) => void;
  onCategoryChange: (category: LeaderboardCategory) => void;
}

export function LeaderboardFilters({
  config,
  isLoading,
  scope,
  category,
  onScopeChange,
  onCategoryChange,
}: LeaderboardFiltersProps) {
  if (isLoading) {
    return <LeaderboardFiltersSkeleton />;
  }

  const availableScopes = config?.scopes.filter((s) => s.available) || [];
  const categories = config?.categories || [];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Scope Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Scope:</span>
        <div className="flex rounded-lg border bg-muted/50 p-1">
          {availableScopes.map((s) => (
            <Button
              key={s.value}
              variant="ghost"
              size="sm"
              onClick={() => onScopeChange(s.value)}
              className={cn(
                'h-8 gap-2 rounded-md px-3',
                scope === s.value
                  ? 'bg-background shadow-sm'
                  : 'hover:bg-background/50'
              )}
            >
              {s.value === 'global' ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Category Select */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Category:</span>
        <Select value={category} onValueChange={(v) => onCategoryChange(v as LeaderboardCategory)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex flex-col">
                  <span>{cat.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function LeaderboardFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-44" />
      </div>
    </div>
  );
}
// src/components/mock-drive/discovery/drive-filters.tsx

'use client';

import { FC } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDiscoveryStore } from '@/lib/store/mock-drive/discovery-store';

export const DriveFilters: FC = () => {
  const { filters, setFilters, resetFilters } = useDiscoveryStore();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mock drives..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Registration Open Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="registration-open"
            checked={filters.registrationOpen}
            onCheckedChange={(checked) => setFilters({ registrationOpen: checked })}
          />
          <Label htmlFor="registration-open" className="text-sm">
            Registration Open Only
          </Label>
        </div>

        {/* Reset Button */}
        {(filters.search || filters.registrationOpen) && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
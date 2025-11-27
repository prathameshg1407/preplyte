// src/app/mock-drive/page.tsx (fixed)

'use client';

import { useMockDriveList } from '@/lib/hooks/mock-drive/use-discovery';
import { useDiscoveryStore } from '@/lib/store/mock-drive/discovery-store';
import { DriveList } from '@/components/mock-drive/discovery/drive-list';
import { DriveFilters } from '@/components/mock-drive/discovery/drive-filters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MockDrivePage() {
  const { filters, page, limit, setPage } = useDiscoveryStore();

  const { data, isLoading } = useMockDriveList({
    page,
    limit,
    status: filters.status, // Pass array directly, service handles conversion
    search: filters.search || undefined,
    registrationOpen: filters.registrationOpen,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mock Drives</h1>
          <p className="text-muted-foreground mt-1">
            Browse and register for available mock placement drives
          </p>
        </div>
        <Link href="/mock-drive/my-registrations">
          <Button variant="outline">My Registrations</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <DriveFilters />
      </div>

      {/* Drive List */}
      <DriveList drives={data?.drives || []} isLoading={isLoading} />

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= data.pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
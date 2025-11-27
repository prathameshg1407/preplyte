// src/app/mock-drive/my-registrations/page.tsx (fixed type comparisons)

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useMyRegistrations } from '@/lib/hooks/mock-drive/use-discovery';
import { MyRegistrationsList } from '@/components/mock-drive/discovery/my-registrations-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MockDriveRegistrationStatus, MockDriveStatus } from '@/types/mockdrive.types';

export default function MyRegistrationsPage() {
  const { data, isLoading } = useMyRegistrations();

  const registrations = data?.registrations || [];

  const categorized = useMemo(() => {
    const now = new Date();

    const upcoming = registrations.filter(
      (r) =>
        r.status === MockDriveRegistrationStatus.APPROVED &&
        r.batch &&
        new Date(r.batch.scheduledStartTime) > now
    );

    const pending = registrations.filter(
      (r) => r.status === MockDriveRegistrationStatus.PENDING
    );

    const completed = registrations.filter(
      (r) =>
        r.mockDrive.status === MockDriveStatus.COMPLETED ||
        (r.batch && new Date(r.batch.scheduledEndTime) < now)
    );

    const other = registrations.filter(
      (r) =>
        !upcoming.includes(r) &&
        !pending.includes(r) &&
        !completed.includes(r)
    );

    return { upcoming, pending, completed, other };
  }, [registrations]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/mock-drive"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Mock Drives
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Registrations</h1>
        <p className="text-muted-foreground mt-1">
          Track your registered mock drives and upcoming schedules
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({categorized.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({categorized.pending.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({categorized.completed.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({registrations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <MyRegistrationsList
            registrations={categorized.upcoming}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="pending">
          <MyRegistrationsList
            registrations={categorized.pending}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="completed">
          <MyRegistrationsList
            registrations={categorized.completed}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="all">
          <MyRegistrationsList registrations={registrations} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
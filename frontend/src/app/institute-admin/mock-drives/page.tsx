// src/app/institute-admin/mock-drives/page.tsx
import { Suspense } from 'react';
import { MockDrivesPageContent } from '@/components/institute-admin/mock-drive/mock-drives-page-content';
import { MockDrivesSkeleton } from '@/components/institute-admin/mock-drive/mock-drives-skeleton';

export const metadata = {
  title: 'Mock Drives | Institute Admin',
  description: 'Create and manage mock placement drives for your students',
};

export default function MockDrivesListPage() {
  return (
    <Suspense fallback={<MockDrivesSkeleton />}>
      <MockDrivesPageContent />
    </Suspense>
  );
}
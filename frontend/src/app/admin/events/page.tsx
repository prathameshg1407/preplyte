// src/app/admin/events/page.tsx

'use client';

import React from 'react';
import AdminEventsPage from '@/app/institute-admin/events/page';

/**
 * Platform Admin Event Management
 * Reuses the Institute Admin Event Hub logic but with Platform Admin context.
 * In a real-world scenario, this might fetch global events or events from all institutes.
 */
export default function PlatformAdminEventsPage() {
  return <AdminEventsPage basePath="/admin" />;
}

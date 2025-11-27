// src/app/admin/layout.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/auth-store';
import { AdminSidebar } from '../../components/admin/admin-sidebar';
import { AdminHeader } from '../../components/admin/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (user?.role !== 'PLATFORM_ADMIN') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'PLATFORM_ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
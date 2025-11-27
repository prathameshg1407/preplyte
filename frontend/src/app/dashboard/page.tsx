'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role === 'PLATFORM_ADMIN') {
      router.push('/admin');
      return;
    }

    if (user?.role === 'INSTITUTE_ADMIN') {
      router.push('/institute-admin');
      return;
    }
  }, [user, isAuthenticated, isHydrated, router]);

  // Show loading while checking auth or redirecting
  if (!isHydrated || !isAuthenticated || user?.role !== 'USER') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <StudentDashboard />;
}
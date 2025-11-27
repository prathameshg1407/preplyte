'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/auth-store';
import { StudentDashboard } from '../../components/dashboard/student-dashboard';


export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect admins to admin dashboard
    if (user?.role === 'PLATFORM_ADMIN' || user?.role === 'INSTITUTE_ADMIN') {
      router.push('/admin/dashboard');
      return;
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [user, isAuthenticated, router]);

  // Show loading while checking auth or redirecting
  if (!isAuthenticated || user?.role !== 'USER') {
    return (
     
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
      <StudentDashboard />
  );
}
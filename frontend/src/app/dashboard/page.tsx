'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { PlatformAdminDashboard } from '@/components/dashboard/platform-admin-dashboard';
import { InstituteAdminDashboard } from '@/components/dashboard/institute-admin-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { AppLayout } from '@/components/layout/app-layout';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'PLATFORM_ADMIN':
        return <PlatformAdminDashboard />;
      case 'INSTITUTE_ADMIN':
        return <InstituteAdminDashboard />;
      case 'USER':
        return <StudentDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return <AppLayout>{renderDashboard()}</AppLayout>;
}
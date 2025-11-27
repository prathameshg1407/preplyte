// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/hooks/use-auth';
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'PLATFORM_ADMIN' | 'INSTITUTE_ADMIN' | 'USER';
  requireInstitute?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireInstitute = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isHydrated, user } = useAuth();

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.replace('/unauthorized');
      return;
    }

    if (requireInstitute && !user?.instituteId) {
      router.replace('/no-institute');
      return;
    }
  }, [isAuthenticated, isLoading, isHydrated, user, requiredRole, requireInstitute, router, pathname]);

  // Show nothing while checking auth
  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Show nothing if role doesn't match (redirect will happen)
  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
// src/app/(auth)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, context } = useAuthStore();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      if (context === 'INSTITUTE') {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, context, router]);

  // Don't render auth pages if already logged in
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

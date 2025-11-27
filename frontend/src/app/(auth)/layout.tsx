// src/app/(auth)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store/auth-store';
import { Loader2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, context, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (context === 'INSTITUTE') {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, context, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render auth pages if already logged in
  if (isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {children}
    </div>
  );
}
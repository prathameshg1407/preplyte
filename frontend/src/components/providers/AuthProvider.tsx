// src/components/providers/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isHydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    // Mark as hydrated after mount
    if (!isHydrated) {
      setHydrated(true);
    }
  }, [isHydrated, setHydrated]);

  // Optionally show loading state while hydrating
  // if (!isHydrated) {
  //   return <LoadingSpinner />;
  // }

  return <>{children}</>;
}
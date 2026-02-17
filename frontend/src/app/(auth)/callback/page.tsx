'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService } from '@/lib/api/services/auth.service';
import { logger } from '@/lib/utils/logger';
import type { UserRole } from '@/types/auth.types';

// Helper to get default redirect based on role
function getDefaultRedirect(role: UserRole): string {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return '/admin';
    case 'INSTITUTE_ADMIN':
      return '/institute-admin';
    case 'USER':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

// Helper to get context based on role
function getContextFromRole(role: UserRole) {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return 'PLATFORM';
    case 'INSTITUTE_ADMIN':
      return 'INSTITUTE';
    case 'USER':
      return 'PLATFORM';
    default:
      return 'PLATFORM';
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
      setTimeout(() => {
        router.push('/login?error=oauth_failed');
      }, 2000);
      return;
    }

    if (accessToken && refreshToken) {
      const completeAuth = async () => {
        try {
          logger.debug('[OAuth Callback] Tokens received, fetching user data');
          
          // Store tokens first
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Small delay to ensure storage is synced
          await new Promise(resolve => setTimeout(resolve, 100));

          // Fetch user data with explicit Authorization header
          const response = await authService.getCurrentUser();
          
          if (response.success && response.data) {
            const user = response.data;
            const context = getContextFromRole(user.role);
            
            // Set auth in store (this will properly set up the session)
            store.setAuth(user, accessToken, refreshToken, context);
            
            setStatus('success');
            setMessage('Sign in successful! Redirecting...');

            // Redirect to appropriate dashboard
            const redirectTo = getDefaultRedirect(user.role);
            setTimeout(() => {
              router.push(redirectTo);
            }, 1500);
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (err) {
          logger.error('[OAuth Callback] Error completing auth:', err);
          
          // If fetching user fails, try to decode the token to get basic user info
          try {
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
            const role = tokenPayload.role || 'USER';
            
            // Create a minimal user object
            const minimalUser = {
              id: tokenPayload.sub,
              email: '',
              name: '',
              role: role,
              instituteId: tokenPayload.instituteId,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            const context = getContextFromRole(role);
            store.setAuth(minimalUser, accessToken, refreshToken, context);
            
            setStatus('success');
            setMessage('Sign in successful! Redirecting...');
            
            const redirectTo = getDefaultRedirect(role);
            setTimeout(() => {
              router.push(redirectTo);
            }, 1500);
          } catch (decodeErr) {
            logger.error('[OAuth Callback] Failed to decode token:', decodeErr);
            setStatus('error');
            setMessage('Failed to complete sign in. Please try again.');
            setTimeout(() => {
              router.push('/login?error=auth_completion_failed');
            }, 2000);
          }
        }
      };

      completeAuth();
    } else {
      setStatus('error');
      setMessage('Invalid authentication response.');
      setTimeout(() => {
        router.push('/login?error=invalid_response');
      }, 2000);
    }
  }, [searchParams, router, store]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-6 flex justify-center">
          {status === 'loading' && (
            <div className="rounded-full bg-primary/10 p-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="rounded-full bg-green-500/10 p-6"
            >
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="rounded-full bg-rose-500/10 p-6"
            >
              <XCircle className="h-12 w-12 text-rose-600 dark:text-rose-400" />
            </motion.div>
          )}
        </div>

        <h1 className="mb-2 text-2xl font-semibold">
          {status === 'loading' && 'Signing you in'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Oops!'}
        </h1>

        <p className="text-muted-foreground">{message}</p>

        {status === 'loading' && (
          <div className="mt-8 flex justify-center gap-2">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="h-2 w-2 rounded-full bg-primary"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="h-2 w-2 rounded-full bg-primary"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}

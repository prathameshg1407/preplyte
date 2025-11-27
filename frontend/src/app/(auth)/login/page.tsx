// src/app/(auth)/login/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '../../../components/auth/login-form';

export const metadata = {
  title: 'Login | Preplyte',
  description: 'Login to your account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-8 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background font-semibold">
              P
            </div>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Form */}
        <Suspense fallback={<FormSkeleton />}>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full animate-pulse rounded-md bg-secondary" />
      <div className="h-10 w-full animate-pulse rounded-md bg-secondary" />
      <div className="h-10 w-full animate-pulse rounded-md bg-secondary" />
    </div>
  );
}
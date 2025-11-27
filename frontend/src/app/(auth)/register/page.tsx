// src/app/(auth)/register/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { RegisterForm } from '../../../components/auth/register-form';

export const metadata = {
  title: 'Register | Preplyte',
  description: 'Create a new account',
};

export default function RegisterPage() {
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
            Create an account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your details to get started
          </p>
        </div>

        {/* Form */}
        <Suspense fallback={<FormSkeleton />}>
          <RegisterForm />
        </Suspense>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
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
      <div className="h-10 w-full animate-pulse rounded-md bg-secondary" />
    </div>
  );
}
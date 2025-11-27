import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register | Preplyte',
  description: 'Create a new Preplyte account',
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
        <Suspense fallback={<FormSkeleton rows={5} />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}

function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-11 w-full animate-pulse rounded-md bg-secondary"
        />
      ))}
    </div>
  );
}
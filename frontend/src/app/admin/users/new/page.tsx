// src/app/admin/users/new/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useUsers } from '../../../../lib/hooks/use-admin';
import { UserForm, type UserFormData } from '../../../../components/admin/users/user-form';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NewUserPage() {
  const router = useRouter();
  const { createUser } = useUsers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: UserFormData) => {
    setLoading(true);
    setError(null);
    try {
      if (!data.password) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      await createUser({
        email: data.email,
        password: data.password,
        name: data.name || undefined,
        role: data.role,
        instituteId: data.instituteId || undefined,
        isActive: data.isActive,
      });
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/users');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">New User</h1>
          <p className="text-sm text-muted-foreground">Create a new account</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-border">
        <CardContent className="pt-6">
          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 border border-border rounded-lg bg-secondary/50">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <UserForm 
            onSubmit={handleSubmit} 
            loading={loading}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
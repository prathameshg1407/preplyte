// src/app/admin/users/[id]/edit/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useUser, useUsers } from '../../../../../../lib/hooks/use-admin';
import { UserForm, type UserFormData } from '../../../../../../components/admin/users/user-form';
import { Card, CardContent } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useUser(id);
  const { editUser } = useUsers();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: UserFormData) => {
    setLoading(true);
    setError(null);
    try {
      await editUser(id, {
        email: data.email,
        password: data.password || undefined,
        name: data.name || undefined,
        role: data.role,
        instituteId: data.instituteId || undefined,
        isActive: data.isActive,
      });
      router.push(`/admin/users/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/users/${id}`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={`/admin/users/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Edit User</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
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
            user={user} 
            onSubmit={handleSubmit} 
            loading={loading}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
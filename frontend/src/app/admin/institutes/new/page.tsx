// src/app/admin/institutes/new/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useInstitutes } from '../../../../lib/hooks/use-admin';
import { InstituteForm, type InstituteFormData } from '../../../../components/admin/institutes/institute-form';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NewInstitutePage() {
  const router = useRouter();
  const { createInstitute } = useInstitutes();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: InstituteFormData) => {
    setLoading(true);
    setError(null);
    try {
      await createInstitute({
        name: data.name,
        domain: data.domain,
        isActive: data.isActive,
        profile: data.profile,
      });
      router.push('/admin/institutes');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create institute');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/institutes');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/admin/institutes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">New Institute</h1>
          <p className="text-sm text-muted-foreground">Add a new institute</p>
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
          <InstituteForm 
            onSubmit={handleSubmit} 
            loading={loading}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
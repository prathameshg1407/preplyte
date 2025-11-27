// src/app/admin/institutes/[id]/edit/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useInstitute, useInstitutes } from '../../../../../lib/hooks/use-admin';
import { InstituteForm, type InstituteFormData } from '../../../../../components/admin/institutes/institute-form';
import { Card, CardContent } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function EditInstitutePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { institute } = useInstitute(id);
  const { editInstitute } = useInstitutes();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: InstituteFormData) => {
    setLoading(true);
    setError(null);
    try {
      await editInstitute(id, {
        name: data.name,
        domain: data.domain,
        isActive: data.isActive,
        profile: data.profile,
      });
      router.push(`/admin/institutes/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update institute');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/institutes/${id}`);
  };

  if (!institute) {
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
          <Link href={`/admin/institutes/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Edit Institute</h1>
          <p className="text-sm text-muted-foreground">{institute.name}</p>
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
            institute={institute}
            onSubmit={handleSubmit}
            loading={loading}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
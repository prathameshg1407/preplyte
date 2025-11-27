// src/components/admin/institutes/institute-form.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Loader2 } from 'lucide-react';
import type { Institute } from '../../../types/admin.types';

const instituteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  domain: z
    .string()
    .min(3, 'Domain must be at least 3 characters')
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, 'Invalid domain format'),
  isActive: z.boolean().default(true),
  profile: z
    .object({
      logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
      location: z.string().optional(),
    })
    .optional(),
});

type FormData = z.infer<typeof instituteSchema>;

interface InstituteFormProps {
  institute?: Institute;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export function InstituteForm({ institute, onSubmit, loading, onCancel }: InstituteFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(instituteSchema),
    defaultValues: {
      name: institute?.name || '',
      domain: institute?.domain || '',
      isActive: institute?.isActive ?? true,
      profile: {
        logoUrl: institute?.profile?.logoUrl || '',
        location: institute?.profile?.location || '',
      },
    },
  });

  const isActive = watch('isActive');

  const handleFormSubmit = async (data: FormData) => {
    const payload: FormData = {
      ...data,
      profile: {
        logoUrl: data.profile?.logoUrl || undefined,
        location: data.profile?.location || undefined,
      },
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm">
          Institute Name <span className="text-muted-foreground">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Mumbai University"
          className="h-10"
        />
        {errors.name && (
          <p className="text-xs text-muted-foreground">{errors.name.message}</p>
        )}
      </div>

      {/* Domain */}
      <div className="space-y-2">
        <Label htmlFor="domain" className="text-sm">
          Domain <span className="text-muted-foreground">*</span>
        </Label>
        <Input
          id="domain"
          {...register('domain')}
          placeholder="mumbai.ac.in"
          className="h-10 font-mono text-sm"
        />
        {errors.domain && (
          <p className="text-xs text-muted-foreground">{errors.domain.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Users with email addresses from this domain can register
        </p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm">Location</Label>
        <Input
          id="location"
          {...register('profile.location')}
          placeholder="Mumbai, Maharashtra"
          className="h-10"
        />
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="logoUrl" className="text-sm">Logo URL</Label>
        <Input
          id="logoUrl"
          {...register('profile.logoUrl')}
          placeholder="https://example.com/logo.png"
          className="h-10"
        />
        {errors.profile?.logoUrl && (
          <p className="text-xs text-muted-foreground">{errors.profile.logoUrl.message}</p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Label className="text-sm">Active</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inactive institutes cannot accept new registrations
          </p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => setValue('isActive', checked)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {institute ? 'Update' : 'Create'} Institute
        </Button>
      </div>
    </form>
  );
}

export type { FormData as InstituteFormData };
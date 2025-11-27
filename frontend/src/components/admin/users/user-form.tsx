// src/components/admin/users/user-form.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../../../lib/api/services/admin.service';
import type { User, Institute, UserRole } from '../../../types/admin.types';

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional().or(z.literal('')),
  role: z.enum(['PLATFORM_ADMIN', 'INSTITUTE_ADMIN', 'USER']),
  instituteId: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

const updateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  name: z.string().optional().or(z.literal('')),
  role: z.enum(['PLATFORM_ADMIN', 'INSTITUTE_ADMIN', 'USER']),
  instituteId: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type CreateFormData = z.infer<typeof createUserSchema>;
type UpdateFormData = z.infer<typeof updateUserSchema>;
type FormData = CreateFormData | UpdateFormData;

interface UserFormProps {
  user?: User;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export function UserForm({ user, onSubmit, loading, onCancel }: UserFormProps) {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [institutesLoading, setInstitutesLoading] = useState(true);

  const isEditMode = !!user;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
      name: user?.name || '',
      role: user?.role || 'USER',
      instituteId: user?.instituteId || '',
      isActive: user?.isActive ?? true,
    },
  });

  const role = watch('role');
  const isActive = watch('isActive');

  useEffect(() => {
    const loadInstitutes = async () => {
      try {
        const data = await adminService.getInstitutes({ limit: 100, isActive: true });
        setInstitutes(data.institutes);
      } catch (error) {
        console.error('Failed to load institutes:', error);
      } finally {
        setInstitutesLoading(false);
      }
    };
    loadInstitutes();
  }, []);

  const handleFormSubmit = async (data: FormData) => {
    const payload: Record<string, any> = {
      email: data.email,
      name: data.name || undefined,
      role: data.role,
      instituteId: data.instituteId || undefined,
      isActive: data.isActive,
    };

    if (data.password) {
      payload.password = data.password;
    }

    await onSubmit(payload as FormData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">
          Email <span className="text-muted-foreground">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="user@example.com"
          className="h-10"
        />
        {errors.email && (
          <p className="text-sm text-muted-foreground">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm">
          Password {isEditMode && <span className="text-muted-foreground font-normal">(leave blank to keep)</span>}
          {!isEditMode && <span className="text-muted-foreground">*</span>}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            placeholder="••••••••"
            className="h-10 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-10 w-10"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-muted-foreground">{errors.password.message}</p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm">Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="John Doe"
          className="h-10"
        />
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label className="text-sm">
          Role <span className="text-muted-foreground">*</span>
        </Label>
        <Select
          value={role}
          onValueChange={(value) => setValue('role', value as UserRole)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Student</SelectItem>
            <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
            <SelectItem value="PLATFORM_ADMIN">Platform Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Institute */}
      {role !== 'PLATFORM_ADMIN' && (
        <div className="space-y-2">
          <Label className="text-sm">Institute</Label>
          <Select
            value={watch('instituteId') || ''}
            onValueChange={(value) => setValue('instituteId', value)}
            disabled={institutesLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select institute" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Institute</SelectItem>
              {institutes.map((inst) => (
                <SelectItem key={inst.id} value={inst.id}>
                  {inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {role === 'INSTITUTE_ADMIN' && (
            <p className="text-xs text-muted-foreground">
              Institute admins must be assigned to an institute
            </p>
          )}
        </div>
      )}

      {/* Active Status */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Label className="text-sm">Active</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inactive users cannot log in
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
          {isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}

export type { FormData as UserFormData };
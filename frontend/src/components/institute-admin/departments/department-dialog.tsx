// src/components/institute-admin/departments/department-dialog.tsx

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Building2 } from 'lucide-react';
import {
  createDepartmentSchema,
  type CreateDepartmentFormData,
} from '@/lib/validations/department.schema';
import { useCreateDepartment, useUpdateDepartment } from '@/lib/hooks/institute-admin';
import type { Department } from '@/types/department.types';
import { cn } from '@/lib/utils';

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
}

export function DepartmentDialog({
  open,
  onOpenChange,
  department,
}: DepartmentDialogProps) {
  const isEdit = !!department;
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateDepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isActive: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        code: department.code || '',
        description: department.description || '',
        isActive: department.isActive,
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        isActive: true,
      });
    }
  }, [department, reset]);

  const onSubmit = async (data: CreateDepartmentFormData) => {
    try {
      // Clean up empty strings
      const cleanedData = {
        ...data,
        code: data.code || undefined,
        description: data.description || undefined,
      };

      if (isEdit && department) {
        await updateMutation.mutateAsync({
          id: department.id,
          input: cleanedData,
        });
      } else {
        await createMutation.mutateAsync(cleanedData);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const watchIsActive = watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {isEdit ? 'Edit Department' : 'Create Department'}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? 'Update the department details below.'
                  : 'Add a new department to your institute.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Department Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Computer Science and Engineering"
              {...register('name')}
              disabled={isLoading}
              className={cn(errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Department Code
              <span className="text-muted-foreground text-xs ml-1">(optional)</span>
            </Label>
            <Input
              id="code"
              placeholder="e.g., CSE"
              {...register('code')}
              disabled={isLoading}
              className={cn('uppercase', errors.code && 'border-destructive')}
              onChange={(e) => setValue('code', e.target.value.toUpperCase())}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Short code for quick identification (uppercase letters and numbers only)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description
              <span className="text-muted-foreground text-xs ml-1">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the department..."
              {...register('description')}
              disabled={isLoading}
              rows={3}
              className={cn(errors.description && 'border-destructive')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base">
                Active Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Inactive departments won't be available for student selection
              </p>
            </div>
            <Switch
              id="isActive"
              checked={watchIsActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
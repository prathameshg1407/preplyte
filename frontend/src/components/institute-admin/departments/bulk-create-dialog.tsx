// src/components/institute-admin/departments/bulk-create-dialog.tsx

'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  bulkCreateDepartmentSchema,
  type BulkCreateDepartmentFormData,
} from '@/lib/validations/department.schema';
import { useBulkCreateDepartments } from '@/lib/hooks/institute-admin';
import { cn } from '@/lib/utils';

interface BulkCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkCreateDialog({ open, onOpenChange }: BulkCreateDialogProps) {
  const [result, setResult] = useState<{
    created: number;
    failed: number;
    errors: { index: number; name: string; error: string }[];
  } | null>(null);

  const bulkCreateMutation = useBulkCreateDepartments();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BulkCreateDepartmentFormData>({
    resolver: zodResolver(bulkCreateDepartmentSchema),
    defaultValues: {
      departments: [{ name: '', code: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'departments',
  });

  const onSubmit = async (data: BulkCreateDepartmentFormData) => {
    try {
      // Clean up data
      const cleanedData = {
        departments: data.departments.map((d) => ({
          name: d.name.trim(),
          code: d.code?.trim() || undefined,
          description: d.description?.trim() || undefined,
        })),
      };

      const res = await bulkCreateMutation.mutateAsync(cleanedData);
      setResult(res);

      if (res.failed === 0) {
        setTimeout(() => {
          onOpenChange(false);
          reset();
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Bulk Create Departments</DialogTitle>
              <DialogDescription>
                Add multiple departments at once. Maximum 50 at a time.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-4">
            <Alert variant={result.failed > 0 ? 'default' : 'default'}>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Successfully created {result.created} department(s).
                {result.failed > 0 && ` ${result.failed} failed.`}
              </AlertDescription>
            </Alert>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-destructive">Failed Items:</Label>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-2">
                  {result.errors.map((err, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{err.name}:</span>{' '}
                      <span className="text-muted-foreground">{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Department {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <Label className="text-xs">Name *</Label>
                        <Input
                          placeholder="Department name"
                          {...register(`departments.${index}.name`)}
                          className={cn(
                            'mt-1',
                            errors.departments?.[index]?.name && 'border-destructive'
                          )}
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <Label className="text-xs">Code</Label>
                        <Input
                          placeholder="e.g., CSE"
                          {...register(`departments.${index}.code`)}
                          className="mt-1 uppercase"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {errors.departments?.message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.departments.message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', code: '', description: '' })}
              disabled={fields.length >= 50}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Department
            </Button>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={bulkCreateMutation.isPending}>
                {bulkCreateMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create {fields.length} Department{fields.length > 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
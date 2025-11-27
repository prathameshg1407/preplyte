// src/components/institute-admin/mock-drive/batches/edit-batch-dialog.tsx

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BatchDetails, UpdateBatchInput, MockDriveBatchStatus } from '@/types/admin.mockdrive.types';
import { BATCH_STATUS_CONFIG } from '@/lib/constants/admin.mockdrive.constants';
import { Loader2, Edit } from 'lucide-react';

// ============================================
// Form Schema
// ============================================

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  scheduledStartTime: z.string().min(1, 'Start time is required'),
  scheduledEndTime: z.string().min(1, 'End time is required'),
  maxCapacity: z.number().min(1).max(10000).nullable(),
  notes: z.string().max(500).nullable(),
  status: z.nativeEnum(MockDriveBatchStatus).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================
// Helper Functions
// ============================================

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function localInputToIso(local: string): string {
  if (!local) return '';
  const date = new Date(local);
  if (isNaN(date.getTime())) return '';
  return date.toISOString();
}

// ============================================
// Props
// ============================================

interface EditBatchDialogProps {
  batch: BatchDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateBatchInput) => Promise<void>;
  isSubmitting?: boolean;
}

// ============================================
// Component
// ============================================

export function EditBatchDialog({
  batch,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: EditBatchDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      scheduledStartTime: '',
      scheduledEndTime: '',
      maxCapacity: null,
      notes: null,
      status: undefined,
    },
  });

  // Reset form when batch changes
  useEffect(() => {
    if (batch) {
      form.reset({
        name: batch.name,
        scheduledStartTime: isoToLocalInput(batch.scheduledStartTime),
        scheduledEndTime: isoToLocalInput(batch.scheduledEndTime),
        maxCapacity: batch.maxCapacity,
        notes: batch.notes,
        status: batch.status,
      });
    }
  }, [batch, form]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      name: values.name,
      scheduledStartTime: localInputToIso(values.scheduledStartTime),
      scheduledEndTime: localInputToIso(values.scheduledEndTime),
      maxCapacity: values.maxCapacity,
      notes: values.notes,
      status: values.status,
    });
  };

  if (!batch) return null;

  // Determine which statuses can be transitioned to
const allowedStatuses = getAllowedStatusTransitions(batch.status);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Batch
          </DialogTitle>
          <DialogDescription>
            Update the batch details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Batch 1 - Morning" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="scheduledStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Capacity (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Leave empty for unlimited"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {allowedStatuses.length > 0 && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={batch.status}>
                          {BATCH_STATUS_CONFIG[batch.status].label} (Current)
                        </SelectItem>
                        {allowedStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {BATCH_STATUS_CONFIG[status].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Change batch status
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Helper: Get Allowed Status Transitions
// ============================================

function getAllowedStatusTransitions(
  currentStatus: MockDriveBatchStatus
): MockDriveBatchStatus[] {
  switch (currentStatus) {
    case MockDriveBatchStatus.CREATED:
      return [MockDriveBatchStatus.SCHEDULED, MockDriveBatchStatus.CANCELLED];
    case MockDriveBatchStatus.SCHEDULED:
      return [MockDriveBatchStatus.IN_PROGRESS, MockDriveBatchStatus.CANCELLED];
    case MockDriveBatchStatus.IN_PROGRESS:
      return [MockDriveBatchStatus.COMPLETED, MockDriveBatchStatus.CANCELLED];
    case MockDriveBatchStatus.COMPLETED:
      return [];
    case MockDriveBatchStatus.CANCELLED:
      return [];
    default:
      return [];
  }
}
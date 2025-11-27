// src/components/institute-admin/mock-drive/batches/auto-create-batches-dialog.tsx

'use client';

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
import { Button } from '@/components/ui/button';
import { AutoCreateBatchesInput } from '@/types/admin.mockdrive.types';
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
  batchSize: z.number().min(1).max(500),
  startTime: z.string().min(1, 'Start time is required'),
  intervalMinutes: z.number().min(30).max(1440),
  prefix: z.string().max(50).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AutoCreateBatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AutoCreateBatchesInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function AutoCreateBatchesDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AutoCreateBatchesDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchSize: 50,
      startTime: '',
      intervalMinutes: 60,
      prefix: 'Batch',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      batchSize: values.batchSize,
      startTime: new Date(values.startTime).toISOString(),
      intervalMinutes: values.intervalMinutes,
      prefix: values.prefix,
    });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Auto Create Batches
          </DialogTitle>
          <DialogDescription>
            Automatically create batches for all approved students without a batch.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="batchSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Students per Batch</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum students in each batch (1-500)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Batch Start Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intervalMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interval Between Batches (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={30}
                      max={1440}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Time gap between batch start times (30-1440 minutes)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prefix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Name Prefix</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Batch" {...field} />
                  </FormControl>
                  <FormDescription>
                    Batches will be named: Prefix 1, Prefix 2, etc.
                  </FormDescription>
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
                Create Batches
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
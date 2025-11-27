// src/components/institute-admin/mock-drive/results/export-results-dialog.tsx

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ExportResultsParams, BatchListItem } from '@/types/admin.mockdrive.types';
import { Loader2, Download, FileSpreadsheet, FileJson } from 'lucide-react';

interface ExportResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (params: ExportResultsParams) => void;
  isExporting?: boolean;
  batches: BatchListItem[];
}

export function ExportResultsDialog({
  open,
  onOpenChange,
  onExport,
  isExporting,
  batches,
}: ExportResultsDialogProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [batchId, setBatchId] = useState<string>('');

  const handleExport = () => {
    onExport({
      format,
      batchId: batchId || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Results</DialogTitle>
          <DialogDescription>
            Download results data in your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as 'csv' | 'json')}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="csv"
                  id="csv"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="csv"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FileSpreadsheet className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">CSV</span>
                  <span className="text-xs text-muted-foreground">
                    Excel compatible
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="json"
                  id="json"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="json"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <FileJson className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">JSON</span>
                  <span className="text-xs text-muted-foreground">
                    For developers
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Batch Filter */}
          <div className="space-y-2">
            <Label>Filter by Batch (Optional)</Label>
            <Select value={batchId} onValueChange={setBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="All batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
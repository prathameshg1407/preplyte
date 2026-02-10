'use client';

import { useState } from 'react';
import { Resume } from '@/types/resume.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Download, Loader2, FileDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PdfExportProps {
  resume: Resume;
}

type PaperSize = 'letter' | 'a4';
type Quality = 'standard' | 'high';

export function PdfExport({ resume }: PdfExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [paperSize, setPaperSize] = useState<PaperSize>('letter');
  const [quality, setQuality] = useState<Quality>('high');
  const [includeLinks, setIncludeLinks] = useState(true);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Dynamic import for client-side only
      const html2pdf = (await import('html2pdf.js')).default;

      // Get the resume preview element
      const element = document.getElementById('resume-preview');
      if (!element) {
        throw new Error('Resume preview not found');
      }

      const opt = {
        margin: 0,
        filename: `${resume.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        image: { type: 'jpeg', quality: quality === 'high' ? 0.98 : 0.85 },
        html2canvas: {
          scale: quality === 'high' ? 2 : 1,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'in',
          format: paperSize,
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(element).save();

      toast({
        title: 'PDF exported successfully',
        description: 'Your resume has been downloaded.',
      });

      setIsOpen(false);
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export as PDF</DialogTitle>
          <DialogDescription>
            Configure your PDF export settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Paper Size */}
          <div className="space-y-2">
            <Label htmlFor="paper-size">Paper Size</Label>
            <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
              <SelectTrigger id="paper-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">US Letter (8.5" x 11")</SelectItem>
                <SelectItem value="a4">A4 (210mm x 297mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <Label htmlFor="quality">Quality</Label>
            <Select value={quality} onValueChange={(v) => setQuality(v as Quality)}>
              <SelectTrigger id="quality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (faster, smaller file)</SelectItem>
                <SelectItem value="high">High (better quality, larger file)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Links */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-links">Include clickable links</Label>
              <p className="text-sm text-muted-foreground">
                Make URLs and email addresses clickable in the PDF
              </p>
            </div>
            <Switch
              id="include-links"
              checked={includeLinks}
              onCheckedChange={setIncludeLinks}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
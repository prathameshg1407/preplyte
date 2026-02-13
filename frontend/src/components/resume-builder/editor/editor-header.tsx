'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Resume } from '@/types/resume-builder.types';
import { useChangeTemplate, useImportFromProfile } from '@/lib/hooks/use-resume-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Download,
  Share2,
  MoreVertical,
  Layout,
  History,
  Upload,
  ZoomIn,
  ZoomOut,
  Palette,
  Award,
} from 'lucide-react';
import { ATSCheckDialog } from './ats-check-dialog';

interface EditorHeaderProps {
  resume: Resume;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  previewMode: boolean;
  zoomLevel: number;
  onTogglePreview: () => void;
  onZoomChange: (zoom: number) => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
}

export function EditorHeader({
  resume,
  isSaving,
  hasUnsavedChanges,
  previewMode,
  zoomLevel,
  onTogglePreview,
  onZoomChange,
  onSave,
  onTitleChange,
}: EditorHeaderProps) {
  const router = useRouter();
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isATSDialogOpen, setIsATSDialogOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(resume.title);

  const importFromProfile = useImportFromProfile();

  const handleImportProfile = async () => {
    await importFromProfile.mutateAsync(resume.id);
  };

  const handleDownloadPDF = () => {
    // Generate PDF from the resume preview
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }

    // Get the resume preview HTML
    const resumePreview = document.querySelector('[data-resume-preview]');
    if (!resumePreview) {
      alert('Resume preview not found');
      return;
    }

    // Get computed styles from the preview
    const previewStyles = window.getComputedStyle(resumePreview);

    // Create a clean HTML document for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${resume.title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: ${previewStyles.fontFamily};
              font-size: ${previewStyles.fontSize};
              line-height: ${previewStyles.lineHeight};
              color: ${previewStyles.color};
              background: white;
            }
            
            /* Print-specific styles */
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
              }
              
              @page {
                size: A4;
                margin: 20mm 0 0 0;
              }
              
              @page :first {
                margin: 0;
              }
              
              body {
                margin: 0 !important;
                padding: 0 !important;
              }
            }
            
            /* Preserve layout */
            .resume-container {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: ${previewStyles.padding};
              background: white;
              position: relative;
            }
            
            /* Typography */
            h1, h2, h3, h4, h5, h6 {
              margin: 0;
              padding: 0;
              font-weight: inherit;
            }
            
            p {
              margin: 0;
              padding: 0;
            }
            
            ul, ol {
              margin: 0;
              padding-left: 1.5em;
            }
            
            /* Flexbox fixes */
            .flex {
              display: flex;
            }
            
            .items-center {
              align-items: center;
            }
            
            .justify-between {
              justify-content: space-between;
            }
            
            .gap-1 { gap: 0.25rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-4 { gap: 1rem; }
            
            /* Text alignment */
            .text-center {
              text-align: center;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-left {
              text-align: left;
            }
            
            /* Spacing */
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            
            /* List styles */
            .list-disc {
              list-style-type: disc;
            }
            
            .list-inside {
              list-style-position: inside;
            }
            
            .space-y-1 > * + * {
              margin-top: 0.25rem;
            }
            
            /* Icons - hide them in print */
            svg {
              display: inline-block;
              vertical-align: middle;
              width: 0.75em;
              height: 0.75em;
            }
            
            /* Links */
            a {
              color: inherit;
              text-decoration: none;
            }
            
            /* Prevent page breaks inside elements */
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
              break-after: avoid;
            }
            
            p, li {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${resumePreview.innerHTML}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== resume.title) {
      onTitleChange(titleValue.trim());
    } else {
      setTitleValue(resume.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setTitleValue(resume.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/resume-builder')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="h-8 w-64"
              autoFocus
            />
          ) : (
            <h1 
              className="font-semibold cursor-pointer hover:text-primary"
              onClick={() => setIsEditingTitle(true)}
            >
              {resume.title}
            </h1>
          )}
          {/* Only show Complete/Draft badge */}
          <Badge 
            variant={resume.isComplete ? 'default' : 'secondary'}
            className={resume.isComplete ? 'bg-green-600' : ''}
          >
            {resume.isComplete ? 'Complete' : 'Draft'}
          </Badge>
        </div>
      </div>

      {/* Center Section - Zoom Controls */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <ZoomIn className="mr-2 h-4 w-4" />
              {zoomLevel}%
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zoom Level</span>
                <span className="text-sm text-muted-foreground">{zoomLevel}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[zoomLevel]}
                  min={50}
                  max={150}
                  step={10}
                  onValueChange={([value]) => onZoomChange(value)}
                />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onZoomChange(75)}
                >
                  75%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onZoomChange(100)}
                >
                  100%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onZoomChange(125)}
                >
                  125%
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
        >
          {previewMode ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Exit Preview
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </>
          )}
        </Button>

        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsATSDialogOpen(true)}
          disabled={!resume.isComplete}
          title={!resume.isComplete ? 'Complete your resume to check ATS score' : 'Check ATS score'}
        >
          <Award className="mr-2 h-4 w-4" />
          Check ATS Score
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsTemplateDialogOpen(true)}>
              <Layout className="mr-2 h-4 w-4" />
              Change Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImportProfile}>
              <Upload className="mr-2 h-4 w-4" />
              Import from Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsHistoryDialogOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              Version History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share Resume
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Template Change Dialog */}
      <TemplateChangeDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        resumeId={resume.id}
        currentTemplateId={resume.template.id}
      />

      {/* Version History Dialog */}
      <VersionHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        resumeId={resume.id}
      />

      {/* ATS Score Check Dialog */}
      <ATSCheckDialog
        open={isATSDialogOpen}
        onOpenChange={setIsATSDialogOpen}
        resume={resume}
      />
    </header>
  );
}

// Template Change Dialog Component
import { useTemplates } from '@/lib/hooks/use-resume';

function TemplateChangeDialog({
  open,
  onOpenChange,
  resumeId,
  currentTemplateId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  currentTemplateId: string;
}) {
  const { data: templates } = useTemplates();
  const changeTemplate = useChangeTemplate();

  const handleSelectTemplate = async (templateId: string) => {
    await changeTemplate.mutateAsync({ resumeId, templateId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Template</DialogTitle>
          <DialogDescription>
            Select a new template for your resume. Your content will be preserved.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          {templates?.map((template) => (
            <div
              key={template.id}
              className={`cursor-pointer rounded-lg border-2 p-2 transition-all hover:border-primary ${
                template.id === currentTemplateId
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent'
              }`}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <div className="aspect-[8.5/11] bg-muted rounded overflow-hidden">
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {template.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-center">{template.name}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Version History Dialog Component
import { useResumeVersions, useRestoreVersion } from '@/lib/hooks/use-resume';
import { formatDistanceToNow } from 'date-fns';

function VersionHistoryDialog({
  open,
  onOpenChange,
  resumeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
}) {
  const { data: versions, isLoading } = useResumeVersions(resumeId);
  const restoreVersion = useRestoreVersion();

  const handleRestore = async (versionId: string) => {
    await restoreVersion.mutateAsync({ resumeId, versionId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and restore previous versions of your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto py-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : versions?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No version history available yet.
            </p>
          ) : (
            <div className="space-y-2">
              {versions?.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">Version {version.version}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                    </p>
                    {version.changeNote && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {version.changeNote}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(version.id)}
                    disabled={restoreVersion.isLoading}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

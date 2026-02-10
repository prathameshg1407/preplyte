'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useResume, useUpdateResume, useUpdateResumeSection } from '@/lib/hooks/use-resume-builder';
import { useResumeStore } from '@/lib/store/resume-store';
import { ResumeSectionType } from '@/types/resume-builder.types';
import { EditorHeader } from './editor-header';
import { EditorSidebar } from './editor-sidebar';
import { ResumePreview } from './resume-preview';
import { SectionEditor } from './section-editor';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface ResumeEditorProps {
  resumeId: string;
}

export function ResumeEditor({ resumeId }: ResumeEditorProps) {
  const router = useRouter();
  const { data: resume, isLoading, error } = useResume(resumeId);
  const updateResume = useUpdateResume();
  const updateSection = useUpdateResumeSection();

  const {
    currentResume,
    activeSection,
    unsavedChanges,
    previewMode,
    zoomLevel,
    setCurrentResume,
    setActiveSection,
    setPreviewMode,
    setZoomLevel,
  } = useResumeStore();

  // Set current resume when loaded or updated
  useEffect(() => {
    if (resume) {
      setCurrentResume(resume);
    }
  }, [resume, setCurrentResume]);

  // Handle auto-download if query parameter is present
  useEffect(() => {
    if (resume && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('download') === 'true') {
        // Wait a bit for the preview to render
        setTimeout(() => {
          const resumePreview = document.querySelector('[data-resume-preview]');
          if (resumePreview) {
            handleDownloadPDF();
            // Remove the query parameter
            router.replace(`/resume-builder/${resumeId}`);
          }
        }, 1000);
      }
    }
  }, [resume, resumeId, router]);

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }

    const resumePreview = document.querySelector('[data-resume-preview]');
    if (!resumePreview) {
      alert('Resume preview not found');
      return;
    }

    const previewStyles = window.getComputedStyle(resumePreview);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${resume?.title || 'Resume'}</title>
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
            
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
              }
              
              @page {
                size: A4;
                margin: 0;
              }
              
              body {
                margin: 0 !important;
                padding: 0 !important;
              }
            }
            
            .resume-container {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: ${previewStyles.padding};
              background: white;
              position: relative;
            }
            
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
            
            .text-center {
              text-align: center;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-left {
              text-align: left;
            }
            
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            
            .list-disc {
              list-style-type: disc;
            }
            
            .list-inside {
              list-style-position: inside;
            }
            
            .space-y-1 > * + * {
              margin-top: 0.25rem;
            }
            
            svg {
              display: inline-block;
              vertical-align: middle;
              width: 0.75em;
              height: 0.75em;
            }
            
            a {
              color: inherit;
              text-decoration: none;
            }
            
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
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  // REMOVED: Auto-save functionality - now requires manual save

  // Handle manual save
  const handleSave = useCallback(async () => {
    if (!currentResume || !unsavedChanges) return;

    await updateResume.mutateAsync({
      resumeId: currentResume.id,
      data: { 
        content: currentResume.content,
        customization: currentResume.customization,
      },
    });
  }, [currentResume, unsavedChanges, updateResume]);

  // Handle title change
  const handleTitleChange = useCallback(async (newTitle: string) => {
    if (!currentResume) return;

    await updateResume.mutateAsync({
      resumeId: currentResume.id,
      data: { title: newTitle },
    });
  }, [currentResume, updateResume]);

  // Handle section save
  const handleSaveSection = useCallback(
    async (section: ResumeSectionType, data: unknown) => {
      if (!currentResume) return;

      await updateSection.mutateAsync({
        resumeId: currentResume.id,
        section,
        data,
      });
    },
    [currentResume, updateSection]
  );

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  if (isLoading) {
    return <EditorSkeleton />;
  }

  if (error || !resume) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Resume not found</h2>
          <p className="mt-2 text-muted-foreground">
            The resume you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            className="mt-4 text-primary underline"
            onClick={() => router.push('/resume-builder')}
          >
            Go back to resumes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <EditorHeader
        resume={resume}
        isSaving={updateResume.isPending || updateSection.isPending}
        hasUnsavedChanges={unsavedChanges}
        previewMode={previewMode}
        zoomLevel={zoomLevel}
        onTogglePreview={() => setPreviewMode(!previewMode)}
        onZoomChange={setZoomLevel}
        onSave={handleSave}
        onTitleChange={handleTitleChange}
      />

      <div className="flex-1 overflow-hidden">
        {previewMode ? (
          <div className="h-full overflow-auto bg-muted/50 p-8">
            <div className="mx-auto" style={{ width: `${zoomLevel}%`, maxWidth: '850px' }}>
              <ResumePreview resume={currentResume || resume} />
            </div>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal">
            {/* Sidebar */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <EditorSidebar
                resume={resume}
                activeSection={activeSection}
                onSectionSelect={setActiveSection}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Section Editor */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full overflow-auto border-r p-6">
                {activeSection ? (
                  <SectionEditor
                    section={activeSection}
                    resume={resume}
                    onSave={handleSaveSection}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Select a section from the sidebar to edit
                  </div>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Preview */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full overflow-auto bg-muted/50 p-6">
                <div
                  className="mx-auto transition-transform"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  <ResumePreview resume={currentResume || resume} />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-64 border-r p-4">
          <Skeleton className="h-8 w-full mb-4" />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-[800px] w-full max-w-2xl mx-auto" />
        </div>
      </div>
    </div>
  );
}
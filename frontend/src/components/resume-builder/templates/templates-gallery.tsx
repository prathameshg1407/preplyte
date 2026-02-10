'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates, useTemplateCategories, useCreateResume } from '@/lib/hooks/use-resume-builder';
import { useResumeStore } from '@/lib/store/resume-store';
import { ResumeTemplate, ResumeTemplateCategory } from '@/types/resume-builder.types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Crown,
  Sparkles,
  Eye,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryLabels: Record<ResumeTemplateCategory, string> = {
  PROFESSIONAL: 'Professional',
  CREATIVE: 'Creative',
  MODERN: 'Modern',
  MINIMAL: 'Minimal',
  ACADEMIC: 'Academic',
  TECHNICAL: 'Technical',
};

const categoryColors: Record<ResumeTemplateCategory, string> = {
  PROFESSIONAL: 'bg-blue-100 text-blue-800',
  CREATIVE: 'bg-purple-100 text-purple-800',
  MODERN: 'bg-green-100 text-green-800',
  MINIMAL: 'bg-gray-100 text-gray-800',
  ACADEMIC: 'bg-amber-100 text-amber-800',
  TECHNICAL: 'bg-cyan-100 text-cyan-800',
};

export function TemplateGallery() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResumeTemplateCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);
  const [resumeTitle, setResumeTitle] = useState('');

  const { templateFilter, setTemplateFilter } = useResumeStore();

  const { data: templates, isLoading: isLoadingTemplates } = useTemplates({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  const { data: categories } = useTemplateCategories();

  const createResume = useCreateResume();

  const handleCategoryChange = (category: ResumeTemplateCategory | null) => {
    setSelectedCategory(category);
    setTemplateFilter({ category });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setTemplateFilter({ search: value });
  };

  const handleSelectTemplate = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    setResumeTitle('');
  };

  const handleCreateResume = async () => {
    if (!selectedTemplate) return;

    try {
      const resume = await createResume.mutateAsync({
        templateId: selectedTemplate.id,
        title: resumeTitle || undefined,
      });
      
      // Close the dialog
      setSelectedTemplate(null);
      
      // Redirect to My Resumes tab to show the newly created resume
      router.push('/resume-builder?tab=my-resumes');
      
      // Optional: Show a success message
      console.log('Resume created successfully:', resume.title);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange(null)}
          >
            All
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.category}
              variant={selectedCategory === cat.category ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(cat.category)}
            >
              {categoryLabels[cat.category]} ({cat.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {isLoadingTemplates ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates?.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => handleSelectTemplate(template)}
              onPreview={() => setPreviewTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Create Resume Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
            <DialogDescription>
              You&apos;re about to create a resume using the &quot;{selectedTemplate?.name}&quot; template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Resume Title (Optional)
              </label>
              <Input
                id="title"
                placeholder="e.g., Software Engineer Resume"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateResume} disabled={createResume.isPending}>
              {createResume.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Resume
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {previewTemplate?.thumbnail ? (
              <img
                src={previewTemplate.thumbnail}
                alt={previewTemplate.name}
                className="w-full rounded-lg border shadow-sm"
              />
            ) : (
              <div className="aspect-[8.5/11] bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Preview not available</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setPreviewTemplate(null);
                handleSelectTemplate(previewTemplate!);
              }}
            >
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TemplateCardProps {
  template: ResumeTemplate;
  onSelect: () => void;
  onPreview: () => void;
}

function TemplateCard({ template, onSelect, onPreview }: TemplateCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[8.5/11] bg-muted">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground/30">
              {template.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" variant="secondary" onClick={onPreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={onSelect}>
            <Check className="mr-2 h-4 w-4" />
            Select
          </Button>
        </div>

        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute right-2 top-2">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
              <Crown className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{template.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary" className={cn(categoryColors[template.category])}>
            {categoryLabels[template.category]}
          </Badge>
          {template.layout.columns === 2 && (
            <Badge variant="outline">Two Column</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/50 p-4">
        <Button className="w-full" onClick={onSelect}>
          Use This Template
        </Button>
      </CardFooter>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Check,
  Crown,
  FileText,
  Loader2,
  Search,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useTemplates, useCreateResume } from '@/lib/hooks/use-resume-builder';
import { ResumeTemplateCategory, type ResumeTemplate } from '@/types/resume-builder.types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CATEGORY_LABELS: Record<ResumeTemplateCategory, string> = {
  [ResumeTemplateCategory.PROFESSIONAL]: 'Professional',
  [ResumeTemplateCategory.CREATIVE]: 'Creative',
  [ResumeTemplateCategory.MODERN]: 'Modern',
  [ResumeTemplateCategory.MINIMAL]: 'Minimal',
  [ResumeTemplateCategory.ACADEMIC]: 'Academic',
  [ResumeTemplateCategory.TECHNICAL]: 'Technical',
};

interface TemplateSelectorProps {
  onSelect?: (template: ResumeTemplate) => void;
  selectedTemplateId?: string | null;
}

export function TemplateSelector({ onSelect, selectedTemplateId }: TemplateSelectorProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ResumeTemplateCategory | 'ALL'>('ALL');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: templates, isLoading } = useTemplates({
    search: search || undefined,
    category: category !== 'ALL' ? category : undefined,
  });

  const createResume = useCreateResume();

  const handleSelectTemplate = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    setError(null);
    onSelect?.(template);
  };

  const handleCreateResume = async () => {
    if (!selectedTemplate) return;

    try {
      setError(null);
      
      console.log('Creating resume with template:', {
        templateId: selectedTemplate.id,
        title: `My ${selectedTemplate.name} Resume`,
      });
      
      const resume = await createResume.mutateAsync({
        templateId: selectedTemplate.id,
        title: `My ${selectedTemplate.name} Resume`,
      });
      
      console.log('Resume created successfully:', resume);
      
      // Redirect to My Resumes tab to show the newly created resume
      router.push('/resume-builder?tab=my-resumes');
      
    } catch (err: any) {
      console.error('Failed to create resume:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      console.error('Full error:', JSON.stringify(err, null, 2));
      
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to create resume';
      setError(errorMessage);
      
      // If it's an authentication error, redirect to login
      if (err.response?.status === 401) {
        setError('Please log in to create a resume');
        setTimeout(() => {
          router.push('/login?redirect=/resume-builder/templates');
        }, 2000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Choose a Template</h2>
            <p className="text-muted-foreground">
              Select a professional template to get started
            </p>
          </div>
          {selectedTemplate && (
            <Button
              onClick={handleCreateResume}
              disabled={createResume.isPending}
              size="lg"
              className="gap-2"
            >
              {createResume.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Resume
                </>
              )}
            </Button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as any)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="ALL">All Templates</TabsTrigger>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-64 w-full rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg group overflow-hidden',
                  selectedTemplate?.id === template.id &&
                    'ring-2 ring-primary shadow-lg'
                )}
                onClick={() => handleSelectTemplate(template)}
              >
                <CardContent className="p-0">
                  {/* Template Preview */}
                  <div className="relative h-64 bg-muted overflow-hidden">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}

                    {/* Selected Indicator */}
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-2">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    {/* Premium Badge */}
                    {template.isPremium && (
                      <div className="absolute top-2 left-2">
                        <Badge className="gap-1 bg-amber-500 hover:bg-amber-600">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        Select Template
                      </Button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[template.category]}
                      </Badge>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{template.layout.columns} Column</span>
                      <span>•</span>
                      <span>{template.layout.sections.length} Sections</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

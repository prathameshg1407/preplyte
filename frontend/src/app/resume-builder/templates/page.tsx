'use client';

import { TemplateSelector } from '@/components/resume-builder/template-selector';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/resume-builder')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resumes
        </Button>
      </div>

      <TemplateSelector />
    </div>
  );
}
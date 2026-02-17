'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateGallery } from '@/components/resume-builder';
import { resumeBuilderService } from '@/lib/api/services/resume-builder.service';
import { ResumeTemplate } from '@/types/resume.types';

export default function TemplatesPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectTemplate = async (template: ResumeTemplate) => {
    try {
      setIsCreating(true);
      
      // Create a new resume with the selected template
      const resume = await resumeBuilderService.createResume({
        templateId: template.id,
        title: 'My Resume',
      });

      // Navigate to the resume editor
      router.push(`/resume-builder/edit/${resume.id}`);
    } catch (error: any) {
      console.error('Failed to create resume:', error);
      alert(error.message || 'Failed to create resume. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
              <p className="text-gray-600 mt-1">
                Choose a professional template to get started
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Template Gallery */}
      <div className="container mx-auto px-4 py-8">
        <TemplateGallery onSelectTemplate={handleSelectTemplate} />
      </div>

      {/* Creating Overlay */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Creating Your Resume
              </h3>
              <p className="text-gray-600">
                Please wait while we set up your resume...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

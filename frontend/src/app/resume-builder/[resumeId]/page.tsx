'use client';

import { use } from 'react';
import { ResumeEditor } from '@/components/resume-builder/editor/resume-editor';

interface ResumeEditorPageProps {
  params: Promise<{
    resumeId: string;
  }>;
}

export default function ResumeEditorPage({ params }: ResumeEditorPageProps) {
  const { resumeId } = use(params);
  return <ResumeEditor resumeId={resumeId} />;
}
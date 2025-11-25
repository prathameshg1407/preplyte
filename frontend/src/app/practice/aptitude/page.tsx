// src/app/practice/aptitude/page.tsx

import { Metadata } from 'next';
import { PracticeConfigForm } from '@/components/practice/aptitude';
import { Brain } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Aptitude Practice',
  description: 'Practice aptitude questions and improve your skills',
};

export default function AptitudePracticePage() {
  return (
    <div className="container max-w-4xl py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Aptitude Practice</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Configure your practice session and start improving your quantitative,
          verbal, and logical reasoning skills.
        </p>
      </div>

      {/* Config Form */}
      <PracticeConfigForm />
    </div>
  );
}
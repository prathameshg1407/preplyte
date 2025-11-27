// src/app/practice/aptitude/page.tsx

import { Metadata } from 'next';
import { PracticeConfigForm } from '../../../components/practice/aptitude';
import { Brain } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Aptitude Practice | Preplyte',
  description: 'Practice aptitude questions and improve your skills',
};

export default function AptitudePracticePage() {
  return (
    <div className="container max-w-3xl py-16 lg:py-20">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary">
          <Brain className="h-7 w-7" />
        </div>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Aptitude Practice
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Configure your practice session and start improving your quantitative,
          verbal, and logical reasoning skills.
        </p>
      </div>

      {/* Config Form */}
      <PracticeConfigForm />
    </div>
  );
}
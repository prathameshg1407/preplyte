// src/app/practice/ai-interview/page.tsx

'use client';

import { Suspense } from 'react';
import AIInterviewPage from '@/components/practice/ai-interview/ai-interview';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading interview...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AIInterviewPage />
    </Suspense>
  );
}
// src/app/profile/resumes/page.tsx

'use client';

import { useEffect } from 'react';
import { useProfile, useProfileData } from '@/lib/hooks/use-profile';
import { ResumeUploadCard, ResumeListCard } from '@/components/profile';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResumesPage() {
  const { isLoading, resumeCount, maxResumes } = useProfileData();

  return (
    <div className="container max-w-3xl py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/profile">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Link>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Resumes</h1>
          <p className="text-muted-foreground">
            Manage your uploaded resumes ({resumeCount}/{maxResumes})
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <ResumeUploadCard />
          <ResumeListCard />
        </div>
      )}
    </div>
  );
}
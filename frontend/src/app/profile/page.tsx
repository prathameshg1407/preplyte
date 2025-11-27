// src/app/profile/page.tsx

'use client';

import { useEffect } from 'react';
import { useProfileData } from '@/lib/hooks/use-profile';
import {
  ProfileCompletionCard,
  UserProfileCard,
  StudentProfileCard,
  ResumeUploadCard,
  ResumeListCard,
  SkillsManager,
} from '@/components/profile';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const {
    isLoading,
    error,
    profileCompletion,
    hasStudentProfile,
  } = useProfileData();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="container max-w-6xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <UserProfileCard />
          <StudentProfileCard />
          {hasStudentProfile && <SkillsManager />}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
         // src/app/profile/page.tsx (continued)

          <ProfileCompletionCard completion={profileCompletion} />
          <ResumeUploadCard />
          <ResumeListCard />
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container max-w-6xl py-8">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
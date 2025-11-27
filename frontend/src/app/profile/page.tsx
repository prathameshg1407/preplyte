// src/app/profile/page.tsx

'use client';

import { motion } from 'framer-motion';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Settings, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const {
    isLoading,
    error,
    profileCompletion,
    hasStudentProfile,
    fetchUserProfile,
    fetchStudentProfile,
    fetchResumes,
  } = useProfileData();

  const handleRetry = () => {
    fetchUserProfile();
    fetchStudentProfile();
    fetchResumes();
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="container max-w-6xl py-8">
        <Alert variant="destructive" className="flex items-start gap-4">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <AlertTitle>Failed to load profile</AlertTitle>
            <AlertDescription className="mt-1">{error}</AlertDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRetry} className="shrink-0">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/profile/resumes">
              <FileText className="h-4 w-4" />
              Resumes
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/profile/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <UserProfileCard />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StudentProfileCard />
          </motion.div>

          {hasStudentProfile && (
            <motion.div variants={itemVariants}>
              <SkillsManager />
            </motion.div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <ProfileCompletionCard completion={profileCompletion} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ResumeUploadCard />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ResumeListCard />
          </motion.div>

          {/* Quick Tips Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Quick Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Complete your profile to increase visibility to recruiters
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Keep your resume updated with latest projects
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Add relevant skills to match with job requirements
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container max-w-6xl py-8">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Skeleton */}
          <Skeleton className="h-[220px] w-full rounded-xl" />
          {/* Student Profile Skeleton */}
          <Skeleton className="h-[350px] w-full rounded-xl" />
          {/* Skills Skeleton */}
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          {/* Completion Skeleton */}
          <Skeleton className="h-[180px] w-full rounded-xl" />
          {/* Upload Skeleton */}
          <Skeleton className="h-[200px] w-full rounded-xl" />
          {/* Resume List Skeleton */}
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
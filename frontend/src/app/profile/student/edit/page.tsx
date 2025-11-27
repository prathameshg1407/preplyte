// src/app/profile/student/edit/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/hooks/use-profile';
import { StudentProfileForm, AcademicMarksForm, SkillsManager } from '@/components/profile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function EditStudentProfilePage() {
  const router = useRouter();
  const { hasStudentProfile, isLoading, fetchStudentProfile } = useProfile();

  useEffect(() => {
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  // Redirect if no profile exists
  useEffect(() => {
    if (!isLoading && !hasStudentProfile) {
      router.push('/profile/student/create');
    }
  }, [hasStudentProfile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasStudentProfile) {
    return null;
  }

  return (
    <div className="container max-w-3xl py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/profile">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6">Edit Student Profile</h1>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <StudentProfileForm mode="edit" />
        </TabsContent>

        <TabsContent value="academics">
          <AcademicMarksForm />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
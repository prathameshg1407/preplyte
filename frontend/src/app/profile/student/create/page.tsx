// src/app/profile/student/create/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/hooks/use-profile';
import { StudentProfileForm } from '@/components/profile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CreateStudentProfilePage() {
  const router = useRouter();
  const { hasStudentProfile, isLoading } = useProfile();

  // Redirect if profile already exists
  useEffect(() => {
    if (!isLoading && hasStudentProfile) {
      router.push('/profile');
    }
  }, [hasStudentProfile, isLoading, router]);

  const handleSuccess = () => {
    router.push('/profile');
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/profile">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Link>
      </Button>

      <StudentProfileForm mode="create" onSuccess={handleSuccess} />
    </div>
  );
}
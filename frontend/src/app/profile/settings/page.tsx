// src/app/profile/settings/page.tsx

'use client';

import { useState } from 'react';
import { useProfile } from '@/lib/hooks/use-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const {
    userProfile,
    studentProfile,
    updateUserProfile,
    deleteStudentProfile,
    isUpdating,
  } = useProfile();

  const [name, setName] = useState(userProfile?.name || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateName = async () => {
    try {
      await updateUserProfile({ name });
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDeleteStudentProfile = async () => {
    setIsDeleting(true);
    try {
      await deleteStudentProfile();
      router.push('/profile');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/profile">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="space-y-6">
        {/* Display Name */}
        <Card>
          <CardHeader>
            <CardTitle>Display Name</CardTitle>
            <CardDescription>
              This is how your name will appear across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <Button
              onClick={handleUpdateName}
              disabled={isUpdating || name === userProfile?.name}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={userProfile?.email || ''} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={userProfile?.role?.replace('_', ' ') || ''}
                disabled
              />
            </div>
            {userProfile?.instituteName && (
              <div className="space-y-2">
                <Label>Institute</Label>
                <Input value={userProfile.instituteName} disabled />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {studentProfile && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Student Profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Student Profile?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your student profile including
                      all academic information and skills. Your resumes will not
                      be affected. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteStudentProfile}
                      disabled={isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Profile'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
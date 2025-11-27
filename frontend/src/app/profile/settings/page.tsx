// src/app/profile/settings/page.tsx

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/lib/hooks/use-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  ArrowLeft,
  Loader2,
  Trash2,
  User,
  Mail,
  Building2,
  Shield,
  Check,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  const [showSaved, setShowSaved] = useState(false);

  const hasChanges = name !== userProfile?.name;

  const handleUpdateName = async () => {
    try {
      await updateUserProfile({ name });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button variant="ghost" asChild className="mb-4 -ml-2 gap-2">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Display Name */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Display Name</CardTitle>
            </div>
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
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleUpdateName}
                disabled={isUpdating || !hasChanges}
                className="gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : showSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              {hasChanges && (
                <Button
                  variant="ghost"
                  onClick={() => setName(userProfile?.name || '')}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Account Information</CardTitle>
            </div>
            <CardDescription>Your account details (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userProfile?.email || ''}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Role</Label>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">
                    {userProfile?.role?.replace('_', ' ') || ''}
                  </Badge>
                </div>
              </div>

              {userProfile?.instituteName && (
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-muted-foreground">Institute</Label>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userProfile.instituteName}</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Contact support if you need to update your email or role.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {studentProfile && (
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible actions that affect your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div>
                  <p className="font-medium">Delete Student Profile</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove your student profile and all academic data
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 shrink-0">
                      <Trash2 className="h-4 w-4" />
                      Delete Profile
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      </div>
                      <AlertDialogTitle className="text-center">
                        Delete Student Profile?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                        This will permanently delete your student profile including all
                        academic information, skills, and linked data.
                        <br />
                        <strong>Your resumes will not be affected.</strong>
                        <br />
                        <br />
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-2">
                      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
                          'Yes, Delete Profile'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
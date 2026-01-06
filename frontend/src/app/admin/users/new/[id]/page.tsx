// src/app/admin/users/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../../../../../lib/hooks/use-admin';
import { UserStatsCards } from '../../../../../components/admin/users/user-stats';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Skeleton } from '../../../../../components/ui/skeleton';
import {
  ArrowLeft,
  Pencil,
  KeyRound,
  Loader2,
} from 'lucide-react';
import type { UserStats } from '../../../../../types/admin.types';

const roleLabels: Record<string, string> = {
  PLATFORM_ADMIN: 'Platform Admin',
  INSTITUTE_ADMIN: 'Institute Admin',
  USER: 'Student',
};

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { user, fetchStats } = useUser(id);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } finally {
        setStatsLoading(false);
      }
    };

    if (id) {
      loadStats();
    }
  }, [id, fetchStats]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayName = user.profile?.fullName || user.name || 'Unnamed';
  const initial = (user.name || user.email)[0].toUpperCase();
  const totalSessions = 
    (user._count?.aptitudeSessions || 0) +
    (user._count?.machineSessions || 0) +
    (user._count?.aiInterviewSessions || 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 mt-1" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-lg font-semibold bg-secondary">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold">{displayName}</h1>
                <span className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{user.email}</span>
                <span>·</span>
                <span>{roleLabels[user.role]}</span>
                {user.institute && (
                  <>
                    <span>·</span>
                    <Link
                      href={`/admin/institutes/${user.institute.id}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {user.institute.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users/${id}/reset-password`}>
              <KeyRound className="h-4 w-4 mr-2" />
              Reset Password
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/users/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-4" />
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <UserStatsCards stats={stats} />
      ) : null}

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile Info */}
        {user.profile && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Student Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Student ID</dt>
                  <dd className="font-medium mt-0.5">{user.profile.studentId || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Department</dt>
                  <dd className="font-medium mt-0.5">{user.profile.department || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Course Year</dt>
                  <dd className="font-medium mt-0.5">{user.profile.courseYear || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Backlogs</dt>
                  <dd className="font-medium mt-0.5">{user.profile.numberOfBacklogs ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">CGPA</dt>
                  <dd className="font-medium mt-0.5">
                    {user.profile.averageCgpa?.toFixed(2) || '—'}
                  </dd>
                </div>
              </dl>
              {user.profile.skills && user.profile.skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <dt className="text-sm text-muted-foreground mb-2">Skills</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {user.profile.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Account Info */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium mt-0.5">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last Login</dt>
                <dd className="font-medium mt-0.5">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString()
                    : 'Never'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Sessions</dt>
                <dd className="font-medium mt-0.5 tabular-nums">{totalSessions}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Resumes</dt>
                <dd className="font-medium mt-0.5 tabular-nums">{user._count?.resumes || 0}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
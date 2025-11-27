// src/app/admin/institutes/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useInstitute } from '../../../../lib/hooks/use-admin';
import { InstituteStats } from '../../../../components/admin/institutes/institute-stats';
import { InstituteStudentsList } from '../../../../components/admin/institutes/institute-students-list';
import { InstituteAdminsList } from '../../../../components/admin/institutes/institute-admins-list';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { ArrowLeft, Pencil, Loader2 } from 'lucide-react';
import type { InstituteStats as InstituteStatsType, User } from '../../../../types/admin.types';

export default function InstituteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { institute, fetchStats, fetchStudents, fetchAdmins } = useInstitute(id);
  
  const [stats, setStats] = useState<InstituteStatsType | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, adminsData] = await Promise.all([
          fetchStats(),
          fetchAdmins(),
        ]);
        setStats(statsData);
        setAdmins(adminsData);
      } finally {
        setStatsLoading(false);
        setAdminsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, fetchStats, fetchAdmins]);

  if (!institute) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 mt-1" asChild>
            <Link href="/admin/institutes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold">{institute.name}</h1>
              <span className={`h-2 w-2 rounded-full ${institute.isActive ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono">{institute.domain}</span>
              {institute.profile?.location && (
                <>
                  <span>·</span>
                  <span>{institute.profile.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href={`/admin/institutes/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : stats ? (
        <InstituteStats stats={stats} />
      ) : null}

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="admins" className="relative">
            Admins
            {admins.length > 0 && (
              <span className="ml-2 text-xs tabular-nums text-muted-foreground">
                {admins.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-0">
          <InstituteStudentsList
            instituteId={id}
            fetchStudents={fetchStudents}
          />
        </TabsContent>

        <TabsContent value="admins" className="mt-0">
          <InstituteAdminsList admins={admins} loading={adminsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
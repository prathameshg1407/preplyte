'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { useInstituteAdminStudents } from '@/lib/hooks/institute-admin/use-institute-admin-students';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  FileText, 
  Code, 
  Activity, 
  Brain, 
  TrendingUp, 
  Users,
  ArrowLeft 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function InstituteStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentIdParam = params.id as string;
  const { user: authUser } = useAuth();
  const instituteId = authUser?.instituteId;

  // Fetch using the admin student hook
  const { 
    students, 
    loading, 
    error, 
    refetch, 
    setPagination,
    setFilters
  } = useInstituteAdminStudents(instituteId || '');

  // Effect to ensure we fetch a wide enough list to find the student
  useEffect(() => {
    if (instituteId) {
      // Clear filters to ensure the student isn't hidden by previous searches
      setFilters({});
      // Increase page size to improve chances of finding the student in the list
      setPagination(prev => ({ ...prev, pageSize: 100 }));
    }
  }, [instituteId, setFilters, setPagination]);

  // Find the specific student from the returned array by DB ID or Student ID
  const student = useMemo(() => {
    return students.find(s => s.id === studentIdParam || s.studentId === studentIdParam);
  }, [students, studentIdParam]);

  // Handle Loading State
  if (loading && !student) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  // Handle Error or Student Not Found
  if (!student && !loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-muted rounded-full">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Student Not Found</h2>
          <p className="text-muted-foreground">
            Could not find student with ID: <span className="font-mono text-primary">{studentIdParam}</span>
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Button onClick={() => refetch()}>Retry Loading</Button>
        </div>
      </div>
    );
  }

  // Calculate CGPA for progress bar (assuming 10.0 scale)
  const cgpaProgress = student?.averageCgpa ? Math.min(student.averageCgpa * 10, 100) : 0;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Identity Card */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                    {student?.name?.slice(0, 2).toUpperCase() || 'ST'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">{student?.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-background">{student?.studentId}</Badge>
                    <Badge variant={student?.isActive ? "default" : "secondary"}>
                      {student?.isActive ? "Active Account" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Email Address</p>
                    <p className="font-medium">{student?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Joined On</p>
                    <p className="font-medium">
                      {student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Academic CGPA</p>
                      <p className="text-xl font-bold text-primary">{student?.averageCgpa?.toFixed(2) || '0.00'}</p>
                    </div>
                    <Progress value={cgpaProgress} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity and Performance Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="activity">Training Activity</TabsTrigger>
              <TabsTrigger value="details">Academic Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Aptitude" value={0} icon={<Activity className="h-4 w-4" />} />
                <StatCard label="Coding" value={0} icon={<Code className="h-4 w-4" />} />
                <StatCard label="AI Mock" value={0} icon={<Brain className="h-4 w-4" />} />
                <StatCard label="Drives" value={0} icon={<TrendingUp className="h-4 w-4" />} />
              </div>
            </TabsContent>

            <TabsContent value="details" className="pt-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-semibold">{student?.department || 'Not Set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Course Year</p>
                      <p className="font-semibold">{student?.courseYear || 'Not Set'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Career Assets</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Student Resume</span>
              </div>
              <Button className="w-full" variant="outline" disabled>
                View Document
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader><CardTitle className="text-lg text-destructive">Admin Actions</CardTitle></CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                Restrict Access
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="text-center">
      <CardContent className="p-4 flex flex-col items-center">
        <div className="p-2 bg-primary/10 text-primary rounded-full mb-2">
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p>
      </CardContent>
    </Card>
  );
}
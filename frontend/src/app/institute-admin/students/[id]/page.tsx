'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import { useInstituteAdminStudents } from '@/lib/hooks/institute-admin/use-institute-admin-students';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  FileText, 
  Code, 
  Activity, 
  Brain, 
  TrendingUp, 
  Users,
  ArrowLeft,
  Mail,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function InstituteStudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentIdParam = params.id as string;
  const { user: authUser } = useAuth();
  const instituteId = authUser?.instituteId;

  const { 
    students, 
    loading, 
    refetch, 
    setPagination,
    setFilters
  } = useInstituteAdminStudents(instituteId || '');

  // Ensure we search broadly to find the specific student ID
  useEffect(() => {
    if (instituteId) {
      setFilters({}); 
      setPagination(prev => ({ ...prev, pageSize: 100 }));
    }
  }, [instituteId, setFilters, setPagination]);

  const student = useMemo(() => {
    return students.find(s => s.id === studentIdParam || s.studentId === studentIdParam);
  }, [students, studentIdParam]);

  if (loading && !student) {
    return <ProfileSkeleton />;
  }

  if (!student && !loading) {
    return <StudentNotFound id={studentIdParam} onRetry={refetch} onBack={() => router.back()} />;
  }

  const cgpaProgress = student?.averageCgpa ? Math.min(student.averageCgpa * 10, 100) : 0;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Identity Card */}
          <Card className="overflow-hidden border-t-4 border-t-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">
                    {student?.name?.slice(0, 2).toUpperCase() || 'ST'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">{student?.name}</h1>
                      <div className="flex items-center gap-3 text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {student?.studentId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {student?.email}</span>
                      </div>
                    </div>
                    <Badge variant={student?.isActive ? "default" : "destructive"} className="px-4 py-1">
                      {student?.isActive ? "Active Student" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
                     <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Department</p>
                        <p className="font-medium">{student?.department || 'N/A'}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Course Year</p>
                        <p className="font-medium">{student?.courseYear || 'N/A'}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Joined</p>
                        <p className="font-medium">{student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</p>
                     </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview - FIXED: Added optional chaining (?.stats?.) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Aptitude Tests" value={student?.stats?.aptitude || 0} icon={<Activity className="h-4 w-4" />} />
            <StatCard label="Code Problems" value={student?.stats?.machine || 0} icon={<Code className="h-4 w-4" />} />
            <StatCard label="AI Interviews" value={student?.stats?.interview || 0} icon={<Brain className="h-4 w-4" />} />
            <StatCard label="Drive Attempts" value={student?.stats?.drives || 0} icon={<TrendingUp className="h-4 w-4" />} />
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="academic" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="academic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 px-6">Academic History</TabsTrigger>
              <TabsTrigger value="skills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3 px-6">Skills & Competency</TabsTrigger>
            </TabsList>
            
            <TabsContent value="academic" className="pt-6 space-y-6">
              {/* CGPA Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between">
                    Current Performance
                    <span className="text-2xl font-bold text-primary">{student?.averageCgpa?.toFixed(2) || 'N/A'} <span className="text-sm text-muted-foreground font-normal">/ 10.0</span></span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={cgpaProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2 text-right">Aggregate CGPA across all semesters</p>
                </CardContent>
              </Card>

              {/* Past Academics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AcademicCard title="10th Grade" score={student?.academic?.marks10} type="Percentage" />
                <AcademicCard title="12th Grade" score={student?.academic?.marks12} type="Percentage" />
                <Card className={student?.academic?.backlogs && student.academic.backlogs > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Backlogs</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {student?.academic?.backlogs && student.academic.backlogs > 0 ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <GraduationCap className="h-5 w-5 text-primary" />}
                            <span className="text-2xl font-bold">{student?.academic?.backlogs || 0}</span>
                        </div>
                    </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="pt-6">
              <Card>
                <CardHeader>
                    <CardTitle>Skills Profile</CardTitle>
                    <CardDescription>Technical and professional skills listed by the student</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {student?.skills && student.skills.length > 0 ? (
                            student.skills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="px-3 py-1 text-sm">{skill}</Badge>
                            ))
                        ) : (
                            <p className="text-muted-foreground italic">No skills added yet.</p>
                        )}
                    </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN (1/3 width) - Sidebar */}
        <div className="space-y-6">
            
          {/* Resume Card */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Career Assets</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                <FileText className="h-8 w-8 text-primary" />
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{student?.resume?.fileName || "Default Resume"}</p>
                    <p className="text-xs text-muted-foreground">
                        {student?.resume ? "Ready for download" : "Not uploaded yet"}
                    </p>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant={student?.resume ? "outline" : "ghost"} 
                disabled={!student?.resume?.url}
                onClick={() => student?.resume?.url && window.open(student.resume.url, '_blank')}
              >
                {student?.resume?.url ? (
                    <>
                        <Download className="mr-2 h-4 w-4" /> View Document
                    </>
                ) : "No Resume Available"}
              </Button>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="border-destructive/20">
            <CardHeader><CardTitle className="text-lg text-destructive">Account Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" /> Send Email
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full">
                Block Student Account
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="text-center shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex flex-col items-center justify-center">
        <div className="p-2 bg-primary/10 text-primary rounded-full mb-2">
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p>
      </CardContent>
    </Card>
  );
}

function AcademicCard({ title, score, type }: { title: string, score: number | null | undefined, type: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {score ? (
                    <div>
                        <span className="text-2xl font-bold">{score}</span>
                        <span className="text-xs text-muted-foreground ml-1">{type === 'Percentage' ? '%' : ''}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground italic text-sm">Not recorded</span>
                )}
            </CardContent>
        </Card>
    )
}

function ProfileSkeleton() {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
}

function StudentNotFound({ id, onRetry, onBack }: { id: string, onRetry: () => void, onBack: () => void }) {
    return (
        <div className="p-8 max-w-2xl mx-auto text-center space-y-6 pt-20">
            <div className="flex justify-center">
              <div className="p-4 bg-muted rounded-full">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Student Not Found</h2>
              <p className="text-muted-foreground">
                We couldn't locate details for ID: <span className="font-mono text-primary">{id}</span>.
                They might belong to a different institute or the ID is incorrect.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={onBack}>Go Back</Button>
              <Button onClick={onRetry}>Retry</Button>
            </div>
        </div>
    )
}
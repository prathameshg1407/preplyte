// Path: frontend/src/components/institute-admin/student-profile-sheet.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  GraduationCap, 
  FileText, 
  Code, 
  Brain,
  BarChart3,
  Clock,
  Users,
  Award 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export type StudentProfile = {
  id: string;
  email: string;
  name: string;
  studentId: string;
  departmentId: string;
  departmentName?: string;
  courseYear: string;
  averageCgpa: number;
  marks10?: number;
  marks12?: number;
  cgpaSemesters: number[];
  skills: string[];
  resumeUrl?: string;
  resumeName?: string;
  isActive: boolean;
  createdAt: string;
  // Stats (from _count in Prisma)
  aptitudeSessions: number;
  machineSessions: number;
  aiInterviewSessions: number;
  mockDriveRegistrations: number;
};

interface StudentProfileSheetProps {
  student: StudentProfile;
  loading?: boolean;
  triggerLabel?: string;
  className?: string;
}

export function StudentProfileSheet({
  student,
  loading = false,
  triggerLabel = 'View Profile',
  className,
}: StudentProfileSheetProps) {
  if (loading) {
    return (
      <div className="w-full h-10">
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] max-w-[90vw] sm:w-[650px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={student.resumeUrl} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary-foreground">
                {student.name?.charAt(0)?.toUpperCase() || 'S'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg leading-tight">{student.name}</p>
              <p className="text-sm text-muted-foreground">ID: {student.studentId}</p>
            </div>
          </SheetTitle>
          <SheetDescription>
            Complete student profile and activity summary
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pb-4">
          {/* Academic Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-primary">
                <GraduationCap className="h-4 w-4" />
                Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">
                    Department
                  </span>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {student.departmentName || student.departmentId || '—'}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">
                    Course Year
                  </span>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {student.courseYear}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">
                    Average CGPA
                  </span>
                  <div className="font-mono font-semibold text-lg text-primary">
                    {student.averageCgpa?.toFixed(2) || '—'}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground block mb-1">
                    Status
                  </span>
                  <Badge 
                    variant={student.isActive ? "default" : "secondary"} 
                    className="font-normal text-xs"
                  >
                    {student.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              {student.marks10 || student.marks12 ? (
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <span className="text-xs text-muted-foreground">10th Marks</span>
                    <p className="font-mono font-medium">
                      {student.marks10?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">12th Marks</span>
                    <p className="font-mono font-medium">
                      {student.marks12?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Skills */}
          {student.skills?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-primary">
                  <Code className="h-4 w-4" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resume */}
          {student.resumeUrl && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-primary">
                  <FileText className="h-4 w-4" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" title={student.resumeName}>
                      {student.resumeName || 'Resume.pdf'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.resumeUrl.split('/').pop()}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="whitespace-nowrap"
                  >
                    <a 
                      href={student.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      View
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-primary">
                <BarChart3 className="h-4 w-4" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">
                    {student.aptitudeSessions}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Aptitude
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">
                    {student.machineSessions}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Coding
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">
                    {student.aiInterviewSessions}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    AI Interviews
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">
                    {student.mockDriveRegistrations}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Mock Drives
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* Account Info */}
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Member since {new Date(student.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

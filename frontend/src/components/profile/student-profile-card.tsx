// src/components/profile/student-profile-card.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  BookOpen,
  Award,
  Pencil,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import Link from 'next/link';

export function StudentProfileCard() {
  const { studentProfile } = useProfile();

  if (!studentProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Profile</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            No student profile created yet
          </p>
          <Button asChild>
            <Link href="/profile/student/create">Create Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Student Profile</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile/student/edit">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{studentProfile.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Student ID</p>
            <p className="font-medium">{studentProfile.studentId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {studentProfile.department}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Course Year</p>
            <p className="font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              {studentProfile.courseYear}
            </p>
          </div>
        </div>

        {/* Academic Marks */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Academic Performance
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">
                {studentProfile.marks10?.toFixed(1) || '-'}
              </p>
              <p className="text-xs text-muted-foreground">10th %</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">
                {studentProfile.marks12?.toFixed(1) || '-'}
              </p>
              <p className="text-xs text-muted-foreground">12th %</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">
                {studentProfile.averageCgpa?.toFixed(2) || '-'}
              </p>
              <p className="text-xs text-muted-foreground">Avg CGPA</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        {studentProfile.skills.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {studentProfile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Linked Resume */}
        {studentProfile.resumeUrl && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Linked Resume</p>
            <a
              href={studentProfile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <FileText className="h-4 w-4" />
              {studentProfile.resumeName || 'View Resume'}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
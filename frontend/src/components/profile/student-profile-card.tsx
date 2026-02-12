// src/components/profile/student-profile-card.tsx

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  BookOpen,
  Award,
  Pencil,
  FileText,
  ExternalLink,
  Hash,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Building2,
  School,
} from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function StudentProfileCard() {
  const { studentProfile, userProfile } = useProfile(); // Added userProfile to check role context

  const isInstituteStudent = !!userProfile?.instituteId;

  if (!studentProfile) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Empty State Hero */}
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
            >
              <GraduationCap className="h-10 w-10 text-primary" />
            </motion.div>
            <h3 className="mb-2 text-xl font-semibold">
              {isInstituteStudent ? "Create Your Student Profile" : "Create Academic Profile"}
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-muted-foreground">
              Add your academic details to unlock personalized opportunities and recommendations
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/profile/student/create">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 divide-x border-t">
            {[
              { icon: Award, label: 'Track Academics' },
              { icon: Sparkles, label: 'Get Matched' },
              { icon: TrendingUp, label: 'Grow Skills' },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-4 text-center text-muted-foreground"
              >
                <feature.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getGradeColor = (value: number | null, max: number = 100) => {
    if (!value) return 'text-muted-foreground';
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (percentage >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <Card className="overflow-hidden">
      {/* Header with Gradient */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{studentProfile.fullName}</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                {studentProfile.studentId}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/profile/student/edit">
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Show Department OR College Name */}
          {studentProfile.departmentName || studentProfile.collegeName ? (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                {studentProfile.departmentName ? <Building2 className="h-4 w-4 text-muted-foreground" /> : <School className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                    {studentProfile.departmentName ? "Department" : "College"}
                </p>
                <p className="font-medium text-sm truncate" title={studentProfile.departmentName || studentProfile.collegeName || ''}>
                    {studentProfile.departmentCode ? (
                    <span className="flex items-center gap-1">
                        <span className="font-semibold">{studentProfile.departmentCode}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="truncate">{studentProfile.departmentName}</span>
                    </span>
                    ) : (
                    studentProfile.departmentName || studentProfile.collegeName
                    )}
                </p>
                </div>
            </div>
          ) : null}

          {/* Show Year Only if Available */}
          {studentProfile.courseYear && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                <p className="text-xs text-muted-foreground">Year</p>
                <p className="font-medium text-sm">{studentProfile.courseYear}</p>
                </div>
            </div>
          )}
        </div>

        {/* Backlogs Info - Only show for Institute Students or if value > 0 */}
        {(isInstituteStudent || studentProfile.numberOfBacklogs > 0) && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <p className="text-xs text-muted-foreground">Number of Backlogs</p>
                <p
                className={cn(
                    'font-medium text-sm',
                    (studentProfile.numberOfBacklogs ?? 0) === 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : (studentProfile.numberOfBacklogs ?? 0) <= 2
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                )}
                >
                {studentProfile.numberOfBacklogs ?? 0}
                {(studentProfile.numberOfBacklogs ?? 0) === 0 && (
                    <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">✓</span>
                )}
                </p>
            </div>
            </div>
        )}

        {/* Academic Performance - Only show if data exists or user is Institute Student */}
        {(isInstituteStudent || studentProfile.averageCgpa) && (
            <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Academic Performance</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[
                { label: '10th', value: studentProfile.marks10, max: 100, suffix: '%' },
                { label: '12th', value: studentProfile.marks12, max: 100, suffix: '%' },
                { label: 'CGPA', value: studentProfile.averageCgpa, max: 10, suffix: '' },
                ].map((item) => (
                <motion.div
                    key={item.label}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden rounded-xl bg-muted/50 p-4 text-center"
                >
                    <p className={cn('text-2xl font-bold', getGradeColor(item.value, item.max))}>
                    {item.value?.toFixed(item.suffix === '%' ? 1 : 2) || '-'}
                    <span className="text-sm font-normal text-muted-foreground">{item.suffix}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                    {item.value && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                        <motion.div
                        className={cn(
                            'h-full',
                            getGradeColor(item.value, item.max).replace('text-', 'bg-')
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        />
                    </div>
                    )}
                </motion.div>
                ))}
            </div>
            </div>
        )}

        {/* Skills */}
        {studentProfile.skills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Skills</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {studentProfile.skills.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {studentProfile.skills.slice(0, 8).map((skill) => (
                <Badge key={skill} variant="outline" className="font-normal">
                  {skill}
                </Badge>
              ))}
              {studentProfile.skills.length > 8 && (
                <Badge variant="secondary">+{studentProfile.skills.length - 8} more</Badge>
              )}
            </div>
          </div>
        )}

        {/* Linked Resume */}
        {studentProfile.resumeUrl && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <a
              href={studentProfile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {studentProfile.resumeName || 'View Resume'}
                  </p>
                  <p className="text-xs text-muted-foreground">Linked to profile</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
// src/components/profile/profile-completion-card.tsx

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Target,
  User,
  GraduationCap,
  FileText,
  Briefcase,
} from 'lucide-react';
import type { ProfileCompletionStatus } from '@/types/profile.types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProfileCompletionCardProps {
  completion: ProfileCompletionStatus | null;
}

const fieldConfig: Record<string, { label: string; icon: React.ElementType; link: string }> = {
  name: { label: 'Display Name', icon: User, link: '/profile/settings' },
  studentProfile: { label: 'Student Profile', icon: GraduationCap, link: '/profile/student/create' },
  fullName: { label: 'Full Name', icon: User, link: '/profile/student/edit' },
  studentId: { label: 'Student ID', icon: Target, link: '/profile/student/edit' },
  department: { label: 'Department', icon: GraduationCap, link: '/profile/student/edit' },
  courseYear: { label: 'Course Year', icon: GraduationCap, link: '/profile/student/edit' },
  skills: { label: 'Skills', icon: Briefcase, link: '/profile/student/edit' },
  marks10: { label: '10th Marks', icon: Target, link: '/profile/student/edit' },
  marks12: { label: '12th Marks', icon: Target, link: '/profile/student/edit' },
  cgpa: { label: 'CGPA', icon: Target, link: '/profile/student/edit' },
  resume: { label: 'Resume', icon: FileText, link: '/profile/resumes' },
};

export function ProfileCompletionCard({ completion }: ProfileCompletionCardProps) {
  if (!completion) return null;

  const { percentage, missingFields, isComplete } = completion;

  const getProgressColor = () => {
    if (percentage >= 80) return 'from-emerald-500 to-emerald-400';
    if (percentage >= 50) return 'from-amber-500 to-amber-400';
    return 'from-rose-500 to-rose-400';
  };

  const getStatusConfig = () => {
    if (isComplete) {
      return {
        icon: Sparkles,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        title: 'Profile Complete!',
        description: "You're all set for interviews",
      };
    }
    if (percentage >= 50) {
      return {
        icon: Target,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        title: 'Almost There',
        description: 'Complete your profile to unlock all features',
      };
    }
    return {
      icon: AlertCircle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      title: 'Get Started',
      description: 'Complete your profile to get noticed',
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <Card className={cn('overflow-hidden border-2', status.border)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className={cn('p-5', status.bg)}>
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                isComplete ? 'bg-emerald-500' : 'bg-background'
              )}
            >
              <StatusIcon className={cn('h-6 w-6', isComplete ? 'text-white' : status.color)} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">{status.title}</h3>
              <p className="text-sm text-muted-foreground">{status.description}</p>
            </div>

            {/* Percentage Circle */}
            <div className="relative h-14 w-14">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="url(#progress-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={150.8}
                  initial={{ strokeDashoffset: 150.8 }}
                  animate={{ strokeDashoffset: 150.8 - (150.8 * percentage) / 100 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className={cn('stop-color-current', getProgressColor().split(' ')[0].replace('from-', 'text-'))} />
                    <stop offset="100%" className={cn('stop-color-current', getProgressColor().split(' ')[1].replace('to-', 'text-'))} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Missing Fields */}
        {!isComplete && missingFields.length > 0 && (
          <div className="p-5 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Complete these to improve your profile
            </p>

            <div className="space-y-2">
              {missingFields.slice(0, 4).map((field, index) => {
                const config = fieldConfig[field] || {
                  label: field,
                  icon: Target,
                  link: '/profile',
                };
                const Icon = config.icon;

                return (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={config.link}
                      className="group flex items-center justify-between rounded-lg border border-transparent bg-muted/50 p-3 transition-all hover:border-primary/20 hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  </motion.div>
                );
              })}

              {missingFields.length > 4 && (
                <p className="text-center text-xs text-muted-foreground">
                  +{missingFields.length - 4} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Complete State */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5"
          >
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                Your profile is complete! You're ready for opportunities.
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
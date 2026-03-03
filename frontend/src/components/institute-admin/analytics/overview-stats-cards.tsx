'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  FileText, Users, ClipboardList, Brain, Code2, Mic,
  TrendingUp, CheckCircle2
} from 'lucide-react';
import type { InstituteAnalyticsSummary, PracticeModuleStats } from '@/lib/hooks/institute-admin/use-institute-analytics';

interface OverviewStatsCardsProps {
  summary: InstituteAnalyticsSummary | undefined;
  practiceStats: PracticeModuleStats | undefined;
}

interface StatCardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: 'primary' | 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'indigo';
}

const colorMap: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};

const glowMap: Record<string, string> = {
  primary: 'bg-primary',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
  indigo: 'bg-indigo-500',
};

export function OverviewStatsCards({ summary, practiceStats }: OverviewStatsCardsProps) {
  if (!summary || !practiceStats) return null;

  const cards: StatCardData[] = [
    {
      title: 'Total Students',
      value: summary.totalStudents,
      subtitle: 'Active institute members',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Mock Drives',
      value: summary.totalMockDrives,
      subtitle: `${summary.totalRegistrations} total registrations`,
      icon: FileText,
      color: 'primary',
    },
    {
      title: 'Completion Rate',
      value: `${summary.overallCompletionRate.toFixed(1)}%`,
      subtitle: summary.overallAvgScore
        ? `Avg score: ${summary.overallAvgScore.toFixed(1)}%`
        : 'Overall mock drive completion',
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      title: 'Aptitude Sessions',
      value: summary.totalAptitudeSessions,
      subtitle: `${practiceStats.aptitude.sessionsThisMonth} this month`,
      icon: ClipboardList,
      color: 'amber',
    },
    {
      title: 'Coding Sessions',
      value: summary.totalCodingSessions,
      subtitle: `${practiceStats.coding.sessionsThisMonth} this month`,
      icon: Code2,
      color: 'rose',
    },
    {
      title: 'AI Interviews',
      value: summary.totalAiInterviewSessions,
      subtitle: `${practiceStats.aiInterview.sessionsThisMonth} this month`,
      icon: Mic,
      color: 'violet',
    },
    {
      title: 'Avg Aptitude Acc.',
      value: practiceStats.aptitude.avgAccuracy != null
        ? `${practiceStats.aptitude.avgAccuracy.toFixed(1)}%`
        : '—',
      subtitle: `${practiceStats.aptitude.completedSessions} sessions completed`,
      icon: Brain,
      color: 'cyan',
    },
    {
      title: 'Avg AI Score',
      value: practiceStats.aiInterview.avgScore != null
        ? `${practiceStats.aiInterview.avgScore.toFixed(1)}/10`
        : '—',
      subtitle: `${practiceStats.aiInterview.completedSessions} interviews done`,
      icon: TrendingUp,
      color: 'indigo',
    },
  ];

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <motion.div
          key={card.title}
          variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <Card className="relative overflow-hidden border-none shadow-lg glass-effect">
            <div className={cn(
              'absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-10 blur-2xl',
              glowMap[card.color]
            )} />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-2 rounded-lg border', colorMap[card.color])}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-bold tabular-nums">{card.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{card.title}</p>
                <p className="text-xs text-muted-foreground/80">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { AnalyticsOverview } from '@/types/admin.mockdrive.types';
import { Users, UserCheck, TrendingUp, Target, Layers, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnalyticsOverviewCardsProps {
  overview: AnalyticsOverview | undefined;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  purple: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  yellow: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

const glowMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  purple: 'bg-violet-500',
  orange: 'bg-orange-500',
  indigo: 'bg-indigo-500',
  yellow: 'bg-amber-500',
};

export function AnalyticsOverviewCards({ overview }: AnalyticsOverviewCardsProps) {
  if (!overview) return null;

  const cards = [
    {
      title: 'Total Registered',
      value: overview.registrations.total,
      subValue: `${overview.registrations.approved} approved`,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Participation Rate',
      value: `${overview.participation.completionRate.toFixed(1)}%`,
      subValue: `${overview.participation.totalCompleted} of ${overview.participation.totalRegistered}`,
      icon: UserCheck,
      color: 'green',
    },
    {
      title: 'Average Score',
      value: overview.scores.average ? `${overview.scores.average.toFixed(1)}%` : '-',
      subValue: overview.scores.median ? `Median: ${overview.scores.median.toFixed(1)}%` : '',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'Score Range',
      value: overview.scores.highest ? `${overview.scores.highest.toFixed(1)}%` : '-',
      subValue: overview.scores.lowest ? `Low: ${overview.scores.lowest.toFixed(1)}%` : '',
      icon: Target,
      color: 'orange',
    },
    {
      title: 'Batches',
      value: overview.batches.total,
      subValue: `${overview.batches.completed} completed`,
      icon: Layers,
      color: 'indigo',
    },
    {
      title: 'In Progress',
      value: overview.participation.totalStarted - overview.participation.totalCompleted,
      subValue: `${overview.batches.inProgress} active`,
      icon: Activity,
      color: 'yellow',
    },
  ];

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      {cards.map((card) => (
        <motion.div
           key={card.title}
           variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <Card className="group relative overflow-hidden glass-card h-full">
            <div className={cn(
              'absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-5 blur-3xl transition-opacity group-hover:opacity-10',
              glowMap[card.color]
            )} />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  'p-2 rounded-xl border shadow-sm transition-transform group-hover:scale-110',
                  colorMap[card.color]
                )}>
                  <card.icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-bold tracking-tight text-gradient tabular-nums">
                  {card.value}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 line-clamp-1">
                  {card.title}
                </p>
                {card.subValue && (
                  <p className="text-[11px] text-muted-foreground/60 font-medium">
                    {card.subValue}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

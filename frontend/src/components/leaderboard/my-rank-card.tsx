// src/components/leaderboard/my-rank-card.tsx

'use client';

import { Trophy, TrendingUp, Users, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { CurrentUserRank } from '@/types/leaderboard.types';

interface MyRankCardProps {
  data: CurrentUserRank | undefined;
  isLoading: boolean;
  categoryLabel: string;
  scoreUnit: string;
}

export function MyRankCard({ data, isLoading, categoryLabel, scoreUnit }: MyRankCardProps) {
  if (isLoading) {
    return <MyRankCardSkeleton />;
  }

  if (!data) {
    return null;
  }

  const getRankBadgeColor = (rank: number | null) => {
    if (rank === null) return 'bg-muted text-muted-foreground';
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
    if (rank === 2) return 'bg-slate-300/30 text-slate-600 dark:text-slate-300';
    if (rank === 3) return 'bg-amber-600/20 text-amber-600 dark:text-amber-400';
    if (rank <= 10) return 'bg-primary/10 text-primary';
    return 'bg-muted text-muted-foreground';
  };

  const getRankIcon = (rank: number | null) => {
    if (rank === null) return <Trophy className="h-5 w-5" />;
    if (rank <= 3) return <Medal className="h-5 w-5" />;
    return <Trophy className="h-5 w-5" />;
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Your Ranking - {categoryLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Rank */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                getRankBadgeColor(data.rank)
              )}
            >
              {getRankIcon(data.rank)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rank</p>
              <p className="text-2xl font-bold">
                {data.rank !== null ? `#${data.rank}` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">{data.score.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{scoreUnit}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-2xl font-bold">{data.totalParticipants.toLocaleString()}</p>
            </div>
          </div>

          {/* Percentile */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Percentile</p>
              <p className="text-sm font-medium">
                {data.percentile !== null ? `${data.percentile}%` : 'N/A'}
              </p>
            </div>
            <Progress
              value={data.percentile ?? 0}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {data.percentile !== null
                ? `Better than ${data.percentile}% of participants`
                : 'Complete activities to get ranked'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MyRankCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
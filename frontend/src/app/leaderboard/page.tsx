// src/app/leaderboard/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LeaderboardFilters,
  LeaderboardTable,
  MyRankCard,
  ScoreBreakdownCard,
} from '@/components/leaderboard';
import { useLeaderboard, useLeaderboardConfig, useMyScores } from '@/lib/hooks/use-leaderboard';
import { useLeaderboardStore } from '@/lib/store/leaderboard-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { filters, setScope, setCategory, setPage } = useLeaderboardStore();

  // Check if user has institute access for institute scope
  const hasInstituteAccess = !!user?.instituteId;

  // Reset to global if user doesn't have institute access but institute scope is selected
  useEffect(() => {
    if (isHydrated && filters.scope === 'institute' && !hasInstituteAccess) {
      setScope('global');
    }
  }, [isHydrated, filters.scope, hasInstituteAccess, setScope]);

  // Fetch data
  const {
    data: config,
    isLoading: isConfigLoading,
  } = useLeaderboardConfig();

  const {
    data: leaderboard,
    isLoading: isLeaderboardLoading,
    refetch: refetchLeaderboard,
  } = useLeaderboard(filters);

  const {
    data: myScores,
    isLoading: isMyScoresLoading,
  } = useMyScores();

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login?redirect=/leaderboard');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Show loading while checking auth
  if (!isHydrated || !isAuthenticated) {
    return <LeaderboardPageSkeleton />;
  }

  // Filter out unavailable scopes for individual users
  const filteredConfig = config
    ? {
        ...config,
        scopes: config.scopes.filter(
          (s) => s.value === 'global' || hasInstituteAccess
        ),
      }
    : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Trophy className="h-8 w-8 text-primary" />
            Leaderboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            See how you rank against other learners
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchLeaderboard()}
          disabled={isLeaderboardLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLeaderboardLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <LeaderboardFilters
          config={filteredConfig}
          isLoading={isConfigLoading}
          scope={filters.scope}
          category={filters.category}
          onScopeChange={setScope}
          onCategoryChange={setCategory}
        />
      </div>

      {/* My Rank Card */}
      <div className="mb-6">
        <MyRankCard
          data={leaderboard?.currentUser}
          isLoading={isLeaderboardLoading}
          categoryLabel={leaderboard?.categoryLabel || 'Overall'}
          scoreUnit={leaderboard?.scoreUnit || 'points'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leaderboard Table - Takes 2 columns */}
        <div className="lg:col-span-2">
          <LeaderboardTable
            entries={leaderboard?.entries}
            pagination={leaderboard?.pagination}
            isLoading={isLeaderboardLoading}
            scoreUnit={leaderboard?.scoreUnit || 'points'}
            onPageChange={setPage}
          />
        </div>

        {/* Score Breakdown - Takes 1 column */}
        <div>
          <ScoreBreakdownCard
            data={myScores}
            isLoading={isMyScoresLoading}
          />
        </div>
      </div>

      {/* Last Updated */}
      {leaderboard?.lastUpdated && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Last updated: {new Date(leaderboard.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function LeaderboardPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-44" />
      </div>

      {/* My Rank Card */}
      <Skeleton className="mb-6 h-32 w-full rounded-lg" />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
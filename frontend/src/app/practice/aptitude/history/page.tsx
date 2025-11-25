// src/app/practice/aptitude/history/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SessionCard } from '@/components/practice/aptitude';
import { useAptitude } from '@/lib/hooks/use-aptitude';
import type {
  ListSessionsResponse,
  ListSessionsParams,
  SessionStatus,
  DifficultyLevel,
  SessionSortBy,
} from '@/types/aptitude.types';
import {
  Loader2,
  History,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function AptitudeHistoryPage() {
  const router = useRouter();
  const { listSessions, resumeSession } = useAptitude();

  const [sessionsData, setSessionsData] = useState<ListSessionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState<'all' | SessionStatus>('all');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<SessionSortBy>('createdAt');
  const [page, setPage] = useState(1);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ListSessionsParams = {
        page,
        limit: 10,
        status: status as ListSessionsParams['status'],
        sortBy,
        sortOrder: 'desc',
      };

      if (difficulty !== 'all') {
        params.difficulty = difficulty;
      }

      const data = await listSessions(params);
      setSessionsData(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, status, difficulty, sortBy, listSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleResume = async (sessionId: string) => {
    try {
      await resumeSession(sessionId);
    } catch {
      // Error handled in hook
    }
  };

  const handleViewResults = (sessionId: string) => {
    router.push(`/practice/aptitude/result/${sessionId}`);
  };

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filters change
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            Practice History
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your past practice sessions
          </p>
        </div>
        <Button asChild>
          <Link href="/practice/aptitude">
            <Plus className="h-4 w-4 mr-2" />
            New Practice
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-2 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Status</label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as typeof status);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Difficulty</label>
              <Select
                value={difficulty}
                onValueChange={(v) => {
                  setDifficulty(v as typeof difficulty);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Sort By</label>
              <Select
                value={sortBy}
                onValueChange={(v) => {
                  setSortBy(v as SessionSortBy);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="completedAt">Date Completed</SelectItem>
                  <SelectItem value="totalScore">Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sessionsData && sessionsData.sessions.length > 0 ? (
        <div className="space-y-4">
          {sessionsData.sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onResume={handleResume}
              onViewResults={handleViewResults}
            />
          ))}

          {/* Pagination */}
          {sessionsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {sessionsData.pagination.currentPage} of{' '}
                {sessionsData.pagination.totalPages} ({sessionsData.pagination.totalItems}{' '}
                total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!sessionsData.pagination.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!sessionsData.pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
            <p className="text-muted-foreground mb-6">
              {status !== 'all' || difficulty !== 'all'
                ? 'No sessions match your filters. Try adjusting them.'
                : "You haven't started any practice sessions yet."}
            </p>
            <Button asChild>
              <Link href="/practice/aptitude">
                <Plus className="mr-2 h-4 w-4" />
                Start Your First Practice
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
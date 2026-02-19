// src/components/leaderboard/leaderboard-table.tsx

'use client';

import { Medal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry, LeaderboardPagination } from '@/types/leaderboard.types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[] | undefined;
  pagination: LeaderboardPagination | undefined;
  isLoading: boolean;
  scoreUnit: string;
  onPageChange: (page: number) => void;
}

export function LeaderboardTable({
  entries,
  pagination,
  isLoading,
  scoreUnit,
  onPageChange,
}: LeaderboardTableProps) {
  if (isLoading) {
    return <LeaderboardTableSkeleton />;
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Medal className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Rankings Yet</h3>
          <p className="text-center text-muted-foreground">
            Complete activities to appear on the leaderboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Medal className="h-5 w-5 text-primary" />
          Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Institute</TableHead>
                <TableHead className="hidden lg:table-cell">Department</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  scoreUnit={scoreUnit}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} -{' '}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{' '}
              of {pagination.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {generatePageNumbers(pagination.currentPage, pagination.totalPages).map(
                  (pageNum, idx) =>
                    pageNum === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onPageChange(pageNum as number)}
                      >
                        {pageNum}
                      </Button>
                    )
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({
  entry,
  scoreUnit,
}: {
  entry: LeaderboardEntry;
  scoreUnit: string;
}) {
  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-bold';
    if (rank === 2)
      return 'bg-slate-300/30 text-slate-600 dark:text-slate-300 font-bold';
    if (rank === 3)
      return 'bg-amber-600/20 text-amber-600 dark:text-amber-400 font-bold';
    return 'bg-muted text-muted-foreground';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TableRow className={cn(entry.isCurrentUser && 'bg-primary/5')}>
      <TableCell className="text-center">
        <span
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm',
            getRankStyle(entry.rank)
          )}
        >
          {entry.rank}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            {entry.profilePictureUrl && (
              <AvatarImage src={entry.profilePictureUrl} alt={entry.userName} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(entry.userName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className={cn('font-medium', entry.isCurrentUser && 'text-primary')}>
              {entry.userName}
              {entry.isCurrentUser && (
                <span className="ml-2 text-xs text-primary">(You)</span>
              )}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {entry.instituteName || '-'}
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">
        {entry.departmentName || '-'}
      </TableCell>
      <TableCell className="text-right">
        <span className="font-semibold">{entry.score.toLocaleString()}</span>
        <span className="ml-1 text-xs text-muted-foreground">{scoreUnit}</span>
      </TableCell>
    </TableRow>
  );
}

function generatePageNumbers(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }

  return pages;
}

function LeaderboardTableSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">
                  <Skeleton className="h-4 w-8" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto h-8 w-8 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
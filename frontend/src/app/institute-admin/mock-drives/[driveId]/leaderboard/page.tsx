// src/app/institute-admin/mock-drives/[driveId]/leaderboard/page.tsx

'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useMockDriveDetail } from '@/lib/hooks/institute-admin/use-mockdrive';
import { useResults } from '@/lib/hooks/institute-admin/use-mockdrive-results';
import { useBatches } from '@/lib/hooks/institute-admin/use-mockdrive-batches';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  Search,
  X,
  RefreshCcw,
  AlertCircle,
  Crown,
  Users,
  TrendingUp,
} from 'lucide-react';
import { MockDriveAttemptStatus } from '@/types/admin.mockdrive.types';

export default function LeaderboardPage() {
  const params = useParams();
  const driveId = params.driveId as string;

  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [batchId, setBatchId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');

  // Fetch mock drive details
  const { data: drive, isLoading: isDriveLoading } = useMockDriveDetail(driveId);

  // Check if leaderboard is enabled
  const isLeaderboardEnabled = drive?.showLeaderboard ?? false;

  // Fetch batches for filter
  const { data: batchesData } = useBatches(driveId);
  const batches = batchesData?.data ?? [];

  // Fetch results sorted by rank
 // Fetch results sorted by rank
const { data: resultsData, isLoading, isFetching, refetch } = useResults(
  driveId,
  {
    page,
    limit: 50,
    sortBy: 'rank',
    sortOrder: 'asc',
    batchId,
    search,
    status: MockDriveAttemptStatus.COMPLETED,
  },
  { enabled: isLeaderboardEnabled }
);

  const results = resultsData?.data ?? [];
  const pagination = resultsData?.pagination;

  // Handlers
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
      setPage(1);
    },
    [searchInput]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  }, []);

  const handleBatchChange = useCallback((value: string) => {
    if (value === 'all') {
      setBatchId(undefined);
    } else {
      setBatchId(value);
    }
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Get top 3 for podium
  const topThree = results.slice(0, 3);
  const restOfResults = results.slice(3);

  if (isDriveLoading) {
    return <PageSkeleton />;
  }

  if (!isLeaderboardEnabled) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/institute-admin/mock-drives/${driveId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">{drive?.title}</p>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Leaderboard Disabled</AlertTitle>
          <AlertDescription>
            The leaderboard is currently disabled for this mock drive. You can enable
            it in the drive settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/institute-admin/mock-drives/${driveId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">{drive?.title}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-64 pl-9"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Search
              </Button>
            </form>

            {/* Batch Filter */}
            <Select value={batchId || 'all'} onValueChange={handleBatchChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear */}
            {(search || batchId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleClearSearch();
                  setBatchId(undefined);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LeaderboardSkeleton />
      ) : results.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No results yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The leaderboard will populate when students complete the drive.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && page === 1 && !search && (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Second Place */}
              {topThree[1] && (
                <Card className="order-1 md:order-1">
                  <CardContent className="flex flex-col items-center pt-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <Medal className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-2xl font-bold text-gray-400">#2</div>
                      <div className="mt-1 font-semibold">
                        {topThree[1].studentName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {topThree[1].studentId}
                      </div>
                      <div className="mt-2 text-xl font-bold text-gray-600">
                        {topThree[1].percentageScore?.toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* First Place */}
              {topThree[0] && (
                <Card className="order-0 border-yellow-200 bg-yellow-50 md:order-2">
                  <CardContent className="flex flex-col items-center pt-6">
                    <div className="relative">
                      <Crown className="absolute -top-6 left-1/2 h-8 w-8 -translate-x-1/2 text-yellow-500" />
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                        <Trophy className="h-10 w-10 text-yellow-500" />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-3xl font-bold text-yellow-600">#1</div>
                      <div className="mt-1 text-lg font-semibold">
                        {topThree[0].studentName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {topThree[0].studentId}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-yellow-600">
                        {topThree[0].percentageScore?.toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Third Place */}
              {topThree[2] && (
                <Card className="order-2 md:order-3">
                  <CardContent className="flex flex-col items-center pt-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                      <Award className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-2xl font-bold text-amber-600">#3</div>
                      <div className="mt-1 font-semibold">
                        {topThree[2].studentName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {topThree[2].studentId}
                      </div>
                      <div className="mt-2 text-xl font-bold text-amber-700">
                        {topThree[2].percentageScore?.toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Rest of Rankings Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(page === 1 && !search ? restOfResults : results).map(
                      (result) => (
                        <TableRow key={result.attemptId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {result.rank && result.rank <= 3 && (
                                <Trophy
                                  className={`h-4 w-4 ${
                                    result.rank === 1
                                      ? 'text-yellow-500'
                                      : result.rank === 2
                                        ? 'text-gray-400'
                                        : 'text-amber-600'
                                  }`}
                                />
                              )}
                              <span className="font-bold">#{result.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{result.studentName}</div>
                              <div className="text-sm text-muted-foreground">
                                {result.studentId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {result.department || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {result.batchName ? (
                              <Badge variant="outline">{result.batchName}</Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-bold">
                              {result.percentageScore?.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {result.totalScore} pts
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(page - 1)}
                          className={
                            !pagination.hasPrevious
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNum)}
                                isActive={pageNum === page}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(page + 1)}
                          className={
                            !pagination.hasNext
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-16" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
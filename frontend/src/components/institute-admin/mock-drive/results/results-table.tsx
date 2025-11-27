// src/components/institute-admin/mock-drive/results/results-table.tsx

'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { AttemptStatusBadge } from './attempt-status-badge';
import { ResultListItem, ListResultsParams } from '@/types/admin.mockdrive.types';
import { format } from 'date-fns';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Trophy,
  FileBarChart,
} from 'lucide-react';

interface ResultsTableProps {
  results: ResultListItem[];
  isLoading?: boolean;
  driveId: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
  onSortChange: (
    sortBy: ListResultsParams['sortBy'],
    sortOrder: ListResultsParams['sortOrder']
  ) => void;
  currentSort: {
    sortBy?: ListResultsParams['sortBy'];
    sortOrder?: ListResultsParams['sortOrder'];
  };
}

export function ResultsTable({
  results,
  isLoading,
  driveId,
  pagination,
  onPageChange,
  onSortChange,
  currentSort,
}: ResultsTableProps) {
  const handleSort = (column: ListResultsParams['sortBy']) => {
    if (currentSort.sortBy === column) {
      onSortChange(column, currentSort.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(column, 'desc');
    }
  };

  const getSortIcon = (column: ListResultsParams['sortBy']) => {
    if (currentSort.sortBy !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return currentSort.sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <FileBarChart className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No results found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Results will appear here when students complete the drive.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => handleSort('rank')}
                >
                  Rank
                  {getSortIcon('rank')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => handleSort('studentName')}
                >
                  Student
                  {getSortIcon('studentName')}
                </Button>
              </TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => handleSort('totalScore')}
                >
                  Score
                  {getSortIcon('totalScore')}
                </Button>
              </TableHead>
              <TableHead>Result</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3"
                  onClick={() => handleSort('completedAt')}
                >
                  Completed
                  {getSortIcon('completedAt')}
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.attemptId}>
                <TableCell>
                  {result.rank ? (
                    <div className="flex items-center gap-1">
                      {result.rank <= 3 && (
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
                      <span className="font-medium">#{result.rank}</span>
                    </div>
                  ) : (
                    '-'
                  )}
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
                  {result.batchName ? (
                    <Badge variant="outline">{result.batchName}</Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <AttemptStatusBadge status={result.status} />
                </TableCell>
                <TableCell>
                  {result.totalScore !== null ? (
                    <div>
                      <div className="font-medium">
                        {result.percentageScore?.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.totalScore} pts
                      </div>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {result.isPassed !== null ? (
                    <Badge
                      variant={result.isPassed ? 'default' : 'destructive'}
                      className={
                        result.isPassed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {result.isPassed ? 'Passed' : 'Failed'}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {result.completedAt ? (
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(result.completedAt), 'PP')}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link
                      href={`/institute-admin/mock-drives/${driveId}/results/${result.attemptId}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {results.length} of {pagination.totalItems} results
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  className={
                    !pagination.hasPrevPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={page === pagination.currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  className={
                    !pagination.hasNextPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-16" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 8 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
// src/app/mock-drive/[driveId]/leaderboard/page.tsx

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLeaderboard, useMyRank } from '@/lib/hooks/mock-drive/use-leaderboard';
import { useMockDriveDetail } from '@/lib/hooks/mock-drive/use-discovery';
import { LeaderboardView } from '@/components/mock-drive/leaderboard/leaderboard-view';
import { MyRankCard } from '@/components/mock-drive/leaderboard/my-rank-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MockDriveLeaderboardPage() {
  const params = useParams();
  const driveId = params.driveId as string;
  const [page, setPage] = useState(1);

  const { data: drive } = useMockDriveDetail(driveId);
  const { data: leaderboard, isLoading } = useLeaderboard(driveId, { page, limit: 20 });
  const { data: myRank } = useMyRank(driveId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/mock-drive/${driveId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mock Drive
        </Link>
        <h1 className="text-3xl font-bold">{drive?.title || 'Mock Drive'}</h1>
        <p className="text-muted-foreground">Leaderboard</p>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">Full Leaderboard</TabsTrigger>
          <TabsTrigger value="my-rank">My Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          {leaderboard ? (
            <>
              <LeaderboardView data={leaderboard} />

              {/* Pagination */}
              {leaderboard.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {leaderboard.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(leaderboard.pagination.totalPages, p + 1))}
                    disabled={page >= leaderboard.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Leaderboard not available
            </p>
          )}
        </TabsContent>

        <TabsContent value="my-rank">
          {myRank ? (
            <div className="max-w-md mx-auto">
              <MyRankCard data={myRank} />
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              You haven't completed this mock drive yet
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
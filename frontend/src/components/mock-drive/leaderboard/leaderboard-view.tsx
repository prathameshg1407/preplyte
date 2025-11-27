// src/components/mock-drive/leaderboard/leaderboard-view.tsx

'use client';

import { FC } from 'react';
import { Trophy, Medal, Award, TrendingUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { LeaderboardEntry, LeaderboardResponse } from '@/types/mockdrive.types';

interface LeaderboardViewProps {
  data: LeaderboardResponse;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return null;
  }
};

export const LeaderboardView: FC<LeaderboardViewProps> = ({ data }) => {
  const { entries, stats, currentUserRank } = data;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-2xl font-bold">{stats.totalParticipants}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Highest Score</p>
              <p className="text-2xl font-bold">{stats.highestScore.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        {currentUserRank && (
          <Card className="bg-primary/5 border-primary">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-2xl font-bold">#{currentUserRank.rank}</p>
                <p className="text-xs text-muted-foreground">
                  Top {(100 - currentUserRank.percentile).toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-8">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <Medal className="h-10 w-10 text-gray-400" />
            </div>
            <p className="font-medium truncate max-w-[100px]">{entries[1]?.studentName}</p>
            <p className="text-sm text-muted-foreground">
              {entries[1]?.percentageScore.toFixed(1)}%
            </p>
            <div className="h-16 w-24 bg-gray-200 rounded-t-lg mt-2" />
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
            <p className="font-medium truncate max-w-[120px]">{entries[0]?.studentName}</p>
            <p className="text-sm text-muted-foreground">
              {entries[0]?.percentageScore.toFixed(1)}%
            </p>
            <div className="h-24 w-28 bg-yellow-200 rounded-t-lg mt-2" />
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-2 bg-amber-100 rounded-full flex items-center justify-center">
              <Award className="h-10 w-10 text-amber-600" />
            </div>
            <p className="font-medium truncate max-w-[100px]">{entries[2]?.studentName}</p>
            <p className="text-sm text-muted-foreground">
              {entries[2]?.percentageScore.toFixed(1)}%
            </p>
            <div className="h-12 w-24 bg-amber-200 rounded-t-lg mt-2" />
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Full Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.userId}
                  className={cn(entry.isCurrentUser && 'bg-primary/5')}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                      <span className={cn('font-medium', entry.rank <= 3 && 'text-lg')}>
                        #{entry.rank}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {entry.studentName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {entry.studentName}
                          {entry.isCurrentUser && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              You
                            </Badge>
                          )}
                        </p>
                        {entry.studentId && (
                          <p className="text-xs text-muted-foreground">{entry.studentId}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{entry.department || '-'}</TableCell>
                  <TableCell className="text-right font-medium">
                    {entry.totalScore.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={entry.percentageScore >= 60 ? 'default' : 'secondary'}>
                      {entry.percentageScore.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
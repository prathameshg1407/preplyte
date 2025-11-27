// src/components/mock-drive/leaderboard/my-rank-card.tsx

'use client';

import { FC } from 'react';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MyRankResponse } from '@/types/mockdrive.types';

interface MyRankCardProps {
  data: MyRankResponse;
}

export const MyRankCard: FC<MyRankCardProps> = ({ data }) => {
  const {
    rank,
    totalParticipants,
    percentile,
    percentageScore,
    aboveAverage,
    nearbyEntries,
  } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rank Display */}
        <div className="text-center">
          <div className="text-6xl font-bold">#{rank}</div>
          <p className="text-muted-foreground">out of {totalParticipants} participants</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{percentile.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Percentile</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{percentageScore.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </div>

        {/* Above/Below Average */}
        <div className={`p-4 rounded-lg ${aboveAverage ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <p className={`text-sm font-medium ${aboveAverage ? 'text-green-700' : 'text-yellow-700'}`}>
            {aboveAverage
              ? '🎉 Congratulations! You scored above average.'
              : '💪 Your score is below average. Keep practicing!'}
          </p>
        </div>

        {/* Nearby Entries */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Nearby Rankings
          </h4>
          <div className="space-y-2">
            {nearbyEntries.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.isCurrentUser ? 'bg-primary/10 border border-primary' : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold w-8">#{entry.rank}</span>
                  <span className={entry.isCurrentUser ? 'font-medium' : ''}>
                    {entry.studentName}
                    {entry.isCurrentUser && ' (You)'}
                  </span>
                </div>
                <Badge variant={entry.isCurrentUser ? 'default' : 'secondary'}>
                  {entry.percentageScore.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
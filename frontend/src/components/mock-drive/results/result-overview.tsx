// src/components/mock-drive/results/result-overview.tsx

'use client';

import { FC } from 'react';
import { format } from 'date-fns';
import {
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ResultOverview as ResultOverviewType } from '@/types/mockdrive.types';
import { MODULE_TYPE_CONFIG, ATTEMPT_STATUS_CONFIG } from '@/lib/constants/mockdrive.constants';

interface ResultOverviewProps {
  result: ResultOverviewType;
}

export const ResultOverview: FC<ResultOverviewProps> = ({ result }) => {
  const statusConfig = ATTEMPT_STATUS_CONFIG[result.status];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-2xl font-bold">
                  {result.totalScore?.toFixed(1) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percentage</p>
                <p className="text-2xl font-bold">
                  {result.percentageScore?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold">
                  {result.rank ? `#${result.rank}` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {result.totalParticipants}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full ${
                  result.isPassed ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {result.isPassed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p
                  className={`text-lg font-bold ${
                    result.isPassed ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {result.isPassed ? 'Passed' : 'Not Passed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attempt Info */}
      <Card>
        <CardHeader>
          <CardTitle>Attempt Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="text-sm font-medium">
                  {result.startedAt
                    ? format(new Date(result.startedAt), 'MMM d, yyyy h:mm a')
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-sm font-medium">
                  {result.completedAt
                    ? format(new Date(result.completedAt), 'MMM d, yyyy h:mm a')
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className={`${statusConfig.color} ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Module Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.moduleScores.map((module) => {
              const typeConfig = MODULE_TYPE_CONFIG[module.moduleType];
              return (
                <div key={module.moduleId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${typeConfig.color}`}>
                        {module.moduleName || typeConfig.label}
                      </span>
                      {module.isPassed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{module.score.toFixed(1)}</span>
                      <span className="text-muted-foreground">/{module.maxScore}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({module.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={module.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Time: {Math.floor(module.timeSpentSeconds / 60)}m {module.timeSpentSeconds % 60}s</span>
                    <span>Status: {module.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
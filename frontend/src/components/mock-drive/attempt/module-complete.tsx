// src/components/mock-drive/attempt/module-complete.tsx

'use client';

import { FC } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SubmitModuleResponse } from '@/types/mockdrive.types';

interface ModuleCompleteProps {
  result: SubmitModuleResponse;
  onContinue: () => void;
  onViewResults: () => void;
}

export const ModuleComplete: FC<ModuleCompleteProps> = ({
  result,
  onContinue,
  onViewResults,
}) => {
  const { score, maxScore, percentage, isPassed, isLastModule, attemptCompleted } = result;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          {isPassed ? (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </div>
        <CardTitle>
          {attemptCompleted ? 'Mock Drive Completed!' : 'Module Completed!'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center">
          <div className="text-4xl font-bold">
            {score.toFixed(1)}/{maxScore}
          </div>
          <div className="text-muted-foreground">
            {percentage.toFixed(1)}% Score
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={percentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isPassed
                ? 'bg-green-100 text-green-700'
                : // src/components/mock-drive/attempt/module-complete.tsx (continued)

                'bg-red-100 text-red-700'
            }`}
          >
            {isPassed ? 'Passed' : 'Not Passed'}
          </div>
        </div>

        {attemptCompleted && (
          <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Congratulations! You have completed all modules.
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {attemptCompleted ? (
          <Button onClick={onViewResults} className="w-full">
            <Trophy className="mr-2 h-4 w-4" />
            View Results
          </Button>
        ) : (
          <Button onClick={onContinue} className="w-full">
            Continue to Next Module
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
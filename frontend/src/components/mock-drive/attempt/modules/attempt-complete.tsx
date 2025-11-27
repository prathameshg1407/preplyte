// src/components/mock-drive/attempt/attempt-complete.tsx

'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Trophy, BarChart3, Medal, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface AttemptCompleteProps {
  driveId: string;
  driveTitle: string;
}

export const AttemptComplete: FC<AttemptCompleteProps> = ({ driveId, driveTitle }) => {
  const { width, height } = useWindowSize();

  return (
    <>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.1}
      />
      
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <div className="relative">
                <Trophy className="h-20 w-20 text-yellow-500" />
                <Medal className="h-8 w-8 text-yellow-600 absolute -bottom-1 -right-1" />
              </div>
            </div>
            <CardTitle className="text-2xl">Congratulations!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have successfully completed the mock drive:
            </p>
            <p className="text-lg font-semibold">{driveTitle}</p>
            <p className="text-sm text-muted-foreground">
              Your responses have been recorded. You can now view your detailed results
              and see how you performed across all modules.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Link href={`/mock-drive/${driveId}/result`} className="w-full">
              <Button className="w-full" size="lg">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Detailed Results
              </Button>
            </Link>
            <Link href={`/mock-drive/${driveId}/leaderboard`} className="w-full">
              <Button variant="outline" className="w-full">
                <Medal className="mr-2 h-4 w-4" />
                View Leaderboard
              </Button>
            </Link>
            <Link href="/mock-drive" className="w-full">
              <Button variant="ghost" className="w-full">
                Browse More Mock Drives
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
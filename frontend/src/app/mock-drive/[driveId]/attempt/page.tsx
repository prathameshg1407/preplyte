// src/app/mock-drive/[driveId]/attempt/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AttemptContainer } from '@/components/mock-drive/attempt/modules/attempt-container';
import { useAttemptState, useStartAttempt } from '@/lib/hooks/mock-drive/use-attempt';
import { useMockDriveDetail } from '@/lib/hooks/mock-drive/use-discovery';
import { useAttemptStore } from '@/lib/store/mock-drive/attempt-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MockDriveAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const driveId = params.driveId as string;

  const { data: drive, isLoading: driveLoading } = useMockDriveDetail(driveId);
  const { data: attemptData, isLoading: attemptLoading } = useAttemptState(driveId);
  const startAttemptMutation = useStartAttempt();
  const { setCurrentDriveId, reset } = useAttemptStore();

  // Set current drive ID in store
  useEffect(() => {
    setCurrentDriveId(driveId);
    return () => {
      // Don't reset on unmount during active attempt
    };
  }, [driveId, setCurrentDriveId]);

  // Handle starting attempt
  const handleStartAttempt = () => {
    startAttemptMutation.mutate(driveId);
  };

  if (driveLoading || attemptLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Mock drive not found</p>
      </div>
    );
  }

  // Check if user can attempt
  if (!drive.isRegistered || drive.registrationStatus !== 'APPROVED') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You need to be registered and approved to attempt this mock drive.
            </p>
            <Button onClick={() => router.push(`/mock-drive/${driveId}`)}>
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No existing attempt - show start screen
  if (!attemptData?.attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{drive.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Before you begin:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Ensure you have a stable internet connection</li>
                <li>The test will consist of {drive.modules.length} modules</li>
                <li>Total duration: {drive.totalTimeLimit} minutes</li>
                <li>Once started, you cannot pause the test</li>
                <li>Each module will auto-submit when time runs out</li>
              </ul>
            </div>

            {drive.batchInfo && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Your Batch:</strong> {drive.batchInfo.name}
                </p>
              </div>
            )}

            <Button
              onClick={handleStartAttempt}
              disabled={startAttemptMutation.isPending}
              className="w-full"
              size="lg"
            >
              {startAttemptMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Mock Drive'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Existing attempt - show attempt container
  return <AttemptContainer driveId={driveId} driveTitle={drive.title} />;
}
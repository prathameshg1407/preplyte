// src/app/practice/mockdrive/[id]/attempt/[attemptId]/module/[moduleId]/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../../../../../../../components/ui/button';

type SupportedModuleType = 'APTITUDE' | 'MACHINE_CODING' | 'AI_INTERVIEW';

function getModuleTargetPath(
  moduleType: SupportedModuleType,
  sessionId: string,
  mockDriveId: string,
  attemptId: string,
  moduleId: string,
  moduleAttemptId?: string
) {
  const queryParams = new URLSearchParams();
  if (moduleAttemptId) {
    queryParams.append('moduleAttemptId', moduleAttemptId);
  }
  const qs = queryParams.toString();
  const qsStr = qs ? `?${qs}` : '';

  switch (moduleType) {
    case 'APTITUDE':
      return `/practice/mockdrive/${mockDriveId}/attempt/${attemptId}/module/${moduleId}/aptitude/${sessionId}${qsStr}`;
    case 'MACHINE_CODING':
      return `/practice/mockdrive/${mockDriveId}/attempt/${attemptId}/module/${moduleId}/machine/${sessionId}${qsStr}`;
    case 'AI_INTERVIEW':
      return `/practice/mockdrive/${mockDriveId}/attempt/${attemptId}/module/${moduleId}/interview/${sessionId}${qsStr}`;
    default:
      return null;
  }
}

export default function IndividualMockDriveModuleRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const mockDriveId = params.id as string;
  const attemptId = params.attemptId as string;
  const sessionId = searchParams.get('sessionId');
  const moduleType = searchParams.get('moduleType') as SupportedModuleType | null;
  const moduleAttemptId = searchParams.get('moduleAttemptId');

  useEffect(() => {
    if (!sessionId || !moduleType) return;

    const moduleId = params.moduleId as string;
    const targetPath = getModuleTargetPath(moduleType, sessionId, mockDriveId, attemptId, moduleId, moduleAttemptId || undefined);
    if (!targetPath) return;

    router.replace(targetPath);
  }, [attemptId, mockDriveId, moduleType, params.moduleId, router, sessionId, moduleAttemptId]);

  if (!sessionId || !moduleType) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Could not start this module because session details are missing.
        </p>
        <Button onClick={() => router.push(`/practice/mockdrive/${mockDriveId}/attempt?attemptId=${attemptId}`)}>
          Back to Attempt
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Preparing your module...</p>
    </div>
  );
}

// src/components/mock-drive/attempt/attempt-container.tsx

'use client';

import { FC, useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AttemptHeader } from './attempt-header';
import { ModuleProgress } from './module-progress';
import { ModuleInstructions } from './module-instructions';
import { ModuleComplete } from './module-complete';
import { AttemptComplete } from './attempt-complete';
import { AutoSubmitWarning } from './auto-submit-warning';
import { AptitudeModule } from './modules/aptitude-module';
import { MachineModule } from './modules/machine-module';
import { InterviewModule } from './modules/interview-module';
import { useModuleTimer } from '@/lib/hooks/mock-drive/use-module-timer';
import {
  useAttemptState,
  useStartModule,
  useSubmitModule,
} from '@/lib/hooks/mock-drive/use-attempt';
import { useAttemptStore } from '@/lib/store/mock-drive/attempt-store';
import {
  CurrentModuleState,
  ModuleAttemptState,
  SubmitModuleResponse,
} from '@/types/mockdrive.types';

interface AttemptContainerProps {
  driveId: string;
  driveTitle: string;
}

export const AttemptContainer: FC<AttemptContainerProps> = ({ driveId, driveTitle }) => {
  const router = useRouter();
  const [moduleResult, setModuleResult] = useState<SubmitModuleResponse | null>(null);
  const [attemptCompleted, setAttemptCompleted] = useState(false);

  const { data: attemptData, isLoading, refetch } = useAttemptState(driveId);
  const startModuleMutation = useStartModule();
  const submitModuleMutation = useSubmitModule();

  const {
    setAttemptState,
    setCurrentModule,
    currentModule,
    showTimeWarning,
  } = useAttemptStore();

  // Sync attempt data with store
  useEffect(() => {
    if (attemptData) {
      setAttemptState(attemptData.attempt);
      if (!moduleResult) {
        setCurrentModule(attemptData.currentModule);
      }
    }
  }, [attemptData, moduleResult, setAttemptState, setCurrentModule]);

  // Timer for current module
  const handleTimeExpire = useCallback(() => {
    if (currentModule?.moduleId) {
      submitModuleMutation.mutate(
        { driveId, moduleId: currentModule.moduleId },
        {
          onSuccess: (result) => {
            setModuleResult(result);
            if (result.attemptCompleted) {
              setAttemptCompleted(true);
            }
          },
        }
      );
    }
  }, [currentModule, driveId, submitModuleMutation]);

  const { remainingFormatted, isWarning, progress } = useModuleTimer({
    expiresAt: currentModule?.expiresAt || null,
    onExpire: handleTimeExpire,
  });

  // Handle starting a module
  const handleStartModule = () => {
    if (currentModule?.moduleId) {
      startModuleMutation.mutate(
        { driveId, moduleId: currentModule.moduleId },
        {
          onSuccess: (data) => {
            setCurrentModule({
              ...currentModule,
              status: 'IN_PROGRESS',
              startedAt: data.startedAt,
              expiresAt: data.expiresAt,
              timeRemainingSeconds: data.timeRemainingSeconds,
              data: data.data,
            });
            setModuleResult(null);
          },
        }
      );
    }
  };

  // Handle submitting a module
  const handleSubmitModule = () => {
    if (currentModule?.moduleId) {
      submitModuleMutation.mutate(
        { driveId, moduleId: currentModule.moduleId },
        {
          onSuccess: (result) => {
            setModuleResult(result);
            if (result.attemptCompleted) {
              setAttemptCompleted(true);
            }
          },
        }
      );
    }
  };

  // Handle continue to next module
  const handleContinue = async () => {
    setModuleResult(null);
    await refetch();
  };

  // Handle view results
  const handleViewResults = () => {
    router.push(`/mock-drive/${driveId}/result`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!attemptData?.attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Attempt not found</p>
      </div>
    );
  }

  const { attempt } = attemptData;

  // Show completion screen
  if (attemptCompleted || attempt.status === 'COMPLETED') {
    return <AttemptComplete driveId={driveId} driveTitle={driveTitle} />;
  }

  // Show module result if just completed
  if (moduleResult) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <ModuleComplete
          result={moduleResult}
          onContinue={handleContinue}
          onViewResults={handleViewResults}
        />
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No module available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <AttemptHeader
        driveTitle={driveTitle}
        currentModuleName={currentModule.name}
        currentModuleOrder={currentModule.order}
        totalModules={attempt.modules.length}
        remainingTime={remainingFormatted}
        isWarning={isWarning}
        progress={progress}
      />

      {/* Module Progress */}
      <div className="container mx-auto px-4">
        <ModuleProgress
          modules={attempt.modules}
          currentModuleId={currentModule.moduleId}
        />
      </div>

      {/* Module Content */}
      <div className="container mx-auto px-4 pb-8">
        {currentModule.status === 'AVAILABLE' && (
          <ModuleInstructions
            moduleName={currentModule.name}
            moduleType={currentModule.moduleType}
            timeLimit={currentModule.timeLimit}
            instructions={currentModule.instructions}
            config={currentModule.config}
            onStart={handleStartModule}
            isStarting={startModuleMutation.isPending}
          />
        )}

        {currentModule.status === 'IN_PROGRESS' && (
          <>
            {currentModule.moduleType === 'APTITUDE' && (
              <AptitudeModule
                driveId={driveId}
                moduleId={currentModule.moduleId}
                config={currentModule.config}
                data={currentModule.data}
                onSubmit={handleSubmitModule}
                isSubmitting={submitModuleMutation.isPending}
              />
            )}

            {currentModule.moduleType === 'MACHINE_CODING' && (
              <MachineModule
                driveId={driveId}
                moduleId={currentModule.moduleId}
                config={currentModule.config}
                data={currentModule.data}
                onSubmit={handleSubmitModule}
                isSubmitting={submitModuleMutation.isPending}
              />
            )}

            {currentModule.moduleType === 'AI_INTERVIEW' && (
              <InterviewModule
                driveId={driveId}
                moduleId={currentModule.moduleId}
                config={currentModule.config}
                data={currentModule.data}
                onSubmit={handleSubmitModule}
                isSubmitting={submitModuleMutation.isPending}
              />
            )}
          </>
        )}
      </div>

      {/* Time Warning Dialog */}
      {showTimeWarning && <AutoSubmitWarning remainingTime={remainingFormatted} />}
    </div>
  );
};
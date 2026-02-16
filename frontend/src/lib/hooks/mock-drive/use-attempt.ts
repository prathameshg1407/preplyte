// src/lib/hooks/mock-drive/use-attempt.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { attemptService } from '@/lib/api/services/mock-drive/attempt.service';
import { toast } from 'sonner';
import {
  AptitudeAnswerPayload,
  AptitudeClearPayload,
  AptitudeMarkReviewPayload,
  MachineSubmitPayload,
  MachineRunPayload,
  InterviewRespondPayload,
  InterviewSkipPayload,
  GetAttemptResponse,
  StartAttemptResponse,
  StartModuleResponse,
  SubmitModuleResponse,
  ModuleActionResponse,
  ModuleStateResponse,
} from '@/types/mockdrive.types';

// =====================================================
// Query Keys
// =====================================================

export const attemptKeys = {
  all: ['attempt'] as const,
  state: (driveId: string) => [...attemptKeys.all, 'state', driveId] as const,
  moduleState: (driveId: string, moduleId: string) =>
    [...attemptKeys.all, 'module', driveId, moduleId] as const,
};

// =====================================================
// Query Hooks
// =====================================================

export function useAttemptState(driveId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: attemptKeys.state(driveId),
    queryFn: () => attemptService.getAttemptState(driveId),
    enabled: options?.enabled !== false && !!driveId,
    refetchInterval: 30000, // Refetch every 30 seconds for time sync
  });
}

export function useModuleState(
  driveId: string,
  moduleId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: attemptKeys.moduleState(driveId, moduleId),
    queryFn: () => attemptService.getModuleState(driveId, moduleId),
    enabled: options?.enabled !== false && !!driveId && !!moduleId,
  });
}

// =====================================================
// Attempt Lifecycle Mutations
// =====================================================

export function useStartAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (driveId: string) => attemptService.startAttempt(driveId),
    onSuccess: (data: StartAttemptResponse, driveId) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
      toast.success('Mock drive started!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to start mock drive';
      toast.error(message);
    },
  });
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (driveId: string) => attemptService.submitAttempt(driveId),
    onSuccess: (data: any, driveId) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
      toast.success('Mock drive submitted successfully!');
      router.push(`/mock-drive/${driveId}/result`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit mock drive';
      toast.error(message);
    },
  });
}

export function useStartModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driveId, moduleId }: { driveId: string; moduleId: string }) =>
      attemptService.startModule(driveId, moduleId),
    onSuccess: (data: StartModuleResponse, { driveId, moduleId }) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
      queryClient.invalidateQueries({ queryKey: attemptKeys.moduleState(driveId, moduleId) });
      toast.success('Module started!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to start module';
      toast.error(message);
    },
  });
}

export function useSubmitModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driveId, moduleId }: { driveId: string; moduleId: string }) =>
      attemptService.submitModule(driveId, moduleId),
    onSuccess: (data: SubmitModuleResponse, { driveId }) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });

      if (data.attemptCompleted) {
        toast.success('Mock drive completed! View your results.');
      } else if (data.nextModule) {
        toast.success(`Module submitted! Score: ${data.percentage.toFixed(1)}%`);
      } else {
        toast.success('Module submitted successfully!');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit module';
      toast.error(message);
    },
  });
}

// =====================================================
// Aptitude Module Hooks
// =====================================================

export function useAptitudeAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driveId,
      moduleId,
      payload,
    }: {
      driveId: string;
      moduleId: string;
      payload: AptitudeAnswerPayload;
    }) => attemptService.submitAptitudeAnswer(driveId, moduleId, payload),
    onSuccess: (data: ModuleActionResponse, { driveId }) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit answer';
      toast.error(message);
    },
  });
}

export function useClearAptitudeAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driveId,
      moduleId,
      payload,
    }: {
      driveId: string;
      moduleId: string;
      payload: AptitudeClearPayload;
    }) => attemptService.clearAptitudeAnswer(driveId, moduleId, payload),
    onSuccess: (data: ModuleActionResponse, { driveId }) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to clear answer';
      toast.error(message);
    },
  });
}

export function useMarkAptitudeForReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driveId,
      moduleId,
      payload,
    }: {
      driveId: string;
      moduleId: string;
      payload: AptitudeMarkReviewPayload;
    }) => attemptService.markAptitudeForReview(driveId, moduleId, payload),
    onSuccess: (data: ModuleActionResponse, { driveId }) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update review status';
      toast.error(message);
    },
  });
}

// =====================================================
// Machine Coding Module Hooks
// =====================================================

export function useMachineRun() {
  return useMutation({
    mutationFn: ({
      driveId,
      moduleId,
      payload,
    }: {
      driveId: string;
      moduleId: string;
      payload: MachineRunPayload;
    }) => attemptService.runMachineCode(driveId, moduleId, payload),
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to run code';
      toast.error(message);
    },
  });
}

export function useMachineSubmit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driveId,
      moduleId,
      payload,
    }: {
      driveId: string;
      moduleId: string;
      payload: MachineSubmitPayload;
    }) => attemptService.submitMachineCode(driveId, moduleId, payload),
    onSuccess: (data: ModuleActionResponse, { driveId }) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
      toast.success('Code submitted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit code';
      toast.error(message);
    },
  });
}

// =====================================================
// AI Interview Module Hooks
// =====================================================

export function useInterviewRespond() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driveId,
      moduleId,
      payload,
    }: {
      driveId: string;
      moduleId: string;
      payload: InterviewRespondPayload;
    }) => attemptService.submitInterviewResponse(driveId, moduleId, payload),
    onSuccess: (data: ModuleActionResponse, { driveId }) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit response';
      toast.error(message);
    },
  });
}

export function useInterviewSkip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      driveId,
      moduleId,
      payload,
    }: {
      driveId: string;
      moduleId: string;
      payload?: InterviewSkipPayload;
    }) => attemptService.skipInterviewQuestion(driveId, moduleId, payload),
    onSuccess: (data: ModuleActionResponse, { driveId }) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
      toast.info('Question skipped');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to skip question';
      toast.error(message);
    },
  });
}

export function useInterviewNextQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driveId, moduleId }: { driveId: string; moduleId: string }) =>
      attemptService.getNextInterviewQuestion(driveId, moduleId),
    onSuccess: (data: ModuleActionResponse, { driveId }) => {
      queryClient.invalidateQueries({ queryKey: attemptKeys.state(driveId) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to get next question';
      toast.error(message);
    },
  });
}

export function useInterviewVoiceMode() {
  return useMutation({
    mutationFn: ({ driveId, moduleId }: { driveId: string; moduleId: string }) =>
      attemptService.startInterviewVoiceMode(driveId, moduleId),
    onSuccess: () => {
      toast.success('Voice mode enabled');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to enable voice mode';
      toast.error(message);
    },
  });
}

export function useInterviewAudioQuestion() {
  return useMutation({
    mutationFn: ({ driveId, moduleId }: { driveId: string; moduleId: string }) =>
      attemptService.getInterviewAudioQuestion(driveId, moduleId),
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to get audio question';
      toast.error(message);
    },
  });
}
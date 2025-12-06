// src/lib/hooks/use-interview.ts

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { interviewService, InterviewServiceError } from '@/lib/api/services/interview.service';
import { useInterviewStore } from '@/lib/store/interview-store';
import { useToast } from '@/components/ui/use-toast';
import type {
  CreateSessionInput,
  InterviewSessionStatus,
} from '@/types/interview.types';

// =====================================================
// QUERY KEYS
// =====================================================

export const interviewKeys = {
  all: ['interview'] as const,
  sessions: () => [...interviewKeys.all, 'sessions'] as const,
  sessionsList: (filters?: { status?: InterviewSessionStatus }) =>
    [...interviewKeys.sessions(), 'list', filters] as const,
  session: (id: string) => [...interviewKeys.all, 'session', id] as const,
  sessionDetail: (id: string) => [...interviewKeys.session(id), 'detail'] as const,
  feedback: (id: string) => [...interviewKeys.all, 'feedback', id] as const,
};

// =====================================================
// ERROR HANDLER
// =====================================================

function getErrorMessage(error: unknown): string {
  if (error instanceof InterviewServiceError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// =====================================================
// SESSION LIST HOOKS
// =====================================================

export function useInterviewSessions(
  options: {
    pageSize?: number;
    status?: InterviewSessionStatus;
    enabled?: boolean;
  } = {}
) {
  const { pageSize = 10, status, enabled = true } = options;
  const { setSessionHistory, setHistoryLoading } = useInterviewStore();

  const query = useInfiniteQuery({
    queryKey: interviewKeys.sessionsList({ status }),
    queryFn: async ({ pageParam = 1 }) => {
      setHistoryLoading(true);
      try {
        return await interviewService.listSessions({
          page: pageParam,
          pageSize,
          status,
        });
      } finally {
        setHistoryLoading(false);
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      const allSessions = query.data.pages.flatMap((page) => page.sessions);
      const hasMore = query.data.pages[query.data.pages.length - 1]?.hasMore ?? false;
      setSessionHistory(allSessions, hasMore);
    }
  }, [query.data, setSessionHistory]);

  return {
    sessions: query.data?.pages.flatMap((page) => page.sessions) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    refetch: query.refetch,
  };
}

// =====================================================
// SESSION DETAIL HOOKS
// =====================================================

export function useInterviewSession(sessionId: string | undefined) {
  const { setCurrentSession } = useInterviewStore();

  return useQuery({
    queryKey: interviewKeys.session(sessionId!),
    queryFn: async () => {
      const session = await interviewService.getSession(sessionId!);
      setCurrentSession(session);
      return session;
    },
    enabled: !!sessionId,
    staleTime: 10000,
    retry: 2,
  });
}

export function useInterviewSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: interviewKeys.sessionDetail(sessionId!),
    queryFn: () => interviewService.getSessionDetail(sessionId!),
    enabled: !!sessionId,
    staleTime: 10000,
    retry: 2,
  });
}

// =====================================================
// SESSION MUTATION HOOKS
// =====================================================

export function useCreateSession() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setCurrentSession } = useInterviewStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateSessionInput) => interviewService.createSession(input),
    onSuccess: (session) => {
      setCurrentSession(session);
      queryClient.invalidateQueries({ queryKey: interviewKeys.sessions() });
      toast({
        title: 'Session Created',
        description: 'Your interview session is ready to start.',
      });
      router.push(`/practice/ai-interview/${session.id}`);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error Creating Session',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  const { setCurrentSession, addMessage, setProgress } = useInterviewStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => interviewService.startSession(sessionId),
    onSuccess: (data, sessionId) => {
      setCurrentSession(data.session);
      setProgress(data.session.progress);

      // Add opening message from AI
      addMessage({
        id: `ai-opening-${Date.now()}`,
        role: 'assistant',
        content: data.openingMessage,
        timestamp: new Date(),
        category: 'INTRODUCTORY',
      });

      queryClient.invalidateQueries({ queryKey: interviewKeys.session(sessionId) });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error Starting Session',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useCancelSession() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { reset } = useInterviewStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => interviewService.cancelSession(sessionId),
    onSuccess: (_, sessionId) => {
      reset();
      queryClient.invalidateQueries({ queryKey: interviewKeys.sessions() });
      queryClient.removeQueries({ queryKey: interviewKeys.session(sessionId) });
      toast({
        title: 'Session Cancelled',
        description: 'Your interview session has been cancelled.',
      });
      router.push('/practice/ai-interview');
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error Cancelling Session',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useEndSession() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setFeedback, updateSessionStatus } = useInterviewStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => interviewService.endSession(sessionId),
    onSuccess: (data, sessionId) => {
      setFeedback(data.feedback);
      updateSessionStatus('COMPLETED');
      queryClient.invalidateQueries({ queryKey: interviewKeys.sessions() });
      queryClient.setQueryData(interviewKeys.feedback(sessionId), data.feedback);
      toast({
        title: 'Interview Complete',
        description: 'Your feedback is ready to view.',
      });
      router.push(`/practice/ai-interview/results/${sessionId}`);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error Ending Session',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

// =====================================================
// FEEDBACK HOOKS
// =====================================================

export function useInterviewFeedback(sessionId: string | undefined) {
  const { setFeedback, setFeedbackLoading } = useInterviewStore();

  return useQuery({
    queryKey: interviewKeys.feedback(sessionId!),
    queryFn: async () => {
      setFeedbackLoading(true);
      try {
        const feedback = await interviewService.getFeedback(sessionId!);
        setFeedback(feedback);
        return feedback;
      } finally {
        setFeedbackLoading(false);
      }
    },
    enabled: !!sessionId,
    staleTime: 60000,
    retry: 2,
  });
}

export function useRegenerateFeedback() {
  const queryClient = useQueryClient();
  const { setFeedback, setFeedbackLoading } = useInterviewStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      setFeedbackLoading(true);
      try {
        return await interviewService.regenerateFeedback(sessionId);
      } finally {
        setFeedbackLoading(false);
      }
    },
    onSuccess: (feedback, sessionId) => {
      setFeedback(feedback);
      queryClient.setQueryData(interviewKeys.feedback(sessionId), feedback);
      toast({
        title: 'Feedback Regenerated',
        description: 'Your feedback has been updated with new insights.',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error Regenerating Feedback',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

// =====================================================
// COMBINED INTERVIEW HOOK
// =====================================================

export function useInterview(sessionId: string) {
  const store = useInterviewStore();
  const session = useInterviewSession(sessionId);
  const feedback = useInterviewFeedback(
    store.currentSession?.status === 'COMPLETED' ? sessionId : undefined
  );
  const startSession = useStartSession();
  const cancelSession = useCancelSession();
  const endSession = useEndSession();

  return {
    // Data
    session: store.currentSession,
    isLoading: session.isLoading,
    isError: session.isError,
    error: session.error,
    messages: store.messages,
    currentQuestion: store.currentQuestion,
    progress: store.progress,
    feedback: store.feedback,
    feedbackLoading: store.feedbackLoading,
    ui: store.ui,
    
    // Actions
    startSession: () => startSession.mutate(sessionId),
    cancelSession: () => cancelSession.mutate(sessionId),
    endSession: () => endSession.mutate(sessionId),
    
    // Loading states
    isStarting: startSession.isPending,
    isCancelling: cancelSession.isPending,
    isEnding: endSession.isPending,
    
    // Store actions
    addMessage: store.addMessage,
    setError: store.setError,
    reset: store.reset,
  };
}
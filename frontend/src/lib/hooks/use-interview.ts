// src/lib/hooks/use-interview.ts

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { interviewService } from '@/lib/api/services/interview.service';
import { useInterviewStore } from '@/lib/store/interview-store';
import { useToast } from '@/components/ui/use-toast';
import type {
  CreateSessionInput,
  InterviewSession,
  InterviewFeedback,
} from '@/types/interview.types';

// =====================================================
// QUERY KEYS
// =====================================================

export const interviewKeys = {
  all: ['interview'] as const,
  sessions: () => [...interviewKeys.all, 'sessions'] as const,
  session: (id: string) => [...interviewKeys.all, 'session', id] as const,
  sessionDetail: (id: string) => [...interviewKeys.all, 'session', id, 'detail'] as const,
  feedback: (id: string) => [...interviewKeys.all, 'feedback', id] as const,
};

// =====================================================
// SESSION HOOKS
// =====================================================

/**
 * Hook for fetching paginated interview sessions with infinite scroll support
 */
export function useInterviewSessions(pageSize = 10) {
  const { setSessionHistory, appendSessionHistory, setHistoryLoading } = useInterviewStore();

  const query = useInfiniteQuery({
    queryKey: interviewKeys.sessions(),
    queryFn: async ({ pageParam = 1 }) => {
      setHistoryLoading(true);
      try {
        const data = await interviewService.listSessions({ 
          page: pageParam, 
          pageSize 
        });
        return data;
      } finally {
        setHistoryLoading(false);
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 30000,
  });

  // Sync all pages to store whenever data changes
  const syncToStore = useCallback(() => {
    if (query.data) {
      const allSessions = query.data.pages.flatMap((page) => page.sessions);
      const hasMore = query.data.pages[query.data.pages.length - 1]?.hasMore ?? false;
      setSessionHistory(allSessions, hasMore);
    }
  }, [query.data, setSessionHistory]);

  // Sync on data change
  if (query.data) {
    syncToStore();
  }

  return {
    data: query.data,
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

/**
 * Alternative: Simple pagination hook (non-infinite)
 */
export function useInterviewSessionsPaginated(page = 1, pageSize = 10) {
  const store = useInterviewStore();
  const { setSessionHistory, appendSessionHistory, setHistoryLoading } = store;

  const query = useQuery({
    queryKey: [...interviewKeys.sessions(), page],
    queryFn: async () => {
      setHistoryLoading(true);
      try {
        const data = await interviewService.listSessions({ page, pageSize });
        if (page === 1) {
          setSessionHistory(data.sessions, data.hasMore);
        } else {
          appendSessionHistory(data.sessions, data.hasMore);
        }
        return data;
      } finally {
        setHistoryLoading(false);
      }
    },
    staleTime: 30000,
  });

  return query;
}

export function useInterviewSession(sessionId: string) {
  const { setCurrentSession } = useInterviewStore();

  return useQuery({
    queryKey: interviewKeys.session(sessionId),
    queryFn: async () => {
      const session = await interviewService.getSession(sessionId);
      setCurrentSession(session);
      return session;
    },
    enabled: !!sessionId,
  });
}

export function useInterviewSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: interviewKeys.sessionDetail(sessionId),
    queryFn: () => interviewService.getSessionDetail(sessionId),
    enabled: !!sessionId,
  });
}

// =====================================================
// MUTATION HOOKS
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
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create session',
        variant: 'destructive',
      });
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  const { setCurrentSession, addMessage } = useInterviewStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => interviewService.startSession(sessionId),
    onSuccess: (data, sessionId) => {
      setCurrentSession(data.session);
      
      // Add opening message to conversation
      addMessage({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.openingMessage,
        timestamp: new Date(),
        category: 'INTRODUCTORY',
      });

      queryClient.invalidateQueries({ queryKey: interviewKeys.session(sessionId) });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start session',
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
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: interviewKeys.sessions() });
      toast({
        title: 'Session Cancelled',
        description: 'Your interview session has been cancelled.',
      });
      router.push('/practice/ai-interview');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel session',
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
      toast({
        title: 'Interview Complete',
        description: 'Your feedback is ready.',
      });
      router.push(`/practice/ai-interview/results/${sessionId}`);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to end session',
        variant: 'destructive',
      });
    },
  });
}

// =====================================================
// FEEDBACK HOOKS
// =====================================================

export function useInterviewFeedback(sessionId: string) {
  const { setFeedback, setFeedbackLoading } = useInterviewStore();

  return useQuery({
    queryKey: interviewKeys.feedback(sessionId),
    queryFn: async () => {
      setFeedbackLoading(true);
      try {
        const feedback = await interviewService.getFeedback(sessionId);
        setFeedback(feedback);
        return feedback;
      } finally {
        setFeedbackLoading(false);
      }
    },
    enabled: !!sessionId,
  });
}

export function useRegenerateFeedback() {
  const queryClient = useQueryClient();
  const { setFeedback } = useInterviewStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => interviewService.regenerateFeedback(sessionId),
    onSuccess: (feedback, sessionId) => {
      setFeedback(feedback);
      queryClient.invalidateQueries({ queryKey: interviewKeys.feedback(sessionId) });
      toast({
        title: 'Feedback Regenerated',
        description: 'Your feedback has been updated.',
      });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to regenerate feedback',
        variant: 'destructive',
      });
    },
  });
}
// src/lib/hooks/lms/use-lms.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lmsService } from '@/lib/api/services/lms.service';
import type {
  GetCoursesParams,
  UpdateTopicProgressRequest,
  SubmitTestRequest,
} from '@/types/lms.types';
import { useToast } from '@/components/ui/use-toast';

// Query Keys
export const lmsQueryKeys = {
  all: ['lms'] as const,
  categories: () => [...lmsQueryKeys.all, 'categories'] as const,
  stats: () => [...lmsQueryKeys.all, 'stats'] as const,
  courses: (params: GetCoursesParams) => [...lmsQueryKeys.all, 'courses', params] as const,
  course: (slug: string) => [...lmsQueryKeys.all, 'course', slug] as const,
  module: (courseSlug: string, moduleOrder: number) =>
    [...lmsQueryKeys.all, 'module', courseSlug, moduleOrder] as const,
  topic: (courseSlug: string, moduleOrder: number, topicOrder: number) =>
    [...lmsQueryKeys.all, 'topic', courseSlug, moduleOrder, topicOrder] as const,
  myCourses: () => [...lmsQueryKeys.all, 'my-courses'] as const,
  myDashboard: () => [...lmsQueryKeys.all, 'my-dashboard'] as const,
  comments: (slug: string, params?: any) => [...lmsQueryKeys.all, 'comments', slug, params] as const,
};

// Categories Hook
export function useCategories() {
  return useQuery({
    queryKey: lmsQueryKeys.categories(),
    queryFn: lmsService.getCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Stats Hook
export function useLmsStats() {
  return useQuery({
    queryKey: lmsQueryKeys.stats(),
    queryFn: lmsService.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Courses Hook
export function useCourses(params: GetCoursesParams) {
  return useQuery({
    queryKey: lmsQueryKeys.courses(params),
    queryFn: () => lmsService.getCourses(params),
    staleTime: 1000 * 60 * 5,
  });
}

// Course Details Hook
export function useCourseDetails(slug: string) {
  return useQuery({
    queryKey: lmsQueryKeys.course(slug),
    queryFn: () => lmsService.getCourseBySlug(slug),
    enabled: !!slug,
  });
}

// Module Details Hook
export function useModuleDetails(courseSlug: string, moduleOrder: number) {
  return useQuery({
    queryKey: lmsQueryKeys.module(courseSlug, moduleOrder),
    queryFn: () => lmsService.getModuleDetails(courseSlug, moduleOrder),
    enabled: !!courseSlug && moduleOrder > 0,
  });
}

// Topic Details Hook
export function useTopicDetails(
  courseSlug: string,
  moduleOrder: number,
  topicOrder: number
) {
  return useQuery({
    queryKey: lmsQueryKeys.topic(courseSlug, moduleOrder, topicOrder),
    queryFn: () => lmsService.getTopicDetails(courseSlug, moduleOrder, topicOrder),
    enabled: !!courseSlug && moduleOrder > 0 && topicOrder > 0,
  });
}

// My Courses Hook
export function useMyCourses() {
  return useQuery({
    queryKey: lmsQueryKeys.myCourses(),
    queryFn: lmsService.getMyCourses,
  });
}

// My Dashboard Hook
export function useMyDashboard() {
  return useQuery({
    queryKey: lmsQueryKeys.myDashboard(),
    queryFn: lmsService.getMyDashboard,
  });
}

// Enroll Course Mutation
export function useEnrollCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (slug: string) => lmsService.enrollCourse(slug),
    onSuccess: (data, slug) => {
      queryClient.invalidateQueries({ queryKey: lmsQueryKeys.course(slug) });
      queryClient.invalidateQueries({ queryKey: lmsQueryKeys.myCourses() });
      toast({
        title: 'Enrolled Successfully!',
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Enrollment Failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Update Topic Progress Mutation
export function useUpdateTopicProgress(
  courseSlug: string,
  moduleOrder: number,
  topicOrder: number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTopicProgressRequest) =>
      lmsService.updateTopicProgress(courseSlug, moduleOrder, topicOrder, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lmsQueryKeys.topic(courseSlug, moduleOrder, topicOrder),
      });
      queryClient.invalidateQueries({
        queryKey: lmsQueryKeys.module(courseSlug, moduleOrder),
      });
      queryClient.invalidateQueries({
        queryKey: lmsQueryKeys.course(courseSlug),
      });
    },
  });
}

// Start Module Test Mutation
export function useStartModuleTest(courseSlug: string, moduleOrder: number) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => lmsService.startModuleTest(courseSlug, moduleOrder),
    onError: (error: any) => {
      toast({
        title: 'Failed to Start Test',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Submit Module Test Mutation
export function useSubmitModuleTest(courseSlug: string, moduleOrder: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SubmitTestRequest) =>
      lmsService.submitModuleTest(courseSlug, moduleOrder, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: lmsQueryKeys.module(courseSlug, moduleOrder),
      });
      queryClient.invalidateQueries({
        queryKey: lmsQueryKeys.course(courseSlug),
      });
      toast({
        title: data.passed ? 'Test Passed!' : 'Test Completed',
        description: `You scored ${data.attempt.score}% and earned ${data.pointsEarned} points`,
        variant: data.passed ? 'default' : 'destructive',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Start Final Test Mutation
export function useStartFinalTest(courseSlug: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => lmsService.startFinalTest(courseSlug),
    onError: (error: any) => {
      toast({
        title: 'Failed to Start Final Test',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Submit Final Test Mutation
export function useSubmitFinalTest(courseSlug: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SubmitTestRequest) =>
      lmsService.submitFinalTest(courseSlug, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: lmsQueryKeys.course(courseSlug),
      });
      queryClient.invalidateQueries({
        queryKey: lmsQueryKeys.myCourses(),
      });
      toast({
        title: data.passed ? 'Congratulations!' : 'Test Completed',
        description: data.passed
          ? `You passed with ${data.attempt.score}%! Certificate unlocked.`
          : `You scored ${data.attempt.score}%. Keep learning!`,
        variant: data.passed ? 'default' : 'destructive',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

// Comments Hooks
export function useCourseComments(slug: string, params?: any) {
  return useQuery({
    queryKey: lmsQueryKeys.comments(slug, params),
    queryFn: () => lmsService.getComments(slug, params),
    enabled: !!slug,
  });
}

export function useAddComment(courseSlug: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { comment: string; parentId?: string }) =>
      lmsService.addComment(courseSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'comments', courseSlug] });
      toast({
        title: 'Comment added',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add comment',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}

export function useToggleCommentLike(courseSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => lmsService.toggleCommentLike(courseSlug, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'comments', courseSlug] });
    },
  });
}

export function useDeleteComment(courseSlug: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (commentId: string) => lmsService.deleteComment(courseSlug, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms', 'comments', courseSlug] });
      toast({ title: 'Comment deleted' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete comment',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
}
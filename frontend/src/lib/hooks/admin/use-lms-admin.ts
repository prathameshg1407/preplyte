// LMS Admin Hooks
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    lmsCategoryAdminService,
    lmsCourseAdminService,
    lmsModuleAdminService,
    lmsTopicAdminService,
    lmsModuleTestAdminService,
    lmsFinalTestAdminService,
    lmsTestQuestionAdminService,
    lmsAnalyticsAdminService,
} from '@/lib/api/services/lms-admin.service';
import type {
    CourseFilters,
    CategoryFilters,
    CreateCourseDto,
    UpdateCourseDto,
    CreateCategoryDto,
    UpdateCategoryDto,
    CreateModuleDto,
    UpdateModuleDto,
    CreateTopicDto,
    UpdateTopicDto,
    CreateModuleTestDto,
    UpdateModuleTestDto,
    CreateFinalTestDto,
    UpdateFinalTestDto,
    CreateTestQuestionDto,
    UpdateTestQuestionDto,
} from '@/types/lms-admin.types';

// ============================================
// Category Hooks
// ============================================

export function useLmsCategories(filters?: CategoryFilters) {
    return useQuery({
        queryKey: ['lms-admin', 'categories', filters],
        queryFn: () => lmsCategoryAdminService.getAll(filters),
    });
}

export function useLmsCategory(categoryId: string) {
    return useQuery({
        queryKey: ['lms-admin', 'categories', categoryId],
        queryFn: () => lmsCategoryAdminService.getById(categoryId),
        enabled: !!categoryId,
    });
}

export function useAddCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCategoryDto) => lmsCategoryAdminService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'categories'] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
            lmsCategoryAdminService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'categories'] });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lmsCategoryAdminService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'categories'] });
        },
    });
}

// ============================================
// Course Hooks
// ============================================

export function useLmsCourses(filters?: CourseFilters) {
    return useQuery({
        queryKey: ['lms-admin', 'courses', filters],
        queryFn: () => lmsCourseAdminService.getAll(filters),
    });
}

export function useLmsCourse(courseId: string) {
    return useQuery({
        queryKey: ['lms-admin', 'courses', courseId],
        queryFn: () => lmsCourseAdminService.getById(courseId),
        enabled: !!courseId,
    });
}

// Aliases for compatibility
export const useCourse = useLmsCourse;

export function useLmsCourseStats(courseId: string) {
    return useQuery({
        queryKey: ['lms-admin', 'courses', courseId, 'stats'],
        queryFn: () => lmsCourseAdminService.getStats(courseId),
        enabled: !!courseId,
    });
}

export function useAddCourse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCourseDto) => lmsCourseAdminService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'courses'] });
        },
    });
}

export function useUpdateCourse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCourseDto }) =>
            lmsCourseAdminService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'courses'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'courses', variables.id] });
        },
    });
}

export function useDeleteCourse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lmsCourseAdminService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'courses'] });
        },
    });
}

// ============================================
// Module Hooks
// ============================================

export function useLmsModules(courseId?: string) {
    return useQuery({
        queryKey: ['lms-admin', 'modules', { courseId }],
        queryFn: () => lmsModuleAdminService.getAll({ courseId }),
        enabled: !!courseId,
    });
}

export const useModulesByCourse = useLmsModules;

export function useLmsModule(moduleId: string) {
    return useQuery({
        queryKey: ['lms-admin', 'modules', moduleId],
        queryFn: () => lmsModuleAdminService.getById(moduleId),
        enabled: !!moduleId,
    });
}

export const useModule = useLmsModule;

export function useAddModule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateModuleDto) => lmsModuleAdminService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'modules'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'courses', variables.courseId] });
        },
    });
}

export function useUpdateModule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateModuleDto }) =>
            lmsModuleAdminService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'modules'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'modules', variables.id] });
        },
    });
}

export function useDeleteModule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lmsModuleAdminService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'modules'] });
        },
    });
}

// ============================================
// Topic Hooks
// ============================================

export function useLmsTopics(moduleId?: string) {
    return useQuery({
        queryKey: ['lms-admin', 'topics', { moduleId }],
        queryFn: () => lmsTopicAdminService.getAll({ moduleId }),
        enabled: !!moduleId,
    });
}

export const useTopicsByModule = useLmsTopics;

export function useLmsTopic(topicId: string) {
    return useQuery({
        queryKey: ['lms-admin', 'topics', topicId],
        queryFn: () => lmsTopicAdminService.getById(topicId),
        enabled: !!topicId,
    });
}

export const useTopic = useLmsTopic;

export function useAddTopic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTopicDto) => lmsTopicAdminService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'topics'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'modules', variables.moduleId] });
        },
    });
}

export function useUpdateTopic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTopicDto }) =>
            lmsTopicAdminService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'topics'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'topics', variables.id] });
        },
    });
}

export function useDeleteTopic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lmsTopicAdminService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'topics'] });
        },
    });
}

// ============================================
// Test Hooks
// ============================================

export function useModuleTestsByModule(moduleId: string) {
    return useQuery({
        queryKey: ['lms-admin', 'module-tests', { moduleId }],
        queryFn: () => lmsModuleTestAdminService.getByModule(moduleId),
        enabled: !!moduleId,
    });
}

export function useAddModuleTest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateModuleTestDto) => lmsModuleTestAdminService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'module-tests'] });
        },
    });
}

export function useUpdateModuleTest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateModuleTestDto }) =>
            lmsModuleTestAdminService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'module-tests'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'module-tests', variables.id] });
        },
    });
}

export function useFinalTestsByCourse(courseId: string) {
    return useQuery({
        queryKey: ['lms-admin', 'final-tests', { courseId }],
        queryFn: () => lmsFinalTestAdminService.getByCourse(courseId),
        enabled: !!courseId,
    });
}

export function useAddFinalTest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateFinalTestDto) => lmsFinalTestAdminService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'final-tests'] });
        },
    });
}

export function useUpdateFinalTest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateFinalTestDto }) =>
            lmsFinalTestAdminService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'final-tests'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'final-tests', variables.id] });
        },
    });
}

// ============================================
// Question Hooks
// ============================================

export function useAddTestQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTestQuestionDto) => lmsTestQuestionAdminService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'module-tests'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'final-tests'] });
        },
    });
}

export function useUpdateTestQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTestQuestionDto }) =>
            lmsTestQuestionAdminService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'module-tests'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'final-tests'] });
        },
    });
}

export function useDeleteTestQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => lmsTestQuestionAdminService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'module-tests'] });
            queryClient.invalidateQueries({ queryKey: ['lms-admin', 'final-tests'] });
        },
    });
}

// ============================================
// Analytics Hooks
// ============================================

export function useLmsAnalytics() {
    return useQuery({
        queryKey: ['lms-admin', 'analytics', 'overview'],
        queryFn: () => lmsAnalyticsAdminService.getOverview(),
    });
}

export function useTopCourses() {
    return useQuery({
        queryKey: ['lms-admin', 'analytics', 'top-courses'],
        queryFn: () => lmsAnalyticsAdminService.getTopCourses(),
    });
}
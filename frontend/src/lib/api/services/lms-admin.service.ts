// LMS Admin Service
import { apiClient } from '../axios-instance';
import {
    PaginatedResponse,
    LmsCourseAdmin,
    CourseFilters,
    CreateCourseDto,
    UpdateCourseDto,
    LmsAnalytics,
    CategoryFilters,
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
    ModuleFilters,
    TopicFilters,
} from '@/types/lms-admin.types';
import {
    LmsCategory,
    LmsModule,
    LmsTopic,
    LmsModuleTest,
    LmsFinalTest,
    LmsTestQuestion,
} from '@/types/lms.types';

// ============================================
// Category Admin Service
// ============================================

export const lmsCategoryAdminService = {
    async getAll(filters?: CategoryFilters): Promise<PaginatedResponse<LmsCategory>> {
        const response = await apiClient.get('/api/admin/lms/categories', { params: filters });
        return response.data;
    },

    async getById(id: string): Promise<LmsCategory> {
        const response = await apiClient.get(`/api/admin/lms/categories/${id}`);
        return response.data;
    },

    async create(data: CreateCategoryDto): Promise<LmsCategory> {
        const response = await apiClient.post('/api/admin/lms/categories', data);
        return response.data;
    },

    async update(id: string, data: UpdateCategoryDto): Promise<LmsCategory> {
        const response = await apiClient.patch(`/api/admin/lms/categories/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/admin/lms/categories/${id}`);
    },
};

// ============================================
// Course Admin Service
// ============================================

export const lmsCourseAdminService = {
    async getAll(filters?: CourseFilters): Promise<PaginatedResponse<LmsCourseAdmin>> {
        const response = await apiClient.get('/api/admin/lms/courses', { params: filters });
        return response.data;
    },

    async getById(id: string): Promise<LmsCourseAdmin> {
        const response = await apiClient.get(`/api/admin/lms/courses/${id}`);
        return response.data;
    },

    async create(data: CreateCourseDto): Promise<LmsCourseAdmin> {
        const response = await apiClient.post('/api/admin/lms/courses', data);
        return response.data;
    },

    async update(id: string, data: UpdateCourseDto): Promise<LmsCourseAdmin> {
        const response = await apiClient.patch(`/api/admin/lms/courses/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/admin/lms/courses/${id}`);
    },

    async getStats(id: string): Promise<any> {
        const response = await apiClient.get(`/api/admin/lms/courses/${id}/stats`);
        return response.data;
    },
};

// ============================================
// Module Admin Service
// ============================================

export const lmsModuleAdminService = {
    async getAll(filters?: ModuleFilters): Promise<LmsModule[]> {
        let url = '/api/admin/lms/modules';
        if (filters?.courseId) {
            url = `/api/admin/lms/courses/${filters.courseId}/modules`;
        }
        const response = await apiClient.get(url, { params: filters });
        return response.data.data || response.data;
    },

    async getById(id: string): Promise<LmsModule> {
        const response = await apiClient.get(`/api/admin/lms/modules/${id}`);
        return response.data.data || response.data;
    },

    async create(data: CreateModuleDto): Promise<LmsModule> {
        const response = await apiClient.post('/api/admin/lms/modules', data);
        return response.data.data || response.data;
    },

    async update(id: string, data: UpdateModuleDto): Promise<LmsModule> {
        const response = await apiClient.patch(`/api/admin/lms/modules/${id}`, data);
        return response.data.data || response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/admin/lms/modules/${id}`);
    },
};

// ============================================
// Topic Admin Service
// ============================================

export const lmsTopicAdminService = {
    async getAll(filters?: TopicFilters): Promise<LmsTopic[]> {
        let url = '/api/admin/lms/topics';
        if (filters?.moduleId) {
            url = `/api/admin/lms/modules/${filters.moduleId}/topics`;
        }
        const response = await apiClient.get(url, { params: filters });
        return response.data.data || response.data;
    },

    async getById(id: string): Promise<LmsTopic> {
        const response = await apiClient.get(`/api/admin/lms/topics/${id}`);
        return response.data.data || response.data;
    },

    async create(data: CreateTopicDto): Promise<LmsTopic> {
        const response = await apiClient.post('/api/admin/lms/topics', data);
        return response.data.data || response.data;
    },

    async update(id: string, data: UpdateTopicDto): Promise<LmsTopic> {
        const response = await apiClient.patch(`/api/admin/lms/topics/${id}`, data);
        return response.data.data || response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/admin/lms/topics/${id}`);
    },
};

// ============================================
// Module Test Admin Service
// ============================================

export const lmsModuleTestAdminService = {
    async getByModule(moduleId: string): Promise<LmsModuleTest[]> {
        const response = await apiClient.get(`/api/admin/lms/modules/${moduleId}/tests`);
        return response.data.data || response.data;
    },

    async create(data: CreateModuleTestDto): Promise<LmsModuleTest> {
        const response = await apiClient.post('/api/admin/lms/tests/module', data);
        return response.data.data || response.data;
    },

    async update(id: string, data: UpdateModuleTestDto): Promise<LmsModuleTest> {
        const response = await apiClient.patch(`/api/admin/lms/tests/module/${id}`, data);
        return response.data.data || response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/admin/lms/tests/module/${id}`);
    },
};

// ============================================
// Final Test Admin Service
// ============================================

export const lmsFinalTestAdminService = {
    async getByCourse(courseId: string): Promise<LmsFinalTest[]> {
        const response = await apiClient.get(`/api/admin/lms/courses/${courseId}/tests/final`);
        return response.data.data || response.data;
    },

    async create(data: CreateFinalTestDto): Promise<LmsFinalTest> {
        const response = await apiClient.post('/api/admin/lms/tests/final', data);
        return response.data.data || response.data;
    },

    async update(id: string, data: UpdateFinalTestDto): Promise<LmsFinalTest> {
        const response = await apiClient.patch(`/api/admin/lms/tests/final/${id}`, data);
        return response.data.data || response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/admin/lms/tests/final/${id}`);
    },
};

// ============================================
// Test Question Admin Service
// ============================================

export const lmsTestQuestionAdminService = {
    async create(data: CreateTestQuestionDto): Promise<LmsTestQuestion> {
        const response = await apiClient.post('/api/admin/lms/questions', data);
        return response.data.data || response.data;
    },

    async update(id: string, data: UpdateTestQuestionDto): Promise<LmsTestQuestion> {
        const response = await apiClient.patch(`/api/admin/lms/questions/${id}`, data);
        return response.data.data || response.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/admin/lms/questions/${id}`);
    },
};

// ============================================
// Analytics Admin Service
// ============================================

export const lmsAnalyticsAdminService = {
    async getOverview(): Promise<LmsAnalytics> {
        const response = await apiClient.get('/api/admin/lms/analytics/overview');
        return response.data.data || response.data;
    },

    async getTopCourses(): Promise<any[]> {
        const response = await apiClient.get('/api/admin/lms/analytics/top-courses');
        return response.data.data || response.data;
    },
};
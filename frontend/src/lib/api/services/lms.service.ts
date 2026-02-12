// src/lib/api/services/lms.service.ts

import { apiClient } from '../axios-instance';
import { LMS_ENDPOINTS } from '../endpoints';
import type {
  LmsCategory,
  LmsCourseCard,
  GetCoursesParams,
  GetCoursesResponse,
  CourseDetailsResponse,
  ModuleDetailsResponse,
  TopicDetailsResponse,
  EnrollCourseResponse,
  StartTestResponse,
  SubmitTestRequest,
  SubmitTestResponse,
  UpdateTopicProgressRequest,
  LmsTopicProgress,
  LmsStats,
  LmsUserDashboard,
  LmsEnrollment,
} from '@/types/lms.types';

export const lmsService = {
  // Categories
  getCategories: async (): Promise<LmsCategory[]> => {
    const response = await apiClient.get(LMS_ENDPOINTS.CATEGORIES);
    return response.data.data;
  },

  // Courses
  getCourses: async (params: GetCoursesParams): Promise<GetCoursesResponse> => {
    const response = await apiClient.get(LMS_ENDPOINTS.COURSES, { params });
    return response.data.data;
  },

  getCourseBySlug: async (slug: string): Promise<CourseDetailsResponse> => {
    const response = await apiClient.get(LMS_ENDPOINTS.COURSE_BY_SLUG(slug));
    return response.data.data;
  },

  enrollCourse: async (slug: string): Promise<EnrollCourseResponse> => {
    const response = await apiClient.post(LMS_ENDPOINTS.COURSE_ENROLL(slug));
    return response.data.data;
  },

  // Modules
  getModuleDetails: async (
    courseSlug: string,
    moduleOrder: number
  ): Promise<ModuleDetailsResponse> => {
    const response = await apiClient.get(
      LMS_ENDPOINTS.MODULE_DETAILS(courseSlug, moduleOrder)
    );
    return response.data.data;
  },

  // Topics
  getTopicDetails: async (
    courseSlug: string,
    moduleOrder: number,
    topicOrder: number
  ): Promise<TopicDetailsResponse> => {
    const response = await apiClient.get(
      LMS_ENDPOINTS.TOPIC_DETAILS(courseSlug, moduleOrder, topicOrder)
    );
    return response.data.data;
  },

  updateTopicProgress: async (
    courseSlug: string,
    moduleOrder: number,
    topicOrder: number,
    data: UpdateTopicProgressRequest
  ): Promise<LmsTopicProgress> => {
    const response = await apiClient.patch(
      LMS_ENDPOINTS.TOPIC_PROGRESS(courseSlug, moduleOrder, topicOrder),
      data
    );
    return response.data.data;
  },

  // Module Tests
  startModuleTest: async (
    courseSlug: string,
    moduleOrder: number
  ): Promise<StartTestResponse> => {
    const response = await apiClient.post(
      LMS_ENDPOINTS.MODULE_TEST_START(courseSlug, moduleOrder)
    );
    return response.data.data;
  },

  submitModuleTest: async (
    courseSlug: string,
    moduleOrder: number,
    data: SubmitTestRequest
  ): Promise<SubmitTestResponse> => {
    const response = await apiClient.post(
      LMS_ENDPOINTS.MODULE_TEST_SUBMIT(courseSlug, moduleOrder),
      data
    );
    return response.data.data;
  },

  // Final Test
  startFinalTest: async (courseSlug: string): Promise<StartTestResponse> => {
    const response = await apiClient.post(LMS_ENDPOINTS.FINAL_TEST_START(courseSlug));
    return response.data.data;
  },

  submitFinalTest: async (
    courseSlug: string,
    data: SubmitTestRequest
  ): Promise<SubmitTestResponse> => {
    const response = await apiClient.post(
      LMS_ENDPOINTS.FINAL_TEST_SUBMIT(courseSlug),
      data
    );
    return response.data.data;
  },

  // User Dashboard
  getMyCourses: async (): Promise<LmsEnrollment[]> => {
    const response = await apiClient.get(LMS_ENDPOINTS.MY_COURSES);
    return response.data.data;
  },

  getMyDashboard: async (): Promise<LmsUserDashboard> => {
    const response = await apiClient.get(LMS_ENDPOINTS.MY_DASHBOARD);
    return response.data.data;
  },

  // Stats
  getStats: async (): Promise<LmsStats> => {
    const response = await apiClient.get(LMS_ENDPOINTS.STATS);
    return response.data.data;
  },
};

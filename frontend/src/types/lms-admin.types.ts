// Admin-specific LMS types
import {
    LmsCategory,
    LmsCourse,
    LmsCourseStatus,
    DifficultyLevel,
    LmsModule,
    LmsTopic,
    LmsModuleTest,
    LmsFinalTest,
    LmsTestQuestion,
} from './lms.types';

// Paginated Response
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Admin Course with additional fields
export interface LmsCourseAdmin extends LmsCourse {
    enrollmentCount?: number;
    moduleCount?: number;
    topicCount?: number;
    averageProgress?: number;
    revenue?: number;
}

// Course Filters
export interface CourseFilters {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: LmsCourseStatus;
    difficulty?: DifficultyLevel;
    sortBy?: 'createdAt' | 'title' | 'enrollments' | 'revenue';
    sortOrder?: 'asc' | 'desc';
}

// Category Filters
export interface CategoryFilters {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

// Module Filters
export interface ModuleFilters {
    courseId?: string;
    isActive?: boolean;
}

// Topic Filters
export interface TopicFilters {
    moduleId?: string;
    isActive?: boolean;
}

// Analytics Types
export interface LmsAnalytics {
    // Overview section
    overview?: {
        totalCourses: number;
        publishedCourses: number;
        totalCategories: number;
        totalModules: number;
        totalTopics: number;
        totalEnrollments: number;
        activeEnrollments: number;
        completedEnrollments: number;
        totalRevenue: number;
        averageCompletionRate: number;
    };

    // Direct properties (for backward compatibility)
    totalCourses: number;
    totalCategories?: number;
    publishedCourses?: number;
    totalModules?: number;
    totalTopics?: number;
    totalEnrollments: number;
    activeEnrollments?: number;
    completedEnrollments?: number;
    totalRevenue: number;
    averageCompletionRate: number;

    // Course performance data
    coursePerformance?: Array<{
        courseId: string;
        courseName: string;
        enrollments: number;
        completionRate: number;
        averageScore: number;
    }>;

    topCourses: Array<{
        id: string;
        title: string;
        enrollments: number;
        revenue: number;
        averageProgress: number;
    }>;
    categoryStats: Array<{
        categoryId: string;
        categoryName: string;
        courseCount: number;
        enrollmentCount: number;
    }>;
    enrollmentTrends: Array<{
        date: string;
        count: number;
    }>;
}

// Type aliases for components
export type LmsAnalyticsOverview = LmsAnalytics;
export type LmsModuleAdmin = LmsModule;
export type LmsTopicAdmin = LmsTopic;
export type LmsTestAdmin = LmsModuleTest | LmsFinalTest;
export type LmsTestQuestionAdmin = LmsTestQuestion;

// Re-export TopicResource from base types
export type { TopicResource } from './lms.types';

// Create/Update DTOs
export interface CreateCategoryDto {
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    order: number;
    isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> { }

export interface NestedTopicDto {
    title: string;
    description?: string;
    order: number;
    theoryContent: string;
    videoUrl?: string;
    videoDuration?: number;
    estimatedMinutes?: number;
    isActive?: boolean;
    resources?: Array<{
        name: string;
        url: string;
        type: 'pdf' | 'link' | 'file';
    }>;
}

export interface NestedOptionDto {
    id?: string;
    text: string;
    isCorrect: boolean;
    order: number;
}

export interface NestedQuestionDto {
    id?: string;
    questionText: string;
    explanation?: string;
    order: number;
    points: number;
    isActive?: boolean;
    options: NestedOptionDto[];
}

export interface NestedModuleTestDto {
    title: string;
    instructions?: string;
    totalQuestions: number;
    passingScore: number;
    timeLimitMinutes: number;
    maxAttempts?: number;
    pointsPerQuestion: number;
    isActive?: boolean;
    questions?: NestedQuestionDto[];
}

export interface NestedModuleDto {
    title: string;
    shortDescription: string;
    description?: string;
    order: number;
    points?: number;
    estimatedMinutes?: number;
    isActive?: boolean;
    topics?: NestedTopicDto[];
    moduleTest?: NestedModuleTestDto | null;
}

export interface NestedFinalTestDto {
    title: string;
    instructions?: string;
    totalQuestions: number;
    passingScore: number;
    timeLimitMinutes: number;
    maxAttempts?: number;
    pointsPerQuestion: number;
    isActive?: boolean;
    questions?: NestedQuestionDto[];
}

export interface CreateCourseDto {
    categoryId: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    thumbnailUrl?: string;
    previewVideoUrl?: string;
    price?: number;
    discountPrice?: number;
    currency?: string;
    status?: LmsCourseStatus;
    isActive?: boolean;
    certificateEnabled?: boolean;
    passingPercentage?: number;
    tags?: string[];
    difficulty?: DifficultyLevel;
    instructor?: string;
    language?: string;

    // Nested creation
    modules?: NestedModuleDto[];
    finalTest?: NestedFinalTestDto | null;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> { }

export interface CreateModuleDto {
    courseId: string;
    title: string;
    shortDescription: string;
    description?: string;
    order: number;
    points?: number;
    estimatedMinutes?: number;
    isActive?: boolean;
}

export interface UpdateModuleDto extends Partial<CreateModuleDto> { }

export interface CreateTopicDto {
    moduleId: string;
    title: string;
    description?: string;
    order: number;
    theoryContent: string;
    videoUrl?: string;
    videoDuration?: number;
    estimatedMinutes?: number;
    resources?: Array<{
        name: string;
        url: string;
        type: 'pdf' | 'link' | 'file';
    }>;
    isActive?: boolean;
}

export interface UpdateTopicDto extends Partial<CreateTopicDto> { }

export interface CreateModuleTestDto {
    moduleId: string;
    title: string;
    instructions?: string;
    totalQuestions: number;
    passingScore: number;
    timeLimitMinutes: number;
    maxAttempts?: number;
    pointsPerQuestion: number;
    isActive?: boolean;
}

export interface UpdateModuleTestDto extends Partial<CreateModuleTestDto> { }

export interface CreateFinalTestDto {
    courseId: string;
    title: string;
    instructions?: string;
    totalQuestions: number;
    passingScore: number;
    timeLimitMinutes: number;
    maxAttempts?: number;
    pointsPerQuestion: number;
    isActive?: boolean;
}

export interface UpdateFinalTestDto extends Partial<CreateFinalTestDto> { }

export interface CreateTestQuestionDto {
    moduleTestId?: string;
    finalTestId?: string;
    questionText: string;
    explanation?: string;
    order: number;
    points: number;
    isActive?: boolean;
    options: Array<{
        text: string;
        isCorrect: boolean;
        order: number;
    }>;
}

export interface UpdateTestQuestionDto extends Partial<CreateTestQuestionDto> { }
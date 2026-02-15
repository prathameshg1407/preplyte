// backend/src/module/admin/lms/course/course.types.ts

import { DifficultyLevel, LmsCourseStatus } from '@prisma/client';

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
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> { }

export interface CourseFilters {
    search?: string;
    categoryId?: string;
    status?: LmsCourseStatus;
    isActive?: boolean;
    difficulty?: DifficultyLevel;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: 'title' | 'createdAt' | 'price' | 'totalEnrollments';
    sortOrder?: 'asc' | 'desc';
}

export interface CourseWithDetails {
    id: string;
    categoryId: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    thumbnailUrl: string | null;
    previewVideoUrl: string | null;
    totalModules: number;
    totalTopics: number;
    totalPoints: number;
    totalHours: number;
    price: number;
    discountPrice: number | null;
    currency: string;
    status: LmsCourseStatus;
    isActive: boolean;
    certificateEnabled: boolean;
    passingPercentage: number;
    tags: string[];
    difficulty: DifficultyLevel;
    instructor: string | null;
    language: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    _count: {
        modules: number;
        enrollments: number;
    };
}

export interface CourseStats {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    averageProgress: number;
    averageRating: number;
    totalRevenue: number;
}

export interface CourseEnrollmentAdmin {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    status: string;
    progress: number;
    enrolledAt: Date;
    completedAt: Date | null;
    lastAccessedAt: Date | null;
}

export interface EnrollmentStatsAdmin {
    total: number;
    inProgress: number;
    completed: number;
    dropped: number;
    averageProgress: number;
    completionRate: number;
}
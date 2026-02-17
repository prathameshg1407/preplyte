// backend/src/module/admin/lms/module/module.types.ts

export interface CreateModuleDto {
    courseId: string;
    title: string;
    shortDescription: string;
    description?: string;
    order?: number;
    points?: number;
    estimatedMinutes?: number;
    isActive?: boolean;
}

export interface UpdateModuleDto {
    title?: string;
    shortDescription?: string;
    description?: string;
    order?: number;
    points?: number;
    estimatedMinutes?: number;
    isActive?: boolean;
}

export interface ModuleWithTopics {
    id: string;
    courseId: string;
    title: string;
    shortDescription: string;
    description: string | null;
    order: number;
    totalTopics: number;
    points: number;
    estimatedMinutes: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    topics: {
        id: string;
        title: string;
        order: number;
        estimatedMinutes: number;
        isActive: boolean;
    }[];
    moduleTest: {
        id: string;
        title: string;
        totalQuestions: number;
        passingScore: number;
    } | null;
}
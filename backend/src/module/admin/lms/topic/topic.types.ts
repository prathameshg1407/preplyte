// backend/src/module/admin/lms/topic/topic.types.ts

export interface CreateTopicDto {
    moduleId: string;
    title: string;
    description?: string;
    order?: number;
    theoryContent: string;
    videoUrl?: string;
    videoDuration?: number;
    estimatedMinutes?: number;
    resources?: TopicResource[];
    isActive?: boolean;
}

export interface UpdateTopicDto {
    title?: string;
    description?: string;
    order?: number;
    theoryContent?: string;
    videoUrl?: string;
    videoDuration?: number;
    estimatedMinutes?: number;
    resources?: TopicResource[];
    isActive?: boolean;
}

export interface TopicResource {
    name: string;
    url: string;
    type: 'pdf' | 'doc' | 'video' | 'link' | 'image' | 'other';
}

export interface TopicWithDetails {
    id: string;
    moduleId: string;
    title: string;
    description: string | null;
    order: number;
    theoryContent: string;
    videoUrl: string | null;
    videoDuration: number | null;
    estimatedMinutes: number;
    resources: TopicResource[] | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
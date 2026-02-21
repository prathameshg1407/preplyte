// src/module/roadmap/roadmap.types.ts

export interface RoadmapMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    skills: string[];
    duration?: string; // e.g. "2-3 weeks"
}

export interface RoadmapQuestion {
    question: string;
    options?: {
        label: string;
        value: string;
        description?: string;
    }[];
    inputType: 'select' | 'text' | 'multi-select';
    isFinal?: boolean;
}

export interface Roadmap {
    title: string;
    description: string;
    totalDuration?: string; // e.g. "12-16 weeks"
    steps: RoadmapStep[];
}

export interface CourseRecommendation {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string;
    shortDescription: string;
    price: number;
    difficulty: string;
    source: 'platform' | 'external';
    searchQuery?: string;
}

// Per-step course matches (used in generate response)
export interface StepWithCourses {
    stepId: string;
    courses: CourseRecommendation[];
}

// Response for generate endpoint
export interface GenerateRoadmapResponse {
    roadmap: Roadmap;
    courses: CourseRecommendation[];       // flat list (backwards compat)
    stepCourses: StepWithCourses[];        // per-step matches
}

// Saved roadmap types
export interface SavedRoadmapSummary {
    id: string;
    title: string;
    description: string;
    totalDuration: string | null;
    progress: number;           // 0-100
    totalSteps: number;
    completedSteps: number;
    createdAt: string;
}

export interface SavedRoadmapDetail {
    id: string;
    title: string;
    description: string;
    totalDuration: string | null;
    shareToken: string | null;
    conversationHistory: RoadmapMessage[];
    steps: SavedRoadmapStepDetail[];
    createdAt: string;
    updatedAt: string;
}

export interface SavedRoadmapStepDetail {
    id: string;
    stepOrder: number;
    title: string;
    description: string;
    skills: string[];
    duration: string | null;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    completedAt: string | null;
}

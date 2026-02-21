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
    steps: RoadmapStep[];
}

export interface RoadmapSession {
    history: RoadmapMessage[];
    currentGoal?: string;
    selections: Record<string, any>;
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

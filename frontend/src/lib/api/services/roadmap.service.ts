// src/lib/api/services/roadmap.service.ts

import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';

export interface RoadmapMessage {
    role: 'user' | 'assistant';
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

export interface RoadmapGenerateResponse {
    roadmap: Roadmap;
    courses: CourseRecommendation[];
}

class RoadmapService {
    /**
     * Send the conversation history and get the next question from AI.
     * If history is empty, the backend returns the first question (text input).
     */
    async getNextQuestion(history: RoadmapMessage[]): Promise<RoadmapQuestion> {
        const response = await apiClient.post(API_ENDPOINTS.ROADMAP.NEXT_QUESTION, { history });
        return response.data;
    }

    /**
     * Send the full conversation history to generate the final roadmap + matching courses.
     */
    async generateRoadmap(history: RoadmapMessage[]): Promise<RoadmapGenerateResponse> {
        const response = await apiClient.post(API_ENDPOINTS.ROADMAP.GENERATE, { history });
        return response.data;
    }
}

export const roadmapService = new RoadmapService();

// src/lib/api/services/roadmap.service.ts

import { apiClient } from '../axios-instance';
import { API_ENDPOINTS } from '../endpoints';

// ─── Types ───────────────────────────────────────────

export interface RoadmapMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    skills: string[];
    duration?: string;
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
    totalDuration?: string;
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

export interface StepWithCourses {
    stepId: string;
    courses: CourseRecommendation[];
}

export interface GenerateRoadmapResponse {
    roadmap: Roadmap;
    courses: CourseRecommendation[];
    stepCourses: StepWithCourses[];
}

// Saved roadmap types
export interface SavedRoadmapSummary {
    id: string;
    title: string;
    description: string;
    totalDuration: string | null;
    progress: number;
    totalSteps: number;
    completedSteps: number;
    createdAt: string;
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
    userName?: string; // only on shared view
}

// ─── Service ─────────────────────────────────────────

class RoadmapService {
    // AI conversation
    async getNextQuestion(history: RoadmapMessage[]): Promise<RoadmapQuestion> {
        const response = await apiClient.post(API_ENDPOINTS.ROADMAP.NEXT_QUESTION, { history });
        return response.data;
    }

    async generateRoadmap(history: RoadmapMessage[]): Promise<GenerateRoadmapResponse> {
        const response = await apiClient.post(API_ENDPOINTS.ROADMAP.GENERATE, { history });
        return response.data;
    }

    // CRUD
    async saveRoadmap(roadmap: Roadmap, history: RoadmapMessage[]): Promise<{ id: string }> {
        const response = await apiClient.post(API_ENDPOINTS.ROADMAP.SAVE, { roadmap, history });
        return response.data;
    }

    async listRoadmaps(): Promise<SavedRoadmapSummary[]> {
        const response = await apiClient.get(API_ENDPOINTS.ROADMAP.LIST);
        return response.data;
    }

    async getRoadmap(id: string): Promise<SavedRoadmapDetail> {
        const response = await apiClient.get(API_ENDPOINTS.ROADMAP.GET(id));
        return response.data;
    }

    async updateStepStatus(
        roadmapId: string,
        stepId: string,
        status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    ): Promise<void> {
        await apiClient.patch(API_ENDPOINTS.ROADMAP.UPDATE_STEP(roadmapId, stepId), { status });
    }

    async deleteRoadmap(id: string): Promise<void> {
        await apiClient.delete(API_ENDPOINTS.ROADMAP.DELETE(id));
    }

    // Sharing
    async shareRoadmap(id: string): Promise<{ shareToken: string }> {
        const response = await apiClient.post(API_ENDPOINTS.ROADMAP.SHARE(id));
        return response.data;
    }

    async getSharedRoadmap(token: string): Promise<SavedRoadmapDetail> {
        const response = await apiClient.get(API_ENDPOINTS.ROADMAP.SHARED(token));
        return response.data;
    }
}

export const roadmapService = new RoadmapService();

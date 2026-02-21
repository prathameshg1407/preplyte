// src/module/roadmap/roadmap.service.ts

import { prisma } from '../../lib/db';
import { GroqApiManager } from '../../utils/groq-manager';
import { randomBytes } from 'crypto';
import {
    ROADMAP_QUESTION_SYSTEM_PROMPT,
    ROADMAP_GENERATE_SYSTEM_PROMPT,
    buildQuestionPrompt,
    buildGeneratePrompt
} from './roadmap.prompts';
import {
    RoadmapQuestion,
    Roadmap,
    CourseRecommendation,
    StepWithCourses,
    SavedRoadmapSummary,
    SavedRoadmapDetail,
    RoadmapMessage
} from './roadmap.types';
import { LmsCourseStatus, RoadmapStepStatus } from '@prisma/client';

class RoadmapService {
    private groq: GroqApiManager;

    constructor() {
        const apiKeys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '')
            .split(',')
            .filter(Boolean);
        this.groq = new GroqApiManager(apiKeys);
    }

    // ──────────────────────────────────────────────
    // AI — Questions & Generation
    // ──────────────────────────────────────────────

    async getNextQuestion(history: { role: string; content: string }[]): Promise<RoadmapQuestion> {
        if (!history || history.length === 0) {
            return {
                question: "What's your career goal? Tell us what role or field you want to prepare for.",
                inputType: 'text',
                isFinal: false
            };
        }

        const prompt = buildQuestionPrompt(history);
        return this.groq.generateJson<RoadmapQuestion>(prompt, {
            systemPrompt: ROADMAP_QUESTION_SYSTEM_PROMPT,
            temperature: 0.7,
        });
    }

    async generateRoadmap(history: { role: string; content: string }[]): Promise<Roadmap> {
        const prompt = buildGeneratePrompt(history);
        return this.groq.generateJson<Roadmap>(prompt, {
            systemPrompt: ROADMAP_GENERATE_SYSTEM_PROMPT,
            temperature: 0.5,
        });
    }

    // ──────────────────────────────────────────────
    // Course Search
    // ──────────────────────────────────────────────

    async searchCourses(skills: string[]): Promise<CourseRecommendation[]> {
        const recommendations: CourseRecommendation[] = [];

        for (const skill of skills) {
            const platformCourses = await prisma.lmsCourse.findMany({
                where: {
                    OR: [
                        { title: { contains: skill, mode: 'insensitive' } },
                        { tags: { hasSome: [skill.toLowerCase()] } },
                        { shortDescription: { contains: skill, mode: 'insensitive' } }
                    ],
                    status: LmsCourseStatus.PUBLISHED,
                    isActive: true,
                },
                take: 2
            });

            if (platformCourses.length > 0) {
                platformCourses.forEach(course => {
                    recommendations.push({
                        id: course.id,
                        title: course.title,
                        slug: course.slug,
                        thumbnailUrl: course.thumbnailUrl || undefined,
                        shortDescription: course.shortDescription,
                        price: course.price,
                        difficulty: course.difficulty,
                        source: 'platform'
                    });
                });
            } else {
                recommendations.push({
                    id: `ext-${skill}`,
                    title: `Learn ${skill}`,
                    slug: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`,
                    shortDescription: `We don't have a course for "${skill}" yet. Check out highly-rated tutorials on YouTube.`,
                    price: 0,
                    difficulty: 'Various',
                    source: 'external',
                    searchQuery: skill
                });
            }
        }

        return Array.from(new Map(recommendations.map(item => [item.slug, item])).values());
    }

    /**
     * Search courses grouped by step — returns per-step matches.
     */
    async searchCoursesPerStep(steps: { id: string; skills: string[] }[]): Promise<StepWithCourses[]> {
        const result: StepWithCourses[] = [];

        for (const step of steps) {
            const courses = await this.searchCourses(step.skills);
            result.push({ stepId: step.id, courses });
        }

        return result;
    }

    // ──────────────────────────────────────────────
    // CRUD — Save / List / Get / Delete
    // ──────────────────────────────────────────────

    async saveRoadmap(
        userId: string,
        roadmap: Roadmap,
        conversationHistory: RoadmapMessage[]
    ): Promise<{ id: string }> {
        const saved = await prisma.userRoadmap.create({
            data: {
                userId,
                title: roadmap.title,
                description: roadmap.description,
                totalDuration: roadmap.totalDuration || null,
                conversationHistory: conversationHistory as any,
                steps: {
                    create: roadmap.steps.map((step, idx) => ({
                        stepOrder: idx + 1,
                        title: step.title,
                        description: step.description,
                        skills: step.skills,
                        duration: step.duration || null,
                    }))
                }
            }
        });
        return { id: saved.id };
    }

    async getUserRoadmaps(userId: string): Promise<SavedRoadmapSummary[]> {
        const roadmaps = await prisma.userRoadmap.findMany({
            where: { userId },
            include: {
                steps: {
                    select: { status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return roadmaps.map(r => {
            const totalSteps = r.steps.length;
            const completedSteps = r.steps.filter(s => s.status === RoadmapStepStatus.COMPLETED).length;
            const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

            return {
                id: r.id,
                title: r.title,
                description: r.description,
                totalDuration: r.totalDuration,
                progress,
                totalSteps,
                completedSteps,
                createdAt: r.createdAt.toISOString(),
            };
        });
    }

    async getRoadmapById(userId: string, roadmapId: string): Promise<SavedRoadmapDetail | null> {
        const r = await prisma.userRoadmap.findFirst({
            where: { id: roadmapId, userId },
            include: {
                steps: { orderBy: { stepOrder: 'asc' } }
            }
        });

        if (!r) return null;

        return {
            id: r.id,
            title: r.title,
            description: r.description,
            totalDuration: r.totalDuration,
            shareToken: r.shareToken,
            conversationHistory: r.conversationHistory as RoadmapMessage[],
            steps: r.steps.map(s => ({
                id: s.id,
                stepOrder: s.stepOrder,
                title: s.title,
                description: s.description,
                skills: s.skills,
                duration: s.duration,
                status: s.status,
                completedAt: s.completedAt?.toISOString() || null,
            })),
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
        };
    }

    async updateStepStatus(
        userId: string,
        roadmapId: string,
        stepId: string,
        status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    ): Promise<boolean> {
        // Verify ownership
        const roadmap = await prisma.userRoadmap.findFirst({
            where: { id: roadmapId, userId },
            select: { id: true }
        });
        if (!roadmap) return false;

        await prisma.userRoadmapStep.update({
            where: { id: stepId },
            data: {
                status: status as RoadmapStepStatus,
                completedAt: status === 'COMPLETED' ? new Date() : null,
            }
        });

        return true;
    }

    async deleteRoadmap(userId: string, roadmapId: string): Promise<boolean> {
        const roadmap = await prisma.userRoadmap.findFirst({
            where: { id: roadmapId, userId },
            select: { id: true }
        });
        if (!roadmap) return false;

        await prisma.userRoadmap.delete({ where: { id: roadmapId } });
        return true;
    }

    // ──────────────────────────────────────────────
    // Sharing
    // ──────────────────────────────────────────────

    async generateShareToken(userId: string, roadmapId: string): Promise<string | null> {
        const roadmap = await prisma.userRoadmap.findFirst({
            where: { id: roadmapId, userId },
            select: { id: true, shareToken: true }
        });
        if (!roadmap) return null;

        // Reuse existing token if already shared
        if (roadmap.shareToken) return roadmap.shareToken;

        const token = randomBytes(16).toString('hex');
        await prisma.userRoadmap.update({
            where: { id: roadmapId },
            data: { shareToken: token }
        });

        return token;
    }

    async getSharedRoadmap(token: string): Promise<(SavedRoadmapDetail & { userName?: string }) | null> {
        const r = await prisma.userRoadmap.findFirst({
            where: { shareToken: token },
            include: {
                steps: { orderBy: { stepOrder: 'asc' } },
                user: { select: { name: true } }
            }
        });

        if (!r) return null;

        return {
            id: r.id,
            title: r.title,
            description: r.description,
            totalDuration: r.totalDuration,
            shareToken: r.shareToken,
            conversationHistory: [],  // Don't expose conversation publicly
            steps: r.steps.map(s => ({
                id: s.id,
                stepOrder: s.stepOrder,
                title: s.title,
                description: s.description,
                skills: s.skills,
                duration: s.duration,
                status: s.status,
                completedAt: s.completedAt?.toISOString() || null,
            })),
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
            userName: r.user?.name || undefined,
        };
    }
}

export const roadmapService = new RoadmapService();

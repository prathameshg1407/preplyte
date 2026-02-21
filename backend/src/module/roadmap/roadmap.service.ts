// src/module/roadmap/roadmap.service.ts

import { prisma } from '../../lib/db';
import { GroqApiManager } from '../../utils/groq-manager';
import {
    ROADMAP_QUESTION_SYSTEM_PROMPT,
    ROADMAP_GENERATE_SYSTEM_PROMPT,
    buildQuestionPrompt,
    buildGeneratePrompt
} from './roadmap.prompts';
import {
    RoadmapQuestion,
    Roadmap,
    CourseRecommendation
} from './roadmap.types';
import { LmsCourseStatus } from '@prisma/client';

class RoadmapService {
    private groq: GroqApiManager;

    constructor() {
        const apiKeys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '')
            .split(',')
            .filter(Boolean);
        this.groq = new GroqApiManager(apiKeys);
    }

    /**
     * Get the next question for the roadmap wizard.
     * If history is empty, return the first question (text input for career goal).
     * Otherwise, send the history to the AI to get the next clarifying question.
     */
    async getNextQuestion(history: { role: string; content: string }[]): Promise<RoadmapQuestion> {
        // First question: always ask for the user's goal via text input
        if (!history || history.length === 0) {
            return {
                question: "What's your career goal? Tell us what role or field you want to prepare for.",
                inputType: 'text',
                isFinal: false
            };
        }

        // Ask the AI for the next clarifying question
        const prompt = buildQuestionPrompt(history);
        return this.groq.generateJson<RoadmapQuestion>(prompt, {
            systemPrompt: ROADMAP_QUESTION_SYSTEM_PROMPT,
            temperature: 0.7,
        });
    }

    /**
     * Generate the final roadmap from the full conversation history.
     * The AI will analyze the entire conversation and produce a structured roadmap.
     */
    async generateRoadmap(history: { role: string; content: string }[]): Promise<Roadmap> {
        const prompt = buildGeneratePrompt(history);
        return this.groq.generateJson<Roadmap>(prompt, {
            systemPrompt: ROADMAP_GENERATE_SYSTEM_PROMPT,
            temperature: 0.5,
        });
    }

    /**
     * Search platform courses by skill keywords.
     * For each skill, search the LMS database for matching published courses.
     * If no match is found in the DB, provide a YouTube search link as fallback.
     */
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

        // Deduplicate by slug
        return Array.from(new Map(recommendations.map(item => [item.slug, item])).values());
    }
}

export const roadmapService = new RoadmapService();

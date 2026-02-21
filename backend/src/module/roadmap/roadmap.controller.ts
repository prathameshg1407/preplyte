// src/module/roadmap/roadmap.controller.ts

import { Request, Response } from 'express';
import { roadmapService } from './roadmap.service';
import { logger } from '../../utils/logger';

export class RoadmapController {
    /**
     * POST /api/practice/roadmap/question
     * Body: { history: { role: string, content: string }[] }
     * Returns the next question for the roadmap wizard.
     */
    static async getNextQuestion(req: Request, res: Response) {
        try {
            const { history } = req.body;
            const question = await roadmapService.getNextQuestion(history || []);
            res.json(question);
        } catch (error) {
            logger.error('[RoadmapController] Error getting next question', error);
            res.status(500).json({ message: 'Failed to get next question' });
        }
    }

    /**
     * POST /api/practice/roadmap/generate
     * Body: { history: { role: string, content: string }[] }
     * Generates the final roadmap from the full conversation history,
     * then searches the DB for matching courses by skill keywords.
     */
    static async generateRoadmap(req: Request, res: Response) {
        try {
            const { history } = req.body;

            if (!history || history.length === 0) {
                res.status(400).json({ message: 'Conversation history is required' });
                return;
            }

            // Generate roadmap from conversation history
            const roadmap = await roadmapService.generateRoadmap(history);

            // Extract all unique skills from the roadmap steps
            const allSkills = Array.from(
                new Set(roadmap.steps.flatMap(step => step.skills))
            );

            // Search for matching courses in the database
            const courses = await roadmapService.searchCourses(allSkills);

            res.json({
                roadmap,
                courses
            });
        } catch (error) {
            logger.error('[RoadmapController] Error generating roadmap', error);
            res.status(500).json({ message: 'Failed to generate roadmap' });
        }
    }
}

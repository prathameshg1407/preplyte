// src/module/roadmap/roadmap.controller.ts

import { Request, Response } from 'express';
import { roadmapService } from './roadmap.service';
import { logger } from '../../utils/logger';

export class RoadmapController {
    // POST /question
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

    // POST /generate
    static async generateRoadmap(req: Request, res: Response) {
        try {
            const { history } = req.body;
            if (!history || history.length === 0) {
                res.status(400).json({ message: 'Conversation history is required' });
                return;
            }

            const roadmap = await roadmapService.generateRoadmap(history);
            const allSkills = Array.from(new Set(roadmap.steps.flatMap(step => step.skills)));
            const courses = await roadmapService.searchCourses(allSkills);
            const stepCourses = await roadmapService.searchCoursesPerStep(
                roadmap.steps.map(s => ({ id: s.id, skills: s.skills }))
            );

            res.json({ roadmap, courses, stepCourses });
        } catch (error) {
            logger.error('[RoadmapController] Error generating roadmap', error);
            res.status(500).json({ message: 'Failed to generate roadmap' });
        }
    }

    // POST /save
    static async saveRoadmap(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { roadmap, history } = req.body;

            if (!roadmap || !history) {
                res.status(400).json({ message: 'Roadmap and history are required' });
                return;
            }

            const result = await roadmapService.saveRoadmap(userId, roadmap, history);
            res.json(result);
        } catch (error) {
            logger.error('[RoadmapController] Error saving roadmap', error);
            res.status(500).json({ message: 'Failed to save roadmap' });
        }
    }

    // GET /list
    static async listRoadmaps(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const roadmaps = await roadmapService.getUserRoadmaps(userId);
            res.json(roadmaps);
        } catch (error) {
            logger.error('[RoadmapController] Error listing roadmaps', error);
            res.status(500).json({ message: 'Failed to fetch roadmaps' });
        }
    }

    // GET /:id
    static async getRoadmap(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { id } = req.params;
            const roadmap = await roadmapService.getRoadmapById(userId, id);
            if (!roadmap) {
                res.status(404).json({ message: 'Roadmap not found' });
                return;
            }
            res.json(roadmap);
        } catch (error) {
            logger.error('[RoadmapController] Error getting roadmap', error);
            res.status(500).json({ message: 'Failed to fetch roadmap' });
        }
    }

    // PATCH /:id/steps/:stepId
    static async updateStepStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { id, stepId } = req.params;
            const { status } = req.body;

            if (!['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
                res.status(400).json({ message: 'Invalid status' });
                return;
            }

            const success = await roadmapService.updateStepStatus(userId, id, stepId, status);
            if (!success) {
                res.status(404).json({ message: 'Roadmap or step not found' });
                return;
            }

            res.json({ message: 'Step status updated' });
        } catch (error) {
            logger.error('[RoadmapController] Error updating step status', error);
            res.status(500).json({ message: 'Failed to update step status' });
        }
    }

    // DELETE /:id
    static async deleteRoadmap(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { id } = req.params;
            const success = await roadmapService.deleteRoadmap(userId, id);
            if (!success) {
                res.status(404).json({ message: 'Roadmap not found' });
                return;
            }
            res.json({ message: 'Roadmap deleted' });
        } catch (error) {
            logger.error('[RoadmapController] Error deleting roadmap', error);
            res.status(500).json({ message: 'Failed to delete roadmap' });
        }
    }

    // POST /:id/share
    static async shareRoadmap(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { id } = req.params;
            const token = await roadmapService.generateShareToken(userId, id);
            if (!token) {
                res.status(404).json({ message: 'Roadmap not found' });
                return;
            }
            res.json({ shareToken: token });
        } catch (error) {
            logger.error('[RoadmapController] Error sharing roadmap', error);
            res.status(500).json({ message: 'Failed to share roadmap' });
        }
    }

    // POST /courses-for-steps
    static async searchCoursesForSteps(req: Request, res: Response) {
        try {
            const { steps } = req.body;
            if (!steps || !Array.isArray(steps)) {
                res.status(400).json({ message: 'Steps array is required' });
                return;
            }
            const stepCourses = await roadmapService.searchCoursesPerStep(
                steps.map((s: any) => ({ id: s.id, skills: s.skills || [] }))
            );
            res.json(stepCourses);
        } catch (error) {
            logger.error('[RoadmapController] Error searching courses for steps', error);
            res.status(500).json({ message: 'Failed to search courses' });
        }
    }

    // GET /shared/:token (no auth)
    static async getSharedRoadmap(req: Request, res: Response) {
        try {
            const { token } = req.params;
            const roadmap = await roadmapService.getSharedRoadmap(token);
            if (!roadmap) {
                res.status(404).json({ message: 'Shared roadmap not found' });
                return;
            }
            res.json(roadmap);
        } catch (error) {
            logger.error('[RoadmapController] Error getting shared roadmap', error);
            res.status(500).json({ message: 'Failed to fetch shared roadmap' });
        }
    }
}

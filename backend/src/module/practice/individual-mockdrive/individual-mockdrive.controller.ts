// src/module/practice/individual-mockdrive/individual-mockdrive.controller.ts

import { Request, Response } from 'express';
import { individualMockDriveService } from './individual-mockdrive.service';
import { 
  createIndividualMockDriveSchema, 
  updateIndividualMockDriveSchema 
} from './individual-mockdrive.validation';
import { logger } from '../../../utils/logger';

export class IndividualMockDriveController {
  /**
   * Create a new mock drive
   */
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = createIndividualMockDriveSchema.parse(req.body);
      const mockDrive = await individualMockDriveService.create(userId, validatedData);

      return res.status(201).json(mockDrive);
    } catch (error: any) {
      logger.error('Error creating individual mockdrive', { error: error.message });
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * List user's mock drives
   */
  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const drives = await individualMockDriveService.findAll(userId);
      return res.json(drives);
    } catch (error: any) {
      logger.error('Error listing individual mockdrives', { error: error.message });
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get mock drive details
   */
  async getDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const mockDrive = await individualMockDriveService.findOne(id as string, userId);
      return res.json(mockDrive);
    } catch (error: any) {
      logger.error('Error getting individual mockdrive details', { id: req.params.id, error: error.message });
      return res.status(404).json({ message: error.message });
    }
  }

  /**
   * Update mock drive
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const validatedData = updateIndividualMockDriveSchema.parse(req.body);
      const updated = await individualMockDriveService.update(id as string, userId, validatedData);
      return res.json(updated);
    } catch (error: any) {
      logger.error('Error updating individual mockdrive', { id: req.params.id, error: error.message });
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * Delete mock drive
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await individualMockDriveService.delete(id as string, userId);
      return res.status(204).send();
    } catch (error: any) {
      logger.error('Error deleting individual mockdrive', { id: req.params.id, error: error.message });
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * Start an attempt
   */
  async startAttempt(req: Request, res: Response) {
    try {
      const { id } = req.params; // MockDrive ID
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const attempt = await individualMockDriveService.startAttempt(id as string, userId);
      return res.status(201).json(attempt);
    } catch (error: any) {
      logger.error('Error starting mockdrive attempt', { id: req.params.id, error: error.message });
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get current active attempt
   */
  async getCurrentAttempt(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const attempt = await individualMockDriveService.getCurrentAttempt(userId);
      return res.json(attempt);
    } catch (error: any) {
      logger.error('Error getting current attempt', { error: error.message });
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Start a module in an attempt
   */
  async startModule(req: Request, res: Response) {
    try {
      const { attemptId, moduleId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const moduleAttempt = await individualMockDriveService.startModule(attemptId as string, moduleId as string, userId);
      return res.json(moduleAttempt);
    } catch (error: any) {
      logger.error('Error starting module', { attemptId: req.params.attemptId, moduleId: req.params.moduleId, error: error.message });
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get attempt history
   */
  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const history = await individualMockDriveService.getAttemptHistory(userId);
      return res.json(history);
    } catch (error: any) {
      logger.error('Error getting attempt history', { error: error.message });
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get attempt details by id
   */
  async getAttemptDetails(req: Request, res: Response) {
    try {
      const { attemptId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const attempt = await individualMockDriveService.getAttemptById(attemptId as string, userId);
      return res.json(attempt);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }

  /**
   * Sync and get current attempt
   */
  async sync(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const attempt = await individualMockDriveService.syncAttempt(userId);
      return res.json(attempt);
    } catch (error: any) {
      logger.error('Error syncing attempt', { error: error.message });
      return res.status(500).json({ message: error.message });
    }
  }
}

export const individualMockDriveController = new IndividualMockDriveController();

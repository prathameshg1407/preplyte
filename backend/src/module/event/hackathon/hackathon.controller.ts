// backend/src/module/event/hackathon/hackathon.controller.ts

import { Request, Response, NextFunction } from 'express';
import { hackathonService } from './hackathon.service';
import { createHackathonSchema, updateHackathonSchema, hackathonListQuerySchema } from './hackathon.validation';
import { sendSuccess, sendPaginated } from '../../../utils/response';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

export class HackathonController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = createHackathonSchema.parse(req.body);
      const hackathon = await hackathonService.createHackathon(validatedData as any, authReq.user!.id);
      return sendSuccess(res, hackathon, 'Hackathon created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const hackathon = await hackathonService.getHackathonById(id, authReq.user?.id);
      return sendSuccess(res, hackathon, 'Hackathon retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = hackathonListQuerySchema.parse(req.query);
      const result = await hackathonService.listHackathons(query as any);
      return sendPaginated(res, result.data, result.meta as any, 'Hackathons retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = updateHackathonSchema.parse(req.body);
      const id = req.params.id as string;
      const hackathon = await hackathonService.updateHackathon(
        id, 
        validatedData as any, 
        authReq.user!.id, 
        authReq.user!.role
      );
      return sendSuccess(res, hackathon, 'Hackathon updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      await hackathonService.deleteHackathon(id, authReq.user!.id, authReq.user!.role);
      return sendSuccess(res, { success: true }, 'Hackathon deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  async checkEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const result = await hackathonService.checkUserEligibility(id, authReq.user!.id);
      return sendSuccess(res, result, 'Eligibility check completed');
    } catch (error) {
      return next(error);
    }
  }
}

export const hackathonController = new HackathonController();

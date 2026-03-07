// backend/src/module/event/internship/internship.controller.ts

import { Request, Response, NextFunction } from 'express';
import { internshipService } from './internship.service';
import { createInternshipSchema, updateInternshipSchema, internshipListQuerySchema } from './internship.validation';
import { sendSuccess, sendPaginated } from '../../../utils/response';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

export class InternshipController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = createInternshipSchema.parse(req.body);
      const internship = await internshipService.createInternship(validatedData as any, authReq.user!.id);
      return sendSuccess(res, internship, 'Internship created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const internship = await internshipService.getInternshipById(id, authReq.user?.id);
      return sendSuccess(res, internship, 'Internship retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = internshipListQuerySchema.parse(req.query);
      const result = await internshipService.listInternships(query as any);
      return sendPaginated(res, result.data, result.meta as any, 'Internships retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = updateInternshipSchema.parse(req.body);
      const id = req.params.id as string;
      const internship = await internshipService.updateInternship(
        id, 
        validatedData as any, 
        authReq.user!.id, 
        authReq.user!.role
      );
      return sendSuccess(res, internship, 'Internship updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      await internshipService.deleteInternship(id, authReq.user!.id, authReq.user!.role);
      return sendSuccess(res, { success: true }, 'Internship deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  async checkEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const result = await internshipService.checkUserEligibility(id, authReq.user!.id);
      return sendSuccess(res, result, 'Eligibility check completed');
    } catch (error) {
      return next(error);
    }
  }
}

export const internshipController = new InternshipController();

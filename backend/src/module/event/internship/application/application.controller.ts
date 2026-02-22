// backend/src/module/event/internship/application/application.controller.ts

import { Request, Response, NextFunction } from 'express';
import { internshipApplicationService } from './application.service';
import { submitApplicationSchema, reviewApplicationSchema } from './application.validation';
import { sendSuccess } from '../../../../utils/response';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';

export class InternshipApplicationController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = submitApplicationSchema.parse({
        ...req.body,
        internshipId: req.params.id,
      });
      const application = await internshipApplicationService.submitApplication(validatedData as any, authReq.user!.id);
      return sendSuccess(res, application, 'Application submitted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const application = await internshipApplicationService.getApplicationById(
        id, 
        authReq.user!.id, 
        authReq.user!.role
      );
      return sendSuccess(res, application, 'Application retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        internshipId: req.query.internshipId as string,
        userId: req.query.userId as string,
        status: req.query.status as any
      };
      const applications = await internshipApplicationService.listApplications(filters);
      return sendSuccess(res, applications, 'Applications retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const validatedData = reviewApplicationSchema.parse(req.body);
      const application = await internshipApplicationService.reviewApplication(
        id, 
        validatedData as any, 
        authReq.user!.id
      );
      return sendSuccess(res, application, 'Application reviewed successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const internshipApplicationController = new InternshipApplicationController();

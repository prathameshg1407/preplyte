// backend/src/module/event/job/application/application.controller.ts

import { Request, Response, NextFunction } from 'express';
import { applicationService } from './application.service';
import { submitApplicationSchema, reviewApplicationSchema } from './application.validation';
import { sendSuccess } from '../../../../utils/response';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';

export class ApplicationController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = submitApplicationSchema.parse({
        ...req.body,
        jobId: req.params.id,
      });
      const application = await applicationService.submitApplication(validatedData as any, authReq.user!.id);
      return sendSuccess(res, application, 'Application submitted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const application = await applicationService.getApplicationById(
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
        jobId: req.query.jobId as string,
        userId: req.query.userId as string,
        status: req.query.status as any
      };
      const applications = await applicationService.listApplications(filters);
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
      const application = await applicationService.reviewApplication(
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

export const applicationController = new ApplicationController();

// backend/src/module/event/hackathon/submission/submission.controller.ts

import { Request, Response, NextFunction } from 'express';
import { submissionService } from './submission.service';
import { submitProjectSchema, reviewSubmissionSchema } from '../hackathon.validation';
import { sendSuccess } from '../../../../utils/response';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';

export class SubmissionController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = submitProjectSchema.parse(req.body);
      const submission = await submissionService.submitProject(validatedData as any, authReq.user!.id);
      return sendSuccess(res, submission, 'Project submitted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async saveDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const submission = await submissionService.saveDraft(req.body, authReq.user!.id);
      return sendSuccess(res, submission, 'Draft saved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
       const id = req.params.id as string;
       const submission = await submissionService.getSubmission(id);
       return sendSuccess(res, submission, 'Submission retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validatedData = reviewSubmissionSchema.parse(req.body);
      const submission = await submissionService.reviewSubmission(id, validatedData as any);
      return sendSuccess(res, submission, 'Submission reviewed successfully');
    } catch (error) {
      return next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const hackathonId = req.params.id as string;
      const submissions = await submissionService.listSubmissions(hackathonId);
      return sendSuccess(res, submissions, 'Submissions retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const submissionController = new SubmissionController();

// backend/src/module/event/job/job.controller.ts

import { Request, Response, NextFunction } from 'express';
import { jobService } from './job.service';
import { createJobSchema, updateJobSchema, jobListQuerySchema } from './job.validation';
import { sendSuccess, sendPaginated } from '../../../utils/response';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';

export class JobController {
  /**
   * Create Job
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = createJobSchema.parse(req.body);
      const job = await jobService.createJob(validatedData as any, authReq.user!.id);
      
      return sendSuccess(res, job, 'Job created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get Job by ID
   */
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
       const authReq = req as AuthenticatedRequest;
       const id = req.params.id as string;
      const job = await jobService.getJobById(id, authReq.user?.id);
      return sendSuccess(res, job, 'Job retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * List Jobs
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = jobListQuerySchema.parse(req.query);
      const result = await jobService.listJobs(query as any);
      return sendPaginated(res, result.data, result.meta as any, 'Jobs retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Update Job
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = updateJobSchema.parse(req.body);
      const id = req.params.id as string;
      const job = await jobService.updateJob(
        id, 
        validatedData as any, 
        authReq.user!.id, 
        authReq.user!.role
      );
      return sendSuccess(res, job, 'Job updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete Job
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      await jobService.deleteJob(id, authReq.user!.id, authReq.user!.role);
      return sendSuccess(res, { success: true }, 'Job deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Check Eligibility
   */
  async checkEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const result = await jobService.checkUserEligibility(id, authReq.user!.id);
      return sendSuccess(res, result, 'Eligibility check completed');
    } catch (error) {
      return next(error);
    }
  }
}

export const jobController = new JobController();

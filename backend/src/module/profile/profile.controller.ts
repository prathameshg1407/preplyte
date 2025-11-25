// src/module/profile/profile.controller.ts

import { Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../../config/constants';
import { profileService } from './profile.service';
import { resumeIdParamSchema } from './profile.validation';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { BadRequestError } from '../../lib/errors';

export class ProfileController {
  constructor() {
    // Bind all methods
    this.uploadResume = this.uploadResume.bind(this);
    this.getResumes = this.getResumes.bind(this);
    this.getResume = this.getResume.bind(this);
    this.deleteResume = this.deleteResume.bind(this);
    this.setDefaultResume = this.setDefaultResume.bind(this);
    this.getDefaultResume = this.getDefaultResume.bind(this);
  }

  // ============= Helper Methods =============

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user?.id) {
      throw new BadRequestError('User ID not found in request');
    }
    return req.user.id;
  }

  private parseResumeId(resumeId: string): number {
    const result = resumeIdParamSchema.safeParse({ resumeId });
    if (!result.success) {
      throw new BadRequestError('Invalid resume ID');
    }
    return result.data.resumeId;
  }

  // ============= Route Handlers =============

  async uploadResume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);

      if (!req.file) {
        throw new BadRequestError('No file provided');
      }

      const resume = await profileService.uploadResume(userId, req.file);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResumes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resumes = await profileService.getUserResumes(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: resumes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resumeId = this.parseResumeId(req.params.resumeId);
      const resume = await profileService.getResume(userId, resumeId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteResume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resumeId = this.parseResumeId(req.params.resumeId);
      await profileService.deleteResume(userId, resumeId);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  async setDefaultResume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resumeId = this.parseResumeId(req.params.resumeId);
      const resume = await profileService.setDefaultResume(userId, resumeId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Default resume updated',
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDefaultResume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resume = await profileService.getDefaultResume(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
// src/module/profile/profile.controller.ts

import { Response, NextFunction } from 'express';
import { profileService } from './profile.service';
import {
  parseResumeId,
  parseCreateStudentProfile,
  parseUpdateStudentProfile,
  parseUpdateUserProfile,
} from './profile.validation';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { BadRequestError } from '../../utils/errors';
import { HTTP_STATUS } from './profile.constants';

// =====================================================
// CONTROLLER CLASS
// =====================================================

class ProfileController {
  constructor() {
    // Bind all methods to preserve 'this' context
    this.getCompleteProfile = this.getCompleteProfile.bind(this);
    this.getUserProfile = this.getUserProfile.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);

    this.createStudentProfile = this.createStudentProfile.bind(this);
    this.getStudentProfile = this.getStudentProfile.bind(this);
    this.updateStudentProfile = this.updateStudentProfile.bind(this);
    this.deleteStudentProfile = this.deleteStudentProfile.bind(this);

    this.addSkills = this.addSkills.bind(this);
    this.removeSkills = this.removeSkills.bind(this);
    this.updateAcademicMarks = this.updateAcademicMarks.bind(this);

    this.uploadResume = this.uploadResume.bind(this);
    this.getResumes = this.getResumes.bind(this);
    this.getResume = this.getResume.bind(this);
    this.deleteResume = this.deleteResume.bind(this);
    this.setDefaultResume = this.setDefaultResume.bind(this);
    this.getDefaultResume = this.getDefaultResume.bind(this);
    this.extractResumeText = this.extractResumeText.bind(this);
    this.linkResumeToProfile = this.linkResumeToProfile.bind(this);
  }

  // =================================================
  // USER PROFILE ENDPOINTS
  // =================================================

  /**
   * GET /profile
   * Get complete user profile with all related data
   */
  async getCompleteProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const profile = await profileService.getCompleteProfile(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /profile/user
   * Get basic user profile
   */
  async getUserProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const profile = await profileService.getUserProfile(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /profile/user
   * Update basic user profile
   */
  async updateUserProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const input = parseUpdateUserProfile(req.body);
      const profile = await profileService.updateUserProfile(userId, input);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // STUDENT PROFILE ENDPOINTS
  // =================================================

  /**
   * POST /profile/student
   * Create student profile
   */
  async createStudentProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const input = parseCreateStudentProfile(req.body);
      const profile = await profileService.createStudentProfile(userId, input);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Student profile created successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /profile/student
   * Get student profile
   */
  async getStudentProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const profile = await profileService.getStudentProfile(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /profile/student
   * Update student profile
   */
  async updateStudentProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const input = parseUpdateStudentProfile(req.body);
      const profile = await profileService.updateStudentProfile(userId, input);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Student profile updated successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /profile/student
   * Delete student profile
   */
  async deleteStudentProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      await profileService.deleteStudentProfile(userId);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /profile/student/skills
   * Add skills to student profile
   */
  async addSkills(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { skills } = req.body;

      if (!Array.isArray(skills) || skills.length === 0) {
        throw new BadRequestError('Skills array is required');
      }

      const profile = await profileService.addSkills(userId, skills);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Skills added successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /profile/student/skills
   * Remove skills from student profile
   */
  async removeSkills(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { skills } = req.body;

      if (!Array.isArray(skills) || skills.length === 0) {
        throw new BadRequestError('Skills array is required');
      }

      const profile = await profileService.removeSkills(userId, skills);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Skills removed successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /profile/student/academics
   * Update academic marks
   */
  async updateAcademicMarks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { marks10, marks12, cgpaSemesters } = req.body;

      const profile = await profileService.updateAcademicMarks(userId, {
        marks10,
        marks12,
        cgpaSemesters,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Academic marks updated successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // RESUME ENDPOINTS
  // =================================================

  /**
   * POST /profile/resumes
   * Upload a new resume
   */
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

  /**
   * GET /profile/resumes
   * Get all resumes for the user
   */
  async getResumes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const result = await profileService.getUserResumes(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /profile/resumes/default
   * Get the default resume
   */
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

  /**
   * GET /profile/resumes/:resumeId
   * Get a specific resume
   */
  async getResume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resumeId = parseResumeId(req.params.resumeId);
      const resume = await profileService.getResume(userId, resumeId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /profile/resumes/:resumeId
   * Delete a resume
   */
  async deleteResume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resumeId = parseResumeId(req.params.resumeId);
      await profileService.deleteResume(userId, resumeId);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /profile/resumes/:resumeId/default
   * Set a resume as default
   */
  async setDefaultResume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resumeId = parseResumeId(req.params.resumeId);
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

  /**
   * GET /profile/resumes/:resumeId/text
   * Extract text from a resume
   */
  async extractResumeText(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resumeId = parseResumeId(req.params.resumeId);
      const result = await profileService.extractResumeText(userId, resumeId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /profile/resumes/:resumeId/link
   * Link resume to student profile
   */
  async linkResumeToProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const resumeId = parseResumeId(req.params.resumeId);
      await profileService.linkResumeToProfile(userId, resumeId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Resume linked to profile successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // =================================================
  // PRIVATE HELPERS
  // =================================================

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user?.id) {
      throw new BadRequestError('User ID not found in request');
    }
    return req.user.id;
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const profileController = new ProfileController();
export { ProfileController };
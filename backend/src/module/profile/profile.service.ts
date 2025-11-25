// src/module/profile/profile.service.ts

import { prisma } from '../../lib/db';
import { uploadResume, deleteFile } from '../../utils/cloudinary';
import {
  NotFoundError,
  BadRequestError,
  InternalError,
} from '../../lib/errors';
import { logger } from '../../utils/logger';
import { ResumeResponse } from './profile.types';
import { validateResumeFile } from './profile.validation';
import { CONSTANTS } from '../../config/constants';
import pdfParse from 'pdf-parse';
import { Resume } from '@prisma/client';

export class ProfileService {
  // ============= Private Helper Methods =============

  private mapResumeToResponse(resume: Resume): ResumeResponse {
    return {
      id: resume.id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      fileSize: resume.fileSize,
      mimeType: resume.mimeType,
      isDefault: resume.isDefault,
      createdAt: resume.createdAt,
    };
  }

  // ============= Resume Methods =============

  async uploadResume(
    userId: string,
    file: Express.Multer.File
  ): Promise<ResumeResponse> {
    logger.info('[ProfileService] Uploading resume', { userId });

    // Validate file
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      throw new BadRequestError(validation.error!);
    }

    // Upload to Cloudinary
    const uploadResult = await uploadResume(
      file.buffer,
      file.originalname,
      userId
    );

    try {
      const resume = await prisma.$transaction(async (tx) => {
        const existingResumes = await tx.resume.count({
          where: { userId },
        });

        return tx.resume.create({
          data: {
            userId,
            fileName: file.originalname,
            fileUrl: uploadResult.secureUrl,
            fileSize: file.size,
            mimeType: file.mimetype,
            isDefault: existingResumes === 0,
          },
        });
      });

      logger.info('[ProfileService] Resume uploaded successfully', {
        resumeId: resume.id,
        userId,
      });

      return this.mapResumeToResponse(resume);
    } catch (error) {
      // Cleanup Cloudinary on database failure
      try {
        await deleteFile(uploadResult.publicId, 'raw');
        logger.info('[ProfileService] Cleaned up Cloudinary file after database failure');
      } catch (cleanupError) {
        logger.error('[ProfileService] Failed to cleanup Cloudinary file', cleanupError);
      }

      logger.error('[ProfileService] Resume upload failed', error);
      throw new InternalError('Failed to upload resume');
    }
  }

  async getUserResumes(userId: string): Promise<ResumeResponse[]> {
    logger.debug('[ProfileService] Fetching resumes', { userId });

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return resumes.map((resume) => this.mapResumeToResponse(resume));
  }

  async getResume(userId: string, resumeId: number): Promise<ResumeResponse> {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume');
    }

    return this.mapResumeToResponse(resume);
  }

  async deleteResume(userId: string, resumeId: number): Promise<void> {
    logger.info('[ProfileService] Deleting resume', { resumeId, userId });

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume');
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.resume.delete({
          where: { id: resumeId },
        });

        if (resume.isDefault) {
          const nextResume = await tx.resume.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });

          if (nextResume) {
            await tx.resume.update({
              where: { id: nextResume.id },
              data: { isDefault: true },
            });
          }
        }
      });

      logger.info('[ProfileService] Resume deleted', { resumeId });
    } catch (error) {
      logger.error('[ProfileService] Resume deletion failed', error);
      throw new InternalError('Failed to delete resume');
    }
  }

  async setDefaultResume(userId: string, resumeId: number): Promise<ResumeResponse> {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume');
    }

    const updatedResume = await prisma.$transaction(async (tx) => {
      await tx.resume.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.resume.update({
        where: { id: resumeId },
        data: { isDefault: true },
      });
    });

    logger.info('[ProfileService] Default resume updated', { resumeId, userId });

    return this.mapResumeToResponse(updatedResume);
  }

  async getDefaultResume(userId: string): Promise<ResumeResponse | null> {
    const resume = await prisma.resume.findFirst({
      where: { userId, isDefault: true },
    });

    if (!resume) {
      return null;
    }

    return this.mapResumeToResponse(resume);
  }

  async extractResumeText(userId: string, resumeId: number): Promise<string> {
    logger.debug('[ProfileService] Extracting resume text', { resumeId, userId });

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume');
    }

    try {
      const response = await fetch(resume.fileUrl);

      if (!response.ok) {
        throw new InternalError('Failed to fetch resume file');
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const parsed = await pdfParse(buffer);

      if (parsed.text.trim().length < CONSTANTS.MIN_RESUME_LENGTH) {
        throw new BadRequestError('Resume appears to be empty or image-based');
      }

      logger.debug('[ProfileService] Resume text extracted', {
        resumeId,
        textLength: parsed.text.length,
      });

      return parsed.text;
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      logger.error('[ProfileService] Resume text extraction failed', error);
      throw new InternalError('Failed to extract resume text');
    }
  }
}

export const profileService = new ProfileService();
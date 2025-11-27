// src/module/profile/profile.service.ts

import { prisma } from '../../lib/db';
import { uploadResume, deleteFile } from '../../utils/cloudinary';
import {
  NotFoundError,
  BadRequestError,
  InternalError,
  ConflictError,
} from '../../utils/errors';
import { logger } from '../../utils/logger';
import {
  ResumeResponse,
  ResumeListResponse,
  StudentProfileResponse,
  UserProfileResponse,
  CompleteProfileResponse,
  ProfileCompletionStatus,
  mapResumeToResponse,
  mapStudentProfileToResponse,
  mapUserToProfileResponse,
  ExtractedResumeData,
} from './profile.types';
import {
  CreateStudentProfileInput,
  UpdateStudentProfileInput,
  UpdateUserProfileInput,
  validateResumeFile,
} from './profile.validation';
import { RESUME_LIMITS } from './profile.constants';
import pdfParse from 'pdf-parse';

// =====================================================
// SERVICE CLASS
// =====================================================

class ProfileService {
  // =================================================
  // USER PROFILE METHODS
  // =================================================

  /**
   * Get complete user profile with all related data
   */
  async getCompleteProfile(userId: string): Promise<CompleteProfileResponse> {
    logger.debug('[ProfileService] Fetching complete profile', { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        institute: { select: { name: true } },
        profile: true,
        resumes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const profileCompletion = this.calculateProfileCompletion(user);

    return {
      user: mapUserToProfileResponse(user),
      studentProfile: user.profile
        ? mapStudentProfileToResponse(user.profile)
        : null,
      resumes: user.resumes.map(mapResumeToResponse),
      profileCompletion,
    };
  }

  /**
   * Get basic user profile
   */
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    logger.debug('[ProfileService] Fetching user profile', { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        institute: { select: { name: true } },
        profile: true,
        resumes: { where: { isDefault: true }, take: 1 },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return mapUserToProfileResponse({
      ...user,
      resumes: user.resumes,
    });
  }

  /**
   * Update basic user profile (name, etc.)
   */
  async updateUserProfile(
    userId: string,
    input: UpdateUserProfileInput
  ): Promise<UserProfileResponse> {
    logger.info('[ProfileService] Updating user profile', { userId });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        updatedAt: new Date(),
      },
      include: {
        institute: { select: { name: true } },
        profile: true,
        resumes: { where: { isDefault: true }, take: 1 },
      },
    });

    logger.info('[ProfileService] User profile updated', { userId });
    return mapUserToProfileResponse(user);
  }

  // =================================================
  // STUDENT PROFILE METHODS
  // =================================================

  /**
   * Create student profile
   */
  async createStudentProfile(
    userId: string,
    input: CreateStudentProfileInput
  ): Promise<StudentProfileResponse> {
    logger.info('[ProfileService] Creating student profile', { userId });

    // Check if profile already exists
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictError('Student profile already exists');
    }

    // Check if studentId is unique
    const existingStudentId = await prisma.studentProfile.findUnique({
      where: { studentId: input.studentId },
    });

    if (existingStudentId) {
      throw new ConflictError('Student ID already registered');
    }

    // Calculate average CGPA if semesters provided
    const averageCgpa = this.calculateAverageCgpa(input.cgpaSemesters);

    const profile = await prisma.studentProfile.create({
      data: {
        userId,
        fullName: input.fullName,
        studentId: input.studentId,
        department: input.department,
        courseYear: input.courseYear,
        skills: input.skills || [],
        marks10: input.marks10,
        marks12: input.marks12,
        cgpaSemesters: input.cgpaSemesters || [],
        averageCgpa,
      },
    });

    logger.info('[ProfileService] Student profile created', {
      profileId: profile.id,
      userId,
    });

    return mapStudentProfileToResponse(profile);
  }

  /**
   * Get student profile
   */
  async getStudentProfile(userId: string): Promise<StudentProfileResponse | null> {
    logger.debug('[ProfileService] Fetching student profile', { userId });

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    return profile ? mapStudentProfileToResponse(profile) : null;
  }

  /**
   * Update student profile
   */
  async updateStudentProfile(
    userId: string,
    input: UpdateStudentProfileInput
  ): Promise<StudentProfileResponse> {
    logger.info('[ProfileService] Updating student profile', { userId });

    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundError('Student profile');
    }

    // Calculate new average CGPA if semesters updated
    const cgpaSemesters = input.cgpaSemesters ?? existingProfile.cgpaSemesters;
    const averageCgpa = this.calculateAverageCgpa(cgpaSemesters);

    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        ...input,
        averageCgpa,
        updatedAt: new Date(),
      },
    });

    logger.info('[ProfileService] Student profile updated', { userId });
    return mapStudentProfileToResponse(profile);
  }

  /**
   * Delete student profile
   */
  async deleteStudentProfile(userId: string): Promise<void> {
    logger.info('[ProfileService] Deleting student profile', { userId });

    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundError('Student profile');
    }

    await prisma.studentProfile.delete({
      where: { userId },
    });

    logger.info('[ProfileService] Student profile deleted', { userId });
  }

  /**
   * Add skills to student profile
   */
  async addSkills(userId: string, skills: string[]): Promise<StudentProfileResponse> {
    logger.info('[ProfileService] Adding skills', { userId, skillCount: skills.length });

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Student profile');
    }

    // Merge and deduplicate skills
    const existingSkills = new Set(profile.skills.map((s) => s.toLowerCase()));
    const newSkills = skills.filter((s) => !existingSkills.has(s.toLowerCase()));
    const updatedSkills = [...profile.skills, ...newSkills].slice(0, 20); // Max 20 skills

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: { skills: updatedSkills },
    });

    return mapStudentProfileToResponse(updatedProfile);
  }

  /**
   * Remove skills from student profile
   */
  async removeSkills(userId: string, skills: string[]): Promise<StudentProfileResponse> {
    logger.info('[ProfileService] Removing skills', { userId, skillCount: skills.length });

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Student profile');
    }

    const skillsToRemove = new Set(skills.map((s) => s.toLowerCase()));
    const updatedSkills = profile.skills.filter(
      (s) => !skillsToRemove.has(s.toLowerCase())
    );

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: { skills: updatedSkills },
    });

    return mapStudentProfileToResponse(updatedProfile);
  }

  /**
   * Update academic marks
   */
  async updateAcademicMarks(
    userId: string,
    marks: {
      marks10?: number;
      marks12?: number;
      cgpaSemesters?: number[];
    }
  ): Promise<StudentProfileResponse> {
    logger.info('[ProfileService] Updating academic marks', { userId });

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Student profile');
    }

    const cgpaSemesters = marks.cgpaSemesters ?? profile.cgpaSemesters;
    const averageCgpa = this.calculateAverageCgpa(cgpaSemesters);

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        marks10: marks.marks10 ?? profile.marks10,
        marks12: marks.marks12 ?? profile.marks12,
        cgpaSemesters,
        averageCgpa,
      },
    });

    return mapStudentProfileToResponse(updatedProfile);
  }

  // =================================================
  // RESUME METHODS
  // =================================================

  /**
   * Upload a new resume
   */
  async uploadResume(
    userId: string,
    file: Express.Multer.File
  ): Promise<ResumeResponse> {
    logger.info('[ProfileService] Uploading resume', {
      userId,
      fileName: file.originalname,
    });

    const validation = validateResumeFile(file);
    if (!validation.valid) {
      throw new BadRequestError(validation.error!);
    }

    const uploadResult = await uploadResume(file.buffer, file.originalname, userId);

    try {
      const resume = await prisma.$transaction(async (tx) => {
        const existingCount = await tx.resume.count({ where: { userId } });

        if (existingCount >= RESUME_LIMITS.MAX_PER_USER) {
          throw new BadRequestError(
            `Maximum ${RESUME_LIMITS.MAX_PER_USER} resumes allowed`
          );
        }

        return tx.resume.create({
          data: {
            userId,
            fileName: file.originalname,
            fileUrl: uploadResult.secureUrl,
            fileSize: file.size,
            mimeType: file.mimetype,
            isDefault: existingCount === 0,
          },
        });
      });

      logger.info('[ProfileService] Resume uploaded', {
        resumeId: resume.id,
        userId,
      });

      return mapResumeToResponse(resume);
    } catch (error) {
      // Cleanup uploaded file on failure
      await this.cleanupCloudinaryFile(uploadResult.publicId);

      if (error instanceof BadRequestError) throw error;

      logger.error('[ProfileService] Resume upload failed', error);
      throw new InternalError('Failed to upload resume');
    }
  }

  /**
   * Get all resumes for a user
   */
  async getUserResumes(userId: string): Promise<ResumeListResponse> {
    logger.debug('[ProfileService] Fetching resumes', { userId });

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      resumes: resumes.map(mapResumeToResponse),
      total: resumes.length,
      maxAllowed: RESUME_LIMITS.MAX_PER_USER,
    };
  }

  /**
   * Get a specific resume
   */
  async getResume(userId: string, resumeId: string): Promise<ResumeResponse> {
    const resume = await this.findResumeOrThrow(userId, resumeId);
    return mapResumeToResponse(resume);
  }

  /**
   * Get the default resume
   */
  async getDefaultResume(userId: string): Promise<ResumeResponse | null> {
    const resume = await prisma.resume.findFirst({
      where: { userId, isDefault: true },
    });

    return resume ? mapResumeToResponse(resume) : null;
  }

  /**
   * Delete a resume
   */
  async deleteResume(userId: string, resumeId: string): Promise<void> {
    logger.info('[ProfileService] Deleting resume', { resumeId, userId });

    const resume = await this.findResumeOrThrow(userId, resumeId);

    await prisma.$transaction(async (tx) => {
      await tx.resume.delete({ where: { id: resumeId } });

      // If deleted resume was default, set another as default
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

    // Cleanup from Cloudinary (fire and forget)
    this.extractPublicIdAndDelete(resume.fileUrl).catch((err) => {
      logger.error('[ProfileService] Failed to delete file from Cloudinary', err);
    });

    logger.info('[ProfileService] Resume deleted', { resumeId });
  }

  /**
   * Set a resume as default
   */
  async setDefaultResume(
    userId: string,
    resumeId: string
  ): Promise<ResumeResponse> {
    await this.findResumeOrThrow(userId, resumeId);

    const updatedResume = await prisma.$transaction(async (tx) => {
      // Unset current default
      await tx.resume.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      // Set new default
      return tx.resume.update({
        where: { id: resumeId },
        data: { isDefault: true },
      });
    });

    logger.info('[ProfileService] Default resume updated', { resumeId, userId });
    return mapResumeToResponse(updatedResume);
  }

  /**
   * Extract text from a resume
   */
  async extractResumeText(
    userId: string,
    resumeId: string
  ): Promise<ExtractedResumeData> {
    logger.debug('[ProfileService] Extracting resume text', { resumeId, userId });

    const resume = await this.findResumeOrThrow(userId, resumeId);

    if (resume.mimeType !== 'application/pdf') {
      throw new BadRequestError('Text extraction only supported for PDF files');
    }

    try {
      const response = await fetch(resume.fileUrl);

      if (!response.ok) {
        throw new InternalError('Failed to fetch resume file');
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const parsed = await pdfParse(buffer);

      if (parsed.text.trim().length < RESUME_LIMITS.MIN_TEXT_LENGTH) {
        throw new BadRequestError(
          'Resume appears to be empty or image-based. Please upload a text-based PDF.'
        );
      }

      const wordCount = parsed.text.split(/\s+/).filter(Boolean).length;

      logger.debug('[ProfileService] Resume text extracted', {
        resumeId,
        textLength: parsed.text.length,
        wordCount,
      });

      return {
        text: parsed.text,
        wordCount,
        pageCount: parsed.numpages,
      };
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }

      logger.error('[ProfileService] Resume text extraction failed', error);
      throw new InternalError('Failed to extract resume text');
    }
  }

  /**
   * Link resume to student profile
   */
  async linkResumeToProfile(userId: string, resumeId: string): Promise<void> {
    const resume = await this.findResumeOrThrow(userId, resumeId);
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Student profile');
    }

    await prisma.studentProfile.update({
      where: { userId },
      data: {
        resumeUrl: resume.fileUrl,
        resumeName: resume.fileName,
      },
    });

    logger.info('[ProfileService] Resume linked to profile', { userId, resumeId });
  }

  // =================================================
  // PRIVATE HELPER METHODS
  // =================================================

  private async findResumeOrThrow(userId: string, resumeId: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume');
    }

    return resume;
  }

  private calculateAverageCgpa(cgpaSemesters?: number[]): number | null {
    if (!cgpaSemesters || cgpaSemesters.length === 0) {
      return null;
    }

    const sum = cgpaSemesters.reduce((acc, cgpa) => acc + cgpa, 0);
    return Math.round((sum / cgpaSemesters.length) * 100) / 100;
  }

  private calculateProfileCompletion(user: {
    name: string | null;
    profile: {
      fullName: string;
      studentId: string;
      department: string;
      courseYear: string;
      skills: string[];
      marks10: number | null;
      marks12: number | null;
      cgpaSemesters: number[];
    } | null;
    resumes: { id: string }[];
  }): ProfileCompletionStatus {
    const missingFields: string[] = [];
    let totalFields = 0;
    let completedFields = 0;

    // User fields
    totalFields += 1;
    if (user.name) {
      completedFields += 1;
    } else {
      missingFields.push('name');
    }

    // Student profile fields
    if (user.profile) {
      const profileFields = [
        { key: 'fullName', value: user.profile.fullName },
        { key: 'studentId', value: user.profile.studentId },
        { key: 'department', value: user.profile.department },
        { key: 'courseYear', value: user.profile.courseYear },
        { key: 'skills', value: user.profile.skills.length > 0 },
        { key: 'marks10', value: user.profile.marks10 !== null },
        { key: 'marks12', value: user.profile.marks12 !== null },
        { key: 'cgpa', value: user.profile.cgpaSemesters.length > 0 },
      ];

      totalFields += profileFields.length;

      profileFields.forEach((field) => {
        if (field.value) {
          completedFields += 1;
        } else {
          missingFields.push(field.key);
        }
      });
    } else {
      totalFields += 8;
      missingFields.push('studentProfile');
    }

    // Resume
    totalFields += 1;
    if (user.resumes.length > 0) {
      completedFields += 1;
    } else {
      missingFields.push('resume');
    }

    const percentage = Math.round((completedFields / totalFields) * 100);

    return {
      percentage,
      missingFields,
      isComplete: missingFields.length === 0,
    };
  }

  private async cleanupCloudinaryFile(publicId: string): Promise<void> {
    try {
      await deleteFile(publicId, 'raw');
      logger.info('[ProfileService] Cleaned up Cloudinary file', { publicId });
    } catch (error) {
      logger.error('[ProfileService] Failed to cleanup Cloudinary file', error);
    }
  }

  private async extractPublicIdAndDelete(fileUrl: string): Promise<void> {
    // Extract public ID from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud}/raw/upload/v123/{folder}/{publicId}.pdf
    const match = fileUrl.match(/\/upload\/v\d+\/(.+)\.\w+$/);
    if (match && match[1]) {
      await deleteFile(match[1], 'raw');
    }
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const profileService = new ProfileService();
export { ProfileService };
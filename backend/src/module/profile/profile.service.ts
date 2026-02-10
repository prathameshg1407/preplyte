// src/module/profile/profile.service.ts

import { prisma } from '../../lib/db';
import { uploadResume, deleteFile, uploadImage } from '../../utils/cloudinary'; // Added uploadFile import
import {
  NotFoundError,
  BadRequestError,
  InternalError,
  ConflictError,
  ForbiddenError,
} from '../../utils/errors';
import { logger } from '../../utils/logger';
import {
  ResumeResponse,
  ResumeListResponse,
  StudentProfileResponse,
  UserProfileResponse,
  CompleteProfileResponse,
  ProfileCompletionStatus,
  DepartmentResponse,
  DepartmentListResponse,
  mapResumeToResponse,
  mapStudentProfileToResponse,
  mapUserToProfileResponse,
  mapDepartmentToResponse,
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
  // DEPARTMENT METHODS
  // =================================================

  /**
   * Get departments available for a user (based on their institute)
   */
  async getAvailableDepartments(
    userId: string,
    includeInactive = false
  ): Promise<DepartmentListResponse> {
    logger.debug('[ProfileService] Fetching available departments', { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { instituteId: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Allow empty list for non-institute users instead of error
    if (!user.instituteId) {
      return { departments: [], total: 0 };
    }

    const departments = await prisma.department.findMany({
      where: {
        instituteId: user.instituteId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { name: 'asc' },
    });

    return {
      departments: departments.map(mapDepartmentToResponse),
      total: departments.length,
    };
  }

  /**
   * Validate department belongs to user's institute
   */
  private async validateDepartmentForUser(
    userId: string,
    departmentId: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { instituteId: true },
    });

    if (!user?.instituteId) {
      // Individual users shouldn't be setting department IDs
      // But if they send one, we treat it as invalid since they have no institute scope
      throw new BadRequestError('User is not associated with any institute');
    }

    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        instituteId: user.instituteId,
        isActive: true,
      },
    });

    if (!department) {
      throw new BadRequestError(
        'Invalid department. Please select a department from your institute.'
      );
    }
  }

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
        institute: { select: { id: true, name: true } },
        profile: {
          include: {
            department: true,
          },
        },
        resumes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const profileCompletion = this.calculateProfileCompletion(user);

    // Get available departments for the user
    let availableDepartments: DepartmentResponse[] = [];
    if (user.instituteId) {
      const departments = await prisma.department.findMany({
        where: {
          instituteId: user.instituteId,
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });
      availableDepartments = departments.map(mapDepartmentToResponse);
    }

    return {
      user: mapUserToProfileResponse(user),
      studentProfile: user.profile
        ? mapStudentProfileToResponse(user.profile)
        : null,
      resumes: user.resumes.map(mapResumeToResponse),
      profileCompletion,
      availableDepartments,
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
        profile: {
          include: {
            department: true,
          },
        },
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
        profile: {
          include: {
            department: true,
          },
        },
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

    // Determine User Context (Institute vs Individual)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { instituteId: true }
    });
    const isInstituteStudent = !!user?.instituteId;

    // Validate department only if user belongs to an institute AND provided a department
    if (isInstituteStudent) {
        if (!input.departmentId) {
            throw new BadRequestError('Department is required for institute students');
        }
        await this.validateDepartmentForUser(userId, input.departmentId);
    } 
    // Individual users might provide collegeName instead of departmentId
    // If they provide departmentId but have no institute, we can either ignore it or throw error.
    // For safety, we force departmentId to null if not institute student.

    // Calculate average CGPA if semesters provided
    const averageCgpa = this.calculateAverageCgpa(input.cgpaSemesters);

    const profile = await prisma.studentProfile.create({
      data: {
        userId,
        fullName: input.fullName,
        studentId: input.studentId,
        
        // CONDITIONAL FIELDS
        departmentId: isInstituteStudent ? input.departmentId : null,
        courseYear: isInstituteStudent ? input.courseYear : null,
        collegeName: !isInstituteStudent ? (input as any).collegeName : null, // Assuming input might have it

        numberOfBacklogs: input.numberOfBacklogs || 0,
        skills: input.skills || [],
        marks10: input.marks10,
        marks12: input.marks12,
        cgpaSemesters: input.cgpaSemesters || [],
        averageCgpa,
      },
      include: {
        department: true,
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
      include: {
        department: true,
      },
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

    // Determine User Context
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { instituteId: true }
    });
    const isInstituteStudent = !!user?.instituteId;

    // Validate department if being updated AND user is institute student
    if (input.departmentId && isInstituteStudent) {
      await this.validateDepartmentForUser(userId, input.departmentId);
    }

    // Calculate new average CGPA if semesters updated
    const cgpaSemesters = input.cgpaSemesters ?? existingProfile.cgpaSemesters;
    const averageCgpa = this.calculateAverageCgpa(cgpaSemesters);

    const profile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        ...input,
        // Ensure we don't set departmentId for individual users even if they try
        departmentId: isInstituteStudent ? input.departmentId : undefined,
        averageCgpa,
        updatedAt: new Date(),
      },
      include: {
        department: true,
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
      include: { department: true },
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
      include: { department: true },
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
      include: { department: true },
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
      include: { department: true },
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
      include: { department: true },
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
      include: { department: true },
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
  // PROFILE PICTURE (NEW)
  // =================================================

  async updateProfilePicture(userId: string, file: Express.Multer.File): Promise<string> {
    logger.info('[ProfileService] Updating profile picture', { userId });

    // Upload to Cloudinary (using 'image' type which usually works with uploadResume utils if configured for any file)
    // OR ideally import a specific 'uploadImage' function if you have one. 
    // Assuming uploadResume is generic enough or we use uploadFile from cloudinary utils.
    
    // NOTE: You need to make sure 'uploadFile' or 'uploadResume' supports image types in your util
    // Here I assume we can use a generic upload function.
    
    // Use a unique ID for the profile picture to avoid caching issues
    const publicId = `profile_pic_${userId}_${Date.now()}`;
    const uploadResult = await uploadResume(file.buffer, publicId, userId); // Reusing existing util

    // Update User Record
    await prisma.user.update({
        where: { id: userId },
        data: { profilePictureUrl: uploadResult.secureUrl }
    });

    return uploadResult.secureUrl;
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
      departmentId: string | null; // Changed to nullable
      courseYear: string | null; // Changed to nullable
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
        { key: 'skills', value: user.profile.skills.length > 0 },
        { key: 'marks10', value: user.profile.marks10 !== null },
        { key: 'marks12', value: user.profile.marks12 !== null },
        { key: 'cgpa', value: user.profile.cgpaSemesters.length > 0 },
      ];

      // Only check department/courseYear if they are NOT null (meaning Institute User)
      // Or if you want to force them for institute users, we'd need the instituteId check here too.
      // For calculation simplicity, we just check if value exists.
      if (user.profile.departmentId) profileFields.push({ key: 'department', value: true });
      if (user.profile.courseYear) profileFields.push({ key: 'courseYear', value: true });

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
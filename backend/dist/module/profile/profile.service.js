"use strict";
// src/module/profile/profile.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = exports.profileService = void 0;
const db_1 = require("../../lib/db");
const cloudinary_1 = require("../../utils/cloudinary");
const errors_1 = require("../../utils/errors");
const logger_1 = require("../../utils/logger");
const profile_types_1 = require("./profile.types");
const profile_validation_1 = require("./profile.validation");
const profile_constants_1 = require("./profile.constants");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
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
    async getCompleteProfile(userId) {
        logger_1.logger.debug('[ProfileService] Fetching complete profile', { userId });
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                institute: { select: { name: true } },
                profile: true,
                resumes: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User');
        }
        const profileCompletion = this.calculateProfileCompletion(user);
        return {
            user: (0, profile_types_1.mapUserToProfileResponse)(user),
            studentProfile: user.profile
                ? (0, profile_types_1.mapStudentProfileToResponse)(user.profile)
                : null,
            resumes: user.resumes.map(profile_types_1.mapResumeToResponse),
            profileCompletion,
        };
    }
    /**
     * Get basic user profile
     */
    async getUserProfile(userId) {
        logger_1.logger.debug('[ProfileService] Fetching user profile', { userId });
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                institute: { select: { name: true } },
                profile: true,
                resumes: { where: { isDefault: true }, take: 1 },
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User');
        }
        return (0, profile_types_1.mapUserToProfileResponse)({
            ...user,
            resumes: user.resumes,
        });
    }
    /**
     * Update basic user profile (name, etc.)
     */
    async updateUserProfile(userId, input) {
        logger_1.logger.info('[ProfileService] Updating user profile', { userId });
        const user = await db_1.prisma.user.update({
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
        logger_1.logger.info('[ProfileService] User profile updated', { userId });
        return (0, profile_types_1.mapUserToProfileResponse)(user);
    }
    // =================================================
    // STUDENT PROFILE METHODS
    // =================================================
    /**
     * Create student profile
     */
    async createStudentProfile(userId, input) {
        logger_1.logger.info('[ProfileService] Creating student profile', { userId });
        // Check if profile already exists
        const existingProfile = await db_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        if (existingProfile) {
            throw new errors_1.ConflictError('Student profile already exists');
        }
        // Check if studentId is unique
        const existingStudentId = await db_1.prisma.studentProfile.findUnique({
            where: { studentId: input.studentId },
        });
        if (existingStudentId) {
            throw new errors_1.ConflictError('Student ID already registered');
        }
        // Calculate average CGPA if semesters provided
        const averageCgpa = this.calculateAverageCgpa(input.cgpaSemesters);
        const profile = await db_1.prisma.studentProfile.create({
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
        logger_1.logger.info('[ProfileService] Student profile created', {
            profileId: profile.id,
            userId,
        });
        return (0, profile_types_1.mapStudentProfileToResponse)(profile);
    }
    /**
     * Get student profile
     */
    async getStudentProfile(userId) {
        logger_1.logger.debug('[ProfileService] Fetching student profile', { userId });
        const profile = await db_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        return profile ? (0, profile_types_1.mapStudentProfileToResponse)(profile) : null;
    }
    /**
     * Update student profile
     */
    async updateStudentProfile(userId, input) {
        logger_1.logger.info('[ProfileService] Updating student profile', { userId });
        const existingProfile = await db_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        if (!existingProfile) {
            throw new errors_1.NotFoundError('Student profile');
        }
        // Calculate new average CGPA if semesters updated
        const cgpaSemesters = input.cgpaSemesters ?? existingProfile.cgpaSemesters;
        const averageCgpa = this.calculateAverageCgpa(cgpaSemesters);
        const profile = await db_1.prisma.studentProfile.update({
            where: { userId },
            data: {
                ...input,
                averageCgpa,
                updatedAt: new Date(),
            },
        });
        logger_1.logger.info('[ProfileService] Student profile updated', { userId });
        return (0, profile_types_1.mapStudentProfileToResponse)(profile);
    }
    /**
     * Delete student profile
     */
    async deleteStudentProfile(userId) {
        logger_1.logger.info('[ProfileService] Deleting student profile', { userId });
        const existingProfile = await db_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        if (!existingProfile) {
            throw new errors_1.NotFoundError('Student profile');
        }
        await db_1.prisma.studentProfile.delete({
            where: { userId },
        });
        logger_1.logger.info('[ProfileService] Student profile deleted', { userId });
    }
    /**
     * Add skills to student profile
     */
    async addSkills(userId, skills) {
        logger_1.logger.info('[ProfileService] Adding skills', { userId, skillCount: skills.length });
        const profile = await db_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new errors_1.NotFoundError('Student profile');
        }
        // Merge and deduplicate skills
        const existingSkills = new Set(profile.skills.map((s) => s.toLowerCase()));
        const newSkills = skills.filter((s) => !existingSkills.has(s.toLowerCase()));
        const updatedSkills = [...profile.skills, ...newSkills].slice(0, 20); // Max 20 skills
        const updatedProfile = await db_1.prisma.studentProfile.update({
            where: { userId },
            data: { skills: updatedSkills },
        });
        return (0, profile_types_1.mapStudentProfileToResponse)(updatedProfile);
    }
    /**
     * Remove skills from student profile
     */
    async removeSkills(userId, skills) {
        logger_1.logger.info('[ProfileService] Removing skills', { userId, skillCount: skills.length });
        const profile = await db_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new errors_1.NotFoundError('Student profile');
        }
        const skillsToRemove = new Set(skills.map((s) => s.toLowerCase()));
        const updatedSkills = profile.skills.filter((s) => !skillsToRemove.has(s.toLowerCase()));
        const updatedProfile = await db_1.prisma.studentProfile.update({
            where: { userId },
            data: { skills: updatedSkills },
        });
        return (0, profile_types_1.mapStudentProfileToResponse)(updatedProfile);
    }
    /**
     * Update academic marks
     */
    async updateAcademicMarks(userId, marks) {
        logger_1.logger.info('[ProfileService] Updating academic marks', { userId });
        const profile = await db_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new errors_1.NotFoundError('Student profile');
        }
        const cgpaSemesters = marks.cgpaSemesters ?? profile.cgpaSemesters;
        const averageCgpa = this.calculateAverageCgpa(cgpaSemesters);
        const updatedProfile = await db_1.prisma.studentProfile.update({
            where: { userId },
            data: {
                marks10: marks.marks10 ?? profile.marks10,
                marks12: marks.marks12 ?? profile.marks12,
                cgpaSemesters,
                averageCgpa,
            },
        });
        return (0, profile_types_1.mapStudentProfileToResponse)(updatedProfile);
    }
    // =================================================
    // RESUME METHODS
    // =================================================
    /**
     * Upload a new resume
     */
    async uploadResume(userId, file) {
        logger_1.logger.info('[ProfileService] Uploading resume', {
            userId,
            fileName: file.originalname,
        });
        const validation = (0, profile_validation_1.validateResumeFile)(file);
        if (!validation.valid) {
            throw new errors_1.BadRequestError(validation.error);
        }
        const uploadResult = await (0, cloudinary_1.uploadResume)(file.buffer, file.originalname, userId);
        try {
            const resume = await db_1.prisma.$transaction(async (tx) => {
                const existingCount = await tx.resume.count({ where: { userId } });
                if (existingCount >= profile_constants_1.RESUME_LIMITS.MAX_PER_USER) {
                    throw new errors_1.BadRequestError(`Maximum ${profile_constants_1.RESUME_LIMITS.MAX_PER_USER} resumes allowed`);
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
            logger_1.logger.info('[ProfileService] Resume uploaded', {
                resumeId: resume.id,
                userId,
            });
            return (0, profile_types_1.mapResumeToResponse)(resume);
        }
        catch (error) {
            // Cleanup uploaded file on failure
            await this.cleanupCloudinaryFile(uploadResult.publicId);
            if (error instanceof errors_1.BadRequestError)
                throw error;
            logger_1.logger.error('[ProfileService] Resume upload failed', error);
            throw new errors_1.InternalError('Failed to upload resume');
        }
    }
    /**
     * Get all resumes for a user
     */
    async getUserResumes(userId) {
        logger_1.logger.debug('[ProfileService] Fetching resumes', { userId });
        const resumes = await db_1.prisma.resume.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return {
            resumes: resumes.map(profile_types_1.mapResumeToResponse),
            total: resumes.length,
            maxAllowed: profile_constants_1.RESUME_LIMITS.MAX_PER_USER,
        };
    }
    /**
     * Get a specific resume
     */
    async getResume(userId, resumeId) {
        const resume = await this.findResumeOrThrow(userId, resumeId);
        return (0, profile_types_1.mapResumeToResponse)(resume);
    }
    /**
     * Get the default resume
     */
    async getDefaultResume(userId) {
        const resume = await db_1.prisma.resume.findFirst({
            where: { userId, isDefault: true },
        });
        return resume ? (0, profile_types_1.mapResumeToResponse)(resume) : null;
    }
    /**
     * Delete a resume
     */
    async deleteResume(userId, resumeId) {
        logger_1.logger.info('[ProfileService] Deleting resume', { resumeId, userId });
        const resume = await this.findResumeOrThrow(userId, resumeId);
        await db_1.prisma.$transaction(async (tx) => {
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
            logger_1.logger.error('[ProfileService] Failed to delete file from Cloudinary', err);
        });
        logger_1.logger.info('[ProfileService] Resume deleted', { resumeId });
    }
    /**
     * Set a resume as default
     */
    async setDefaultResume(userId, resumeId) {
        await this.findResumeOrThrow(userId, resumeId);
        const updatedResume = await db_1.prisma.$transaction(async (tx) => {
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
        logger_1.logger.info('[ProfileService] Default resume updated', { resumeId, userId });
        return (0, profile_types_1.mapResumeToResponse)(updatedResume);
    }
    /**
     * Extract text from a resume
     */
    async extractResumeText(userId, resumeId) {
        logger_1.logger.debug('[ProfileService] Extracting resume text', { resumeId, userId });
        const resume = await this.findResumeOrThrow(userId, resumeId);
        if (resume.mimeType !== 'application/pdf') {
            throw new errors_1.BadRequestError('Text extraction only supported for PDF files');
        }
        try {
            const response = await fetch(resume.fileUrl);
            if (!response.ok) {
                throw new errors_1.InternalError('Failed to fetch resume file');
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            const parsed = await (0, pdf_parse_1.default)(buffer);
            if (parsed.text.trim().length < profile_constants_1.RESUME_LIMITS.MIN_TEXT_LENGTH) {
                throw new errors_1.BadRequestError('Resume appears to be empty or image-based. Please upload a text-based PDF.');
            }
            const wordCount = parsed.text.split(/\s+/).filter(Boolean).length;
            logger_1.logger.debug('[ProfileService] Resume text extracted', {
                resumeId,
                textLength: parsed.text.length,
                wordCount,
            });
            return {
                text: parsed.text,
                wordCount,
                pageCount: parsed.numpages,
            };
        }
        catch (error) {
            if (error instanceof errors_1.BadRequestError || error instanceof errors_1.NotFoundError) {
                throw error;
            }
            logger_1.logger.error('[ProfileService] Resume text extraction failed', error);
            throw new errors_1.InternalError('Failed to extract resume text');
        }
    }
    /**
     * Link resume to student profile
     */
    async linkResumeToProfile(userId, resumeId) {
        const resume = await this.findResumeOrThrow(userId, resumeId);
        const profile = await db_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new errors_1.NotFoundError('Student profile');
        }
        await db_1.prisma.studentProfile.update({
            where: { userId },
            data: {
                resumeUrl: resume.fileUrl,
                resumeName: resume.fileName,
            },
        });
        logger_1.logger.info('[ProfileService] Resume linked to profile', { userId, resumeId });
    }
    // =================================================
    // PRIVATE HELPER METHODS
    // =================================================
    async findResumeOrThrow(userId, resumeId) {
        const resume = await db_1.prisma.resume.findFirst({
            where: { id: resumeId, userId },
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume');
        }
        return resume;
    }
    calculateAverageCgpa(cgpaSemesters) {
        if (!cgpaSemesters || cgpaSemesters.length === 0) {
            return null;
        }
        const sum = cgpaSemesters.reduce((acc, cgpa) => acc + cgpa, 0);
        return Math.round((sum / cgpaSemesters.length) * 100) / 100;
    }
    calculateProfileCompletion(user) {
        const missingFields = [];
        let totalFields = 0;
        let completedFields = 0;
        // User fields
        totalFields += 1;
        if (user.name) {
            completedFields += 1;
        }
        else {
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
                }
                else {
                    missingFields.push(field.key);
                }
            });
        }
        else {
            totalFields += 8;
            missingFields.push('studentProfile');
        }
        // Resume
        totalFields += 1;
        if (user.resumes.length > 0) {
            completedFields += 1;
        }
        else {
            missingFields.push('resume');
        }
        const percentage = Math.round((completedFields / totalFields) * 100);
        return {
            percentage,
            missingFields,
            isComplete: missingFields.length === 0,
        };
    }
    async cleanupCloudinaryFile(publicId) {
        try {
            await (0, cloudinary_1.deleteFile)(publicId, 'raw');
            logger_1.logger.info('[ProfileService] Cleaned up Cloudinary file', { publicId });
        }
        catch (error) {
            logger_1.logger.error('[ProfileService] Failed to cleanup Cloudinary file', error);
        }
    }
    async extractPublicIdAndDelete(fileUrl) {
        // Extract public ID from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud}/raw/upload/v123/{folder}/{publicId}.pdf
        const match = fileUrl.match(/\/upload\/v\d+\/(.+)\.\w+$/);
        if (match && match[1]) {
            await (0, cloudinary_1.deleteFile)(match[1], 'raw');
        }
    }
}
exports.ProfileService = ProfileService;
// =====================================================
// SINGLETON EXPORT
// =====================================================
exports.profileService = new ProfileService();
//# sourceMappingURL=profile.service.js.map
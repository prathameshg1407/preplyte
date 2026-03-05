"use strict";
// src/module/profile/profile.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = exports.profileController = void 0;
const profile_service_1 = require("./profile.service");
const profile_validation_1 = require("./profile.validation");
const errors_1 = require("../../utils/errors");
const profile_constants_1 = require("./profile.constants");
// =====================================================
// CONTROLLER CLASS
// =====================================================
class ProfileController {
    constructor() {
        // Bind all methods to preserve 'this' context
        this.getCompleteProfile = this.getCompleteProfile.bind(this);
        this.getUserProfile = this.getUserProfile.bind(this);
        this.updateUserProfile = this.updateUserProfile.bind(this);
        this.getAvailableDepartments = this.getAvailableDepartments.bind(this);
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
    async getCompleteProfile(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const profile = await profile_service_1.profileService.getCompleteProfile(userId);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /profile/user
     * Get basic user profile
     */
    async getUserProfile(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const profile = await profile_service_1.profileService.getUserProfile(userId);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /profile/user
     * Update basic user profile
     */
    async updateUserProfile(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const input = (0, profile_validation_1.parseUpdateUserProfile)(req.body);
            const profile = await profile_service_1.profileService.updateUserProfile(userId, input);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Profile updated successfully',
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // =================================================
    // DEPARTMENT ENDPOINTS
    // =================================================
    /**
     * GET /profile/departments
     * Get available departments for the user's institute
     */
    async getAvailableDepartments(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const query = (0, profile_validation_1.parseDepartmentQuery)(req.query);
            const result = await profile_service_1.profileService.getAvailableDepartments(userId, query.includeInactive);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
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
    async createStudentProfile(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const input = (0, profile_validation_1.parseCreateStudentProfile)(req.body);
            const profile = await profile_service_1.profileService.createStudentProfile(userId, input);
            res.status(profile_constants_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Student profile created successfully',
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /profile/student
     * Get student profile
     */
    async getStudentProfile(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const profile = await profile_service_1.profileService.getStudentProfile(userId);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /profile/student
     * Update student profile
     */
    async updateStudentProfile(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const input = (0, profile_validation_1.parseUpdateStudentProfile)(req.body);
            const profile = await profile_service_1.profileService.updateStudentProfile(userId, input);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Student profile updated successfully',
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /profile/student
     * Delete student profile
     */
    async deleteStudentProfile(req, res, next) {
        try {
            const userId = this.getUserId(req);
            await profile_service_1.profileService.deleteStudentProfile(userId);
            res.status(profile_constants_1.HTTP_STATUS.NO_CONTENT).send();
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /profile/student/skills
     * Add skills to student profile
     */
    async addSkills(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const { skills } = req.body;
            if (!Array.isArray(skills) || skills.length === 0) {
                throw new errors_1.BadRequestError('Skills array is required');
            }
            const profile = await profile_service_1.profileService.addSkills(userId, skills);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Skills added successfully',
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /profile/student/skills
     * Remove skills from student profile
     */
    async removeSkills(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const { skills } = req.body;
            if (!Array.isArray(skills) || skills.length === 0) {
                throw new errors_1.BadRequestError('Skills array is required');
            }
            const profile = await profile_service_1.profileService.removeSkills(userId, skills);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Skills removed successfully',
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /profile/student/academics
     * Update academic marks
     */
    async updateAcademicMarks(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const { marks10, marks12, cgpaSemesters } = req.body;
            const profile = await profile_service_1.profileService.updateAcademicMarks(userId, {
                marks10,
                marks12,
                cgpaSemesters,
            });
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Academic marks updated successfully',
                data: profile,
            });
        }
        catch (error) {
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
    async uploadResume(req, res, next) {
        try {
            const userId = this.getUserId(req);
            if (!req.file) {
                throw new errors_1.BadRequestError('No file provided');
            }
            const resume = await profile_service_1.profileService.uploadResume(userId, req.file);
            res.status(profile_constants_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Resume uploaded successfully',
                data: resume,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /profile/resumes
     * Get all resumes for the user
     */
    async getResumes(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const result = await profile_service_1.profileService.getUserResumes(userId);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /profile/resumes/default
     * Get the default resume
     */
    async getDefaultResume(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const resume = await profile_service_1.profileService.getDefaultResume(userId);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: resume,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /profile/resumes/:resumeId
     * Get a specific resume
     */
    async getResume(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const resumeId = (0, profile_validation_1.parseResumeId)(req.params.resumeId);
            const resume = await profile_service_1.profileService.getResume(userId, resumeId);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: resume,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /profile/resumes/:resumeId
     * Delete a resume
     */
    async deleteResume(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const resumeId = (0, profile_validation_1.parseResumeId)(req.params.resumeId);
            await profile_service_1.profileService.deleteResume(userId, resumeId);
            res.status(profile_constants_1.HTTP_STATUS.NO_CONTENT).send();
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /profile/resumes/:resumeId/default
     * Set a resume as default
     */
    async setDefaultResume(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const resumeId = (0, profile_validation_1.parseResumeId)(req.params.resumeId);
            const resume = await profile_service_1.profileService.setDefaultResume(userId, resumeId);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Default resume updated',
                data: resume,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /profile/resumes/:resumeId/text
     * Extract text from a resume
     */
    async extractResumeText(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const resumeId = (0, profile_validation_1.parseResumeId)(req.params.resumeId);
            const result = await profile_service_1.profileService.extractResumeText(userId, resumeId);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /profile/resumes/:resumeId/link
     * Link resume to student profile
     */
    async linkResumeToProfile(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const resumeId = (0, profile_validation_1.parseResumeId)(req.params.resumeId);
            await profile_service_1.profileService.linkResumeToProfile(userId, resumeId);
            res.status(profile_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Resume linked to profile successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // =================================================
    // PRIVATE HELPERS
    // =================================================
    getUserId(req) {
        if (!req.user?.id) {
            throw new errors_1.BadRequestError('User ID not found in request');
        }
        return req.user.id;
    }
}
exports.ProfileController = ProfileController;
// =====================================================
// SINGLETON EXPORT
// =====================================================
exports.profileController = new ProfileController();
//# sourceMappingURL=profile.controller.js.map
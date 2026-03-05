import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
declare class ProfileController {
    constructor();
    /**
     * GET /profile
     * Get complete user profile with all related data
     */
    getCompleteProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /profile/user
     * Get basic user profile
     */
    getUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /profile/user
     * Update basic user profile
     */
    updateUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /profile/departments
     * Get available departments for the user's institute
     */
    getAvailableDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /profile/student
     * Create student profile
     */
    createStudentProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /profile/student
     * Get student profile
     */
    getStudentProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /profile/student
     * Update student profile
     */
    updateStudentProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /profile/student
     * Delete student profile
     */
    deleteStudentProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /profile/student/skills
     * Add skills to student profile
     */
    addSkills(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /profile/student/skills
     * Remove skills from student profile
     */
    removeSkills(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /profile/student/academics
     * Update academic marks
     */
    updateAcademicMarks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /profile/resumes
     * Upload a new resume
     */
    uploadResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /profile/resumes
     * Get all resumes for the user
     */
    getResumes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /profile/resumes/default
     * Get the default resume
     */
    getDefaultResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /profile/resumes/:resumeId
     * Get a specific resume
     */
    getResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /profile/resumes/:resumeId
     * Delete a resume
     */
    deleteResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /profile/resumes/:resumeId/default
     * Set a resume as default
     */
    setDefaultResume(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /profile/resumes/:resumeId/text
     * Extract text from a resume
     */
    extractResumeText(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /profile/resumes/:resumeId/link
     * Link resume to student profile
     */
    linkResumeToProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    private getUserId;
}
export declare const profileController: ProfileController;
export { ProfileController };
//# sourceMappingURL=profile.controller.d.ts.map
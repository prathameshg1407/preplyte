import { ResumeResponse, ResumeListResponse, StudentProfileResponse, UserProfileResponse, CompleteProfileResponse, ExtractedResumeData } from './profile.types';
import { CreateStudentProfileInput, UpdateStudentProfileInput, UpdateUserProfileInput } from './profile.validation';
declare class ProfileService {
    /**
     * Get complete user profile with all related data
     */
    getCompleteProfile(userId: string): Promise<CompleteProfileResponse>;
    /**
     * Get basic user profile
     */
    getUserProfile(userId: string): Promise<UserProfileResponse>;
    /**
     * Update basic user profile (name, etc.)
     */
    updateUserProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfileResponse>;
    /**
     * Create student profile
     */
    createStudentProfile(userId: string, input: CreateStudentProfileInput): Promise<StudentProfileResponse>;
    /**
     * Get student profile
     */
    getStudentProfile(userId: string): Promise<StudentProfileResponse | null>;
    /**
     * Update student profile
     */
    updateStudentProfile(userId: string, input: UpdateStudentProfileInput): Promise<StudentProfileResponse>;
    /**
     * Delete student profile
     */
    deleteStudentProfile(userId: string): Promise<void>;
    /**
     * Add skills to student profile
     */
    addSkills(userId: string, skills: string[]): Promise<StudentProfileResponse>;
    /**
     * Remove skills from student profile
     */
    removeSkills(userId: string, skills: string[]): Promise<StudentProfileResponse>;
    /**
     * Update academic marks
     */
    updateAcademicMarks(userId: string, marks: {
        marks10?: number;
        marks12?: number;
        cgpaSemesters?: number[];
    }): Promise<StudentProfileResponse>;
    /**
     * Upload a new resume
     */
    uploadResume(userId: string, file: Express.Multer.File): Promise<ResumeResponse>;
    /**
     * Get all resumes for a user
     */
    getUserResumes(userId: string): Promise<ResumeListResponse>;
    /**
     * Get a specific resume
     */
    getResume(userId: string, resumeId: string): Promise<ResumeResponse>;
    /**
     * Get the default resume
     */
    getDefaultResume(userId: string): Promise<ResumeResponse | null>;
    /**
     * Delete a resume
     */
    deleteResume(userId: string, resumeId: string): Promise<void>;
    /**
     * Set a resume as default
     */
    setDefaultResume(userId: string, resumeId: string): Promise<ResumeResponse>;
    /**
     * Extract text from a resume
     */
    extractResumeText(userId: string, resumeId: string): Promise<ExtractedResumeData>;
    /**
     * Link resume to student profile
     */
    linkResumeToProfile(userId: string, resumeId: string): Promise<void>;
    private findResumeOrThrow;
    private calculateAverageCgpa;
    private calculateProfileCompletion;
    private cleanupCloudinaryFile;
    private extractPublicIdAndDelete;
}
export declare const profileService: ProfileService;
export { ProfileService };
//# sourceMappingURL=profile.service.d.ts.map
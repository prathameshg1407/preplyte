"use strict";
// src/module/profile/profile.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const profile_controller_1 = require("./profile.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const profile_constants_1 = require("./profile.constants");
const router = (0, express_1.Router)();
exports.profileRoutes = router;
// =====================================================
// MULTER CONFIGURATION
// =====================================================
const resumeUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: profile_constants_1.RESUME_LIMITS.MAX_FILE_SIZE,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = profile_constants_1.ALLOWED_RESUME_MIME_TYPES;
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
        }
    },
});
// =====================================================
// ALL ROUTES REQUIRE AUTHENTICATION
// =====================================================
router.use(auth_middleware_1.authenticate);
// =====================================================
// COMPLETE PROFILE
// =====================================================
// GET /profile - Get complete profile with all data
router.get('/', profile_controller_1.profileController.getCompleteProfile);
// =====================================================
// USER PROFILE ROUTES
// =====================================================
// GET /profile/user - Get basic user profile
router.get('/user', profile_controller_1.profileController.getUserProfile);
// PATCH /profile/user - Update basic user profile
router.patch('/user', profile_controller_1.profileController.updateUserProfile);
// =====================================================
// DEPARTMENT ROUTES
// =====================================================
// GET /profile/departments - Get available departments for user's institute
router.get('/departments', profile_controller_1.profileController.getAvailableDepartments);
// =====================================================
// STUDENT PROFILE ROUTES
// =====================================================
// POST /profile/student - Create student profile
router.post('/student', profile_controller_1.profileController.createStudentProfile);
// GET /profile/student - Get student profile
router.get('/student', profile_controller_1.profileController.getStudentProfile);
// PATCH /profile/student - Update student profile
router.patch('/student', profile_controller_1.profileController.updateStudentProfile);
// DELETE /profile/student - Delete student profile
router.delete('/student', profile_controller_1.profileController.deleteStudentProfile);
// POST /profile/student/skills - Add skills
router.post('/student/skills', profile_controller_1.profileController.addSkills);
// DELETE /profile/student/skills - Remove skills
router.delete('/student/skills', profile_controller_1.profileController.removeSkills);
// PATCH /profile/student/academics - Update academic marks
router.patch('/student/academics', profile_controller_1.profileController.updateAcademicMarks);
// =====================================================
// RESUME ROUTES (Static routes first)
// =====================================================
// GET /profile/resumes/default - Get default resume
router.get('/resumes/default', profile_controller_1.profileController.getDefaultResume);
// GET /profile/resumes - Get all resumes
router.get('/resumes', profile_controller_1.profileController.getResumes);
// POST /profile/resumes - Upload new resume
router.post('/resumes', resumeUpload.single('resume'), profile_controller_1.profileController.uploadResume);
// =====================================================
// RESUME ROUTES (Parameterized routes)
// =====================================================
// GET /profile/resumes/:resumeId - Get specific resume
router.get('/resumes/:resumeId', profile_controller_1.profileController.getResume);
// DELETE /profile/resumes/:resumeId - Delete resume
router.delete('/resumes/:resumeId', profile_controller_1.profileController.deleteResume);
// PATCH /profile/resumes/:resumeId/default - Set as default
router.patch('/resumes/:resumeId/default', profile_controller_1.profileController.setDefaultResume);
// GET /profile/resumes/:resumeId/text - Extract text
router.get('/resumes/:resumeId/text', profile_controller_1.profileController.extractResumeText);
// POST /profile/resumes/:resumeId/link - Link to student profile
router.post('/resumes/:resumeId/link', profile_controller_1.profileController.linkResumeToProfile);
exports.default = router;
//# sourceMappingURL=profile.routes.js.map
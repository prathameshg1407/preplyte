"use strict";
// src/module/profile/profile.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAllowedImageMimeType = exports.isAllowedResumeMimeType = exports.mapUserToProfileResponse = exports.mapStudentProfileToResponse = exports.mapResumeToResponse = void 0;
// =====================================================
// MAPPER FUNCTIONS
// =====================================================
const mapResumeToResponse = (resume) => ({
    id: resume.id, // Now correctly expects string
    fileName: resume.fileName,
    fileUrl: resume.fileUrl,
    fileSize: resume.fileSize,
    mimeType: resume.mimeType,
    isDefault: resume.isDefault,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
});
exports.mapResumeToResponse = mapResumeToResponse;
const mapStudentProfileToResponse = (profile) => ({
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    studentId: profile.studentId,
    department: profile.department,
    courseYear: profile.courseYear,
    skills: profile.skills,
    marks10: profile.marks10,
    marks12: profile.marks12,
    cgpaSemesters: profile.cgpaSemesters,
    averageCgpa: profile.averageCgpa,
    resumeUrl: profile.resumeUrl,
    resumeName: profile.resumeName,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
});
exports.mapStudentProfileToResponse = mapStudentProfileToResponse;
const mapUserToProfileResponse = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    instituteId: user.instituteId,
    instituteName: user.institute?.name ?? null,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    studentProfile: user.profile ? (0, exports.mapStudentProfileToResponse)(user.profile) : null,
    resumeCount: user.resumes?.length ?? 0,
    defaultResume: user.resumes?.find((r) => r.isDefault)
        ? (0, exports.mapResumeToResponse)(user.resumes.find((r) => r.isDefault))
        : null,
});
exports.mapUserToProfileResponse = mapUserToProfileResponse;
// =====================================================
// TYPE GUARDS
// =====================================================
const isAllowedResumeMimeType = (mimeType) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return allowed.includes(mimeType);
};
exports.isAllowedResumeMimeType = isAllowedResumeMimeType;
const isAllowedImageMimeType = (mimeType) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    return allowed.includes(mimeType);
};
exports.isAllowedImageMimeType = isAllowedImageMimeType;
//# sourceMappingURL=profile.types.js.map
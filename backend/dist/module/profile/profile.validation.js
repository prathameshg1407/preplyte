"use strict";
// src/module/profile/profile.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDepartmentQuery = exports.parseUpdateUserProfile = exports.parseUpdateStudentProfile = exports.parseCreateStudentProfile = exports.validateResumeFile = exports.departmentQuerySchema = exports.profileQuerySchema = exports.updateUserProfileSchema = exports.updateStudentProfileSchema = exports.createStudentProfileSchema = exports.resumeIdParamSchema = void 0;
exports.parseResumeId = parseResumeId;
const zod_1 = require("zod");
const profile_constants_1 = require("./profile.constants");
const errors_1 = require("../../utils/errors");
// =====================================================
// RESUME VALIDATION SCHEMAS
// =====================================================
exports.resumeIdParamSchema = zod_1.z.object({
    resumeId: zod_1.z.string().min(1, 'Resume ID is required'),
});
// =====================================================
// STUDENT PROFILE VALIDATION SCHEMAS
// =====================================================
exports.createStudentProfileSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must not exceed 100 characters')
        .trim(),
    studentId: zod_1.z
        .string()
        .regex(profile_constants_1.STUDENT_ID_PATTERN, 'Invalid student ID format (3-30 alphanumeric characters)')
        .toUpperCase(),
    departmentId: zod_1.z
        .string()
        .min(1, 'Department is required')
        .trim(),
    courseYear: zod_1.z.enum(profile_constants_1.COURSE_YEARS, {
        errorMap: () => ({ message: 'Invalid course year' }),
    }),
    numberOfBacklogs: zod_1.z
        .number()
        .int('Backlogs must be a whole number')
        .min(0, 'Backlogs cannot be negative')
        .max(50, 'Backlogs cannot exceed 50')
        .optional()
        .default(0),
    skills: zod_1.z
        .array(zod_1.z.string().min(1).max(50).trim())
        .max(20, 'Maximum 20 skills allowed')
        .optional()
        .default([]),
    marks10: zod_1.z
        .number()
        .min(0, 'Marks cannot be negative')
        .max(100, 'Marks cannot exceed 100')
        .optional(),
    marks12: zod_1.z
        .number()
        .min(0, 'Marks cannot be negative')
        .max(100, 'Marks cannot exceed 100')
        .optional(),
    cgpaSemesters: zod_1.z
        .array(zod_1.z
        .number()
        .min(0, 'CGPA cannot be negative')
        .max(10, 'CGPA cannot exceed 10'))
        .max(10, 'Maximum 10 semesters allowed')
        .optional()
        .default([]),
});
exports.updateStudentProfileSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must not exceed 100 characters')
        .trim()
        .optional(),
    departmentId: zod_1.z
        .string()
        .min(1, 'Department ID cannot be empty')
        .trim()
        .optional(),
    courseYear: zod_1.z
        .enum(profile_constants_1.COURSE_YEARS, {
        errorMap: () => ({ message: 'Invalid course year' }),
    })
        .optional(),
    numberOfBacklogs: zod_1.z
        .number()
        .int('Backlogs must be a whole number')
        .min(0, 'Backlogs cannot be negative')
        .max(50, 'Backlogs cannot exceed 50')
        .optional(),
    skills: zod_1.z
        .array(zod_1.z.string().min(1).max(50).trim())
        .max(20, 'Maximum 20 skills allowed')
        .optional(),
    marks10: zod_1.z
        .number()
        .min(0, 'Marks cannot be negative')
        .max(100, 'Marks cannot exceed 100')
        .optional(),
    marks12: zod_1.z
        .number()
        .min(0, 'Marks cannot be negative')
        .max(100, 'Marks cannot exceed 100')
        .optional(),
    cgpaSemesters: zod_1.z
        .array(zod_1.z
        .number()
        .min(0, 'CGPA cannot be negative')
        .max(10, 'CGPA cannot exceed 10'))
        .max(10, 'Maximum 10 semesters allowed')
        .optional(),
});
// =====================================================
// USER PROFILE VALIDATION SCHEMAS
// =====================================================
exports.updateUserProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .trim()
        .optional(),
});
// =====================================================
// QUERY SCHEMAS
// =====================================================
exports.profileQuerySchema = zod_1.z.object({
    includeResumes: zod_1.z.coerce.boolean().optional().default(false),
    includeStudentProfile: zod_1.z.coerce.boolean().optional().default(true),
});
exports.departmentQuerySchema = zod_1.z.object({
    includeInactive: zod_1.z.coerce.boolean().optional().default(false),
});
const validateResumeFile = (file) => {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }
    const allowedTypes = profile_constants_1.ALLOWED_RESUME_MIME_TYPES;
    if (!allowedTypes.includes(file.mimetype)) {
        return {
            valid: false,
            error: 'Invalid file type. Only PDF and Word documents are allowed',
        };
    }
    if (file.size > profile_constants_1.RESUME_LIMITS.MAX_FILE_SIZE) {
        const maxSizeMB = profile_constants_1.RESUME_LIMITS.MAX_FILE_SIZE / (1024 * 1024);
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
        };
    }
    return { valid: true };
};
exports.validateResumeFile = validateResumeFile;
// =====================================================
// HELPER PARSERS
// =====================================================
function parseResumeId(value) {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
    }
    throw new errors_1.BadRequestError('Invalid resume ID');
}
const parseCreateStudentProfile = (data) => {
    return exports.createStudentProfileSchema.parse(data);
};
exports.parseCreateStudentProfile = parseCreateStudentProfile;
const parseUpdateStudentProfile = (data) => {
    return exports.updateStudentProfileSchema.parse(data);
};
exports.parseUpdateStudentProfile = parseUpdateStudentProfile;
const parseUpdateUserProfile = (data) => {
    return exports.updateUserProfileSchema.parse(data);
};
exports.parseUpdateUserProfile = parseUpdateUserProfile;
const parseDepartmentQuery = (data) => {
    return exports.departmentQuerySchema.parse(data);
};
exports.parseDepartmentQuery = parseDepartmentQuery;
//# sourceMappingURL=profile.validation.js.map
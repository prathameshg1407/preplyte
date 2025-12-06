"use strict";
// src/modules/instituteadmin/mock-drive/eligibility/eligibility.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.eligibilityService = exports.EligibilityService = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../../../lib/db");
const logger_1 = require("../../../../utils/logger");
const eligibility_types_1 = require("./eligibility.types");
const mockdrive_types_1 = require("../mockdrive.types");
// ============================================
// Helper Functions
// ============================================
/**
 * Converts a value to Prisma's nullable JSON input
 */
function toNullableJson(value) {
    if (value === null || value === undefined) {
        return client_1.Prisma.DbNull;
    }
    return value;
}
/**
 * Safely parses JSON value from database
 */
function parseJsonValue(value) {
    if (value === null || value === undefined) {
        return null;
    }
    return value;
}
// ============================================
// Service Class
// ============================================
class EligibilityService {
    // ==========================================
    // Set Eligibility Criteria
    // ==========================================
    async setEligibility(mockDriveId, instituteId, data) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        logger_1.logger.info('Setting eligibility criteria', { mockDriveId });
        // Validate custom rules if provided
        if (data.customRules) {
            this.validateCustomRules(data.customRules);
        }
        const eligibility = await db_1.prisma.mockDriveEligibility.upsert({
            where: { mockDriveId },
            create: {
                mockDriveId,
                minCgpa: data.minCgpa ?? null,
                maxCgpa: data.maxCgpa ?? null,
                minMarks10: data.minMarks10 ?? null,
                minMarks12: data.minMarks12 ?? null,
                allowedDepartments: data.allowedDepartments ?? [],
                allowedCourseYears: data.allowedCourseYears ?? [],
                requiredSkills: data.requiredSkills ?? [],
                maxBacklogs: data.maxBacklogs ?? null,
                customRules: toNullableJson(data.customRules),
            },
            update: {
                minCgpa: data.minCgpa ?? null,
                maxCgpa: data.maxCgpa ?? null,
                minMarks10: data.minMarks10 ?? null,
                minMarks12: data.minMarks12 ?? null,
                allowedDepartments: data.allowedDepartments ?? [],
                allowedCourseYears: data.allowedCourseYears ?? [],
                requiredSkills: data.requiredSkills ?? [],
                maxBacklogs: data.maxBacklogs ?? null,
                customRules: toNullableJson(data.customRules),
            },
        });
        logger_1.logger.info('Eligibility criteria set successfully', {
            mockDriveId,
            eligibilityId: eligibility.id,
        });
        return this.mapToDetails(eligibility);
    }
    // ==========================================
    // Get Eligibility Criteria
    // ==========================================
    async getEligibility(mockDriveId, instituteId) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const eligibility = await db_1.prisma.mockDriveEligibility.findUnique({
            where: { mockDriveId },
        });
        if (!eligibility) {
            return null;
        }
        return this.mapToDetails(eligibility);
    }
    // ==========================================
    // Update Eligibility Criteria
    // ==========================================
    async updateEligibility(mockDriveId, instituteId, data) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const existing = await db_1.prisma.mockDriveEligibility.findUnique({
            where: { mockDriveId },
        });
        if (!existing) {
            throw new eligibility_types_1.EligibilityNotFoundError(mockDriveId);
        }
        // Validate custom rules if provided
        if (data.customRules) {
            this.validateCustomRules(data.customRules);
        }
        const updateData = {};
        if (data.minCgpa !== undefined)
            updateData.minCgpa = data.minCgpa;
        if (data.maxCgpa !== undefined)
            updateData.maxCgpa = data.maxCgpa;
        if (data.minMarks10 !== undefined)
            updateData.minMarks10 = data.minMarks10;
        if (data.minMarks12 !== undefined)
            updateData.minMarks12 = data.minMarks12;
        if (data.allowedDepartments !== undefined) {
            updateData.allowedDepartments = data.allowedDepartments;
        }
        if (data.allowedCourseYears !== undefined) {
            updateData.allowedCourseYears = data.allowedCourseYears;
        }
        if (data.requiredSkills !== undefined) {
            updateData.requiredSkills = data.requiredSkills;
        }
        if (data.maxBacklogs !== undefined)
            updateData.maxBacklogs = data.maxBacklogs;
        if (data.customRules !== undefined) {
            updateData.customRules = toNullableJson(data.customRules);
        }
        const eligibility = await db_1.prisma.mockDriveEligibility.update({
            where: { mockDriveId },
            data: updateData,
        });
        logger_1.logger.info('Eligibility criteria updated', { mockDriveId });
        return this.mapToDetails(eligibility);
    }
    // ==========================================
    // Delete Eligibility Criteria
    // ==========================================
    async deleteEligibility(mockDriveId, instituteId) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const existing = await db_1.prisma.mockDriveEligibility.findUnique({
            where: { mockDriveId },
        });
        if (!existing) {
            throw new eligibility_types_1.EligibilityNotFoundError(mockDriveId);
        }
        await db_1.prisma.mockDriveEligibility.delete({
            where: { mockDriveId },
        });
        logger_1.logger.info('Eligibility criteria deleted', { mockDriveId });
    }
    // ==========================================
    // Check Student Eligibility
    // ==========================================
    async checkStudentEligibility(mockDriveId, instituteId, userId) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const eligibility = await db_1.prisma.mockDriveEligibility.findUnique({
            where: { mockDriveId },
        });
        // If no eligibility criteria, everyone is eligible
        if (!eligibility) {
            return {
                isEligible: true,
                checks: [],
                summary: { passed: 0, failed: 0, total: 0 },
            };
        }
        // Get student profile
        const studentProfile = await db_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        if (!studentProfile) {
            return {
                isEligible: false,
                checks: [
                    {
                        criterion: 'Student Profile',
                        passed: false,
                        required: 'Complete profile required',
                        actual: 'Profile not found',
                    },
                ],
                summary: { passed: 0, failed: 1, total: 1 },
            };
        }
        const checks = [];
        // Check CGPA
        if (eligibility.minCgpa !== null) {
            const studentCgpa = studentProfile.averageCgpa ?? 0;
            const passed = studentCgpa >= eligibility.minCgpa;
            checks.push({
                criterion: 'Minimum CGPA',
                passed,
                required: `>= ${eligibility.minCgpa}`,
                actual: studentProfile.averageCgpa?.toString() ?? 'N/A',
            });
        }
        if (eligibility.maxCgpa !== null) {
            const studentCgpa = studentProfile.averageCgpa ?? 10;
            const passed = studentCgpa <= eligibility.maxCgpa;
            checks.push({
                criterion: 'Maximum CGPA',
                passed,
                required: `<= ${eligibility.maxCgpa}`,
                actual: studentProfile.averageCgpa?.toString() ?? 'N/A',
            });
        }
        // Check 10th Marks
        if (eligibility.minMarks10 !== null) {
            const marks = studentProfile.marks10 ?? 0;
            const passed = marks >= eligibility.minMarks10;
            checks.push({
                criterion: '10th Marks',
                passed,
                required: `>= ${eligibility.minMarks10}%`,
                actual: studentProfile.marks10 !== null ? `${studentProfile.marks10}%` : 'N/A',
            });
        }
        // Check 12th Marks
        if (eligibility.minMarks12 !== null) {
            const marks = studentProfile.marks12 ?? 0;
            const passed = marks >= eligibility.minMarks12;
            checks.push({
                criterion: '12th Marks',
                passed,
                required: `>= ${eligibility.minMarks12}%`,
                actual: studentProfile.marks12 !== null ? `${studentProfile.marks12}%` : 'N/A',
            });
        }
        // Check Department
        if (eligibility.allowedDepartments.length > 0) {
            const passed = eligibility.allowedDepartments.includes(studentProfile.department);
            checks.push({
                criterion: 'Department',
                passed,
                required: eligibility.allowedDepartments.join(', '),
                actual: studentProfile.department,
            });
        }
        // Check Course Year
        if (eligibility.allowedCourseYears.length > 0) {
            const passed = eligibility.allowedCourseYears.includes(studentProfile.courseYear);
            checks.push({
                criterion: 'Course Year',
                passed,
                required: eligibility.allowedCourseYears.join(', '),
                actual: studentProfile.courseYear,
            });
        }
        // Check Required Skills (at least one match)
        if (eligibility.requiredSkills.length > 0) {
            const studentSkillsLower = studentProfile.skills.map((s) => s.toLowerCase());
            const requiredSkillsLower = eligibility.requiredSkills.map((s) => s.toLowerCase());
            const hasMatchingSkill = requiredSkillsLower.some((skill) => studentSkillsLower.includes(skill));
            checks.push({
                criterion: 'Required Skills',
                passed: hasMatchingSkill,
                required: `At least one of: ${eligibility.requiredSkills.join(', ')}`,
                actual: studentProfile.skills.length > 0 ? studentProfile.skills.join(', ') : 'None',
            });
        }
        // Check Custom Rules
        const customRules = parseJsonValue(eligibility.customRules);
        if (customRules && customRules.rules.length > 0) {
            const customChecks = this.evaluateCustomRules(customRules, studentProfile);
            checks.push(...customChecks);
        }
        const passed = checks.filter((c) => c.passed).length;
        const failed = checks.filter((c) => !c.passed).length;
        return {
            isEligible: failed === 0,
            checks,
            summary: {
                passed,
                failed,
                total: checks.length,
            },
        };
    }
    // ==========================================
    // Get Eligible Students
    // ==========================================
    async getEligibleStudents(mockDriveId, instituteId, query) {
        const mockDrive = await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const { page = 1, limit = 20, department, courseYear, search } = query;
        const skip = (page - 1) * limit;
        const eligibility = await db_1.prisma.mockDriveEligibility.findUnique({
            where: { mockDriveId },
        });
        // Build base where clause
        const where = {
            user: {
                instituteId,
                isActive: true,
            },
        };
        // Apply search filter
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { studentId: { contains: search, mode: 'insensitive' } },
            ];
        }
        // Apply eligibility filters
        if (eligibility) {
            if (eligibility.minCgpa !== null) {
                where.averageCgpa = { gte: eligibility.minCgpa };
            }
            if (eligibility.maxCgpa !== null) {
                where.averageCgpa = {
                    ...(where.averageCgpa || {}),
                    lte: eligibility.maxCgpa,
                };
            }
            if (eligibility.minMarks10 !== null) {
                where.marks10 = { gte: eligibility.minMarks10 };
            }
            if (eligibility.minMarks12 !== null) {
                where.marks12 = { gte: eligibility.minMarks12 };
            }
            // Apply department filter (query param takes precedence)
            if (department) {
                where.department = department;
            }
            else if (eligibility.allowedDepartments.length > 0) {
                where.department = { in: eligibility.allowedDepartments };
            }
            // Apply course year filter (query param takes precedence)
            if (courseYear) {
                where.courseYear = courseYear;
            }
            else if (eligibility.allowedCourseYears.length > 0) {
                where.courseYear = { in: eligibility.allowedCourseYears };
            }
        }
        else {
            // No eligibility criteria - just apply query filters
            if (department) {
                where.department = department;
            }
            if (courseYear) {
                where.courseYear = courseYear;
            }
        }
        // Get students
        const [students, total] = await Promise.all([
            db_1.prisma.studentProfile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { fullName: 'asc' },
                include: {
                    user: {
                        select: { id: true },
                    },
                },
            }),
            db_1.prisma.studentProfile.count({ where }),
        ]);
        // Get registration status for these students
        const userIds = students.map((s) => s.userId);
        const registrations = await db_1.prisma.mockDriveRegistration.findMany({
            where: {
                mockDriveId,
                userId: { in: userIds },
            },
            select: {
                userId: true,
                status: true,
            },
        });
        const registrationMap = new Map(registrations.map((r) => [r.userId, r.status]));
        const totalPages = Math.ceil(total / limit);
        return {
            data: students.map((s) => ({
                id: s.id,
                userId: s.userId,
                fullName: s.fullName,
                studentId: s.studentId,
                department: s.department,
                courseYear: s.courseYear,
                averageCgpa: s.averageCgpa,
                marks10: s.marks10,
                marks12: s.marks12,
                skills: s.skills,
                isRegistered: registrationMap.has(s.userId),
                registrationStatus: registrationMap.get(s.userId),
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        };
    }
    // ==========================================
    // Get Eligibility Summary
    // ==========================================
    async getEligibilitySummary(mockDriveId, instituteId) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const eligibility = await db_1.prisma.mockDriveEligibility.findUnique({
            where: { mockDriveId },
        });
        // Build where clause for eligible students
        const where = {
            user: {
                instituteId,
                isActive: true,
            },
        };
        if (eligibility) {
            if (eligibility.minCgpa !== null) {
                where.averageCgpa = { gte: eligibility.minCgpa };
            }
            if (eligibility.allowedDepartments.length > 0) {
                where.department = { in: eligibility.allowedDepartments };
            }
            if (eligibility.allowedCourseYears.length > 0) {
                where.courseYear = { in: eligibility.allowedCourseYears };
            }
        }
        const [totalEligible, totalRegistered, departmentCounts, yearCounts] = await Promise.all([
            db_1.prisma.studentProfile.count({ where }),
            db_1.prisma.mockDriveRegistration.count({ where: { mockDriveId } }),
            db_1.prisma.studentProfile.groupBy({
                by: ['department'],
                where,
                _count: { id: true },
            }),
            db_1.prisma.studentProfile.groupBy({
                by: ['courseYear'],
                where,
                _count: { id: true },
            }),
        ]);
        return {
            totalEligible,
            totalRegistered,
            byDepartment: Object.fromEntries(departmentCounts.map((d) => [d.department, d._count.id])),
            byCourseYear: Object.fromEntries(yearCounts.map((y) => [y.courseYear, y._count.id])),
        };
    }
    // ==========================================
    // Private Helper Methods
    // ==========================================
    async verifyMockDriveAccess(mockDriveId, instituteId) {
        const mockDrive = await db_1.prisma.mockDrive.findUnique({
            where: { id: mockDriveId },
            select: { id: true, instituteId: true },
        });
        if (!mockDrive) {
            throw new mockdrive_types_1.MockDriveNotFoundError(mockDriveId);
        }
        if (mockDrive.instituteId !== instituteId) {
            throw new mockdrive_types_1.MockDriveAccessDeniedError();
        }
        return mockDrive;
    }
    validateCustomRules(config) {
        if (!config.rules || !Array.isArray(config.rules)) {
            throw new eligibility_types_1.EligibilityValidationError('Custom rules must have a rules array');
        }
        const validOperators = [
            'equals',
            'not_equals',
            'greater_than',
            'less_than',
            'greater_than_or_equals',
            'less_than_or_equals',
            'contains',
            'not_contains',
            'in',
            'not_in',
        ];
        for (const rule of config.rules) {
            if (!rule.field || typeof rule.field !== 'string') {
                throw new eligibility_types_1.EligibilityValidationError('Each rule must have a valid field name');
            }
            if (!validOperators.includes(rule.operator)) {
                throw new eligibility_types_1.EligibilityValidationError(`Invalid operator: ${rule.operator}. Valid operators: ${validOperators.join(', ')}`);
            }
            if (rule.value === undefined) {
                throw new eligibility_types_1.EligibilityValidationError('Each rule must have a value');
            }
        }
    }
    evaluateCustomRules(config, studentData) {
        const checks = [];
        for (const rule of config.rules) {
            const actualValue = this.getNestedValue(studentData, rule.field);
            const passed = this.evaluateRule(rule, actualValue);
            checks.push({
                criterion: `Custom: ${rule.field}`,
                passed,
                required: `${rule.operator} ${this.formatValue(rule.value)}`,
                actual: this.formatValue(actualValue),
                details: `Field: ${rule.field}`,
            });
        }
        // Handle matchType (all = AND, any = OR)
        if (config.matchType === 'any' && checks.length > 0) {
            const anyPassed = checks.some((c) => c.passed);
            // If using 'any' match type, mark all checks based on whether any passed
            if (anyPassed) {
                checks.forEach((c) => {
                    if (!c.passed) {
                        c.details = `${c.details} (passed via 'any' match)`;
                    }
                });
            }
        }
        return checks;
    }
    getNestedValue(obj, path) {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined) {
                return undefined;
            }
            if (typeof current === 'object') {
                current = current[part];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    evaluateRule(rule, actualValue) {
        const { operator, value } = rule;
        switch (operator) {
            case 'equals':
                return actualValue === value;
            case 'not_equals':
                return actualValue !== value;
            case 'greater_than':
                return typeof actualValue === 'number' && actualValue > value;
            case 'less_than':
                return typeof actualValue === 'number' && actualValue < value;
            case 'greater_than_or_equals':
                return typeof actualValue === 'number' && actualValue >= value;
            case 'less_than_or_equals':
                return typeof actualValue === 'number' && actualValue <= value;
            case 'contains':
                if (typeof actualValue === 'string' && typeof value === 'string') {
                    return actualValue.toLowerCase().includes(value.toLowerCase());
                }
                if (Array.isArray(actualValue)) {
                    return actualValue.some((item) => typeof item === 'string' &&
                        typeof value === 'string' &&
                        item.toLowerCase().includes(value.toLowerCase()));
                }
                return false;
            case 'not_contains':
                if (typeof actualValue === 'string' && typeof value === 'string') {
                    return !actualValue.toLowerCase().includes(value.toLowerCase());
                }
                if (Array.isArray(actualValue)) {
                    return !actualValue.some((item) => typeof item === 'string' &&
                        typeof value === 'string' &&
                        item.toLowerCase().includes(value.toLowerCase()));
                }
                return true;
            case 'in':
                if (Array.isArray(value)) {
                    // Cast to any[] to avoid `never` element type issues
                    const arr = value;
                    return arr.includes(actualValue);
                }
                return false;
            case 'not_in':
                if (Array.isArray(value)) {
                    const arr = value;
                    return !arr.includes(actualValue);
                }
                return true;
            default:
                return false;
        }
    }
    formatValue(value) {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        return String(value);
    }
    mapToDetails(eligibility) {
        return {
            id: eligibility.id,
            mockDriveId: eligibility.mockDriveId,
            minCgpa: eligibility.minCgpa,
            maxCgpa: eligibility.maxCgpa,
            minMarks10: eligibility.minMarks10,
            minMarks12: eligibility.minMarks12,
            allowedDepartments: eligibility.allowedDepartments,
            allowedCourseYears: eligibility.allowedCourseYears,
            requiredSkills: eligibility.requiredSkills,
            maxBacklogs: eligibility.maxBacklogs,
            customRules: parseJsonValue(eligibility.customRules),
            createdAt: eligibility.createdAt,
            updatedAt: eligibility.updatedAt,
        };
    }
}
exports.EligibilityService = EligibilityService;
// Export singleton instance
exports.eligibilityService = new EligibilityService();
//# sourceMappingURL=eligibility.service.js.map
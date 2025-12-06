"use strict";
// src/module/mock-drive/utils/eligibility.utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEligibility = checkEligibility;
exports.formatEligibilityResult = formatEligibilityResult;
function checkEligibility(profile, criteria) {
    const checks = [];
    const failedCriteria = [];
    // If no criteria set, everyone is eligible
    if (!criteria) {
        return {
            isEligible: true,
            checks: [{
                    criterion: 'No criteria',
                    passed: true,
                    details: 'No eligibility criteria set'
                }],
            failedCriteria: [],
        };
    }
    // Must have a profile to check eligibility
    if (!profile) {
        return {
            isEligible: false,
            checks: [{
                    criterion: 'Profile',
                    passed: false,
                    details: 'Student profile not found'
                }],
            failedCriteria: ['Student profile not found'],
        };
    }
    // Check minimum CGPA
    if (criteria.minCgpa !== null) {
        const passed = profile.averageCgpa !== null && profile.averageCgpa >= criteria.minCgpa;
        checks.push({
            criterion: 'Minimum CGPA',
            passed,
            details: passed
                ? `CGPA ${profile.averageCgpa} meets minimum ${criteria.minCgpa}`
                : `CGPA ${profile.averageCgpa ?? 'N/A'} is below minimum ${criteria.minCgpa}`,
            value: profile.averageCgpa ?? undefined,
            required: criteria.minCgpa,
        });
        if (!passed)
            failedCriteria.push(`Minimum CGPA: ${criteria.minCgpa}`);
    }
    // Check maximum CGPA
    if (criteria.maxCgpa !== null) {
        const passed = profile.averageCgpa !== null && profile.averageCgpa <= criteria.maxCgpa;
        checks.push({
            criterion: 'Maximum CGPA',
            passed,
            details: passed
                ? `CGPA ${profile.averageCgpa} is within maximum ${criteria.maxCgpa}`
                : `CGPA ${profile.averageCgpa ?? 'N/A'} exceeds maximum ${criteria.maxCgpa}`,
            value: profile.averageCgpa ?? undefined,
            required: criteria.maxCgpa,
        });
        if (!passed)
            failedCriteria.push(`Maximum CGPA: ${criteria.maxCgpa}`);
    }
    // Check 10th marks
    if (criteria.minMarks10 !== null) {
        const passed = profile.marks10 !== null && profile.marks10 >= criteria.minMarks10;
        checks.push({
            criterion: 'Minimum 10th Marks',
            passed,
            details: passed
                ? `10th marks ${profile.marks10}% meets minimum ${criteria.minMarks10}%`
                : `10th marks ${profile.marks10 ?? 'N/A'}% is below minimum ${criteria.minMarks10}%`,
            value: profile.marks10 ?? undefined,
            required: criteria.minMarks10,
        });
        if (!passed)
            failedCriteria.push(`Minimum 10th Marks: ${criteria.minMarks10}%`);
    }
    // Check 12th marks
    if (criteria.minMarks12 !== null) {
        const passed = profile.marks12 !== null && profile.marks12 >= criteria.minMarks12;
        checks.push({
            criterion: 'Minimum 12th Marks',
            passed,
            details: passed
                ? `12th marks ${profile.marks12}% meets minimum ${criteria.minMarks12}%`
                : `12th marks ${profile.marks12 ?? 'N/A'}% is below minimum ${criteria.minMarks12}%`,
            value: profile.marks12 ?? undefined,
            required: criteria.minMarks12,
        });
        if (!passed)
            failedCriteria.push(`Minimum 12th Marks: ${criteria.minMarks12}%`);
    }
    // Check department
    if (criteria.allowedDepartments && criteria.allowedDepartments.length > 0) {
        const passed = criteria.allowedDepartments.some((dept) => dept.toLowerCase() === profile.department.toLowerCase());
        checks.push({
            criterion: 'Department',
            passed,
            details: passed
                ? `Department ${profile.department} is allowed`
                : `Department ${profile.department} is not in allowed list: ${criteria.allowedDepartments.join(', ')}`,
            value: profile.department,
        });
        if (!passed)
            failedCriteria.push(`Allowed Departments: ${criteria.allowedDepartments.join(', ')}`);
    }
    // Check course year
    if (criteria.allowedCourseYears && criteria.allowedCourseYears.length > 0) {
        const passed = criteria.allowedCourseYears.some((year) => year.toLowerCase() === profile.courseYear.toLowerCase());
        checks.push({
            criterion: 'Course Year',
            passed,
            details: passed
                ? `Course year ${profile.courseYear} is allowed`
                : `Course year ${profile.courseYear} is not in allowed list: ${criteria.allowedCourseYears.join(', ')}`,
            value: profile.courseYear,
        });
        if (!passed)
            failedCriteria.push(`Allowed Course Years: ${criteria.allowedCourseYears.join(', ')}`);
    }
    // Check required skills (must have at least one)
    if (criteria.requiredSkills && criteria.requiredSkills.length > 0) {
        const hasSkill = profile.skills.some((skill) => criteria.requiredSkills.some((required) => skill.toLowerCase().includes(required.toLowerCase())));
        checks.push({
            criterion: 'Required Skills',
            passed: hasSkill,
            details: hasSkill
                ? `Has required skill(s) from: ${criteria.requiredSkills.join(', ')}`
                : `Missing required skills. Need at least one of: ${criteria.requiredSkills.join(', ')}`,
            value: profile.skills.join(', '),
        });
        if (!hasSkill)
            failedCriteria.push(`Required Skills: ${criteria.requiredSkills.join(', ')}`);
    }
    // TODO: Add backlogs check if you track them in StudentProfile
    // Determine overall eligibility
    const isEligible = checks.every((check) => check.passed);
    return {
        isEligible,
        checks,
        failedCriteria,
    };
}
// Export other utility functions if needed
function formatEligibilityResult(result) {
    if (result.isEligible) {
        return 'Student is eligible for this mock drive';
    }
    return `Student is not eligible. Failed criteria: ${result.failedCriteria.join(', ')}`;
}
//# sourceMappingURL=eligibility.utils.js.map
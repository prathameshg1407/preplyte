// src/modules/instituteadmin/mock-drive/eligibility/eligibility.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../../../../lib/db';
import { logger } from '../../../../utils/logger';
import {
  SetEligibilityDTO,
  UpdateEligibilityDTO,
  EligibilityDetails,
  EligibilityCheckResult,
  EligibilityCheck,
  EligibleStudentsQuery,
  PaginatedEligibleStudents,
  EligibleStudent,
  CustomRulesConfig,
  CustomRule,
  CustomRuleOperator,
  EligibilityNotFoundError,
  EligibilityValidationError,
  EligibilityError,
} from './eligibility.types';
import {
  MockDriveNotFoundError,
  MockDriveAccessDeniedError,
} from '../mockdrive.types';

// ============================================
// Helper Functions
// ============================================

/**
 * Converts a value to Prisma's nullable JSON input
 */
function toNullableJson(
  value: unknown
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return Prisma.DbNull;
  }
  return value as Prisma.InputJsonValue;
}

/**
 * Safely parses JSON value from database
 */
function parseJsonValue<T>(value: Prisma.JsonValue | null): T | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value as unknown as T;
}

// ============================================
// Service Class
// ============================================

export class EligibilityService {
  // ==========================================
  // Set Eligibility Criteria
  // ==========================================

  async setEligibility(
    mockDriveId: string,
    instituteId: string,
    data: SetEligibilityDTO
  ): Promise<EligibilityDetails> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    logger.info('Setting eligibility criteria', { mockDriveId });

    // Validate custom rules if provided
    if (data.customRules) {
      this.validateCustomRules(data.customRules);
    }

    const eligibility = await prisma.mockDriveEligibility.upsert({
      where: { mockDriveId },
      create: {
        mockDriveId,
        minCgpa: data.minCgpa ?? null,
        maxCgpa: data.maxCgpa ?? null,
        minMarks10: data.minMarks10 ?? null,
        minMarks12: data.minMarks12 ?? null,
        allowedDepartmentIds: data.allowedDepartmentIds ?? [],
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
        allowedDepartmentIds: data.allowedDepartmentIds ?? [],
        allowedCourseYears: data.allowedCourseYears ?? [],
        requiredSkills: data.requiredSkills ?? [],
        maxBacklogs: data.maxBacklogs ?? null,
        customRules: toNullableJson(data.customRules),
      },
    });

    logger.info('Eligibility criteria set successfully', {
      mockDriveId,
      eligibilityId: eligibility.id,
    });

    return this.mapToDetails(eligibility);
  }

  // ==========================================
  // Get Eligibility Criteria
  // ==========================================

  async getEligibility(
    mockDriveId: string,
    instituteId: string
  ): Promise<EligibilityDetails | null> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const eligibility = await prisma.mockDriveEligibility.findUnique({
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

  async updateEligibility(
    mockDriveId: string,
    instituteId: string,
    data: UpdateEligibilityDTO
  ): Promise<EligibilityDetails> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const existing = await prisma.mockDriveEligibility.findUnique({
      where: { mockDriveId },
    });

    if (!existing) {
      throw new EligibilityNotFoundError(mockDriveId);
    }

    // Validate custom rules if provided
    if (data.customRules) {
      this.validateCustomRules(data.customRules);
    }

    const updateData: Prisma.MockDriveEligibilityUpdateInput = {};

    if (data.minCgpa !== undefined) updateData.minCgpa = data.minCgpa;
    if (data.maxCgpa !== undefined) updateData.maxCgpa = data.maxCgpa;
    if (data.minMarks10 !== undefined) updateData.minMarks10 = data.minMarks10;
    if (data.minMarks12 !== undefined) updateData.minMarks12 = data.minMarks12;
    if (data.allowedDepartmentIds !== undefined) {
      updateData.allowedDepartmentIds = data.allowedDepartmentIds;
    }
    if (data.allowedCourseYears !== undefined) {
      updateData.allowedCourseYears = data.allowedCourseYears;
    }
    if (data.requiredSkills !== undefined) {
      updateData.requiredSkills = data.requiredSkills;
    }
    if (data.maxBacklogs !== undefined) updateData.maxBacklogs = data.maxBacklogs;
    if (data.customRules !== undefined) {
      updateData.customRules = toNullableJson(data.customRules);
    }

    const eligibility = await prisma.mockDriveEligibility.update({
      where: { mockDriveId },
      data: updateData,
    });

    logger.info('Eligibility criteria updated', { mockDriveId });

    return this.mapToDetails(eligibility);
  }

  // ==========================================
  // Delete Eligibility Criteria
  // ==========================================

  async deleteEligibility(
    mockDriveId: string,
    instituteId: string
  ): Promise<void> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const existing = await prisma.mockDriveEligibility.findUnique({
      where: { mockDriveId },
    });

    if (!existing) {
      throw new EligibilityNotFoundError(mockDriveId);
    }

    await prisma.mockDriveEligibility.delete({
      where: { mockDriveId },
    });

    logger.info('Eligibility criteria deleted', { mockDriveId });
  }

  // ==========================================
  // Check Student Eligibility
  // ==========================================

  async checkStudentEligibility(
    mockDriveId: string,
    instituteId: string,
    userId: string
  ): Promise<EligibilityCheckResult> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const eligibility = await prisma.mockDriveEligibility.findUnique({
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
    const studentProfile = await prisma.studentProfile.findUnique({
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

    const checks: EligibilityCheck[] = [];

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
    if (eligibility.allowedDepartmentIds.length > 0) {
      const passed = eligibility.allowedDepartmentIds.includes(studentProfile.departmentId);
      checks.push({
        criterion: 'Department',
        passed,
        required: eligibility.allowedDepartmentIds.join(', '),
        actual: studentProfile.departmentId,
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
      const hasMatchingSkill = requiredSkillsLower.some((skill) =>
        studentSkillsLower.includes(skill)
      );
      checks.push({
        criterion: 'Required Skills',
        passed: hasMatchingSkill,
        required: `At least one of: ${eligibility.requiredSkills.join(', ')}`,
        actual: studentProfile.skills.length > 0 ? studentProfile.skills.join(', ') : 'None',
      });
    }

    // Check Custom Rules
    const customRules = parseJsonValue<CustomRulesConfig>(eligibility.customRules);
    if (customRules && customRules.rules.length > 0) {
      const customChecks = this.evaluateCustomRules(
        customRules,
        studentProfile as unknown as Record<string, unknown>
      );
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

  async getEligibleStudents(
    mockDriveId: string,
    instituteId: string,
    query: EligibleStudentsQuery
  ): Promise<PaginatedEligibleStudents> {
    const mockDrive = await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const { page = 1, limit = 20, departmentId, courseYear, search } = query;
    const skip = (page - 1) * limit;

    const eligibility = await prisma.mockDriveEligibility.findUnique({
      where: { mockDriveId },
    });

    // Build base where clause
    const where: Prisma.StudentProfileWhereInput = {
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
          ...(where.averageCgpa as Prisma.FloatNullableFilter || {}),
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
      if (departmentId) {
        where.departmentId = departmentId;
      } else if (eligibility.allowedDepartmentIds.length > 0) {
        where.departmentId = { in: eligibility.allowedDepartmentIds };
      }

      // Apply course year filter (query param takes precedence)
      if (courseYear) {
        where.courseYear = courseYear;
      } else if (eligibility.allowedCourseYears.length > 0) {
        where.courseYear = { in: eligibility.allowedCourseYears };
      }
    } else {
      // No eligibility criteria - just apply query filters
      if (departmentId) {
        where.departmentId = departmentId;
      }
      if (courseYear) {
        where.courseYear = courseYear;
      }
    }

    // Get students
    const [students, total] = await Promise.all([
      prisma.studentProfile.findMany({
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
      prisma.studentProfile.count({ where }),
    ]);

    // Get registration status for these students
    const userIds = students.map((s) => s.userId);
    const registrations = await prisma.mockDriveRegistration.findMany({
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
      data: students.map((s): EligibleStudent => ({
        id: s.id,
        userId: s.userId,
        fullName: s.fullName,
        studentId: s.studentId,
        departmentId: s.departmentId,
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

  async getEligibilitySummary(
    mockDriveId: string,
    instituteId: string
  ): Promise<{
    totalEligible: number;
    totalRegistered: number;
    byDepartment: Record<string, number>;
    byCourseYear: Record<string, number>;
  }> {
    await this.verifyMockDriveAccess(mockDriveId, instituteId);

    const eligibility = await prisma.mockDriveEligibility.findUnique({
      where: { mockDriveId },
    });

    // Build where clause for eligible students
    const where: Prisma.StudentProfileWhereInput = {
      user: {
        instituteId,
        isActive: true,
      },
    };

    if (eligibility) {
      if (eligibility.minCgpa !== null) {
        where.averageCgpa = { gte: eligibility.minCgpa };
      }
      if (eligibility.allowedDepartmentIds.length > 0) {
        where.departmentId = { in: eligibility.allowedDepartmentIds };
      }
      if (eligibility.allowedCourseYears.length > 0) {
        where.courseYear = { in: eligibility.allowedCourseYears };
      }
    }

    const [totalEligible, totalRegistered, departmentCounts, yearCounts] =
      await Promise.all([
        prisma.studentProfile.count({ where }),
        prisma.mockDriveRegistration.count({ where: { mockDriveId } }),
        prisma.studentProfile.groupBy({
          by: ['departmentId'],
          where,
          _count: { id: true },
        }),
        prisma.studentProfile.groupBy({
          by: ['courseYear'],
          where,
          _count: { id: true },
        }),
      ]);

    return {
      totalEligible,
      totalRegistered,
      byDepartment: Object.fromEntries(
        departmentCounts.map((d) => [d.departmentId, d._count.id])
      ),
      byCourseYear: Object.fromEntries(
        yearCounts.map((y) => [y.courseYear, y._count.id])
      ),
    };
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private async verifyMockDriveAccess(
    mockDriveId: string,
    instituteId: string
  ): Promise<{ id: string; instituteId: string }> {
    const mockDrive = await prisma.mockDrive.findUnique({
      where: { id: mockDriveId },
      select: { id: true, instituteId: true },
    });

    if (!mockDrive) {
      throw new MockDriveNotFoundError(mockDriveId);
    }

    if (mockDrive.instituteId !== instituteId) {
      throw new MockDriveAccessDeniedError();
    }

    return mockDrive;
  }

  private validateCustomRules(config: CustomRulesConfig): void {
    if (!config.rules || !Array.isArray(config.rules)) {
      throw new EligibilityValidationError('Custom rules must have a rules array');
    }

    const validOperators: CustomRuleOperator[] = [
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
        throw new EligibilityValidationError('Each rule must have a valid field name');
      }

      if (!validOperators.includes(rule.operator)) {
        throw new EligibilityValidationError(
          `Invalid operator: ${rule.operator}. Valid operators: ${validOperators.join(', ')}`
        );
      }

      if (rule.value === undefined) {
        throw new EligibilityValidationError('Each rule must have a value');
      }
    }
  }

  private evaluateCustomRules(
    config: CustomRulesConfig,
    studentData: Record<string, unknown>
  ): EligibilityCheck[] {
    const checks: EligibilityCheck[] = [];

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

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

 private evaluateRule(rule: CustomRule, actualValue: unknown): boolean {
  const { operator, value } = rule;

  switch (operator) {
    case 'equals':
      return actualValue === value;

    case 'not_equals':
      return actualValue !== value;

    case 'greater_than':
      return typeof actualValue === 'number' && actualValue > (value as number);

    case 'less_than':
      return typeof actualValue === 'number' && actualValue < (value as number);

    case 'greater_than_or_equals':
      return typeof actualValue === 'number' && actualValue >= (value as number);

    case 'less_than_or_equals':
      return typeof actualValue === 'number' && actualValue <= (value as number);

    case 'contains':
      if (typeof actualValue === 'string' && typeof value === 'string') {
        return actualValue.toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(actualValue)) {
        return actualValue.some(
          (item) =>
            typeof item === 'string' &&
            typeof value === 'string' &&
            item.toLowerCase().includes(value.toLowerCase())
        );
      }
      return false;

    case 'not_contains':
      if (typeof actualValue === 'string' && typeof value === 'string') {
        return !actualValue.toLowerCase().includes(value.toLowerCase());
      }
      if (Array.isArray(actualValue)) {
        return !actualValue.some(
          (item) =>
            typeof item === 'string' &&
            typeof value === 'string' &&
            item.toLowerCase().includes(value.toLowerCase())
        );
      }
      return true;

    case 'in':
      if (Array.isArray(value)) {
        // Cast to any[] to avoid `never` element type issues
        const arr = value as any[];
        return arr.includes(actualValue as any);
      }
      return false;

    case 'not_in':
      if (Array.isArray(value)) {
        const arr = value as any[];
        return !arr.includes(actualValue as any);
      }
      return true;

    default:
      return false;
  }
}


  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  }

  private mapToDetails(eligibility: {
    id: string;
    mockDriveId: string;
    minCgpa: number | null;
    maxCgpa: number | null;
    minMarks10: number | null;
    minMarks12: number | null;
    allowedDepartmentIds: string[];
    allowedCourseYears: string[];
    requiredSkills: string[];
    maxBacklogs: number | null;
    customRules: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  }): EligibilityDetails {
    return {
      id: eligibility.id,
      mockDriveId: eligibility.mockDriveId,
      minCgpa: eligibility.minCgpa,
      maxCgpa: eligibility.maxCgpa,
      minMarks10: eligibility.minMarks10,
      minMarks12: eligibility.minMarks12,
      allowedDepartmentIds: eligibility.allowedDepartmentIds,
      allowedCourseYears: eligibility.allowedCourseYears,
      requiredSkills: eligibility.requiredSkills,
      maxBacklogs: eligibility.maxBacklogs,
      customRules: parseJsonValue<CustomRulesConfig>(eligibility.customRules),
      createdAt: eligibility.createdAt,
      updatedAt: eligibility.updatedAt,
    };
  }
}

// Export singleton instance
export const eligibilityService = new EligibilityService();
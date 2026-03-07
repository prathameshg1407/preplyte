// backend/src/module/event/shared/eligibility.utils.ts

import { prisma } from '../../../lib/db';
import { logger } from '../../../utils/logger';
import {
  EligibilityCriteria,
  EligibilityCheckResult,
  EligibilityCriteriaRule,
} from './event.base.types';
import { ELIGIBILITY_OPERATORS } from '../event.constants';

/**
 * =====================================================
 * ELIGIBILITY CHECKING
 * =====================================================
 */

interface StudentEligibilityData {
  averageCgpa: number | null;
  marks10: number | null;
  marks12: number | null;
  departmentId: string;
  courseYear: string;
  numberOfBacklogs: number;
  skills: string[];
}

/**
 * Check if a student meets eligibility criteria
 */
export async function checkEligibility(
  userId: string,
  criteria: EligibilityCriteria | null
): Promise<EligibilityCheckResult> {
  logger.debug('[EligibilityUtils] Checking eligibility', { userId });

  // If no criteria, everyone is eligible
  if (!criteria || Object.keys(criteria).length === 0) {
    return {
      eligible: true,
      reasons: [],
      criteria: {},
    };
  }

  // Fetch student profile
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: {
      averageCgpa: true,
      marks10: true,
      marks12: true,
      departmentId: true,
      courseYear: true,
      numberOfBacklogs: true,
      skills: true,
    },
  });

  if (!profile) {
    return {
      eligible: false,
      reasons: ['Student profile not found. Please complete your profile.'],
      criteria,
    };
  }

  const reasons: string[] = [];

  // Check CGPA
  if (criteria.minCgpa !== undefined) {
    if (profile.averageCgpa === null) {
      reasons.push('CGPA information is missing');
    } else if (profile.averageCgpa < criteria.minCgpa) {
      reasons.push(`CGPA ${profile.averageCgpa} is below minimum ${criteria.minCgpa}`);
    }
  }

  if (criteria.maxCgpa !== undefined) {
    if (profile.averageCgpa === null) {
      reasons.push('CGPA information is missing');
    } else if (profile.averageCgpa > criteria.maxCgpa) {
      reasons.push(`CGPA ${profile.averageCgpa} is above maximum ${criteria.maxCgpa}`);
    }
  }

  // Check 10th marks
  if (criteria.minMarks10 !== undefined) {
    if (profile.marks10 === null) {
      reasons.push('10th marks information is missing');
    } else if (profile.marks10 < criteria.minMarks10) {
      reasons.push(`10th marks ${profile.marks10} is below minimum ${criteria.minMarks10}`);
    }
  }

  // Check 12th marks
  if (criteria.minMarks12 !== undefined) {
    if (profile.marks12 === null) {
      reasons.push('12th marks information is missing');
    } else if (profile.marks12 < criteria.minMarks12) {
      reasons.push(`12th marks ${profile.marks12} is below minimum ${criteria.minMarks12}`);
    }
  }

  // Check department
  if (criteria.allowedDepartmentIds && criteria.allowedDepartmentIds.length > 0) {
    if (!criteria.allowedDepartmentIds.includes(profile.departmentId)) {
      reasons.push('Your department is not eligible for this opportunity');
    }
  }

  // Check course year
  if (criteria.allowedCourseYears && criteria.allowedCourseYears.length > 0) {
    if (!criteria.allowedCourseYears.includes(profile.courseYear)) {
      reasons.push(`Your course year ${profile.courseYear} is not eligible`);
    }
  }

  // Check skills (at least one required skill must match)
  if (criteria.requiredSkills && criteria.requiredSkills.length > 0) {
    const studentSkillsLower = profile.skills.map((s) => s.toLowerCase());
    const requiredSkillsLower = criteria.requiredSkills.map((s) => s.toLowerCase());

    const hasRequiredSkill = requiredSkillsLower.some((skill) =>
      studentSkillsLower.includes(skill)
    );

    if (!hasRequiredSkill) {
      reasons.push(
        `You must have at least one of these skills: ${criteria.requiredSkills.join(', ')}`
      );
    }
  }

  // Check backlogs
  if (criteria.maxBacklogs !== undefined) {
    if (profile.numberOfBacklogs > criteria.maxBacklogs) {
      reasons.push(
        `Number of backlogs ${profile.numberOfBacklogs} exceeds maximum ${criteria.maxBacklogs}`
      );
    }
  }

  // Check custom rules
  if (criteria.customRules && criteria.customRules.length > 0) {
    const customRuleReasons = evaluateCustomRules(profile, criteria.customRules);
    reasons.push(...customRuleReasons);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    criteria,
  };
}

/**
 * Evaluate custom eligibility rules
 */
function evaluateCustomRules(
  profile: StudentEligibilityData,
  rules: EligibilityCriteriaRule[]
): string[] {
  const reasons: string[] = [];

  for (const rule of rules) {
    const fieldValue = getFieldValue(profile, rule.field);

    if (!evaluateRule(fieldValue, rule.operator, rule.value)) {
      reasons.push(
        `Custom rule failed: ${rule.field} ${rule.operator} ${JSON.stringify(rule.value)}`
      );
    }
  }

  return reasons;
}

/**
 * Get field value from profile using dot notation
 */
function getFieldValue(profile: any, field: string): any {
  const parts = field.split('.');
  let value = profile;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Evaluate a single rule
 */
function evaluateRule(fieldValue: any, operator: string, compareValue: any): boolean {
  switch (operator) {
    case ELIGIBILITY_OPERATORS.EQUALS:
      return fieldValue === compareValue;

    case ELIGIBILITY_OPERATORS.NOT_EQUALS:
      return fieldValue !== compareValue;

    case ELIGIBILITY_OPERATORS.GREATER_THAN:
      return Number(fieldValue) > Number(compareValue);

    case ELIGIBILITY_OPERATORS.GREATER_THAN_EQUAL:
      return Number(fieldValue) >= Number(compareValue);

    case ELIGIBILITY_OPERATORS.LESS_THAN:
      return Number(fieldValue) < Number(compareValue);

    case ELIGIBILITY_OPERATORS.LESS_THAN_EQUAL:
      return Number(fieldValue) <= Number(compareValue);

    case ELIGIBILITY_OPERATORS.IN:
      return Array.isArray(compareValue) && compareValue.includes(fieldValue);

    case ELIGIBILITY_OPERATORS.NOT_IN:
      return Array.isArray(compareValue) && !compareValue.includes(fieldValue);

    case ELIGIBILITY_OPERATORS.CONTAINS:
      if (typeof fieldValue === 'string') {
        return fieldValue.includes(String(compareValue));
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(compareValue);
      }
      return false;

    case ELIGIBILITY_OPERATORS.NOT_CONTAINS:
      if (typeof fieldValue === 'string') {
        return !fieldValue.includes(String(compareValue));
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(compareValue);
      }
      return true;

    default:
      logger.warn('[EligibilityUtils] Unknown operator', { operator });
      return false;
  }
}

/**
 * Validate eligibility criteria structure
 */
export function validateEligibilityCriteria(criteria: EligibilityCriteria): string[] {
  const errors: string[] = [];

  if (criteria.minCgpa !== undefined && criteria.maxCgpa !== undefined) {
    if (criteria.minCgpa > criteria.maxCgpa) {
      errors.push('minCgpa cannot be greater than maxCgpa');
    }
  }

  if (criteria.minCgpa !== undefined && (criteria.minCgpa < 0 || criteria.minCgpa > 10)) {
    errors.push('minCgpa must be between 0 and 10');
  }

  if (criteria.maxCgpa !== undefined && (criteria.maxCgpa < 0 || criteria.maxCgpa > 10)) {
    errors.push('maxCgpa must be between 0 and 10');
  }

  if (criteria.minMarks10 !== undefined && (criteria.minMarks10 < 0 || criteria.minMarks10 > 100)) {
    errors.push('minMarks10 must be between 0 and 100');
  }

  if (criteria.minMarks12 !== undefined && (criteria.minMarks12 < 0 || criteria.minMarks12 > 100)) {
    errors.push('minMarks12 must be between 0 and 100');
  }

  if (criteria.maxBacklogs !== undefined && criteria.maxBacklogs < 0) {
    errors.push('maxBacklogs must be non-negative');
  }

  return errors;
}

/**
 * Get eligibility summary for display
 */
export function getEligibilitySummary(criteria: EligibilityCriteria | null): string[] {
  if (!criteria) return ['No specific eligibility criteria'];

  const summary: string[] = [];

  if (criteria.minCgpa !== undefined) {
    summary.push(`Minimum CGPA: ${criteria.minCgpa}`);
  }

  if (criteria.maxCgpa !== undefined) {
    summary.push(`Maximum CGPA: ${criteria.maxCgpa}`);
  }

  if (criteria.minMarks10 !== undefined) {
    summary.push(`Minimum 10th Marks: ${criteria.minMarks10}%`);
  }

  if (criteria.minMarks12 !== undefined) {
    summary.push(`Minimum 12th Marks: ${criteria.minMarks12}%`);
  }

  if (criteria.maxBacklogs !== undefined) {
    summary.push(`Maximum Backlogs: ${criteria.maxBacklogs}`);
  }

  if (criteria.allowedCourseYears && criteria.allowedCourseYears.length > 0) {
    summary.push(`Eligible Years: ${criteria.allowedCourseYears.join(', ')}`);
  }

  if (criteria.requiredSkills && criteria.requiredSkills.length > 0) {
    summary.push(`Required Skills (any): ${criteria.requiredSkills.join(', ')}`);
  }

  return summary.length > 0 ? summary : ['No specific eligibility criteria'];
}

/**
 * Batch check eligibility for multiple users
 */
export async function batchCheckEligibility(
  userIds: string[],
  criteria: EligibilityCriteria | null
): Promise<Map<string, EligibilityCheckResult>> {
  const results = new Map<string, EligibilityCheckResult>();

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const result = await checkEligibility(userId, criteria);
        results.set(userId, result);
      } catch (error) {
        logger.error('[EligibilityUtils] Failed to check eligibility', {
          userId,
          error,
        });
        results.set(userId, {
          eligible: false,
          reasons: ['Failed to check eligibility'],
          criteria: criteria || {},
        });
      }
    })
  );

  return results;
}

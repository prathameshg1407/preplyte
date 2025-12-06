import { z } from 'zod';
declare const customRuleSchema: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodEnum<["equals", "not_equals", "greater_than", "less_than", "greater_than_or_equals", "less_than_or_equals", "contains", "not_contains", "in", "not_in"]>;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodNumber, "many">]>;
}, "strip", z.ZodTypeAny, {
    value: string | number | boolean | string[] | number[];
    operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
    field: string;
}, {
    value: string | number | boolean | string[] | number[];
    operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
    field: string;
}>;
declare const customRulesConfigSchema: z.ZodObject<{
    rules: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["equals", "not_equals", "greater_than", "less_than", "greater_than_or_equals", "less_than_or_equals", "contains", "not_contains", "in", "not_in"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodNumber, "many">]>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | string[] | number[];
        operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
        field: string;
    }, {
        value: string | number | boolean | string[] | number[];
        operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
        field: string;
    }>, "many">;
    matchType: z.ZodDefault<z.ZodEnum<["all", "any"]>>;
}, "strip", z.ZodTypeAny, {
    rules: {
        value: string | number | boolean | string[] | number[];
        operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
        field: string;
    }[];
    matchType: "all" | "any";
}, {
    rules: {
        value: string | number | boolean | string[] | number[];
        operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
        field: string;
    }[];
    matchType?: "all" | "any" | undefined;
}>;
export declare const setEligibilitySchema: z.ZodEffects<z.ZodObject<{
    minCgpa: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxCgpa: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    minMarks10: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    minMarks12: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    allowedDepartments: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    allowedCourseYears: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    requiredSkills: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    maxBacklogs: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    customRules: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        rules: z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            operator: z.ZodEnum<["equals", "not_equals", "greater_than", "less_than", "greater_than_or_equals", "less_than_or_equals", "contains", "not_contains", "in", "not_in"]>;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodNumber, "many">]>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }, {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }>, "many">;
        matchType: z.ZodDefault<z.ZodEnum<["all", "any"]>>;
    }, "strip", z.ZodTypeAny, {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType: "all" | "any";
    }, {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType?: "all" | "any" | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    allowedDepartments: string[];
    allowedCourseYears: string[];
    requiredSkills: string[];
    minCgpa?: number | null | undefined;
    maxCgpa?: number | null | undefined;
    minMarks10?: number | null | undefined;
    minMarks12?: number | null | undefined;
    maxBacklogs?: number | null | undefined;
    customRules?: {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType: "all" | "any";
    } | null | undefined;
}, {
    minCgpa?: number | null | undefined;
    maxCgpa?: number | null | undefined;
    minMarks10?: number | null | undefined;
    minMarks12?: number | null | undefined;
    allowedDepartments?: string[] | undefined;
    allowedCourseYears?: string[] | undefined;
    requiredSkills?: string[] | undefined;
    maxBacklogs?: number | null | undefined;
    customRules?: {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType?: "all" | "any" | undefined;
    } | null | undefined;
}>, {
    allowedDepartments: string[];
    allowedCourseYears: string[];
    requiredSkills: string[];
    minCgpa?: number | null | undefined;
    maxCgpa?: number | null | undefined;
    minMarks10?: number | null | undefined;
    minMarks12?: number | null | undefined;
    maxBacklogs?: number | null | undefined;
    customRules?: {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType: "all" | "any";
    } | null | undefined;
}, {
    minCgpa?: number | null | undefined;
    maxCgpa?: number | null | undefined;
    minMarks10?: number | null | undefined;
    minMarks12?: number | null | undefined;
    allowedDepartments?: string[] | undefined;
    allowedCourseYears?: string[] | undefined;
    requiredSkills?: string[] | undefined;
    maxBacklogs?: number | null | undefined;
    customRules?: {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType?: "all" | "any" | undefined;
    } | null | undefined;
}>;
export declare const updateEligibilitySchema: z.ZodEffects<z.ZodObject<{
    minCgpa: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    maxCgpa: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    minMarks10: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    minMarks12: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    allowedDepartments: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    allowedCourseYears: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    requiredSkills: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>>;
    maxBacklogs: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    customRules: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodObject<{
        rules: z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            operator: z.ZodEnum<["equals", "not_equals", "greater_than", "less_than", "greater_than_or_equals", "less_than_or_equals", "contains", "not_contains", "in", "not_in"]>;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodNumber, "many">]>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }, {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }>, "many">;
        matchType: z.ZodDefault<z.ZodEnum<["all", "any"]>>;
    }, "strip", z.ZodTypeAny, {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType: "all" | "any";
    }, {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType?: "all" | "any" | undefined;
    }>>>>;
}, "strip", z.ZodTypeAny, {
    minCgpa?: number | null | undefined;
    maxCgpa?: number | null | undefined;
    minMarks10?: number | null | undefined;
    minMarks12?: number | null | undefined;
    allowedDepartments?: string[] | undefined;
    allowedCourseYears?: string[] | undefined;
    requiredSkills?: string[] | undefined;
    maxBacklogs?: number | null | undefined;
    customRules?: {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType: "all" | "any";
    } | null | undefined;
}, {
    minCgpa?: number | null | undefined;
    maxCgpa?: number | null | undefined;
    minMarks10?: number | null | undefined;
    minMarks12?: number | null | undefined;
    allowedDepartments?: string[] | undefined;
    allowedCourseYears?: string[] | undefined;
    requiredSkills?: string[] | undefined;
    maxBacklogs?: number | null | undefined;
    customRules?: {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType?: "all" | "any" | undefined;
    } | null | undefined;
}>, {
    minCgpa?: number | null | undefined;
    maxCgpa?: number | null | undefined;
    minMarks10?: number | null | undefined;
    minMarks12?: number | null | undefined;
    allowedDepartments?: string[] | undefined;
    allowedCourseYears?: string[] | undefined;
    requiredSkills?: string[] | undefined;
    maxBacklogs?: number | null | undefined;
    customRules?: {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType: "all" | "any";
    } | null | undefined;
}, {
    minCgpa?: number | null | undefined;
    maxCgpa?: number | null | undefined;
    minMarks10?: number | null | undefined;
    minMarks12?: number | null | undefined;
    allowedDepartments?: string[] | undefined;
    allowedCourseYears?: string[] | undefined;
    requiredSkills?: string[] | undefined;
    maxBacklogs?: number | null | undefined;
    customRules?: {
        rules: {
            value: string | number | boolean | string[] | number[];
            operator: "in" | "contains" | "equals" | "not_equals" | "greater_than" | "less_than" | "greater_than_or_equals" | "less_than_or_equals" | "not_contains" | "not_in";
            field: string;
        }[];
        matchType?: "all" | "any" | undefined;
    } | null | undefined;
}>;
export declare const eligibleStudentsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
} & {
    department: z.ZodOptional<z.ZodString>;
    courseYear: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    search?: string | undefined;
    department?: string | undefined;
    courseYear?: string | undefined;
}, {
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    department?: string | undefined;
    courseYear?: string | undefined;
}>;
export declare const checkEligibilitySchema: z.ZodObject<{
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
}, {
    userId: string;
}>;
export type SetEligibilityInput = z.infer<typeof setEligibilitySchema>;
export type UpdateEligibilityInput = z.infer<typeof updateEligibilitySchema>;
export type EligibleStudentsQueryInput = z.infer<typeof eligibleStudentsQuerySchema>;
export type CustomRuleInput = z.infer<typeof customRuleSchema>;
export type CustomRulesConfigInput = z.infer<typeof customRulesConfigSchema>;
export {};
//# sourceMappingURL=eligibility.validation.d.ts.map
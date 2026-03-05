import { z } from 'zod';
export declare const resumeIdParamSchema: z.ZodObject<{
    resumeId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    resumeId: string;
}, {
    resumeId: string;
}>;
export declare const createStudentProfileSchema: z.ZodObject<{
    fullName: z.ZodString;
    studentId: z.ZodString;
    departmentId: z.ZodString;
    courseYear: z.ZodEnum<[string, ...string[]]>;
    numberOfBacklogs: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    skills: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    marks10: z.ZodOptional<z.ZodNumber>;
    marks12: z.ZodOptional<z.ZodNumber>;
    cgpaSemesters: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
}, "strip", z.ZodTypeAny, {
    skills: string[];
    departmentId: string;
    courseYear: string;
    fullName: string;
    studentId: string;
    numberOfBacklogs: number;
    cgpaSemesters: number[];
    marks10?: number | undefined;
    marks12?: number | undefined;
}, {
    departmentId: string;
    courseYear: string;
    fullName: string;
    studentId: string;
    skills?: string[] | undefined;
    numberOfBacklogs?: number | undefined;
    marks10?: number | undefined;
    marks12?: number | undefined;
    cgpaSemesters?: number[] | undefined;
}>;
export declare const updateStudentProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    courseYear: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    numberOfBacklogs: z.ZodOptional<z.ZodNumber>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    marks10: z.ZodOptional<z.ZodNumber>;
    marks12: z.ZodOptional<z.ZodNumber>;
    cgpaSemesters: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    skills?: string[] | undefined;
    departmentId?: string | undefined;
    courseYear?: string | undefined;
    fullName?: string | undefined;
    numberOfBacklogs?: number | undefined;
    marks10?: number | undefined;
    marks12?: number | undefined;
    cgpaSemesters?: number[] | undefined;
}, {
    skills?: string[] | undefined;
    departmentId?: string | undefined;
    courseYear?: string | undefined;
    fullName?: string | undefined;
    numberOfBacklogs?: number | undefined;
    marks10?: number | undefined;
    marks12?: number | undefined;
    cgpaSemesters?: number[] | undefined;
}>;
export declare const updateUserProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
}, {
    name?: string | undefined;
}>;
export declare const profileQuerySchema: z.ZodObject<{
    includeResumes: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeStudentProfile: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeResumes: boolean;
    includeStudentProfile: boolean;
}, {
    includeResumes?: boolean | undefined;
    includeStudentProfile?: boolean | undefined;
}>;
export declare const departmentQuerySchema: z.ZodObject<{
    includeInactive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeInactive: boolean;
}, {
    includeInactive?: boolean | undefined;
}>;
export type ResumeIdParam = z.infer<typeof resumeIdParamSchema>;
export type CreateStudentProfileInput = z.infer<typeof createStudentProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type ProfileQuery = z.infer<typeof profileQuerySchema>;
export type DepartmentQuery = z.infer<typeof departmentQuerySchema>;
export interface FileValidationResult {
    valid: boolean;
    error?: string;
}
export declare const validateResumeFile: (file: Express.Multer.File | undefined) => FileValidationResult;
export declare function parseResumeId(value: unknown): string;
export declare const parseCreateStudentProfile: (data: unknown) => CreateStudentProfileInput;
export declare const parseUpdateStudentProfile: (data: unknown) => UpdateStudentProfileInput;
export declare const parseUpdateUserProfile: (data: unknown) => UpdateUserProfileInput;
export declare const parseDepartmentQuery: (data: unknown) => DepartmentQuery;
//# sourceMappingURL=profile.validation.d.ts.map
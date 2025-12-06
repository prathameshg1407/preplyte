import { z } from 'zod';
export declare const resumeIdParamSchema: z.ZodObject<{
    resumeId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    resumeId: number;
}, {
    resumeId: number;
}>;
export declare const createStudentProfileSchema: z.ZodObject<{
    fullName: z.ZodString;
    studentId: z.ZodString;
    department: z.ZodEnum<[string, ...string[]]>;
    courseYear: z.ZodEnum<[string, ...string[]]>;
    skills: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    marks10: z.ZodOptional<z.ZodNumber>;
    marks12: z.ZodOptional<z.ZodNumber>;
    cgpaSemesters: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    studentId: string;
    skills: string[];
    department: string;
    courseYear: string;
    cgpaSemesters: number[];
    marks10?: number | undefined;
    marks12?: number | undefined;
}, {
    fullName: string;
    studentId: string;
    department: string;
    courseYear: string;
    skills?: string[] | undefined;
    marks10?: number | undefined;
    marks12?: number | undefined;
    cgpaSemesters?: number[] | undefined;
}>;
export declare const updateStudentProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    courseYear: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    marks10: z.ZodOptional<z.ZodNumber>;
    marks12: z.ZodOptional<z.ZodNumber>;
    cgpaSemesters: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    fullName?: string | undefined;
    skills?: string[] | undefined;
    department?: string | undefined;
    courseYear?: string | undefined;
    marks10?: number | undefined;
    marks12?: number | undefined;
    cgpaSemesters?: number[] | undefined;
}, {
    fullName?: string | undefined;
    skills?: string[] | undefined;
    department?: string | undefined;
    courseYear?: string | undefined;
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
export type ResumeIdParam = z.infer<typeof resumeIdParamSchema>;
export type CreateStudentProfileInput = z.infer<typeof createStudentProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type ProfileQuery = z.infer<typeof profileQuerySchema>;
export interface FileValidationResult {
    valid: boolean;
    error?: string;
}
export declare const validateResumeFile: (file: Express.Multer.File | undefined) => FileValidationResult;
export declare function parseResumeId(value: unknown): string;
export declare const parseCreateStudentProfile: (data: unknown) => CreateStudentProfileInput;
export declare const parseUpdateStudentProfile: (data: unknown) => UpdateStudentProfileInput;
export declare const parseUpdateUserProfile: (data: unknown) => UpdateUserProfileInput;
//# sourceMappingURL=profile.validation.d.ts.map
import { z } from 'zod';

// ==================== Module Test DTOs ====================

export const CreateModuleTestDtoSchema = z.object({
    moduleId: z.string().min(1),
    title: z.string().min(1, 'Title is required'),
    instructions: z.string().optional().nullable(),
    totalQuestions: z.number().int().positive(),
    passingScore: z.number().int().min(0).max(100),
    timeLimitMinutes: z.number().int().positive(),
    maxAttempts: z.number().int().positive().optional(),
    pointsPerQuestion: z.number().int().positive(),
    isActive: z.boolean().optional(),
});

export const UpdateModuleTestDtoSchema = CreateModuleTestDtoSchema.partial().omit({ moduleId: true });

export type CreateModuleTestDto = z.infer<typeof CreateModuleTestDtoSchema>;
export type UpdateModuleTestDto = z.infer<typeof UpdateModuleTestDtoSchema>;

// ==================== Final Test DTOs ====================

export const CreateFinalTestDtoSchema = z.object({
    courseId: z.string().min(1),
    title: z.string().min(1, 'Title is required'),
    instructions: z.string().optional().nullable(),
    totalQuestions: z.number().int().positive(),
    passingScore: z.number().int().min(0).max(100),
    timeLimitMinutes: z.number().int().positive(),
    maxAttempts: z.number().int().positive().optional(),
    pointsPerQuestion: z.number().int().positive(),
    isActive: z.boolean().optional(),
});

export const UpdateFinalTestDtoSchema = CreateFinalTestDtoSchema.partial().omit({ courseId: true });

export type CreateFinalTestDto = z.infer<typeof CreateFinalTestDtoSchema>;
export type UpdateFinalTestDto = z.infer<typeof UpdateFinalTestDtoSchema>;

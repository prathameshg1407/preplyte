import { z } from 'zod';

export const createModuleSchema = z.object({
    courseId: z.string().min(1, 'Course ID is required'),
    title: z.string().min(1, 'Title is required'),
    shortDescription: z.string().min(1, 'Short description is required'),
    description: z.string().optional().nullable(),
    order: z.number().int(),
    points: z.number().int().min(0).default(0),
    estimatedMinutes: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
});

export type CreateModuleDto = z.infer<typeof createModuleSchema>;

export const updateModuleSchema = createModuleSchema.partial();

export type UpdateModuleDto = z.infer<typeof updateModuleSchema>;
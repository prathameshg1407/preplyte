import { z } from 'zod';

export const createTopicSchema = z.object({
    moduleId: z.string().min(1, 'Module ID is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    order: z.number().int(),
    theoryContent: z.string().optional().nullable().default(''),
    videoUrl: z.preprocess((val) => val === '' ? null : val, z.string().url().nullable().optional()),
    videoDuration: z.number().int().optional().nullable(),
    estimatedMinutes: z.number().int().default(10),
    resources: z.any().optional().nullable(),
    isActive: z.boolean().default(true),
});

export type CreateTopicDto = z.infer<typeof createTopicSchema>;

export const updateTopicSchema = createTopicSchema.partial();

export type UpdateTopicDto = z.infer<typeof updateTopicSchema>;
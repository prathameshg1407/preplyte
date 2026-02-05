import { z } from 'zod';
import { LmsCourseStatus, DifficultyLevel } from '@prisma/client';

const nestedTopicSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    order: z.number().int(),
    theoryContent: z.string().min(1),
    videoUrl: z.preprocess((val) => val === '' ? null : val, z.string().url().nullable().optional()),
    videoDuration: z.number().int().optional().nullable(),
    estimatedMinutes: z.number().int().default(10),
    isActive: z.boolean().default(true),
});

const nestedModuleTestSchema = z.object({
    title: z.string().min(1),
    instructions: z.string().optional().nullable(),
    totalQuestions: z.number().int().positive().default(10),
    passingScore: z.number().int().min(0).max(100).default(60),
    timeLimitMinutes: z.number().int().positive().default(30),
    maxAttempts: z.number().int().positive().default(3),
    pointsPerQuestion: z.number().positive().default(10),
    isActive: z.boolean().default(true),
});

const nestedModuleSchema = z.object({
    title: z.string().min(1),
    shortDescription: z.string().min(1),
    description: z.string().optional().nullable(),
    order: z.number().int(),
    points: z.number().int().min(0).default(0),
    estimatedMinutes: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    topics: z.array(nestedTopicSchema).optional().default([]),
    moduleTest: nestedModuleTestSchema.optional().nullable(),
});

const nestedFinalTestSchema = z.object({
    title: z.string().min(1),
    instructions: z.string().optional().nullable(),
    totalQuestions: z.number().int().positive().default(50),
    passingScore: z.number().int().min(0).max(100).default(60),
    timeLimitMinutes: z.number().int().positive().default(120),
    maxAttempts: z.number().int().positive().default(1),
    pointsPerQuestion: z.number().positive().default(10),
    isActive: z.boolean().default(true),
});

export const createCourseSchema = z.object({
    categoryId: z.string().min(1),

    title: z.string().min(1),
    slug: z.string().min(1),

    shortDescription: z.string().min(1),
    description: z.string().min(1),

    thumbnailUrl: z.preprocess((val) => val === '' ? null : val, z.string().url().nullable().optional()),
    previewVideoUrl: z.preprocess((val) => val === '' ? null : val, z.string().url().nullable().optional()),

    price: z.coerce.number().min(0).default(0),
    discountPrice: z.coerce.number().min(0).nullable().optional(),

    currency: z.string().default('INR'),
    status: z.nativeEnum(LmsCourseStatus).default(LmsCourseStatus.DRAFT),
    isActive: z.boolean().default(true),
    certificateEnabled: z.boolean().default(true),
    passingPercentage: z.coerce.number().min(0).max(100).default(60),
    tags: z.preprocess((val) => typeof val === 'string' ? val.split(',').map(t => t.trim()) : val, z.array(z.string()).default([])),
    difficulty: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.MEDIUM),

    instructor: z.preprocess((val) => val === '' ? null : val, z.string().nullable().optional()),
    language: z.string().default('English'),

    // Nested creation
    modules: z.array(nestedModuleSchema).optional().default([]),
    finalTest: nestedFinalTestSchema.optional().nullable(),
});

export type CreateCourseDto = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;

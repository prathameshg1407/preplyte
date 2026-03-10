// src/module/lms/lms.validation.ts

import { z } from 'zod';
import { DifficultyLevel } from '@prisma/client';

export const getCoursesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  categorySlug: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  priceRange: z.string().optional(),
});

export const courseSlugParamSchema = z.object({
  courseSlug: z.string().min(1).max(200),
});

export const moduleOrderParamSchema = z.object({
  courseSlug: z.string().min(1).max(200),
  moduleOrder: z.coerce.number().int().positive(),
});

export const topicOrderParamSchema = z.object({
  courseSlug: z.string().min(1).max(200),
  moduleOrder: z.coerce.number().int().positive(),
  topicOrder: z.coerce.number().int().positive(),
});

export const updateTopicProgressSchema = z.object({
  theoryCompleted: z.boolean().optional(),
  videoWatched: z.boolean().optional(),
  videoProgress: z.number().min(0).max(100).optional(),
  timeSpentMinutes: z.number().int().min(0).optional(),
});

export const submitTestAnswerSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
});

export const submitTestSchema = z.object({
  answers: z.array(submitTestAnswerSchema),
});

// Combined schemas for validation middleware
export const getCoursesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(50).default(12).optional(),
    categorySlug: z.string().optional(),
    difficulty: z.nativeEnum(DifficultyLevel).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(['popular', 'newest', 'price-low', 'price-high', 'rating']).default('popular').optional(),
    priceRange: z.enum(['free', 'paid', 'all']).default('all').optional(),
  }).optional().default({}),
  params: z.object({}).optional().default({}),
  body: z.object({}).optional().default({}),
});

export const courseSlugSchema = z.object({
  params: courseSlugParamSchema,
  query: z.object({}),
  body: z.object({}),
});

export const moduleOrderSchema = z.object({
  params: moduleOrderParamSchema,
  query: z.object({}),
  body: z.object({}),
});

export const topicOrderSchema = z.object({
  params: topicOrderParamSchema,
  query: z.object({}),
  body: z.object({}),
});

export const updateTopicProgressRequestSchema = z.object({
  params: topicOrderParamSchema,
  query: z.object({}),
  body: updateTopicProgressSchema,
});

export const submitModuleTestSchema = z.object({
  params: moduleOrderParamSchema,
  query: z.object({}),
  body: submitTestSchema,
});

export const submitFinalTestSchema = z.object({
  params: courseSlugParamSchema,
  query: z.object({}),
  body: submitTestSchema,
});

// Type exports
export type GetCoursesQuery = z.infer<typeof getCoursesQuerySchema>;
export type CourseSlugParam = z.infer<typeof courseSlugParamSchema>;
export type ModuleOrderParam = z.infer<typeof moduleOrderParamSchema>;
export type TopicOrderParam = z.infer<typeof topicOrderParamSchema>;
export type UpdateTopicProgressBody = z.infer<typeof updateTopicProgressSchema>;
export type SubmitTestBody = z.infer<typeof submitTestSchema>;
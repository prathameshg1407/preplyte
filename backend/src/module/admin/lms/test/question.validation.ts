import { z } from 'zod';

export const nestedOptionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1),
    isCorrect: z.boolean().default(false),
    order: z.number().int().default(0),
});

export const createQuestionSchema = z.object({
    moduleTestId: z.string().optional().nullable(),
    finalTestId: z.string().optional().nullable(),
    questionText: z.string().min(1),
    explanation: z.string().optional().nullable(),
    order: z.number().int(),
    points: z.number().int().default(10),
    isActive: z.boolean().default(true),
    options: z.array(nestedOptionSchema).min(2, 'At least 2 options are required'),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;

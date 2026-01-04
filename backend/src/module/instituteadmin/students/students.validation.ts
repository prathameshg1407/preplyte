import { z } from 'zod';

export const getInstituteStudentsSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  courseYear: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'name', 'averageCgpa']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
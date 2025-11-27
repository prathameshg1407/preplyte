// src/module/dashboard/dashboard.validation.ts

import { z } from 'zod';
import { TIME_PERIODS } from './dashboard.constants';

// =====================================================
// QUERY SCHEMAS
// =====================================================

export const dashboardQuerySchema = z.object({
  period: z
    .enum([
      TIME_PERIODS.THIS_MONTH,
      TIME_PERIODS.LAST_MONTH,
      TIME_PERIODS.THIS_WEEK,
      TIME_PERIODS.LAST_7_DAYS,
      TIME_PERIODS.LAST_30_DAYS,
    ])
    .optional()
    .default(TIME_PERIODS.THIS_MONTH),
});

// =====================================================
// TYPE EXPORTS
// =====================================================

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

// =====================================================
// PARSER FUNCTIONS
// =====================================================

export const parseDashboardQuery = (query: unknown): DashboardQuery => {
  return dashboardQuerySchema.parse(query);
};
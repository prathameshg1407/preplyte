// src/module/leaderboard/leaderboard.validation.ts

import { z } from 'zod';
import {
  LEADERBOARD_CATEGORIES,
  LEADERBOARD_SCOPES,
  LEADERBOARD_CONSTANTS,
} from './leaderboard.constants';

export const leaderboardQuerySchema = z.object({
  scope: z.enum(LEADERBOARD_SCOPES).optional().default('global'),
  category: z.enum(LEADERBOARD_CATEGORIES).optional().default('overall'),
  page: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = parseInt(val || '1', 10);
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = parseInt(val || String(LEADERBOARD_CONSTANTS.DEFAULT_PAGE_SIZE), 10);
      if (isNaN(parsed) || parsed < LEADERBOARD_CONSTANTS.MIN_PAGE_SIZE) {
        return LEADERBOARD_CONSTANTS.DEFAULT_PAGE_SIZE;
      }
      return Math.min(parsed, LEADERBOARD_CONSTANTS.MAX_PAGE_SIZE);
    }),
});

export type LeaderboardQueryInput = z.infer<typeof leaderboardQuerySchema>;
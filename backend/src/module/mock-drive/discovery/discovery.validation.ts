// src/module/mock-drive/discovery/discovery.validation.ts

import { z } from 'zod';
import { MockDriveStatus } from '@prisma/client';

// Helper to parse comma-separated string to array
const statusArraySchema = z
  .string()
  .transform((val) => val.split(',').map((s) => s.trim()))
  .pipe(z.array(z.nativeEnum(MockDriveStatus)))
  .optional();

// Alternative: Accept both string and array
const statusSchema = z
  .union([
    z.string().transform((val) => val.split(',').map((s) => s.trim())),
    z.array(z.string()),
  ])
  .pipe(z.array(z.nativeEnum(MockDriveStatus)))
  .optional();

export const discoveryListSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().min(1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .pipe(z.number().min(1).max(100)),
    status: statusSchema,
    instituteId: z.string().optional(),
    search: z.string().optional(),
    registrationOpen: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
});

export const mockDriveIdSchema = z.object({
  params: z.object({
    driveId: z.string().min(1, 'Drive ID is required'),
  }),
});

export type DiscoveryListInput = z.infer<typeof discoveryListSchema>;
export type MockDriveIdInput = z.infer<typeof mockDriveIdSchema>;
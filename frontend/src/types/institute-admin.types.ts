// src/types/institute-admin.types.ts

export * from './admin.mockdrive.types';

// ============================================
// Institute Types
// ============================================

export interface Institute {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstituteProfile {
  id: string;
  instituteId: string;
  logoUrl: string | null;
  location: string | null;
  totalStudents: number;
}

// ============================================
// Dashboard Stats
// ============================================

export interface InstituteDashboardStats {
  totalMockDrives: number;
  activeMockDrives: number;
  totalStudents: number;
  totalRegistrations: number;
  completedDrives: number;
  upcomingDrives: number;
}
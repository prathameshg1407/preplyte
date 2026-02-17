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

export interface Student {
  id: string;
  email: string;
  name?: string;
  studentId: string;
  departmentId?: string;
  courseYear?: string;
  averageCgpa?: number;
  isActive: boolean;
  createdAt: string;
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


//Student Profile

export interface Student {
  isActive: boolean;
  id: string;
  name: string;
  email: string;
  studentId: string;
  departmentId: string | null;
  courseYear: string | null;
  numberOfBacklogs: number | null;
  averageCgpa: number | null;
  marks10: number | null;
  marks12: number | null;
  skills: string[];
}
// src/lib/constants/mockdrive.constants.ts

import { MockDriveStatus, MockDriveModuleType, MockDriveAttemptStatus, MockDriveModuleAttemptStatus, MockDriveRegistrationStatus } from '@prisma/client';

export const MOCKDRIVE_STATUS_CONFIG: Record<MockDriveStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  PUBLISHED: { label: 'Published', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  REGISTRATION_OPEN: { label: 'Registration Open', color: 'text-green-600', bgColor: 'bg-green-100' },
  REGISTRATION_CLOSED: { label: 'Registration Closed', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  COMPLETED: { label: 'Completed', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const MODULE_TYPE_CONFIG: Record<MockDriveModuleType, { label: string; icon: string; color: string }> = {
  APTITUDE: { label: 'Aptitude Test', icon: 'Brain', color: 'text-blue-500' },
  MACHINE_CODING: { label: 'Machine Coding', icon: 'Code', color: 'text-green-500' },
  AI_INTERVIEW: { label: 'AI Interview', icon: 'MessageSquare', color: 'text-purple-500' },
};

export const ATTEMPT_STATUS_CONFIG: Record<MockDriveAttemptStatus, { label: string; color: string }> = {
  NOT_STARTED: { label: 'Not Started', color: 'text-gray-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-500' },
  COMPLETED: { label: 'Completed', color: 'text-green-500' },
  TIMED_OUT: { label: 'Timed Out', color: 'text-orange-500' },
  ABANDONED: { label: 'Abandoned', color: 'text-red-500' },
};

export const MODULE_ATTEMPT_STATUS_CONFIG: Record<MockDriveModuleAttemptStatus, { label: string; color: string; bgColor: string }> = {
  LOCKED: { label: 'Locked', color: 'text-gray-400', bgColor: 'bg-gray-100' },
  AVAILABLE: { label: 'Available', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  COMPLETED: { label: 'Completed', color: 'text-green-500', bgColor: 'bg-green-50' },
  TIMED_OUT: { label: 'Timed Out', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  SKIPPED: { label: 'Skipped', color: 'text-gray-500', bgColor: 'bg-gray-50' },
};

export const REGISTRATION_STATUS_CONFIG: Record<MockDriveRegistrationStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  APPROVED: { label: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100' },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  WITHDRAWN: { label: 'Withdrawn', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export const TIME_WARNING_THRESHOLD_SECONDS = 300; // 5 minutes
export const AUTO_SUBMIT_BUFFER_SECONDS = 30;
// src/module/mock-drive/utils/time.utils.ts

export function calculateTimeRemaining(expiresAt: Date | null): number {
  if (!expiresAt) return 0;
  const now = new Date();
  const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
  return remaining;
}

export function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

export function calculateExpiresAt(startedAt: Date, timeLimitMinutes: number): Date {
  return new Date(startedAt.getTime() + timeLimitMinutes * 60 * 1000);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function isWithinRegistrationPeriod(
  registrationStartDate: Date | null,
  registrationEndDate: Date | null
): boolean {
  const now = new Date();
  
  if (registrationStartDate && now < registrationStartDate) {
    return false;
  }
  
  if (registrationEndDate && now > registrationEndDate) {
    return false;
  }
  
  return true;
}

export function canStartAttempt(
  batchScheduledStartTime: Date,
  batchScheduledEndTime: Date,
  gracePeriodMinutes: number = 15
): { canStart: boolean; reason?: string } {
  const now = new Date();
  const startWithGrace = new Date(batchScheduledStartTime.getTime() - gracePeriodMinutes * 60 * 1000);
  
  if (now < startWithGrace) {
    return {
      canStart: false,
      reason: `Batch starts at ${batchScheduledStartTime.toLocaleString()}`,
    };
  }
  
  if (now > batchScheduledEndTime) {
    return {
      canStart: false,
      reason: 'Batch time has ended',
    };
  }
  
  return { canStart: true };
}
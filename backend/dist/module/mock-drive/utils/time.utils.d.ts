export declare function calculateTimeRemaining(expiresAt: Date | null): number;
export declare function isExpired(expiresAt: Date | null): boolean;
export declare function calculateExpiresAt(startedAt: Date, timeLimitMinutes: number): Date;
export declare function formatDuration(seconds: number): string;
export declare function isWithinRegistrationPeriod(registrationStartDate: Date | null, registrationEndDate: Date | null): boolean;
export declare function canStartAttempt(batchScheduledStartTime: Date, batchScheduledEndTime: Date, gracePeriodMinutes?: number): {
    canStart: boolean;
    reason?: string;
};
//# sourceMappingURL=time.utils.d.ts.map
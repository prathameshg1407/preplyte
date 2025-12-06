"use strict";
// src/module/mock-drive/utils/time.utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTimeRemaining = calculateTimeRemaining;
exports.isExpired = isExpired;
exports.calculateExpiresAt = calculateExpiresAt;
exports.formatDuration = formatDuration;
exports.isWithinRegistrationPeriod = isWithinRegistrationPeriod;
exports.canStartAttempt = canStartAttempt;
function calculateTimeRemaining(expiresAt) {
    if (!expiresAt)
        return 0;
    const now = new Date();
    const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    return remaining;
}
function isExpired(expiresAt) {
    if (!expiresAt)
        return false;
    return new Date() > expiresAt;
}
function calculateExpiresAt(startedAt, timeLimitMinutes) {
    return new Date(startedAt.getTime() + timeLimitMinutes * 60 * 1000);
}
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
}
function isWithinRegistrationPeriod(registrationStartDate, registrationEndDate) {
    const now = new Date();
    if (registrationStartDate && now < registrationStartDate) {
        return false;
    }
    if (registrationEndDate && now > registrationEndDate) {
        return false;
    }
    return true;
}
function canStartAttempt(batchScheduledStartTime, batchScheduledEndTime, gracePeriodMinutes = 15) {
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
//# sourceMappingURL=time.utils.js.map
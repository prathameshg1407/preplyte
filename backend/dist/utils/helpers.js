"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAccuracy = exports.calculateScore = exports.shuffleArray = exports.getSessionStatus = exports.calculateTimeRemaining = exports.formatTimeRemaining = void 0;
const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
exports.formatTimeRemaining = formatTimeRemaining;
const calculateTimeRemaining = (expiresAt) => {
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
};
exports.calculateTimeRemaining = calculateTimeRemaining;
const getSessionStatus = (completedAt, expiresAt) => {
    if (completedAt)
        return 'completed';
    if (new Date() > expiresAt)
        return 'expired';
    return 'in_progress';
};
exports.getSessionStatus = getSessionStatus;
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
exports.shuffleArray = shuffleArray;
const calculateScore = (correct, total) => {
    if (total === 0)
        return 0;
    return Math.round((correct / total) * 100);
};
exports.calculateScore = calculateScore;
const calculateAccuracy = (correct, attempted) => {
    if (attempted === 0)
        return 0;
    return Math.round((correct / attempted) * 100 * 100) / 100;
};
exports.calculateAccuracy = calculateAccuracy;
//# sourceMappingURL=helpers.js.map
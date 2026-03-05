"use strict";
// src/modules/instituteadmin/mock-drive/analytics/analytics.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../../../lib/db");
const mockdrive_types_1 = require("../mockdrive.types");
// ============================================
// Constants
// ============================================
const DEFAULT_SCORE_RANGES = [
    { label: '0-20%', min: 0, max: 20, count: 0, percentage: 0 },
    { label: '21-40%', min: 21, max: 40, count: 0, percentage: 0 },
    { label: '41-60%', min: 41, max: 60, count: 0, percentage: 0 },
    { label: '61-80%', min: 61, max: 80, count: 0, percentage: 0 },
    { label: '81-100%', min: 81, max: 100, count: 0, percentage: 0 },
];
const MODULE_ATTEMPT_COMPLETED_STATUSES = [
    client_1.MockDriveModuleAttemptStatus.COMPLETED,
    client_1.MockDriveModuleAttemptStatus.TIMED_OUT,
];
// ============================================
// Service Class
// ============================================
class AnalyticsService {
    // ==========================================
    // Get Full Analytics
    // ==========================================
    async getFullAnalytics(mockDriveId, instituteId, query) {
        await this.verifyMockDriveAccess(mockDriveId, instituteId);
        const batchId = query?.batchId;
        const [overview, scoreDistribution, modulePerformance, batchComparison, timeAnalysis, completionTrend, departmentBreakdown, courseYearBreakdown,] = await Promise.all([
            this.getOverview(mockDriveId, batchId),
            this.getScoreDistribution(mockDriveId, batchId),
            this.getModulePerformance(mockDriveId, batchId),
            this.getBatchComparison(mockDriveId),
            this.getTimeAnalysis(mockDriveId, batchId),
            this.getCompletionTrend(mockDriveId, batchId, query?.startDate, query?.endDate),
            this.getDepartmentBreakdown(mockDriveId, batchId),
            this.getCourseYearBreakdown(mockDriveId, batchId),
        ]);
        return {
            overview,
            scoreDistribution,
            modulePerformance,
            batchComparison,
            timeAnalysis,
            completionTrend,
            departmentBreakdown,
            courseYearBreakdown,
        };
    }
    // ==========================================
    // Get Overview
    // ==========================================
    async getOverview(mockDriveId, batchId) {
        const attemptWhere = this.buildAttemptWhere(mockDriveId, batchId);
        const [registrationStats, attemptStats, batchStats, scoreStats, medianScore] = await Promise.all([
            db_1.prisma.mockDriveRegistration.groupBy({
                by: ['status'],
                where: { mockDriveId },
                _count: { id: true },
            }),
            db_1.prisma.mockDriveAttempt.groupBy({
                by: ['status'],
                where: attemptWhere,
                _count: { id: true },
            }),
            db_1.prisma.mockDriveBatch.groupBy({
                by: ['status'],
                where: { mockDriveId },
                _count: { id: true },
            }),
            db_1.prisma.mockDriveAttempt.aggregate({
                where: {
                    ...attemptWhere,
                    status: client_1.MockDriveAttemptStatus.COMPLETED,
                },
                _avg: { totalScore: true },
                _max: { totalScore: true },
                _min: { totalScore: true },
            }),
            this.getMedianScore(mockDriveId, batchId),
        ]);
        const regMap = this.toCountMap(registrationStats);
        const attemptMap = this.toCountMap(attemptStats);
        const batchMap = this.toCountMap(batchStats);
        const totalRegistered = this.sumCounts(registrationStats);
        const totalStarted = this.sumCounts(attemptStats);
        const totalCompleted = attemptMap.get(client_1.MockDriveAttemptStatus.COMPLETED) ?? 0;
        return {
            registrations: {
                total: totalRegistered,
                approved: regMap.get('APPROVED') ?? 0,
                pending: regMap.get('PENDING') ?? 0,
                rejected: regMap.get('REJECTED') ?? 0,
            },
            participation: {
                totalRegistered: regMap.get('APPROVED') ?? 0,
                totalStarted,
                totalCompleted,
                completionRate: this.calculateRate(totalCompleted, totalStarted),
            },
            scores: {
                average: scoreStats._avg.totalScore,
                highest: scoreStats._max.totalScore,
                lowest: scoreStats._min.totalScore,
                median: medianScore,
            },
            batches: {
                total: this.sumCounts(batchStats),
                completed: batchMap.get(client_1.MockDriveBatchStatus.COMPLETED) ?? 0,
                inProgress: batchMap.get(client_1.MockDriveBatchStatus.IN_PROGRESS) ?? 0,
                scheduled: (batchMap.get(client_1.MockDriveBatchStatus.CREATED) ?? 0) +
                    (batchMap.get(client_1.MockDriveBatchStatus.SCHEDULED) ?? 0),
            },
        };
    }
    // ==========================================
    // Get Score Distribution
    // ==========================================
    async getScoreDistribution(mockDriveId, batchId, bucketSize = 20) {
        const attempts = await db_1.prisma.mockDriveAttempt.findMany({
            where: {
                ...this.buildAttemptWhere(mockDriveId, batchId),
                status: client_1.MockDriveAttemptStatus.COMPLETED,
                percentageScore: { not: null },
            },
            select: { percentageScore: true },
        });
        const ranges = this.createScoreRanges(bucketSize);
        const total = attempts.length;
        for (const attempt of attempts) {
            const score = attempt.percentageScore ?? 0;
            const range = ranges.find((r) => score >= r.min && score <= r.max);
            if (range)
                range.count++;
        }
        for (const range of ranges) {
            range.percentage = this.calculateRate(range.count, total);
        }
        return { ranges, totalStudents: total };
    }
    // ==========================================
    // Get Module Performance
    // ==========================================
    async getModulePerformance(mockDriveId, batchId) {
        const modules = await db_1.prisma.mockDriveModule.findMany({
            where: { mockDriveId, isActive: true },
            orderBy: { order: 'asc' },
        });
        const performances = await Promise.all(modules.map(async (module) => {
            const moduleAttemptWhere = this.buildModuleAttemptWhere(module.id, batchId);
            const [moduleAttempts, totalExpectedAttempts] = await Promise.all([
                db_1.prisma.mockDriveModuleAttempt.findMany({
                    where: {
                        ...moduleAttemptWhere,
                        status: { in: MODULE_ATTEMPT_COMPLETED_STATUSES },
                    },
                    select: {
                        score: true,
                        maxScore: true,
                        percentage: true,
                        isPassed: true,
                        timeSpentSeconds: true,
                    },
                }),
                db_1.prisma.mockDriveModuleAttempt.count({
                    where: moduleAttemptWhere,
                }),
            ]);
            const stats = this.calculateModuleStats(moduleAttempts);
            stats.completionRate = this.calculateRate(moduleAttempts.length, totalExpectedAttempts);
            const scoreDistribution = this.calculateModuleScoreDistribution(moduleAttempts.map((a) => a.percentage ?? 0));
            return {
                moduleId: module.id,
                moduleName: module.name ?? `Module ${module.order}`,
                moduleType: module.moduleType,
                order: module.order,
                stats,
                scoreDistribution,
            };
        }));
        return performances;
    }
    // ==========================================
    // Get Batch Comparison
    // ==========================================
    async getBatchComparison(mockDriveId) {
        const batches = await db_1.prisma.mockDriveBatch.findMany({
            where: { mockDriveId },
            orderBy: { batchNumber: 'asc' },
            include: {
                _count: { select: { registrations: true } },
            },
        });
        const comparisons = await Promise.all(batches.map(async (batch) => {
            const completedWhere = {
                batchId: batch.id,
                status: client_1.MockDriveAttemptStatus.COMPLETED,
            };
            const [attemptStats, passedCount] = await Promise.all([
                db_1.prisma.mockDriveAttempt.aggregate({
                    where: completedWhere,
                    _count: { id: true },
                    _avg: { totalScore: true, percentageScore: true },
                    _max: { totalScore: true },
                    _min: { totalScore: true },
                }),
                db_1.prisma.mockDriveAttempt.count({
                    where: { ...completedWhere, isPassed: true },
                }),
            ]);
            return {
                batchId: batch.id,
                batchName: batch.name,
                batchNumber: batch.batchNumber,
                totalStudents: batch._count.registrations,
                completedStudents: attemptStats._count.id,
                averageScore: attemptStats._avg.totalScore,
                averagePercentage: attemptStats._avg.percentageScore,
                highestScore: attemptStats._max.totalScore,
                lowestScore: attemptStats._min.totalScore,
                passRate: this.calculatePercentageNullable(passedCount, attemptStats._count.id),
            };
        }));
        return comparisons;
    }
    // ==========================================
    // Get Time Analysis
    // ==========================================
    async getTimeAnalysis(mockDriveId, batchId) {
        const completedAttempts = await db_1.prisma.mockDriveAttempt.findMany({
            where: {
                ...this.buildAttemptWhere(mockDriveId, batchId),
                status: client_1.MockDriveAttemptStatus.COMPLETED,
                startedAt: { not: null },
                completedAt: { not: null },
            },
            select: {
                startedAt: true,
                completedAt: true,
            },
        });
        const durations = completedAttempts
            .filter((a) => a.startedAt && a.completedAt)
            .map((a) => Math.floor((a.completedAt.getTime() - a.startedAt.getTime()) / 1000));
        const overall = {
            averageDuration: this.calculateAverage(durations),
            minDuration: durations.length > 0 ? Math.min(...durations) : null,
            maxDuration: durations.length > 0 ? Math.max(...durations) : null,
        };
        const modules = await db_1.prisma.mockDriveModule.findMany({
            where: { mockDriveId, isActive: true },
            orderBy: { order: 'asc' },
        });
        const byModule = await Promise.all(modules.map(async (module) => {
            const moduleAttempts = await db_1.prisma.mockDriveModuleAttempt.aggregate({
                where: {
                    ...this.buildModuleAttemptWhere(module.id, batchId),
                    status: { in: MODULE_ATTEMPT_COMPLETED_STATUSES },
                },
                _avg: { timeSpentSeconds: true },
            });
            const avgTime = moduleAttempts._avg.timeSpentSeconds;
            const timeLimitSeconds = module.timeLimit * 60;
            return {
                moduleId: module.id,
                moduleName: module.name ?? `Module ${module.order}`,
                moduleType: module.moduleType,
                timeLimit: module.timeLimit,
                averageTimeUsed: avgTime,
                averageTimeUsedPercentage: avgTime !== null ? (avgTime / timeLimitSeconds) * 100 : null,
            };
        }));
        return { overall, byModule };
    }
    // ==========================================
    // Get Completion Trend
    // ==========================================
    async getCompletionTrend(mockDriveId, batchId, startDate, endDate) {
        const completedAtWhere = this.buildDateRangeWhere(startDate, endDate);
        const completedAttempts = await db_1.prisma.mockDriveAttempt.findMany({
            where: {
                ...this.buildAttemptWhere(mockDriveId, batchId),
                status: client_1.MockDriveAttemptStatus.COMPLETED,
                completedAt: completedAtWhere,
            },
            select: { completedAt: true },
            orderBy: { completedAt: 'asc' },
        });
        if (completedAttempts.length === 0) {
            return [];
        }
        const dateMap = new Map();
        for (const attempt of completedAttempts) {
            if (attempt.completedAt) {
                const dateStr = attempt.completedAt.toISOString().split('T')[0];
                dateMap.set(dateStr, (dateMap.get(dateStr) ?? 0) + 1);
            }
        }
        const trend = [];
        let cumulative = 0;
        for (const date of Array.from(dateMap.keys()).sort()) {
            const count = dateMap.get(date);
            cumulative += count;
            trend.push({ date, completed: count, cumulative });
        }
        return trend;
    }
    // ==========================================
    // Get Department Breakdown
    // ==========================================
    async getDepartmentBreakdown(mockDriveId, batchId) {
        const attempts = await db_1.prisma.mockDriveAttempt.findMany({
            where: this.buildAttemptWhere(mockDriveId, batchId),
            include: {
                user: {
                    include: {
                        profile: { select: { departmentId: true } },
                    },
                },
            },
        });
        const departmentMap = this.groupAttemptsByField(attempts, (a) => a.user.profile?.departmentId ?? 'Unknown');
        return Array.from(departmentMap.entries())
            .map(([departmentId, stats]) => ({
            departmentId,
            totalStudents: stats.total,
            completedStudents: stats.completed,
            averageScore: this.calculateAverage(stats.scores),
            passRate: this.calculatePercentageNullable(stats.passed, stats.completed),
        }))
            .sort((a, b) => b.totalStudents - a.totalStudents);
    }
    // ==========================================
    // Get Course Year Breakdown
    // ==========================================
    async getCourseYearBreakdown(mockDriveId, batchId) {
        const attempts = await db_1.prisma.mockDriveAttempt.findMany({
            where: this.buildAttemptWhere(mockDriveId, batchId),
            include: {
                user: {
                    include: {
                        profile: { select: { courseYear: true } },
                    },
                },
            },
        });
        const yearMap = this.groupAttemptsByField(attempts, (a) => a.user.profile?.courseYear ?? 'Unknown');
        return Array.from(yearMap.entries())
            .map(([courseYear, stats]) => ({
            courseYear,
            totalStudents: stats.total,
            completedStudents: stats.completed,
            averageScore: this.calculateAverage(stats.scores),
            passRate: this.calculatePercentageNullable(stats.passed, stats.completed),
        }))
            .sort((a, b) => a.courseYear.localeCompare(b.courseYear));
    }
    // ==========================================
    // Private Helper Methods - Query Builders
    // ==========================================
    buildAttemptWhere(mockDriveId, batchId) {
        return {
            mockDriveId,
            ...(batchId && { batchId }),
        };
    }
    buildModuleAttemptWhere(moduleId, batchId) {
        return {
            moduleId,
            ...(batchId && { attempt: { batchId } }),
        };
    }
    buildDateRangeWhere(startDate, endDate) {
        return {
            not: null,
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
        };
    }
    // ==========================================
    // Private Helper Methods - Calculations
    // ==========================================
    /**
     * Returns a percentage (0-100), always returns a number (0 if no data)
     * Use for fields that should never be null (completionRate, percentage in ranges)
     */
    calculateRate(numerator, denominator) {
        return denominator > 0 ? (numerator / denominator) * 100 : 0;
    }
    /**
     * Returns a percentage (0-100) or null if no data
     * Use for optional percentage fields (passRate, averagePercentage)
     */
    calculatePercentageNullable(numerator, denominator) {
        return denominator > 0 ? (numerator / denominator) * 100 : null;
    }
    /**
     * Returns average or null if no values
     */
    calculateAverage(values) {
        return values.length > 0
            ? values.reduce((sum, v) => sum + v, 0) / values.length
            : null;
    }
    toCountMap(stats) {
        return new Map(stats.map((s) => [s.status, s._count.id]));
    }
    sumCounts(stats) {
        return stats.reduce((sum, s) => sum + s._count.id, 0);
    }
    // ==========================================
    // Private Helper Methods - Data Processing
    // ==========================================
    groupAttemptsByField(attempts, getField) {
        const map = new Map();
        for (const attempt of attempts) {
            const field = getField(attempt);
            if (!map.has(field)) {
                map.set(field, { total: 0, completed: 0, scores: [], passed: 0 });
            }
            const stats = map.get(field);
            stats.total++;
            if (attempt.status === client_1.MockDriveAttemptStatus.COMPLETED) {
                stats.completed++;
                if (attempt.totalScore !== null) {
                    stats.scores.push(attempt.totalScore);
                }
                if (attempt.isPassed) {
                    stats.passed++;
                }
            }
        }
        return map;
    }
    // ==========================================
    // Private Helper Methods - Access Control
    // ==========================================
    async verifyMockDriveAccess(mockDriveId, instituteId) {
        const mockDrive = await db_1.prisma.mockDrive.findUnique({
            where: { id: mockDriveId },
            select: { id: true, instituteId: true },
        });
        if (!mockDrive) {
            throw new mockdrive_types_1.MockDriveNotFoundError(mockDriveId);
        }
        if (mockDrive.instituteId !== instituteId) {
            throw new mockdrive_types_1.MockDriveAccessDeniedError();
        }
    }
    // ==========================================
    // Private Helper Methods - Score Calculations
    // ==========================================
    async getMedianScore(mockDriveId, batchId) {
        const scores = await db_1.prisma.mockDriveAttempt.findMany({
            where: {
                ...this.buildAttemptWhere(mockDriveId, batchId),
                status: client_1.MockDriveAttemptStatus.COMPLETED,
                totalScore: { not: null },
            },
            select: { totalScore: true },
            orderBy: { totalScore: 'asc' },
        });
        if (scores.length === 0)
            return null;
        const mid = Math.floor(scores.length / 2);
        if (scores.length % 2 === 0) {
            return (((scores[mid - 1].totalScore ?? 0) + (scores[mid].totalScore ?? 0)) / 2);
        }
        return scores[mid].totalScore;
    }
    createScoreRanges(bucketSize) {
        const ranges = [];
        let start = 0;
        while (start < 100) {
            const end = Math.min(start + bucketSize - 1, 100);
            ranges.push({
                label: `${start}-${end}%`,
                min: start,
                max: end,
                count: 0,
                percentage: 0,
            });
            start = end + 1;
        }
        return ranges;
    }
    calculateModuleStats(moduleAttempts) {
        const totalAttempts = moduleAttempts.length;
        const completedWithScore = moduleAttempts.filter((a) => a.score !== null);
        const scores = completedWithScore.map((a) => a.score ?? 0);
        const percentages = completedWithScore.map((a) => a.percentage ?? 0);
        const times = moduleAttempts.map((a) => a.timeSpentSeconds);
        const passedCount = moduleAttempts.filter((a) => a.isPassed).length;
        return {
            averageScore: this.calculateAverage(scores),
            averagePercentage: this.calculateAverage(percentages),
            averageTimeSpent: this.calculateAverage(times),
            passRate: this.calculatePercentageNullable(passedCount, totalAttempts),
            completionRate: 0, // Will be set by caller
        };
    }
    calculateModuleScoreDistribution(percentages) {
        const ranges = DEFAULT_SCORE_RANGES.map((r) => ({ ...r }));
        const total = percentages.length;
        for (const score of percentages) {
            const range = ranges.find((r) => score >= r.min && score <= r.max);
            if (range)
                range.count++;
        }
        for (const range of ranges) {
            range.percentage = this.calculateRate(range.count, total);
        }
        return ranges;
    }
}
exports.AnalyticsService = AnalyticsService;
// ============================================
// Export Singleton Instance
// ============================================
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=analytics.service.js.map
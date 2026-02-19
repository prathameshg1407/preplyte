// src/module/leaderboard/leaderboard.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { logger } from '../../utils/logger';
import { BadRequestError } from '../../utils/errors';
import {
    LeaderboardFilters,
    LeaderboardResponse,
    LeaderboardEntry,
    LeaderboardConfigResponse,
    CurrentUserRank,
    UserScoreWithDetails,
    UserDetails,
    ScoreBreakdown,
    LeaderboardCategory,
    UserDetailedStats,
} from './leaderboard.types';
import {
    LEADERBOARD_CATEGORIES,
    LEADERBOARD_SCOPES,
    CATEGORY_LABELS,
    SCORE_DESCRIPTIONS,
    SCORE_UNITS,
    ERROR_MESSAGES,
} from './leaderboard.constants';

// =====================================================
// SERVICE CLASS
// =====================================================

class LeaderboardService {
    // ===================================================
    // MAIN LEADERBOARD QUERY
    // ===================================================

    async getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardResponse> {
        const { scope, category, page, limit, userId, instituteId } = filters;

        logger.info('[LeaderboardService] Fetching leaderboard', {
            scope,
            category,
            page,
            limit,
            userId,
        });

        // Validate institute scope
        if (scope === 'institute' && !instituteId) {
            throw new BadRequestError(ERROR_MESSAGES.INSTITUTE_REQUIRED);
        }

        // Get all user scores for the category
        const userScores = await this.getUserScoresByCategory(category, scope, instituteId);

        // Sort by score descending
        userScores.sort((a, b) => b.score - a.score);

        // Calculate total items and pagination
        const totalItems = userScores.length;
        const totalPages = Math.ceil(totalItems / limit);
        const skip = (page - 1) * limit;

        // Get paginated entries with ranks
        const paginatedScores = userScores.slice(skip, skip + limit);

        const scoreUnit = SCORE_UNITS[category];

        const entries: LeaderboardEntry[] = paginatedScores.map((user, index) => ({
            rank: skip + index + 1,
            userId: user.userId,
            userName: user.userName,
            profilePictureUrl: user.profilePictureUrl,
            instituteName: user.instituteName,
            departmentName: user.departmentName,
            score: user.score,
            scoreUnit,
            isCurrentUser: user.userId === userId,
        }));

        // Get current user's rank and score breakdown
        const currentUserScoreBreakdown = await this.getUserScoreBreakdown(userId);
        const currentUser = this.calculateCurrentUserRank(
            userScores,
            userId,
            currentUserScoreBreakdown
        );

        return {
            category,
            categoryLabel: CATEGORY_LABELS[category],
            scoreUnit,
            scope,
            entries,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            currentUser,
            lastUpdated: new Date(),
        };
    }

    // ===================================================
    // GET LEADERBOARD CONFIG
    // ===================================================

    getConfig(instituteId: string | null): LeaderboardConfigResponse {
        const categories = LEADERBOARD_CATEGORIES.map((cat) => ({
            value: cat,
            label: CATEGORY_LABELS[cat],
            description: SCORE_DESCRIPTIONS[cat],
            unit: SCORE_UNITS[cat],
        }));

        const scopes = LEADERBOARD_SCOPES.filter((scope) => {
            if (scope === 'global') return true;
            if (scope === 'institute') return instituteId !== null;
            return false;
        }).map((scope) => ({
            value: scope,
            label: scope === 'global' ? 'Global' : 'Institute',
            available: true,
        }));

        return {
            categories,
            scopes,
            defaultCategory: 'overall',
            defaultScope: 'global',
        };
    }

    // ===================================================
    // SCORE CALCULATION BY CATEGORY
    // ===================================================

    private async getUserScoresByCategory(
        category: LeaderboardCategory,
        scope: string,
        instituteId: string | null
    ): Promise<UserScoreWithDetails[]> {
        switch (category) {
            case 'lms':
                return this.getLmsScores(scope, instituteId);
            case 'aptitude':
                return this.getAptitudeScores(scope, instituteId);
            case 'coding':
                return this.getCodingScores(scope, instituteId);
            case 'ai_interview':
                return this.getAiInterviewScores(scope, instituteId);
            case 'mock_drive':
                return this.getMockDriveScores(scope, instituteId);
            case 'overall':
            default:
                return this.getOverallScores(scope, instituteId);
        }
    }

    // ===================================================
    // LMS SCORES - Total points earned from courses
    // ===================================================

    private async getLmsScores(
        scope: string,
        instituteId: string | null
    ): Promise<UserScoreWithDetails[]> {
        const whereClause: Prisma.LmsEnrollmentWhereInput = {};

        if (scope === 'institute' && instituteId) {
            whereClause.user = { instituteId };
        }

        // Sum of totalPointsEarned (actual points earned from courses)
        const enrollments = await prisma.lmsEnrollment.groupBy({
            by: ['userId'],
            where: whereClause,
            _sum: {
                totalPointsEarned: true,
            },
        });

        const userIds = enrollments.map((e) => e.userId);
        const userDetails = await this.getUserDetails(userIds);

        return enrollments
            .map((e) => ({
                userId: e.userId,
                score: e._sum.totalPointsEarned || 0,
                ...this.getDefaultUserDetails(e.userId, userDetails),
            }))
            .filter((e) => e.score > 0);
    }

    // ===================================================
    // APTITUDE SCORES - Total correct answers
    // ===================================================

    private async getAptitudeScores(
        scope: string,
        instituteId: string | null
    ): Promise<UserScoreWithDetails[]> {
        const whereClause: Prisma.AptitudePracticeSessionWhereInput = {
            completedAt: { not: null },
        };

        if (scope === 'institute' && instituteId) {
            whereClause.user = { instituteId };
        }

        // Sum of totalCorrect (actual number of correct answers)
        const sessions = await prisma.aptitudePracticeSession.groupBy({
            by: ['userId'],
            where: whereClause,
            _sum: {
                totalCorrect: true,
            },
        });

        const userIds = sessions.map((s) => s.userId);
        const userDetails = await this.getUserDetails(userIds);

        return sessions
            .map((s) => ({
                userId: s.userId,
                score: s._sum.totalCorrect || 0,
                ...this.getDefaultUserDetails(s.userId, userDetails),
            }))
            .filter((s) => s.score > 0);
    }

    // ===================================================
    // CODING SCORES - Total problems solved
    // ===================================================

    private async getCodingScores(
        scope: string,
        instituteId: string | null
    ): Promise<UserScoreWithDetails[]> {
        const whereClause: Prisma.MachinePracticeSessionWhereInput = {
            completedAt: { not: null },
        };

        if (scope === 'institute' && instituteId) {
            whereClause.user = { instituteId };
        }

        // Sum of totalSolved (actual number of problems solved)
        const sessions = await prisma.machinePracticeSession.groupBy({
            by: ['userId'],
            where: whereClause,
            _sum: {
                totalSolved: true,
            },
        });

        const userIds = sessions.map((s) => s.userId);
        const userDetails = await this.getUserDetails(userIds);

        return sessions
            .map((s) => ({
                userId: s.userId,
                score: s._sum.totalSolved || 0,
                ...this.getDefaultUserDetails(s.userId, userDetails),
            }))
            .filter((s) => s.score > 0);
    }

    // ===================================================
    // AI INTERVIEW SCORES - Overall score from feedback
    // ===================================================

    private async getAiInterviewScores(
        scope: string,
        instituteId: string | null
    ): Promise<UserScoreWithDetails[]> {
        const whereClause: Prisma.AiInterviewFeedbackWhereInput = {};

        if (scope === 'institute' && instituteId) {
            whereClause.user = { instituteId };
        }

        // Sum of overallScore (actual score from AI feedback)
        const feedbacks = await prisma.aiInterviewFeedback.groupBy({
            by: ['userId'],
            where: whereClause,
            _sum: {
                overallScore: true,
            },
        });

        const userIds = feedbacks.map((f) => f.userId);
        const userDetails = await this.getUserDetails(userIds);

        return feedbacks
            .map((f) => ({
                userId: f.userId,
                // overallScore is Decimal, convert to number and round to 2 decimal places
                score: f._sum.overallScore ? Math.round(Number(f._sum.overallScore) * 100) / 100 : 0,
                ...this.getDefaultUserDetails(f.userId, userDetails),
            }))
            .filter((f) => f.score > 0);
    }

    // ===================================================
    // MOCK DRIVE SCORES - Total score from attempts
    // ===================================================

    private async getMockDriveScores(
        scope: string,
        instituteId: string | null
    ): Promise<UserScoreWithDetails[]> {
        const whereClause: Prisma.MockDriveAttemptWhereInput = {
            status: { in: ['COMPLETED', 'TIMED_OUT'] },
        };

        if (scope === 'institute' && instituteId) {
            whereClause.user = { instituteId };
        }

        // Sum of totalScore (actual score achieved in mock drives)
        const attempts = await prisma.mockDriveAttempt.groupBy({
            by: ['userId'],
            where: whereClause,
            _sum: {
                totalScore: true,
            },
        });

        const userIds = attempts.map((a) => a.userId);
        const userDetails = await this.getUserDetails(userIds);

        return attempts
            .map((a) => ({
                userId: a.userId,
                score: a._sum.totalScore ? Math.round(a._sum.totalScore * 100) / 100 : 0,
                ...this.getDefaultUserDetails(a.userId, userDetails),
            }))
            .filter((a) => a.score > 0);
    }

    // ===================================================
    // OVERALL SCORES (Sum of all categories)
    // ===================================================

    private async getOverallScores(
        scope: string,
        instituteId: string | null
    ): Promise<UserScoreWithDetails[]> {
        // Get all scores from each category in parallel
        const [lmsScores, aptitudeScores, codingScores, aiInterviewScores, mockDriveScores] =
            await Promise.all([
                this.getLmsScores(scope, instituteId),
                this.getAptitudeScores(scope, instituteId),
                this.getCodingScores(scope, instituteId),
                this.getAiInterviewScores(scope, instituteId),
                this.getMockDriveScores(scope, instituteId),
            ]);

        // Combine all scores by userId
        const scoreMap = new Map<string, UserScoreWithDetails>();

        const addScores = (scores: UserScoreWithDetails[]) => {
            for (const entry of scores) {
                const existing = scoreMap.get(entry.userId);
                if (existing) {
                    existing.score += entry.score;
                } else {
                    scoreMap.set(entry.userId, { ...entry });
                }
            }
        };

        addScores(lmsScores);
        addScores(aptitudeScores);
        addScores(codingScores);
        addScores(aiInterviewScores);
        addScores(mockDriveScores);

        // Round overall scores to 2 decimal places
        return Array.from(scoreMap.values())
            .map((s) => ({
                ...s,
                score: Math.round(s.score * 100) / 100,
            }))
            .filter((s) => s.score > 0);
    }

    // ===================================================
    // GET USER'S SCORE BREAKDOWN
    // ===================================================

    async getUserScoreBreakdown(userId: string): Promise<ScoreBreakdown> {
        const [lms, aptitude, coding, aiInterview, mockDrive] = await Promise.all([
            // LMS: Sum of totalPointsEarned
            prisma.lmsEnrollment.aggregate({
                where: { userId },
                _sum: { totalPointsEarned: true },
            }),
            // Aptitude: Sum of totalCorrect (correct answers)
            prisma.aptitudePracticeSession.aggregate({
                where: { userId, completedAt: { not: null } },
                _sum: { totalCorrect: true },
            }),
            // Coding: Sum of totalSolved (problems solved)
            prisma.machinePracticeSession.aggregate({
                where: { userId, completedAt: { not: null } },
                _sum: { totalSolved: true },
            }),
            // AI Interview: Sum of overallScore
            prisma.aiInterviewFeedback.aggregate({
                where: { userId },
                _sum: { overallScore: true },
            }),
            // Mock Drive: Sum of totalScore
            prisma.mockDriveAttempt.aggregate({
                where: { userId, status: { in: ['COMPLETED', 'TIMED_OUT'] } },
                _sum: { totalScore: true },
            }),
        ]);

        const lmsScore = lms._sum.totalPointsEarned || 0;
        const aptitudeScore = aptitude._sum.totalCorrect || 0;
        const codingScore = coding._sum.totalSolved || 0;
        const aiInterviewScore = aiInterview._sum.overallScore
            ? Math.round(Number(aiInterview._sum.overallScore) * 100) / 100
            : 0;
        const mockDriveScore = mockDrive._sum.totalScore
            ? Math.round(mockDrive._sum.totalScore * 100) / 100
            : 0;

        const overall =
            Math.round((lmsScore + aptitudeScore + codingScore + aiInterviewScore + mockDriveScore) * 100) / 100;

        return {
            lms: lmsScore,
            aptitude: aptitudeScore,
            coding: codingScore,
            aiInterview: aiInterviewScore,
            mockDrive: mockDriveScore,
            overall,
        };
    }

    // ===================================================
    // GET DETAILED USER STATS
    // ===================================================

    async getUserDetailedStats(userId: string): Promise<UserDetailedStats> {
        const [lmsData, aptitudeData, codingData, aiInterviewData, mockDriveData] = await Promise.all([
            // LMS details
            prisma.lmsEnrollment.aggregate({
                where: { userId, status: 'COMPLETED' },
                _count: true,
                _sum: { totalPointsEarned: true },
            }),
            // Aptitude details
            prisma.aptitudePracticeSession.aggregate({
                where: { userId, completedAt: { not: null } },
                _count: true,
                _sum: { totalCorrect: true, numberOfQuestions: true },
            }),
            // Coding details
            prisma.machinePracticeSession.aggregate({
                where: { userId, completedAt: { not: null } },
                _count: true,
                _sum: { totalSolved: true, numberOfQuestions: true },
            }),
            // AI Interview details
            prisma.aiInterviewFeedback.aggregate({
                where: { userId },
                _count: true,
                _sum: { overallScore: true },
                _avg: { overallScore: true },
            }),
            // Mock Drive details
            prisma.mockDriveAttempt.aggregate({
                where: { userId, status: { in: ['COMPLETED', 'TIMED_OUT'] } },
                _count: true,
                _sum: { totalScore: true },
                _avg: { totalScore: true },
            }),
        ]);

        const breakdown = await this.getUserScoreBreakdown(userId);

        // Calculate accuracy and solve rate
        const totalCorrect = aptitudeData._sum.totalCorrect || 0;
        const totalAptitudeQuestions = aptitudeData._sum.numberOfQuestions || 0;
        const aptitudeAccuracy =
            totalAptitudeQuestions > 0
                ? Math.round((totalCorrect / totalAptitudeQuestions) * 100 * 100) / 100
                : 0;

        const totalSolved = codingData._sum.totalSolved || 0;
        const totalCodingQuestions = codingData._sum.numberOfQuestions || 0;
        const codingSolveRate =
            totalCodingQuestions > 0
                ? Math.round((totalSolved / totalCodingQuestions) * 100 * 100) / 100
                : 0;

        return {
            breakdown,
            details: {
                lms: {
                    coursesCompleted: lmsData._count || 0,
                    totalPointsEarned: lmsData._sum.totalPointsEarned || 0,
                },
                aptitude: {
                    sessionsCompleted: aptitudeData._count || 0,
                    totalCorrect: totalCorrect,
                    totalQuestions: totalAptitudeQuestions,
                    accuracy: aptitudeAccuracy,
                },
                coding: {
                    sessionsCompleted: codingData._count || 0,
                    totalSolved: totalSolved,
                    totalQuestions: totalCodingQuestions,
                    solveRate: codingSolveRate,
                },
                aiInterview: {
                    interviewsCompleted: aiInterviewData._count || 0,
                    totalScore: aiInterviewData._sum.overallScore
                        ? Math.round(Number(aiInterviewData._sum.overallScore) * 100) / 100
                        : 0,
                    averageScore: aiInterviewData._avg.overallScore
                        ? Math.round(Number(aiInterviewData._avg.overallScore) * 100) / 100
                        : 0,
                },
                mockDrive: {
                    drivesCompleted: mockDriveData._count || 0,
                    totalScore: mockDriveData._sum.totalScore
                        ? Math.round(mockDriveData._sum.totalScore * 100) / 100
                        : 0,
                    averageScore: mockDriveData._avg.totalScore
                        ? Math.round(mockDriveData._avg.totalScore * 100) / 100
                        : 0,
                },
            },
        };
    }

    // ===================================================
    // HELPER METHODS
    // ===================================================

    private async getUserDetails(userIds: string[]): Promise<Map<string, UserDetails>> {
        if (userIds.length === 0) {
            return new Map();
        }

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                name: true,
                profilePictureUrl: true,
                profile: {
                    select: {
                        fullName: true,
                        department: {
                            select: { name: true },
                        },
                    },
                },
                institute: {
                    select: { name: true },
                },
            },
        });

        const map = new Map<string, UserDetails>();

        for (const user of users) {
            map.set(user.id, {
                userName: user.profile?.fullName || user.name || 'Anonymous User',
                profilePictureUrl: user.profilePictureUrl,
                instituteName: user.institute?.name || null,
                departmentName: user.profile?.department?.name || null,
            });
        }

        return map;
    }

    private getDefaultUserDetails(
        userId: string,
        userDetails: Map<string, UserDetails>
    ): UserDetails {
        const details = userDetails.get(userId);
        return (
            details || {
                userName: 'Anonymous User',
                profilePictureUrl: null,
                instituteName: null,
                departmentName: null,
            }
        );
    }

    private calculateCurrentUserRank(
        sortedScores: UserScoreWithDetails[],
        userId: string,
        scoreBreakdown: ScoreBreakdown
    ): CurrentUserRank {
        const userIndex = sortedScores.findIndex((s) => s.userId === userId);
        const totalParticipants = sortedScores.length;

        if (userIndex === -1) {
            return {
                rank: null,
                score: scoreBreakdown.overall,
                totalParticipants,
                percentile: null,
                scoreBreakdown,
            };
        }

        const rank = userIndex + 1;
        const score = sortedScores[userIndex].score;

        // Percentile: percentage of participants below the user
        const percentile =
            totalParticipants > 1
                ? Math.round(((totalParticipants - rank) / (totalParticipants - 1)) * 100)
                : 100;

        return {
            rank,
            score,
            totalParticipants,
            percentile,
            scoreBreakdown,
        };
    }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const leaderboardService = new LeaderboardService();
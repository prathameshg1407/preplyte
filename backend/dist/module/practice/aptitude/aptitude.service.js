"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aptitudeService = void 0;
const db_1 = require("../../../lib/db");
const aptitude_types_1 = require("./aptitude.types");
const errors_1 = require("../../../utils/errors");
const logger_1 = require("../../../utils/logger");
// =====================================================
// CONSTANTS
// =====================================================
const SESSION_SELECT_FIELDS = {
    id: true,
    difficulty: true,
    questionTypes: true,
    numberOfQuestions: true,
    timeLimit: true,
    startedAt: true,
    completedAt: true,
    expiresAt: true,
    totalScore: true,
    totalCorrect: true,
    totalWrong: true,
    totalUnanswered: true,
};
const QUESTION_SELECT_FIELDS = {
    id: true,
    questionText: true,
    questionType: true,
    difficulty: true,
    correctOptionId: true,
    explanation: true,
    options: {
        select: { id: true, text: true },
    },
};
// =====================================================
// HELPER FUNCTIONS (Pure, no side effects)
// =====================================================
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
const getSessionStatus = (completedAt, expiresAt) => {
    if (completedAt)
        return 'completed';
    return Date.now() > expiresAt.getTime() ? 'expired' : 'in_progress';
};
const calculateTimeRemaining = (expiresAt) => Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
const calculatePercentage = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;
const calculateTimeTaken = (startedAt, completedAt) => Math.floor((completedAt.getTime() - startedAt.getTime()) / 60000);
// =====================================================
// SERVICE CLASS
// =====================================================
class AptitudeService {
    // -------------------------------------------------
    // SESSION CREATION (OPTIMIZED)
    // -------------------------------------------------
    async createSession(userId, dto) {
        const { numberOfQuestions, timeLimit, difficulty, questionTypes } = dto;
        // Single transaction for all operations
        return db_1.prisma.$transaction(async (tx) => {
            // Check for active session
            const activeSession = await tx.aptitudePracticeSession.findFirst({
                where: {
                    userId,
                    completedAt: null,
                    expiresAt: { gt: new Date() },
                },
                select: { id: true, expiresAt: true },
            });
            if (activeSession) {
                throw new errors_1.SessionInProgressError(activeSession.id, activeSession.expiresAt);
            }
            // Fetch only required fields, limit to what we need
            const questions = await tx.aptitudeQuestion.findMany({
                where: {
                    isActive: true,
                    difficulty,
                    questionType: { in: questionTypes },
                },
                select: { id: true },
                take: numberOfQuestions * 2, // Fetch extra for better randomization
            });
            // FIX: Throw error if insufficient questions
            if (questions.length < numberOfQuestions) {
                logger_1.logger.warn(`Insufficient questions. Found: ${questions.length}, Requested: ${numberOfQuestions}`, { difficulty, questionTypes });
                throw new errors_1.InsufficientQuestionsError(questions.length, numberOfQuestions);
            }
            const selectedQuestions = shuffleArray(questions).slice(0, numberOfQuestions);
            const now = Date.now();
            const expiresAt = new Date(now + timeLimit * 60 * 1000);
            const startedAt = new Date(now);
            // Create session with questions in one operation
            const session = await tx.aptitudePracticeSession.create({
                data: {
                    userId,
                    difficulty,
                    questionTypes,
                    numberOfQuestions,
                    timeLimit,
                    startedAt,
                    expiresAt,
                    sessionQuestions: {
                        createMany: {
                            data: selectedQuestions.map((q, index) => ({
                                questionId: q.id,
                                order: index + 1,
                            })),
                        },
                    },
                },
                select: {
                    id: true,
                    difficulty: true,
                    questionTypes: true,
                    numberOfQuestions: true,
                    timeLimit: true,
                    startedAt: true,
                    expiresAt: true,
                    createdAt: true,
                },
            });
            return {
                ...session,
                completedAt: null,
                totalScore: null,
                totalCorrect: null,
                totalWrong: null,
                totalUnanswered: null,
            };
        });
    }
    // -------------------------------------------------
    // SESSION LISTING (OPTIMIZED)
    // -------------------------------------------------
    async listSessions(userId, filters) {
        const { page, limit, sortBy, sortOrder, status, difficulty } = filters;
        const skip = (page - 1) * limit;
        const where = this.buildSessionWhereClause(userId, { status, difficulty });
        // Parallel queries
        const [totalItems, sessions] = await Promise.all([
            db_1.prisma.aptitudePracticeSession.count({ where }),
            db_1.prisma.aptitudePracticeSession.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                select: SESSION_SELECT_FIELDS,
            }),
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            sessions: sessions.map((s) => ({
                ...s,
                status: getSessionStatus(s.completedAt, s.expiresAt),
            })),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    buildSessionWhereClause(userId, filters) {
        const where = { userId };
        const now = new Date();
        if (filters.difficulty) {
            where.difficulty = filters.difficulty;
        }
        switch (filters.status) {
            case 'completed':
                where.completedAt = { not: null };
                break;
            case 'in_progress':
                where.completedAt = null;
                where.expiresAt = { gt: now };
                break;
            case 'expired':
                where.completedAt = null;
                where.expiresAt = { lte: now };
                break;
        }
        return where;
    }
    // -------------------------------------------------
    // SESSION DETAILS (OPTIMIZED)
    // -------------------------------------------------
    async getSessionDetails(userId, sessionId) {
        const session = await db_1.prisma.aptitudePracticeSession.findFirst({
            where: { id: sessionId, userId },
            select: {
                ...SESSION_SELECT_FIELDS,
                updatedAt: true,
                _count: {
                    select: {
                        sessionQuestions: { where: { selectedOptionId: { not: null } } },
                    },
                },
                sessionQuestions: {
                    select: { id: true },
                    take: 1, // Just to get total count efficiently
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        const status = getSessionStatus(session.completedAt, session.expiresAt);
        const answered = session._count.sessionQuestions;
        const response = {
            id: session.id,
            difficulty: session.difficulty,
            questionTypes: session.questionTypes,
            numberOfQuestions: session.numberOfQuestions,
            timeLimit: session.timeLimit,
            startedAt: session.startedAt,
            expiresAt: session.expiresAt,
            completedAt: session.completedAt,
            totalScore: session.totalScore,
            status,
            timeRemaining: calculateTimeRemaining(session.expiresAt),
            progress: {
                answered,
                unanswered: session.numberOfQuestions - answered,
                total: session.numberOfQuestions,
            },
            updatedAt: session.updatedAt,
        };
        if (status === 'completed' && session.completedAt) {
            response.timeTaken = calculateTimeTaken(session.startedAt, session.completedAt);
            response.scorePercentage = session.totalScore;
        }
        return response;
    }
    // -------------------------------------------------
    // QUESTIONS (OPTIMIZED)
    // -------------------------------------------------
    async getSessionQuestions(userId, sessionId) {
        const session = await db_1.prisma.aptitudePracticeSession.findFirst({
            where: { id: sessionId, userId },
            select: {
                id: true,
                numberOfQuestions: true,
                completedAt: true,
                expiresAt: true,
                sessionQuestions: {
                    select: {
                        id: true,
                        order: true,
                        selectedOptionId: true,
                        answeredAt: true,
                        isCorrect: true,
                        question: { select: QUESTION_SELECT_FIELDS },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        const status = getSessionStatus(session.completedAt, session.expiresAt);
        const isCompleted = status === 'completed';
        let answeredCount = 0;
        const questions = session.sessionQuestions.map((sq) => {
            if (sq.selectedOptionId)
                answeredCount++;
            return {
                id: sq.question.id,
                order: sq.order,
                questionText: sq.question.questionText,
                questionType: sq.question.questionType,
                difficulty: sq.question.difficulty,
                options: sq.question.options.map((opt) => ({
                    id: opt.id,
                    text: opt.text,
                    ...(isCompleted && { isCorrect: opt.id === sq.question.correctOptionId }),
                })),
                selectedOptionId: sq.selectedOptionId,
                answeredAt: sq.answeredAt,
                ...(isCompleted && {
                    correctOptionId: sq.question.correctOptionId,
                    isCorrect: sq.isCorrect,
                }),
            };
        });
        return {
            sessionId: session.id,
            status,
            questions,
            totalQuestions: session.numberOfQuestions,
            answeredCount,
        };
    }
    async getQuestion(userId, sessionId, questionId) {
        // Optimized: Single query with all needed data
        const sessionQuestion = await db_1.prisma.aptitudeSessionQuestion.findFirst({
            where: {
                questionId,
                session: { id: sessionId, userId },
            },
            select: {
                id: true,
                order: true,
                selectedOptionId: true,
                answeredAt: true,
                question: { select: QUESTION_SELECT_FIELDS },
                session: {
                    select: {
                        id: true,
                        numberOfQuestions: true,
                        completedAt: true,
                        expiresAt: true,
                    },
                },
            },
        });
        if (!sessionQuestion)
            throw new errors_1.NotFoundError('Question');
        const { session, question } = sessionQuestion;
        const status = getSessionStatus(session.completedAt, session.expiresAt);
        // Get adjacent question IDs efficiently
        const [prevQuestion, nextQuestion] = await Promise.all([
            sessionQuestion.order > 1
                ? db_1.prisma.aptitudeSessionQuestion.findFirst({
                    where: { sessionId, order: sessionQuestion.order - 1 },
                    select: { questionId: true },
                })
                : null,
            sessionQuestion.order < session.numberOfQuestions
                ? db_1.prisma.aptitudeSessionQuestion.findFirst({
                    where: { sessionId, order: sessionQuestion.order + 1 },
                    select: { questionId: true },
                })
                : null,
        ]);
        return {
            sessionId: session.id,
            sessionStatus: status,
            question: {
                id: question.id,
                sessionQuestionId: sessionQuestion.id,
                order: sessionQuestion.order,
                questionText: question.questionText,
                questionType: question.questionType,
                difficulty: question.difficulty,
                options: question.options,
                selectedOptionId: sessionQuestion.selectedOptionId,
                answeredAt: sessionQuestion.answeredAt,
            },
            navigation: {
                previousQuestionId: prevQuestion?.questionId ?? null,
                nextQuestionId: nextQuestion?.questionId ?? null,
                currentPosition: sessionQuestion.order,
                totalQuestions: session.numberOfQuestions,
            },
        };
    }
    // -------------------------------------------------
    // ANSWER HANDLING (OPTIMIZED)
    // -------------------------------------------------
    async saveAnswer(userId, sessionId, dto) {
        const { questionId, selectedOptionId } = dto;
        return db_1.prisma.$transaction(async (tx) => {
            // Get session question with validation data in one query
            const sessionQuestion = await tx.aptitudeSessionQuestion.findFirst({
                where: {
                    questionId,
                    session: { id: sessionId, userId },
                },
                select: {
                    id: true,
                    session: {
                        select: {
                            id: true,
                            numberOfQuestions: true,
                            completedAt: true,
                            expiresAt: true,
                        },
                    },
                    question: {
                        select: {
                            correctOptionId: true,
                            options: { select: { id: true } },
                        },
                    },
                },
            });
            if (!sessionQuestion)
                throw new errors_1.NotFoundError('Question in this session');
            const { session, question } = sessionQuestion;
            // Validate session state
            if (session.completedAt) {
                throw new errors_1.SessionAlreadyCompletedError(session.completedAt);
            }
            if (Date.now() > session.expiresAt.getTime()) {
                throw new errors_1.SessionExpiredError(session.expiresAt);
            }
            // Validate option
            if (selectedOptionId !== null) {
                const validOption = question.options.some((opt) => opt.id === selectedOptionId);
                if (!validOption)
                    throw new errors_1.InvalidOptionError();
            }
            const now = new Date();
            const isCorrect = selectedOptionId ? selectedOptionId === question.correctOptionId : null;
            // Update answer and get count in parallel
            const [, answeredCount] = await Promise.all([
                tx.aptitudeSessionQuestion.update({
                    where: { id: sessionQuestion.id },
                    data: {
                        selectedOptionId,
                        answeredAt: selectedOptionId ? now : null,
                        isCorrect,
                    },
                }),
                tx.aptitudeSessionQuestion.count({
                    where: {
                        sessionId,
                        selectedOptionId: { not: null },
                        // Include current if we're setting an answer
                        ...(selectedOptionId && { NOT: { id: sessionQuestion.id } }),
                    },
                }),
            ]);
            const totalAnswered = selectedOptionId ? answeredCount + 1 : answeredCount;
            return {
                sessionId,
                questionId,
                selectedOptionId,
                answeredAt: selectedOptionId ? now : null,
                progress: {
                    answered: totalAnswered,
                    unanswered: session.numberOfQuestions - totalAnswered,
                    total: session.numberOfQuestions,
                },
            };
        });
    }
    // -------------------------------------------------
    // SUBMISSION & RESULTS (OPTIMIZED)
    // -------------------------------------------------
    async submitSession(userId, sessionId) {
        return db_1.prisma.$transaction(async (tx) => {
            const session = await tx.aptitudePracticeSession.findFirst({
                where: { id: sessionId, userId },
                select: {
                    id: true,
                    numberOfQuestions: true,
                    startedAt: true,
                    completedAt: true,
                    sessionQuestions: {
                        select: {
                            selectedOptionId: true,
                            isCorrect: true,
                            question: {
                                select: { questionType: true },
                            },
                        },
                    },
                },
            });
            if (!session)
                throw new errors_1.NotFoundError('Session');
            if (session.completedAt)
                throw new errors_1.SessionAlreadyCompletedError(session.completedAt);
            // Calculate results in memory (no additional queries)
            const results = this.calculateResults(session.sessionQuestions);
            const totalScore = calculatePercentage(results.totalCorrect, session.numberOfQuestions);
            const completedAt = new Date();
            await tx.aptitudePracticeSession.update({
                where: { id: sessionId },
                data: {
                    completedAt,
                    totalScore,
                    totalCorrect: results.totalCorrect,
                    totalWrong: results.totalWrong,
                    totalUnanswered: results.totalUnanswered,
                },
            });
            return {
                sessionId,
                status: 'completed',
                completedAt,
                timeTaken: calculateTimeTaken(session.startedAt, completedAt),
                results: {
                    totalScore,
                    ...results,
                    totalQuestions: session.numberOfQuestions,
                    scorePercentage: totalScore,
                },
            };
        });
    }
    async getSessionStatus(userId, sessionId) {
        const session = await db_1.prisma.aptitudePracticeSession.findFirst({
            where: { id: sessionId, userId },
            select: {
                id: true,
                numberOfQuestions: true,
                startedAt: true,
                completedAt: true,
                expiresAt: true,
                _count: {
                    select: {
                        sessionQuestions: { where: { selectedOptionId: { not: null } } },
                    },
                },
                sessionQuestions: {
                    where: { selectedOptionId: { not: null } },
                    select: { updatedAt: true },
                    orderBy: { updatedAt: 'desc' },
                    take: 1,
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        const answered = session._count.sessionQuestions;
        const total = session.numberOfQuestions;
        const timeRemaining = calculateTimeRemaining(session.expiresAt);
        return {
            sessionId: session.id,
            status: getSessionStatus(session.completedAt, session.expiresAt),
            timeRemaining,
            timeRemainingFormatted: formatTimeRemaining(timeRemaining),
            startedAt: session.startedAt,
            expiresAt: session.expiresAt,
            progress: {
                answered,
                unanswered: total - answered,
                total,
                percentageComplete: calculatePercentage(answered, total),
            },
            lastActivityAt: session.sessionQuestions[0]?.updatedAt ?? session.startedAt,
        };
    }
    async getSessionResults(userId, sessionId) {
        const session = await db_1.prisma.aptitudePracticeSession.findFirst({
            where: { id: sessionId, userId, completedAt: { not: null } },
            select: {
                id: true,
                difficulty: true,
                numberOfQuestions: true,
                timeLimit: true,
                startedAt: true,
                completedAt: true,
                totalScore: true,
                totalCorrect: true,
                totalWrong: true,
                totalUnanswered: true,
                sessionQuestions: {
                    select: {
                        selectedOptionId: true,
                        isCorrect: true,
                        question: {
                            select: { questionType: true, difficulty: true },
                        },
                    },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        if (!session.completedAt)
            throw new errors_1.SessionNotCompletedError();
        const breakdowns = this.calculateDetailedBreakdown(session.sessionQuestions);
        const attempted = session.totalCorrect + session.totalWrong;
        const accuracy = calculatePercentage(session.totalCorrect, attempted);
        const attemptRate = calculatePercentage(attempted, session.numberOfQuestions);
        return {
            sessionId: session.id,
            status: 'completed',
            completedAt: session.completedAt,
            timeTaken: calculateTimeTaken(session.startedAt, session.completedAt),
            timeLimit: session.timeLimit,
            difficulty: session.difficulty,
            summary: {
                totalScore: session.totalScore,
                totalCorrect: session.totalCorrect,
                totalWrong: session.totalWrong,
                totalUnanswered: session.totalUnanswered,
                totalQuestions: session.numberOfQuestions,
                scorePercentage: session.totalScore,
                accuracy,
                attemptRate,
            },
            breakdown: breakdowns,
            performance: this.evaluatePerformance(session.totalScore, accuracy, attemptRate, session.difficulty),
        };
    }
    async getSolutions(userId, sessionId, filter) {
        const session = await db_1.prisma.aptitudePracticeSession.findFirst({
            where: { id: sessionId, userId, completedAt: { not: null } },
            select: {
                id: true,
                totalCorrect: true,
                totalWrong: true,
                totalUnanswered: true,
                sessionQuestions: {
                    where: this.buildSolutionFilter(filter),
                    select: {
                        order: true,
                        selectedOptionId: true,
                        isCorrect: true,
                        question: {
                            select: {
                                id: true,
                                questionText: true,
                                questionType: true,
                                difficulty: true,
                                correctOptionId: true,
                                explanation: true,
                                options: { select: { id: true, text: true } },
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        return {
            sessionId: session.id,
            status: 'completed',
            solutions: session.sessionQuestions.map((sq) => ({
                order: sq.order,
                questionId: sq.question.id,
                questionText: sq.question.questionText,
                questionType: sq.question.questionType,
                difficulty: sq.question.difficulty,
                options: sq.question.options.map((opt) => ({
                    ...opt,
                    isCorrect: opt.id === sq.question.correctOptionId,
                })),
                selectedOptionId: sq.selectedOptionId,
                correctOptionId: sq.question.correctOptionId,
                isCorrect: sq.isCorrect,
                explanation: sq.question.explanation,
            })),
            summary: {
                totalCorrect: session.totalCorrect,
                totalWrong: session.totalWrong,
                totalUnanswered: session.totalUnanswered,
            },
        };
    }
    // Build filter at database level instead of in memory
    buildSolutionFilter(filter) {
        switch (filter) {
            case 'correct':
                return { isCorrect: true };
            case 'wrong':
                return { isCorrect: false, selectedOptionId: { not: null } };
            case 'unanswered':
                return { selectedOptionId: null };
            default:
                return undefined;
        }
    }
    // -------------------------------------------------
    // CALCULATION HELPERS
    // -------------------------------------------------
    calculateResults(questions) {
        let totalCorrect = 0;
        let totalWrong = 0;
        let totalUnanswered = 0;
        const breakdownByType = {};
        for (const sq of questions) {
            const type = sq.question.questionType;
            breakdownByType[type] ??= { correct: 0, wrong: 0, unanswered: 0, total: 0 };
            breakdownByType[type].total++;
            if (sq.selectedOptionId === null) {
                totalUnanswered++;
                breakdownByType[type].unanswered++;
            }
            else if (sq.isCorrect) {
                totalCorrect++;
                breakdownByType[type].correct++;
            }
            else {
                totalWrong++;
                breakdownByType[type].wrong++;
            }
        }
        return { totalCorrect, totalWrong, totalUnanswered, breakdownByType };
    }
    calculateDetailedBreakdown(questions) {
        const byType = {};
        const byDifficulty = {};
        for (const sq of questions) {
            const { questionType, difficulty } = sq.question;
            byType[questionType] ??= { correct: 0, wrong: 0, unanswered: 0, total: 0 };
            byDifficulty[difficulty] ??= { correct: 0, wrong: 0, unanswered: 0, total: 0 };
            byType[questionType].total++;
            byDifficulty[difficulty].total++;
            if (sq.selectedOptionId === null) {
                byType[questionType].unanswered++;
                byDifficulty[difficulty].unanswered++;
            }
            else if (sq.isCorrect) {
                byType[questionType].correct++;
                byDifficulty[difficulty].correct++;
            }
            else {
                byType[questionType].wrong++;
                byDifficulty[difficulty].wrong++;
            }
        }
        // Calculate accuracy
        for (const breakdown of Object.values(byType)) {
            const attempted = breakdown.correct + breakdown.wrong;
            breakdown.accuracy = calculatePercentage(breakdown.correct, attempted);
        }
        return { byType, byDifficulty };
    }
    evaluatePerformance(score, accuracy, attemptRate, difficulty) {
        const thresholds = aptitude_types_1.PERFORMANCE_THRESHOLDS[difficulty];
        const suggestions = [];
        let rank;
        let message;
        if (score >= thresholds.excellent) {
            rank = 'EXCELLENT';
            message = 'Outstanding performance! You have mastered this difficulty level.';
        }
        else if (score >= thresholds.good) {
            rank = 'GOOD';
            message = 'Great job! You scored above average.';
        }
        else if (score >= thresholds.average) {
            rank = 'AVERAGE';
            message = 'Good effort! There is room for improvement.';
        }
        else {
            rank = 'NEEDS_IMPROVEMENT';
            message = 'Keep practicing! Focus on understanding the concepts better.';
        }
        if (attemptRate < 90) {
            suggestions.push('Focus on time management to attempt all questions');
        }
        if (accuracy < 70) {
            suggestions.push('Review incorrect answers and understand the concepts');
        }
        if (score < thresholds.average) {
            suggestions.push('Consider practicing with easier difficulty first');
        }
        if (suggestions.length === 0) {
            suggestions.push('Try challenging yourself with harder difficulty');
        }
        return { rank, message, suggestions };
    }
}
exports.aptitudeService = new AptitudeService();
//# sourceMappingURL=aptitude.service.js.map
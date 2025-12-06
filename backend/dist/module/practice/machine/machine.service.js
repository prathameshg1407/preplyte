"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.machineService = void 0;
const db_1 = require("../../../lib/db");
const machine_types_1 = require("./machine.types");
const errors_1 = require("../../../utils/errors");
const logger_1 = require("../../../utils/logger");
const judge0_1 = __importDefault(require("../../../lib/judge0"));
// =====================================================
// HELPER FUNCTIONS
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
    return new Date() > expiresAt ? 'expired' : 'in_progress';
};
const calculateTimeRemaining = (expiresAt) => Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
const calculatePercentage = (value, total) => total > 0 ? Math.round((value / total) * 100 * 100) / 100 : 0;
const calculateTimeTaken = (startedAt, completedAt) => Math.floor((completedAt.getTime() - startedAt.getTime()) / 60000);
const createPagination = (page, limit, totalItems) => ({
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < Math.ceil(totalItems / limit),
    hasPreviousPage: page > 1,
});
// =====================================================
// SERVICE CLASS
// =====================================================
class MachineService {
    // -------------------------------------------------
    // SESSION MANAGEMENT
    // -------------------------------------------------
    async createSession(userId, dto) {
        await this.ensureNoActiveSession(userId);
        const questions = await this.fetchQuestions(dto);
        const selectedQuestions = shuffleArray(questions).slice(0, dto.numberOfQuestions);
        if (selectedQuestions.length < dto.numberOfQuestions) {
            logger_1.logger.warn(`Insufficient questions. Found: ${selectedQuestions.length}, Requested: ${dto.numberOfQuestions}`);
        }
        const expiresAt = new Date(Date.now() + dto.timeLimit * 60 * 1000);
        const session = await db_1.prisma.machinePracticeSession.create({
            data: {
                userId,
                difficulty: dto.difficulty,
                numberOfQuestions: selectedQuestions.length,
                timeLimit: dto.timeLimit,
                expiresAt,
                sessionQuestions: {
                    create: selectedQuestions.map((q, index) => ({
                        questionId: q.id,
                        order: index + 1,
                    })),
                },
            },
        });
        return {
            id: session.id,
            userId: session.userId,
            difficulty: session.difficulty,
            numberOfQuestions: session.numberOfQuestions,
            timeLimit: session.timeLimit,
            startedAt: session.startedAt,
            expiresAt: session.expiresAt,
            completedAt: session.completedAt,
            totalScore: session.totalScore,
            totalSolved: session.totalSolved,
            status: 'in_progress',
            createdAt: session.createdAt,
        };
    }
    async listSessions(userId, filters) {
        const { page, limit } = filters;
        const skip = (page - 1) * limit;
        const where = this.buildSessionWhereClause(userId, filters);
        const [totalItems, sessions] = await Promise.all([
            db_1.prisma.machinePracticeSession.count({ where }),
            db_1.prisma.machinePracticeSession.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            sessions: sessions.map((s) => ({
                ...s,
                status: getSessionStatus(s.completedAt, s.expiresAt),
                solvedPercentage: s.totalSolved !== null
                    ? calculatePercentage(s.totalSolved, s.numberOfQuestions)
                    : null,
            })),
            pagination: createPagination(page, limit, totalItems),
        };
    }
    async getSessionDetails(userId, sessionId) {
        const session = await db_1.prisma.machinePracticeSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                sessionQuestions: {
                    select: {
                        isSolved: true,
                        submissions: { select: { id: true } },
                    },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        const status = getSessionStatus(session.completedAt, session.expiresAt);
        const timeRemaining = calculateTimeRemaining(session.expiresAt);
        const solved = session.sessionQuestions.filter((q) => q.isSolved).length;
        const attempted = session.sessionQuestions.filter((q) => q.submissions.length > 0).length;
        return {
            id: session.id,
            userId: session.userId,
            difficulty: session.difficulty,
            numberOfQuestions: session.numberOfQuestions,
            timeLimit: session.timeLimit,
            startedAt: session.startedAt,
            expiresAt: session.expiresAt,
            completedAt: session.completedAt,
            status,
            timeRemaining,
            timeRemainingFormatted: formatTimeRemaining(timeRemaining),
            progress: { solved, attempted, total: session.numberOfQuestions },
            totalScore: session.totalScore,
            totalSolved: session.totalSolved,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        };
    }
    async getSessionStatus(userId, sessionId) {
        const session = await db_1.prisma.machinePracticeSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                sessionQuestions: {
                    include: {
                        submissions: { orderBy: { submittedAt: 'desc' }, take: 1 },
                    },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        const status = getSessionStatus(session.completedAt, session.expiresAt);
        const timeRemaining = calculateTimeRemaining(session.expiresAt);
        const solved = session.sessionQuestions.filter((q) => q.isSolved).length;
        const attempted = session.sessionQuestions.filter((q) => q.submissions.length > 0).length;
        const allSubmissions = session.sessionQuestions.flatMap((q) => q.submissions);
        const lastSubmission = allSubmissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0];
        return {
            sessionId,
            status,
            timeRemaining,
            timeRemainingFormatted: formatTimeRemaining(timeRemaining),
            startedAt: session.startedAt,
            expiresAt: session.expiresAt,
            progress: {
                solved,
                attempted,
                unattempted: session.numberOfQuestions - attempted,
                total: session.numberOfQuestions,
                solvedPercentage: calculatePercentage(solved, session.numberOfQuestions),
            },
            submissionStats: {
                totalSubmissions: allSubmissions.length,
                acceptedSubmissions: allSubmissions.filter((s) => s.status === 'ACCEPTED').length,
                lastSubmissionAt: lastSubmission?.submittedAt || null,
            },
        };
    }
    // -------------------------------------------------
    // QUESTIONS
    // -------------------------------------------------
    async getSessionQuestions(userId, sessionId) {
        const session = await db_1.prisma.machinePracticeSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                sessionQuestions: {
                    include: {
                        question: { select: { id: true, title: true, difficulty: true, tags: true } },
                        submissions: { orderBy: { submittedAt: 'desc' }, take: 1 },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        const status = getSessionStatus(session.completedAt, session.expiresAt);
        const questions = session.sessionQuestions.map((sq) => ({
            id: sq.question.id,
            sessionQuestionId: sq.id,
            order: sq.order,
            title: sq.question.title,
            difficulty: sq.question.difficulty,
            tags: sq.question.tags,
            isSolved: sq.isSolved,
            submissionCount: sq.submissions.length,
            bestSubmission: sq.submissions[0]
                ? {
                    status: sq.submissions[0].status,
                    executionTime: sq.submissions[0].executionTime ?? undefined,
                    memoryUsed: sq.submissions[0].memoryUsed ?? undefined,
                    testCasesPassed: sq.submissions[0].testCasesPassed,
                    testCasesTotal: sq.submissions[0].testCasesTotal,
                    submittedAt: sq.submissions[0].submittedAt,
                }
                : null,
        }));
        return {
            sessionId: session.id,
            status,
            questions,
            totalQuestions: session.numberOfQuestions,
            solvedCount: session.sessionQuestions.filter((q) => q.isSolved).length,
        };
    }
    async getQuestion(userId, sessionId, questionId) {
        const session = await db_1.prisma.machinePracticeSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                sessionQuestions: {
                    include: {
                        question: {
                            include: {
                                testCases: { where: { type: 'SAMPLE' }, orderBy: { order: 'asc' } },
                            },
                        },
                        submissions: { orderBy: { submittedAt: 'desc' }, take: 1 },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        const currentIndex = session.sessionQuestions.findIndex((sq) => sq.question.id === questionId);
        if (currentIndex === -1)
            throw new errors_1.NotFoundError('Question in this session');
        const sq = session.sessionQuestions[currentIndex];
        const totalTestCases = await db_1.prisma.testCase.count({ where: { questionId } });
        return {
            sessionId: session.id,
            sessionQuestionId: sq.id,
            question: {
                id: sq.question.id,
                title: sq.question.title,
                description: sq.question.description,
                difficulty: sq.question.difficulty,
                inputFormat: sq.question.inputFormat,
                outputFormat: sq.question.outputFormat,
                constraints: sq.question.constraints,
                tags: sq.question.tags,
                sampleTestCases: sq.question.testCases.map((tc) => ({
                    id: tc.id,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                })),
                totalTestCases,
            },
            isSolved: sq.isSolved,
            submissionCount: sq.submissions.length,
            lastSubmission: sq.submissions[0]
                ? {
                    id: sq.submissions[0].id,
                    status: sq.submissions[0].status,
                    languageId: sq.submissions[0].languageId,
                    testCasesPassed: sq.submissions[0].testCasesPassed,
                    testCasesTotal: sq.submissions[0].testCasesTotal,
                    submittedAt: sq.submissions[0].submittedAt,
                }
                : null,
            navigation: {
                previousQuestionId: currentIndex > 0 ? session.sessionQuestions[currentIndex - 1].question.id : null,
                nextQuestionId: currentIndex < session.sessionQuestions.length - 1
                    ? session.sessionQuestions[currentIndex + 1].question.id
                    : null,
                currentPosition: currentIndex + 1,
                totalQuestions: session.numberOfQuestions,
            },
        };
    }
    // -------------------------------------------------
    // CODE EXECUTION
    // -------------------------------------------------
    async runCode(userId, sessionId, questionId, dto) {
        const { sessionQuestion } = await this.validateSessionForExecution(userId, sessionId, questionId);
        if (dto.customInput !== undefined) {
            return this.runWithCustomInput(sessionId, questionId, dto);
        }
        return this.runAgainstSampleTestCases(sessionId, questionId, dto, sessionQuestion.question.testCases);
    }
    async submitCode(userId, sessionId, questionId, dto) {
        const { sessionQuestion } = await this.validateSessionForExecution(userId, sessionId, questionId);
        const testCases = sessionQuestion.question.testCases;
        const submission = await db_1.prisma.submission.create({
            data: {
                sessionQuestionId: sessionQuestion.id,
                code: dto.code,
                languageId: dto.languageId,
                status: 'PENDING',
                testCasesTotal: testCases.length,
            },
        });
        try {
            const tokens = await judge0_1.default.createBatchSubmission(testCases.map((tc) => ({
                source_code: dto.code,
                language_id: dto.languageId,
                stdin: tc.input,
                expected_output: tc.expectedOutput,
            })));
            await this.waitForJudge0();
            const results = await judge0_1.default.getBatchSubmission(tokens);
            return await this.processSubmissionResults(submission.id, sessionId, questionId, sessionQuestion, testCases, results);
        }
        catch (error) {
            logger_1.logger.error('Submission evaluation failed', error);
            await this.markSubmissionError(submission.id, error);
            throw error;
        }
    }
    // -------------------------------------------------
    // SESSION COMPLETION & RESULTS
    // -------------------------------------------------
    async completeSession(userId, sessionId) {
        const session = await db_1.prisma.machinePracticeSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                sessionQuestions: {
                    include: {
                        question: { select: { id: true, title: true } },
                        submissions: { orderBy: { submittedAt: 'desc' } },
                    },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        if (session.completedAt)
            throw new errors_1.SessionAlreadyCompletedError(session.completedAt);
        const totalSolved = session.sessionQuestions.filter((q) => q.isSolved).length;
        const completedAt = new Date();
        await db_1.prisma.machinePracticeSession.update({
            where: { id: sessionId },
            data: { completedAt, totalScore: totalSolved * 100, totalSolved },
        });
        return {
            sessionId,
            status: 'completed',
            completedAt,
            timeTaken: calculateTimeTaken(session.startedAt, completedAt),
            results: {
                totalSolved,
                totalQuestions: session.numberOfQuestions,
                totalScore: totalSolved * 100,
                solvedPercentage: calculatePercentage(totalSolved, session.numberOfQuestions),
                questions: session.sessionQuestions.map((sq) => ({
                    id: sq.question.id,
                    title: sq.question.title,
                    isSolved: sq.isSolved,
                    submissionCount: sq.submissions.length,
                    bestStatus: sq.submissions.find((s) => s.status === 'ACCEPTED')?.status || sq.submissions[0]?.status || null,
                })),
            },
        };
    }
    async getSessionResults(userId, sessionId) {
        const session = await db_1.prisma.machinePracticeSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                sessionQuestions: {
                    include: {
                        question: { select: { id: true, title: true, difficulty: true, tags: true } },
                        submissions: { orderBy: { submittedAt: 'desc' } },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        if (!session.completedAt)
            throw new errors_1.SessionNotCompletedError();
        const totalSubmissions = session.sessionQuestions.reduce((sum, q) => sum + q.submissions.length, 0);
        return {
            sessionId,
            status: 'completed',
            completedAt: session.completedAt,
            timeTaken: calculateTimeTaken(session.startedAt, session.completedAt),
            timeLimit: session.timeLimit,
            difficulty: session.difficulty,
            summary: {
                totalSolved: session.totalSolved,
                totalQuestions: session.numberOfQuestions,
                totalScore: session.totalScore,
                maxPossibleScore: session.numberOfQuestions * 100,
                solvedPercentage: calculatePercentage(session.totalSolved, session.numberOfQuestions),
                totalSubmissions,
            },
            questions: session.sessionQuestions.map((sq) => this.formatQuestionResult(sq)),
            performance: this.evaluatePerformance(session.totalSolved, session.numberOfQuestions, session.difficulty),
        };
    }
    // -------------------------------------------------
    // SUBMISSIONS
    // -------------------------------------------------
    async getSubmissionHistory(userId, sessionId, questionId, page, limit) {
        const session = await db_1.prisma.machinePracticeSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                sessionQuestions: {
                    where: { question: { id: questionId } },
                    include: { question: { select: { title: true } } },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        const sessionQuestion = session.sessionQuestions[0];
        if (!sessionQuestion)
            throw new errors_1.NotFoundError('Question in this session');
        const skip = (page - 1) * limit;
        const [totalItems, submissions] = await Promise.all([
            db_1.prisma.submission.count({ where: { sessionQuestionId: sessionQuestion.id } }),
            db_1.prisma.submission.findMany({
                where: { sessionQuestionId: sessionQuestion.id },
                skip,
                take: limit,
                orderBy: { submittedAt: 'desc' },
            }),
        ]);
        const acceptedSubmissions = submissions.filter((s) => s.status === 'ACCEPTED');
        return {
            sessionId,
            questionId,
            questionTitle: sessionQuestion.question.title,
            submissions: submissions.map((s) => ({
                id: s.id,
                status: s.status,
                languageId: s.languageId,
                language: (0, machine_types_1.getLanguageName)(s.languageId),
                executionTime: s.executionTime,
                memoryUsed: s.memoryUsed,
                testCasesPassed: s.testCasesPassed,
                testCasesTotal: s.testCasesTotal,
                submittedAt: s.submittedAt,
                judgedAt: s.judgedAt,
            })),
            pagination: createPagination(page, limit, totalItems),
            stats: {
                totalSubmissions: totalItems,
                acceptedCount: acceptedSubmissions.length,
                wrongAnswerCount: submissions.filter((s) => s.status === 'WRONG_ANSWER').length,
                compilationErrorCount: submissions.filter((s) => s.status === 'COMPILATION_ERROR').length,
                firstAcceptedAt: acceptedSubmissions.length > 0 ? acceptedSubmissions[acceptedSubmissions.length - 1].submittedAt : null,
            },
        };
    }
    async getSubmissionDetails(userId, submissionId) {
        const submission = await db_1.prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                sessionQuestion: {
                    include: {
                        session: true,
                        question: { include: { testCases: { orderBy: { order: 'asc' } } } },
                    },
                },
            },
        });
        if (!submission || submission.sessionQuestion.session.userId !== userId) {
            throw new errors_1.NotFoundError('Submission');
        }
        return {
            id: submission.id,
            sessionId: submission.sessionQuestion.sessionId,
            questionId: submission.sessionQuestion.questionId,
            questionTitle: submission.sessionQuestion.question.title,
            code: submission.code,
            languageId: submission.languageId,
            language: (0, machine_types_1.getLanguageName)(submission.languageId),
            status: submission.status,
            executionTime: submission.executionTime,
            memoryUsed: submission.memoryUsed,
            testCasesPassed: submission.testCasesPassed,
            testCasesTotal: submission.testCasesTotal,
            stdout: submission.stdout,
            stderr: submission.stderr,
            compileError: submission.compileError,
            submittedAt: submission.submittedAt,
            judgedAt: submission.judgedAt,
            testCaseResults: submission.sessionQuestion.question.testCases.map((tc, index) => ({
                testCaseNumber: index + 1,
                type: tc.type,
                status: index < submission.testCasesPassed ? 'PASSED' : 'FAILED',
                input: tc.type === 'SAMPLE' ? tc.input : '[Hidden]',
                expectedOutput: tc.type === 'SAMPLE' ? tc.expectedOutput : '[Hidden]',
                actualOutput: tc.type === 'SAMPLE' ? '[Shown for sample only]' : '[Hidden]',
            })),
        };
    }
    // -------------------------------------------------
    // PRIVATE HELPERS
    // -------------------------------------------------
    async ensureNoActiveSession(userId) {
        const activeSession = await db_1.prisma.machinePracticeSession.findFirst({
            where: { userId, completedAt: null, expiresAt: { gt: new Date() } },
            select: { id: true, expiresAt: true },
        });
        if (activeSession) {
            throw new errors_1.SessionInProgressError(activeSession.id, activeSession.expiresAt);
        }
    }
    async fetchQuestions(dto) {
        const where = {
            isActive: true,
            difficulty: dto.difficulty,
        };
        if (dto.tags?.length) {
            where.tags = { hasSome: dto.tags };
        }
        return db_1.prisma.machineQuestion.findMany({ where });
    }
    buildSessionWhereClause(userId, filters) {
        const where = { userId };
        const now = new Date();
        if (filters.difficulty)
            where.difficulty = filters.difficulty;
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
    async validateSessionForExecution(userId, sessionId, questionId) {
        const session = await db_1.prisma.machinePracticeSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                sessionQuestions: {
                    where: { question: { id: questionId } },
                    include: {
                        question: { include: { testCases: { orderBy: { order: 'asc' } } } },
                    },
                },
            },
        });
        if (!session)
            throw new errors_1.NotFoundError('Session');
        if (session.completedAt)
            throw new errors_1.SessionAlreadyCompletedError(session.completedAt);
        if (new Date() > session.expiresAt)
            throw new errors_1.SessionExpiredError(session.expiresAt);
        const sessionQuestion = session.sessionQuestions[0];
        if (!sessionQuestion)
            throw new errors_1.NotFoundError('Question in this session');
        return { session, sessionQuestion };
    }
    async runWithCustomInput(sessionId, questionId, dto) {
        try {
            const token = await judge0_1.default.createSubmission({
                source_code: dto.code,
                language_id: dto.languageId,
                stdin: dto.customInput,
            });
            const result = await judge0_1.default.waitForResult(token);
            if (result.status.id === 6) {
                return {
                    sessionId,
                    questionId,
                    executionType: 'custom_input',
                    result: { input: dto.customInput, output: '', executionTime: 0, memoryUsed: 0, status: 'COMPILATION_ERROR' },
                    compilationStatus: 'COMPILATION_ERROR',
                    compileOutput: result.compile_output,
                };
            }
            return {
                sessionId,
                questionId,
                executionType: 'custom_input',
                result: {
                    input: dto.customInput,
                    output: result.stdout?.trim() || '',
                    executionTime: parseFloat(result.time || '0') * 1000,
                    memoryUsed: result.memory || 0,
                    status: result.status.id === 3 ? 'SUCCESS' : judge0_1.default.mapStatusToSubmissionStatus(result.status.id),
                },
                compilationStatus: 'SUCCESS',
                compileOutput: null,
            };
        }
        catch (error) {
            logger_1.logger.error('Code execution failed', error);
            throw error;
        }
    }
    async runAgainstSampleTestCases(sessionId, questionId, dto, testCases) {
        if (testCases.length === 0) {
            return {
                sessionId,
                questionId,
                executionType: 'sample_test_cases',
                results: [],
                summary: { totalTestCases: 0, passed: 0, failed: 0 },
                compilationStatus: 'SUCCESS',
                compileOutput: null,
            };
        }
        try {
            const tokens = await judge0_1.default.createBatchSubmission(testCases.map((tc) => ({
                source_code: dto.code,
                language_id: dto.languageId,
                stdin: tc.input,
                expected_output: tc.expectedOutput,
            })));
            await this.waitForJudge0();
            const results = await judge0_1.default.getBatchSubmission(tokens);
            const compilationError = results.find((r) => r.status.id === 6);
            if (compilationError) {
                return {
                    sessionId,
                    questionId,
                    executionType: 'sample_test_cases',
                    results: [],
                    summary: { totalTestCases: testCases.length, passed: 0, failed: testCases.length },
                    compilationStatus: 'COMPILATION_ERROR',
                    compileOutput: compilationError.compile_output,
                };
            }
            const testCaseResults = results.map((result, index) => {
                const tc = testCases[index];
                const passed = result.status.id === 3;
                return {
                    testCaseId: tc.id,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput: result.stdout?.trim() || '',
                    status: this.mapResultStatus(passed, result.status.id),
                    executionTime: result.time ? parseFloat(result.time) * 1000 : null,
                    memoryUsed: result.memory,
                    stderr: result.stderr,
                };
            });
            const passedCount = testCaseResults.filter((r) => r.status === 'PASSED').length;
            return {
                sessionId,
                questionId,
                executionType: 'sample_test_cases',
                results: testCaseResults,
                summary: {
                    totalTestCases: testCases.length,
                    passed: passedCount,
                    failed: testCases.length - passedCount,
                    ...this.calculateExecutionStats(testCaseResults),
                },
                compilationStatus: 'SUCCESS',
                compileOutput: null,
            };
        }
        catch (error) {
            logger_1.logger.error('Batch code execution failed', error);
            throw error;
        }
    }
    async processSubmissionResults(submissionId, sessionId, questionId, sessionQuestion, testCases, results) {
        const compilationError = results.find((r) => r.status.id === 6);
        if (compilationError) {
            await db_1.prisma.submission.update({
                where: { id: submissionId },
                data: { status: 'COMPILATION_ERROR', compileError: compilationError.compile_output, judgedAt: new Date() },
            });
            return {
                submissionId,
                sessionId,
                questionId,
                status: 'COMPILATION_ERROR',
                testCasesPassed: 0,
                testCasesTotal: testCases.length,
                executionTime: null,
                memoryUsed: null,
                submittedAt: new Date(),
                judgedAt: new Date(),
                isSolved: false,
                score: 0,
                message: 'Compilation error. Please check your code.',
            };
        }
        const { testCasesPassed, totalTime, maxMemory, firstFailedIndex, status } = this.analyzeResults(results, testCases.length);
        const allPassed = testCasesPassed === testCases.length;
        await db_1.prisma.submission.update({
            where: { id: submissionId },
            data: {
                status,
                testCasesPassed,
                executionTime: totalTime / testCases.length,
                memoryUsed: maxMemory,
                judgedAt: new Date(),
            },
        });
        if (allPassed && !sessionQuestion.isSolved) {
            await db_1.prisma.machineSessionQuestion.update({
                where: { id: sessionQuestion.id },
                data: { isSolved: true },
            });
        }
        const result = {
            submissionId,
            sessionId,
            questionId,
            status,
            testCasesPassed,
            testCasesTotal: testCases.length,
            executionTime: totalTime / testCases.length,
            memoryUsed: maxMemory,
            submittedAt: new Date(),
            judgedAt: new Date(),
            isSolved: allPassed,
            score: allPassed ? 100 : 0,
            message: allPassed ? 'Congratulations! All test cases passed.' : 'Wrong answer on some test cases',
        };
        if (!allPassed && firstFailedIndex >= 0) {
            const failedTC = testCases[firstFailedIndex];
            result.failedTestCase = {
                input: failedTC.type === 'SAMPLE' ? failedTC.input : '[Hidden]',
                expectedOutput: failedTC.type === 'SAMPLE' ? failedTC.expectedOutput : '[Hidden]',
                actualOutput: failedTC.type === 'SAMPLE' ? (results[firstFailedIndex].stdout?.trim() || '[Hidden]') : '[Hidden]',
                message: `Failed on test case ${firstFailedIndex + 1} of ${testCases.length}`,
            };
        }
        return result;
    }
    analyzeResults(results, totalTestCases) {
        let testCasesPassed = 0;
        let totalTime = 0;
        let maxMemory = 0;
        let firstFailedIndex = -1;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status.id === 3) {
                testCasesPassed++;
                if (result.time)
                    totalTime += parseFloat(result.time) * 1000;
                if (result.memory)
                    maxMemory = Math.max(maxMemory, result.memory);
            }
            else if (firstFailedIndex === -1) {
                firstFailedIndex = i;
            }
        }
        let status = 'ACCEPTED';
        if (testCasesPassed < totalTestCases && firstFailedIndex >= 0) {
            status = judge0_1.default.mapStatusToSubmissionStatus(results[firstFailedIndex].status.id);
        }
        return { testCasesPassed, totalTime, maxMemory, firstFailedIndex, status };
    }
    async markSubmissionError(submissionId, error) {
        await db_1.prisma.submission.update({
            where: { id: submissionId },
            data: {
                status: 'RUNTIME_ERROR',
                stderr: error instanceof Error ? error.message : 'Unknown error',
                judgedAt: new Date(),
            },
        });
    }
    waitForJudge0() {
        return new Promise((resolve) => setTimeout(resolve, 2000));
    }
    mapResultStatus(passed, statusId) {
        if (passed)
            return 'PASSED';
        if (statusId === 5)
            return 'TIME_LIMIT_EXCEEDED';
        if (statusId >= 7 && statusId <= 12)
            return 'RUNTIME_ERROR';
        return 'FAILED';
    }
    calculateExecutionStats(results) {
        const executionTimes = results.filter((r) => r.executionTime !== null).map((r) => r.executionTime);
        const memoryUsages = results.filter((r) => r.memoryUsed !== null).map((r) => r.memoryUsed);
        return {
            averageExecutionTime: executionTimes.length > 0 ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length : undefined,
            maxMemoryUsed: memoryUsages.length > 0 ? Math.max(...memoryUsages) : undefined,
        };
    }
    formatQuestionResult(sq) {
        const bestSubmission = sq.submissions.find((s) => s.status === 'ACCEPTED') || sq.submissions[0];
        return {
            order: sq.order,
            id: sq.question.id,
            title: sq.question.title,
            difficulty: sq.question.difficulty,
            tags: sq.question.tags,
            isSolved: sq.isSolved,
            score: sq.isSolved ? 100 : 0,
            submissionCount: sq.submissions.length,
            bestSubmission: bestSubmission
                ? {
                    id: bestSubmission.id,
                    status: bestSubmission.status,
                    executionTime: bestSubmission.executionTime,
                    memoryUsed: bestSubmission.memoryUsed,
                    languageId: bestSubmission.languageId,
                    language: (0, machine_types_1.getLanguageName)(bestSubmission.languageId),
                    submittedAt: bestSubmission.submittedAt,
                }
                : null,
        };
    }
    evaluatePerformance(solved, total, difficulty) {
        const solvedPercentage = (solved / total) * 100;
        const thresholds = machine_types_1.PERFORMANCE_THRESHOLDS[difficulty];
        const suggestions = [];
        let rank;
        let message;
        if (solvedPercentage >= thresholds.excellent) {
            rank = 'EXCELLENT';
            message = 'Outstanding! You solved all problems.';
        }
        else if (solvedPercentage >= thresholds.good) {
            rank = 'GOOD';
            message = `Good performance! You solved ${solved} out of ${total} problems.`;
        }
        else if (solvedPercentage >= thresholds.average) {
            rank = 'AVERAGE';
            message = 'Keep practicing to improve your problem-solving skills.';
        }
        else {
            rank = 'NEEDS_IMPROVEMENT';
            message = 'Focus on fundamentals and practice more problems.';
        }
        if (solved < total)
            suggestions.push('Review the unsolved problems and learn from their solutions');
        if (difficulty !== 'EASY' && solvedPercentage < 50)
            suggestions.push('Consider practicing with easier problems first');
        if (suggestions.length === 0)
            suggestions.push('Try challenging yourself with harder problems');
        return { rank, message, suggestions };
    }
}
exports.machineService = new MachineService();
//# sourceMappingURL=machine.service.js.map
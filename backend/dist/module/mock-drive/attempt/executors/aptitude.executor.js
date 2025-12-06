"use strict";
// src/module/mock-drive/attempt/executors/aptitude.executor.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AptitudeModuleExecutor = void 0;
const base_executor_1 = require("./base.executor");
const scoring_utils_1 = require("../../utils/scoring.utils");
const errors_1 = require("../../../../utils/errors");
// ============================================
// Constants
// ============================================
const VALID_ACTIONS = ['answer', 'clear', 'mark_review'];
// ============================================
// Type Guards
// ============================================
function isAnswerPayload(payload) {
    if (typeof payload !== 'object' || payload === null)
        return false;
    const p = payload;
    return typeof p.questionId === 'string' && typeof p.selectedOptionId === 'string';
}
function isClearPayload(payload) {
    if (typeof payload !== 'object' || payload === null)
        return false;
    return typeof payload.questionId === 'string';
}
function isMarkReviewPayload(payload) {
    if (typeof payload !== 'object' || payload === null)
        return false;
    const p = payload;
    return typeof p.questionId === 'string' && typeof p.isMarked === 'boolean';
}
function isAptitudeAction(action) {
    return VALID_ACTIONS.includes(action);
}
function isAptitudeModuleData(data) {
    if (data === null)
        return false;
    return 'questions' in data && Array.isArray(data.questions);
}
// ============================================
// Executor Implementation
// ============================================
class AptitudeModuleExecutor extends base_executor_1.BaseModuleExecutor {
    constructor(prisma) {
        super(prisma, 'APTITUDE');
    }
    async initialize(context) {
        this.validateContext(context);
        const moduleQuestions = await this.prisma.mockDriveModuleQuestion.findMany({
            where: { moduleId: context.moduleId },
            orderBy: { order: 'asc' },
            include: {
                aptitudeQuestion: {
                    include: { options: true },
                },
            },
        });
        if (moduleQuestions.length === 0) {
            throw new errors_1.NotFoundError('Questions for this module');
        }
        const shuffledQuestions = this.shuffleWithSeed(moduleQuestions, context.attemptId);
        const questions = shuffledQuestions.map((mq, index) => {
            if (!mq.aptitudeQuestionId) {
                throw new errors_1.InternalError(`Invalid question configuration for module question ${mq.id}`);
            }
            return {
                questionId: mq.id,
                aptitudeQuestionId: mq.aptitudeQuestionId,
                displayOrder: index,
                selectedOptionId: null,
                isCorrect: null,
                isMarkedForReview: false,
                timeSpentSeconds: 0,
                answeredAt: null,
            };
        });
        return { data: { questions } };
    }
    async handleAction(context, action, payload) {
        if (!isAptitudeAction(action)) {
            throw new errors_1.BadRequestError(`Unknown action: ${action}`);
        }
        if (!isAptitudeModuleData(context.existingData)) {
            throw new errors_1.InternalError('Module not properly initialized');
        }
        switch (action) {
            case 'answer':
                return this.handleAnswer(context.existingData, payload);
            case 'clear':
                return this.handleClear(context.existingData, payload);
            case 'mark_review':
                return this.handleMarkReview(context.existingData, payload);
        }
    }
    async finalize(context) {
        const config = context.config;
        if (!isAptitudeModuleData(context.existingData)) {
            throw new errors_1.InternalError('Module data not found');
        }
        const summary = this.calculateSummary(context.existingData.questions, config);
        const finalData = {
            questions: context.existingData.questions,
            summary,
        };
        const { score, percentage } = (0, scoring_utils_1.calculateAptitudeScore)(finalData, config);
        const passingPercentage = config.passingPercentage;
        const isPassed = passingPercentage !== undefined ? percentage >= passingPercentage : true;
        return {
            data: finalData,
            score,
            maxScore: summary.maxScore,
            percentage,
            isPassed,
        };
    }
    // ============================================
    // Action Handlers
    // ============================================
    async handleAnswer(data, payload) {
        if (!isAnswerPayload(payload)) {
            throw new errors_1.BadRequestError('Invalid answer payload: questionId and selectedOptionId required');
        }
        const questionIndex = data.questions.findIndex((q) => q.questionId === payload.questionId);
        if (questionIndex === -1) {
            throw new errors_1.NotFoundError('Question in attempt');
        }
        const moduleQuestion = await this.prisma.mockDriveModuleQuestion.findUnique({
            where: { id: payload.questionId },
            include: {
                aptitudeQuestion: {
                    select: { correctOptionId: true },
                },
            },
        });
        if (!moduleQuestion?.aptitudeQuestion) {
            throw new errors_1.NotFoundError('Question data');
        }
        const { correctOptionId } = moduleQuestion.aptitudeQuestion;
        if (!correctOptionId) {
            throw new errors_1.InternalError('Question has no correct answer configured');
        }
        const isCorrect = correctOptionId === payload.selectedOptionId;
        const currentQuestion = data.questions[questionIndex];
        const additionalTime = Math.max(0, payload.timeSpent ?? 0);
        const updatedQuestions = [...data.questions];
        updatedQuestions[questionIndex] = {
            ...currentQuestion,
            selectedOptionId: payload.selectedOptionId,
            isCorrect,
            timeSpentSeconds: (currentQuestion.timeSpentSeconds || 0) + additionalTime,
            answeredAt: new Date().toISOString(),
        };
        return { questions: updatedQuestions };
    }
    handleClear(data, payload) {
        if (!isClearPayload(payload)) {
            throw new errors_1.BadRequestError('Invalid clear payload: questionId required');
        }
        const questionIndex = data.questions.findIndex((q) => q.questionId === payload.questionId);
        if (questionIndex === -1) {
            throw new errors_1.NotFoundError('Question in attempt');
        }
        const updatedQuestions = [...data.questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            selectedOptionId: null,
            isCorrect: null,
            answeredAt: null,
        };
        return { questions: updatedQuestions };
    }
    handleMarkReview(data, payload) {
        if (!isMarkReviewPayload(payload)) {
            throw new errors_1.BadRequestError('Invalid mark review payload: questionId and isMarked required');
        }
        const questionIndex = data.questions.findIndex((q) => q.questionId === payload.questionId);
        if (questionIndex === -1) {
            throw new errors_1.NotFoundError('Question in attempt');
        }
        const updatedQuestions = [...data.questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            isMarkedForReview: payload.isMarked,
        };
        return { questions: updatedQuestions };
    }
    // ============================================
    // Summary Calculation
    // ============================================
    calculateSummary(questions, config) {
        let totalCorrect = 0;
        let totalWrong = 0;
        let totalUnanswered = 0;
        for (const question of questions) {
            if (question.selectedOptionId === null) {
                totalUnanswered++;
            }
            else if (question.isCorrect) {
                totalCorrect++;
            }
            else {
                totalWrong++;
            }
        }
        const marksPerQuestion = config.marksPerQuestion ?? 1;
        const negativeMarkingRate = config.negativeMarking ?? 0;
        const marksObtained = totalCorrect * marksPerQuestion;
        const negativeMarks = totalWrong * negativeMarkingRate;
        const finalScore = Math.max(0, marksObtained - negativeMarks);
        const maxScore = questions.length * marksPerQuestion;
        return {
            totalQuestions: questions.length,
            totalCorrect,
            totalWrong,
            totalUnanswered,
            marksObtained,
            negativeMarks,
            finalScore,
            maxScore,
        };
    }
    // ============================================
    // Utility Methods
    // ============================================
    shuffleWithSeed(array, seed) {
        if (array.length <= 1) {
            return [...array];
        }
        const shuffled = [...array];
        let hash = this.hashString(seed);
        for (let i = shuffled.length - 1; i > 0; i--) {
            hash = this.nextRandom(hash);
            const j = Math.abs(hash) % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
        }
        return hash;
    }
    nextRandom(current) {
        return ((current * 1103515245 + 12345) & 0x7fffffff) | 0;
    }
}
exports.AptitudeModuleExecutor = AptitudeModuleExecutor;
//# sourceMappingURL=aptitude.executor.js.map
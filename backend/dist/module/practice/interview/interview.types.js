"use strict";
// src/module/practice/interview/interview.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSessionToResponse = mapSessionToResponse;
exports.mapFeedbackToResponse = mapFeedbackToResponse;
exports.mapResponseToQuestionResponse = mapResponseToQuestionResponse;
exports.mapSessionToSummary = mapSessionToSummary;
// =====================================================
// HELPER FUNCTIONS
// =====================================================
/**
 * Safely parses a JSON field from Prisma to a typed object
 */
function parseJsonField(json, defaultValue) {
    if (json && typeof json === 'object' && !Array.isArray(json)) {
        return json;
    }
    return defaultValue;
}
function calculateEstimatedTime(session) {
    const remainingQuestions = session.totalQuestions - session.currentQuestionIndex;
    const avgTimePerQuestion = 120; // 2 minutes average
    return remainingQuestions * avgTimePerQuestion;
}
function getDefaultCategoryScores() {
    return {
        technical: { score: 0, maxScore: 10, feedback: '' },
        behavioral: { score: 0, maxScore: 10, feedback: '' },
        communication: { score: 0, maxScore: 10, feedback: '' },
        problemSolving: { score: 0, maxScore: 10, feedback: '' },
        cultureFit: { score: 0, maxScore: 10, feedback: '' },
    };
}
function getDefaultScores() {
    return {
        relevance: 0,
        clarity: 0,
        depth: 0,
        technicalAccuracy: null,
        communication: 0,
        overall: 0,
    };
}
function getDefaultAnalysis() {
    return {
        technicalDepth: '',
        communicationStyle: '',
        problemSolvingApproach: '',
        leadershipPotential: '',
        growthMindset: '',
    };
}
// =====================================================
// MAPPER FUNCTIONS
// =====================================================
function mapSessionToResponse(session) {
    const wsUrl = `${process.env.WS_URL || 'ws://localhost:3001'}/ws/interview/${session.id}`;
    return {
        id: session.id,
        userId: session.userId,
        status: session.status,
        config: {
            resumeId: session.resumeId,
            jobTitle: session.jobTitle || 'Software Engineer',
            companyName: session.companyName,
            difficulty: session.difficulty,
            focusAreas: session.focusAreas,
            targetQuestions: session.totalQuestions,
        },
        progress: {
            totalQuestions: session.totalQuestions,
            currentQuestionIndex: session.currentQuestionIndex,
            questionsAnswered: session.currentQuestionIndex,
            estimatedTimeRemaining: calculateEstimatedTime(session),
            percentComplete: Math.round((session.currentQuestionIndex / session.totalQuestions) * 100),
        },
        wsUrl,
        createdAt: session.createdAt,
        startedAt: session.startedAt,
    };
}
function mapFeedbackToResponse(feedback, responses) {
    const feedbackJson = feedback.feedbackJson || {};
    return {
        id: feedback.id,
        sessionId: feedback.sessionId,
        overallScore: Number(feedback.overallScore),
        overallSummary: feedback.overallSummary,
        categoryScores: parseJsonField(feedbackJson.categoryScores, getDefaultCategoryScores()),
        keyStrengths: feedback.keyStrengths,
        areasForImprovement: feedback.areasForImprovement,
        questionFeedback: responses.map((r) => ({
            questionId: r.id,
            question: r.question,
            category: r.category,
            answer: r.answer,
            scores: parseJsonField(r.scoresJson, getDefaultScores()),
            feedback: r.feedbackText || '',
            suggestions: [],
        })),
        recommendations: parseJsonField(feedbackJson.recommendations, []),
        hiringRecommendation: parseJsonField(feedbackJson.hiringRecommendation, 'maybe'),
        detailedAnalysis: parseJsonField(feedbackJson.detailedAnalysis, getDefaultAnalysis()),
        generatedAt: feedback.createdAt,
    };
}
function mapResponseToQuestionResponse(response) {
    return {
        questionId: response.id,
        category: response.category,
        question: response.question,
        answer: response.answer,
        isFollowUp: response.isFollowup, // Fixed: isFollowup (lowercase 'u') matches Prisma schema
        timeTakenSeconds: response.timeTakenSeconds || 0,
        scores: parseJsonField(response.scoresJson, getDefaultScores()),
        feedback: response.feedbackText || '',
    };
}
function mapSessionToSummary(session) {
    return {
        id: session.id,
        status: session.status,
        jobTitle: session.jobTitle || 'Software Engineer',
        difficulty: session.difficulty,
        questionsAnswered: session.currentQuestionIndex,
        totalQuestions: session.totalQuestions,
        overallScore: session.feedback ? Number(session.feedback.overallScore) : null,
        createdAt: session.createdAt,
        completedAt: session.completedAt,
    };
}
//# sourceMappingURL=interview.types.js.map
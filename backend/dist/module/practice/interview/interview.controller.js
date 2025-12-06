"use strict";
// src/module/practice/interview/interview.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewController = exports.interviewController = void 0;
const interview_service_1 = require("./interview.service");
const services_1 = require("./services");
const interview_validation_1 = require("./interview.validation");
const errors_1 = require("../../../utils/errors");
const interview_constants_1 = require("./interview.constants");
// =====================================================
// CONTROLLER CLASS
// =====================================================
class InterviewController {
    constructor() {
        // Bind all methods
        this.createSession = this.createSession.bind(this);
        this.startSession = this.startSession.bind(this);
        this.getSession = this.getSession.bind(this);
        this.getSessionDetail = this.getSessionDetail.bind(this);
        this.listSessions = this.listSessions.bind(this);
        this.cancelSession = this.cancelSession.bind(this);
        this.endSession = this.endSession.bind(this);
        this.submitResponse = this.submitResponse.bind(this);
        this.getFeedback = this.getFeedback.bind(this);
        this.regenerateFeedback = this.regenerateFeedback.bind(this);
    }
    // ===================================================
    // SESSION ENDPOINTS
    // ===================================================
    /**
     * POST /interview/sessions
     * Create a new interview session
     */
    async createSession(req, res, next) {
        try {
            const userId = this.getUserId(req);
            // parse raw input (may contain nulls)
            const rawInput = (0, interview_validation_1.parseCreateSession)(req.body);
            // sanitize: convert null -> undefined for optional fields
            const sanitizedInput = {
                jobTitle: rawInput.jobTitle,
                companyName: rawInput.companyName ?? undefined,
                difficulty: rawInput.difficulty,
                focusAreas: rawInput.focusAreas,
                targetQuestions: rawInput.targetQuestions,
                // keep resumeId undefined instead of null
                resumeId: rawInput.resumeId ?? undefined,
            };
            const session = await interview_service_1.interviewService.createSession(userId, sanitizedInput);
            res.status(interview_constants_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Interview session created',
                data: session,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /interview/sessions/:sessionId/start
     * Start an interview session
     */
    async startSession(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const sessionId = (0, interview_validation_1.parseSessionId)(req.params.sessionId);
            const result = await interview_service_1.interviewService.startSession(userId, sessionId);
            res.status(interview_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Interview session started',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /interview/sessions/:sessionId
     * Get session details
     */
    async getSession(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const sessionId = (0, interview_validation_1.parseSessionId)(req.params.sessionId);
            const session = await interview_service_1.interviewService.getSession(userId, sessionId);
            res.status(interview_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: session,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /interview/sessions/:sessionId/detail
     * Get session with responses and feedback
     */
    async getSessionDetail(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const sessionId = (0, interview_validation_1.parseSessionId)(req.params.sessionId);
            const detail = await interview_service_1.interviewService.getSessionDetail(userId, sessionId);
            res.status(interview_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: detail,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /interview/sessions
     * List user's interview sessions
     */
    async listSessions(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const query = (0, interview_validation_1.parseSessionListQuery)(req.query);
            const result = await interview_service_1.interviewService.listSessions(userId, query);
            res.status(interview_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /interview/sessions/:sessionId/cancel
     * Cancel an active session
     */
    async cancelSession(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const sessionId = (0, interview_validation_1.parseSessionId)(req.params.sessionId);
            await interview_service_1.interviewService.cancelSession(userId, sessionId);
            res.status(interview_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Interview session cancelled',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /interview/sessions/:sessionId/end
     * End session and generate feedback
     */
    async endSession(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const sessionId = (0, interview_validation_1.parseSessionId)(req.params.sessionId);
            const feedback = await interview_service_1.interviewService.endSession(userId, sessionId);
            res.status(interview_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Interview session completed',
                data: { feedback },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ===================================================
    // RESPONSE ENDPOINTS
    // ===================================================
    /**
     * POST /interview/sessions/:sessionId/respond
     * Submit response to current question
     */
    async submitResponse(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const sessionId = (0, interview_validation_1.parseSessionId)(req.params.sessionId);
            const input = (0, interview_validation_1.parseSubmitResponse)(req.body);
            const result = await interview_service_1.interviewService.submitResponse(userId, sessionId, input.answer, input.timeTakenSeconds);
            res.status(interview_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ===================================================
    // FEEDBACK ENDPOINTS
    // ===================================================
    /**
     * GET /interview/sessions/:sessionId/feedback
     * Get feedback for a completed session
     */
    async getFeedback(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const sessionId = (0, interview_validation_1.parseSessionId)(req.params.sessionId);
            const feedback = await interview_service_1.interviewService.getFeedback(userId, sessionId);
            res.status(interview_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: feedback,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /interview/sessions/:sessionId/feedback/regenerate
     * Regenerate feedback for a session
     */
    async regenerateFeedback(req, res, next) {
        try {
            const userId = this.getUserId(req);
            const sessionId = (0, interview_validation_1.parseSessionId)(req.params.sessionId);
            // Verify ownership
            await interview_service_1.interviewService.getSession(userId, sessionId);
            const feedback = await services_1.feedbackGeneratorService.regenerateFeedback(sessionId);
            res.status(interview_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Feedback regenerated',
                data: feedback,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ===================================================
    // PRIVATE HELPERS
    // ===================================================
    getUserId(req) {
        if (!req.user?.id) {
            throw new errors_1.BadRequestError('User ID not found in request');
        }
        return req.user.id;
    }
}
exports.InterviewController = InterviewController;
// =====================================================
// SINGLETON EXPORT
// =====================================================
exports.interviewController = new InterviewController();
//# sourceMappingURL=interview.controller.js.map
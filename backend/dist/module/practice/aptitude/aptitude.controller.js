"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aptitudeController = void 0;
const aptitude_service_1 = require("./aptitude.service");
const response_1 = require("../../../utils/response");
class AptitudeController {
    async createSession(req, res, next) {
        try {
            const result = await aptitude_service_1.aptitudeService.createSession(req.user.id, req.body);
            (0, response_1.sendSuccess)(res, result, 'Practice session created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async listSessions(req, res, next) {
        try {
            const { page, limit, status, difficulty, sortBy, sortOrder } = req.query;
            const result = await aptitude_service_1.aptitudeService.listSessions(req.user.id, {
                page: Number(page) || 1,
                limit: Math.min(Number(limit) || 10, 50),
                status: status || 'all',
                difficulty,
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc',
            });
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSession(req, res, next) {
        try {
            const result = await aptitude_service_1.aptitudeService.getSessionDetails(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSessionQuestions(req, res, next) {
        try {
            const result = await aptitude_service_1.aptitudeService.getSessionQuestions(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getQuestion(req, res, next) {
        try {
            const result = await aptitude_service_1.aptitudeService.getQuestion(req.user.id, req.params.id, req.params.questionId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async saveAnswer(req, res, next) {
        try {
            const result = await aptitude_service_1.aptitudeService.saveAnswer(req.user.id, req.params.id, req.body);
            (0, response_1.sendSuccess)(res, result, 'Answer saved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async submitSession(req, res, next) {
        try {
            const result = await aptitude_service_1.aptitudeService.submitSession(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result, 'Test submitted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getSessionStatus(req, res, next) {
        try {
            const result = await aptitude_service_1.aptitudeService.getSessionStatus(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSessionResults(req, res, next) {
        try {
            const result = await aptitude_service_1.aptitudeService.getSessionResults(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSolutions(req, res, next) {
        try {
            const filter = req.query.filter || 'all';
            const result = await aptitude_service_1.aptitudeService.getSolutions(req.user.id, req.params.id, filter);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.aptitudeController = new AptitudeController();
//# sourceMappingURL=aptitude.controller.js.map
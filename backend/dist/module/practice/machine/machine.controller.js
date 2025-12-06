"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.machineController = void 0;
const machine_service_1 = require("./machine.service");
const response_1 = require("../../../utils/response");
class MachineController {
    async createSession(req, res, next) {
        try {
            const result = await machine_service_1.machineService.createSession(req.user.id, req.body);
            (0, response_1.sendSuccess)(res, result, 'Machine coding session created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async listSessions(req, res, next) {
        try {
            const { page, limit, status, difficulty } = req.query;
            const result = await machine_service_1.machineService.listSessions(req.user.id, {
                page: Number(page) || 1,
                limit: Math.min(Number(limit) || 10, 50),
                status: status || 'all',
                difficulty,
            });
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSession(req, res, next) {
        try {
            const result = await machine_service_1.machineService.getSessionDetails(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSessionQuestions(req, res, next) {
        try {
            const result = await machine_service_1.machineService.getSessionQuestions(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getQuestion(req, res, next) {
        try {
            const result = await machine_service_1.machineService.getQuestion(req.user.id, req.params.id, req.params.questionId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async runCode(req, res, next) {
        try {
            const result = await machine_service_1.machineService.runCode(req.user.id, req.params.sessionId, req.params.questionId, req.body);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async submitCode(req, res, next) {
        try {
            const result = await machine_service_1.machineService.submitCode(req.user.id, req.params.sessionId, req.params.questionId, req.body);
            (0, response_1.sendSuccess)(res, result, result.isSolved ? 'Solution accepted!' : 'Submission evaluated');
        }
        catch (error) {
            next(error);
        }
    }
    async getSessionStatus(req, res, next) {
        try {
            const result = await machine_service_1.machineService.getSessionStatus(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async completeSession(req, res, next) {
        try {
            const result = await machine_service_1.machineService.completeSession(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result, 'Session completed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getSessionResults(req, res, next) {
        try {
            const result = await machine_service_1.machineService.getSessionResults(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSubmissionHistory(req, res, next) {
        try {
            const { page, limit } = req.query;
            const result = await machine_service_1.machineService.getSubmissionHistory(req.user.id, req.params.sessionId, req.params.questionId, Number(page) || 1, Math.min(Number(limit) || 10, 50));
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSubmissionDetails(req, res, next) {
        try {
            const result = await machine_service_1.machineService.getSubmissionDetails(req.user.id, req.params.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.machineController = new MachineController();
//# sourceMappingURL=machine.controller.js.map
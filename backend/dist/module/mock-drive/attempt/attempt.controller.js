"use strict";
// src/module/mock-drive/attempt/attempt.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptController = void 0;
const response_1 = require("../../../utils/response");
// ============================================
// Controller
// ============================================
class AttemptController {
    service;
    constructor(service) {
        this.service = service;
    }
    // ============================================
    // Attempt Lifecycle
    // ============================================
    getAttemptState = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId } = req.params;
            const result = await this.service.getAttemptState(userId, driveId);
            if (result) {
                (0, response_1.sendSuccess)(res, result, 'Attempt state retrieved successfully');
            }
            else {
                (0, response_1.sendSuccess)(res, null, 'No attempt found for this mock drive');
            }
        }
        catch (error) {
            next(error);
        }
    };
    startAttempt = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId } = req.params;
            const result = await this.service.startAttempt(userId, driveId);
            (0, response_1.sendSuccess)(res, result, 'Attempt started successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
    // ============================================
    // Module Lifecycle
    // ============================================
    startModule = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.startModule(userId, driveId, moduleId);
            (0, response_1.sendSuccess)(res, result, 'Module started successfully');
        }
        catch (error) {
            next(error);
        }
    };
    submitModule = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.submitModule(userId, driveId, moduleId, false);
            (0, response_1.sendSuccess)(res, result, 'Module submitted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getModuleState = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.getModuleState(userId, driveId, moduleId);
            (0, response_1.sendSuccess)(res, result, 'Module state retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    // ============================================
    // Aptitude Module Actions
    // ============================================
    submitAptitudeAnswer = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'answer', req.body);
            (0, response_1.sendSuccess)(res, result, 'Answer submitted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    clearAptitudeAnswer = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'clear', req.body);
            (0, response_1.sendSuccess)(res, result, 'Answer cleared successfully');
        }
        catch (error) {
            next(error);
        }
    };
    markForReview = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'mark_review', req.body);
            (0, response_1.sendSuccess)(res, result, 'Review status updated');
        }
        catch (error) {
            next(error);
        }
    };
    // ============================================
    // Machine Coding Module Actions
    // ============================================
    submitMachineCode = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'submit', req.body);
            (0, response_1.sendSuccess)(res, result, 'Code submitted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    runMachineCode = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'run', req.body);
            (0, response_1.sendSuccess)(res, result, 'Code executed successfully');
        }
        catch (error) {
            next(error);
        }
    };
    // ============================================
    // AI Interview Module Actions
    // ============================================
    submitInterviewResponse = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'respond', req.body);
            (0, response_1.sendSuccess)(res, result, 'Response submitted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    skipInterviewQuestion = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'skip', req.body);
            (0, response_1.sendSuccess)(res, result, 'Question skipped');
        }
        catch (error) {
            next(error);
        }
    };
    getNextInterviewQuestion = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'next_question', {});
            (0, response_1.sendSuccess)(res, result, 'Next question retrieved');
        }
        catch (error) {
            next(error);
        }
    };
    startVoiceMode = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'start_voice', {});
            (0, response_1.sendSuccess)(res, result, 'Voice mode enabled');
        }
        catch (error) {
            next(error);
        }
    };
    getAudioQuestion = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { driveId, moduleId } = req.params;
            const result = await this.service.handleModuleAction(userId, driveId, moduleId, 'get_audio_question', {});
            (0, response_1.sendSuccess)(res, result, 'Audio question generated');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AttemptController = AttemptController;
//# sourceMappingURL=attempt.controller.js.map
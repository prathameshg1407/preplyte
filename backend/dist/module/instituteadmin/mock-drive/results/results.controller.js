"use strict";
// src/modules/instituteadmin/mock-drive/results/results.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultsController = exports.ResultsController = void 0;
const zod_1 = require("zod");
const results_service_1 = require("./results.service");
const response_1 = require("../../../../utils/response");
const logger_1 = require("../../../../utils/logger");
const results_types_1 = require("./results.types");
const results_validation_1 = require("./results.validation");
// ============================================
// Controller
// ============================================
class ResultsController {
    async listResults(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = results_validation_1.mockDriveIdParamSchema.parse(req.params);
            const query = results_validation_1.listResultsQuerySchema.parse(req.query);
            const results = await results_service_1.resultsService.listResults(id, instituteId, query);
            (0, response_1.sendSuccess)(res, results, 'Results retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async getDetailedResult(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, attemptId } = results_validation_1.attemptIdParamSchema.parse(req.params);
            const result = await results_service_1.resultsService.getDetailedResult(id, attemptId, instituteId);
            (0, response_1.sendSuccess)(res, result, 'Result retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async getStatistics(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = results_validation_1.mockDriveIdParamSchema.parse(req.params);
            const { batchId } = results_validation_1.statisticsQuerySchema.parse(req.query);
            const stats = await results_service_1.resultsService.getStatistics(id, instituteId, batchId);
            (0, response_1.sendSuccess)(res, stats, 'Statistics retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async calculateRankings(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = results_validation_1.mockDriveIdParamSchema.parse(req.params);
            const { batchId } = results_validation_1.statisticsQuerySchema.parse(req.query);
            const rankings = await results_service_1.resultsService.calculateRankings(id, instituteId, batchId);
            (0, response_1.sendSuccess)(res, rankings, `Rankings calculated for ${rankings.length} students`);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async exportResults(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = results_validation_1.mockDriveIdParamSchema.parse(req.params);
            const options = results_validation_1.exportResultsQuerySchema.parse(req.query);
            const result = await results_service_1.resultsService.exportResults(id, instituteId, options);
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.setHeader('Content-Type', result.contentType);
            res.send(result.data);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async generateReport(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id, attemptId } = results_validation_1.attemptIdParamSchema.parse(req.params);
            await results_service_1.resultsService.generateReport(id, attemptId, instituteId);
            (0, response_1.sendSuccess)(res, null, 'Report generated successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    async generateAllReports(req, res, next) {
        try {
            const instituteId = this.getInstituteId(req, res);
            if (!instituteId)
                return;
            const { id } = results_validation_1.mockDriveIdParamSchema.parse(req.params);
            const result = await results_service_1.resultsService.generateAllReports(id, instituteId);
            (0, response_1.sendSuccess)(res, result, `Generated ${result.generated} reports`);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Helpers
    // ==========================================
    getInstituteId(req, res) {
        const instituteId = req.user?.instituteId;
        if (!instituteId) {
            (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
            return null;
        }
        return instituteId;
    }
    handleError(error, res, next) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Validation failed', 400, errors);
            return;
        }
        if (error instanceof results_types_1.ResultsError) {
            (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
            return;
        }
        logger_1.logger.error('Results controller error', { error });
        next(error);
    }
}
exports.ResultsController = ResultsController;
exports.resultsController = new ResultsController();
//# sourceMappingURL=results.controller.js.map
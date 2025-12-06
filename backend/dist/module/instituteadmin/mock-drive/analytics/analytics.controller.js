"use strict";
// src/modules/instituteadmin/mock-drive/analytics/analytics.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = exports.AnalyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const response_1 = require("../../../../utils/response");
const logger_1 = require("../../../../utils/logger");
const mockdrive_types_1 = require("../mockdrive.types");
const zod_1 = require("zod");
// ============================================
// Param Schema
// ============================================
const mockDriveIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid mock drive ID'),
});
// ============================================
// Controller Class
// ============================================
class AnalyticsController {
    // ==========================================
    // Get Full Analytics
    // ==========================================
    async getFullAnalytics(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const analytics = await analytics_service_1.analyticsService.getFullAnalytics(id, instituteId);
            (0, response_1.sendSuccess)(res, analytics, 'Analytics retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Overview
    // ==========================================
    async getOverview(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            // Verify access
            await this.verifyAccess(id, instituteId);
            const overview = await analytics_service_1.analyticsService.getOverview(id);
            (0, response_1.sendSuccess)(res, overview, 'Overview retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Score Distribution
    // ==========================================
    async getScoreDistribution(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            await this.verifyAccess(id, instituteId);
            const distribution = await analytics_service_1.analyticsService.getScoreDistribution(id);
            (0, response_1.sendSuccess)(res, distribution, 'Score distribution retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Module Performance
    // ==========================================
    async getModulePerformance(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            await this.verifyAccess(id, instituteId);
            const performance = await analytics_service_1.analyticsService.getModulePerformance(id);
            (0, response_1.sendSuccess)(res, performance, 'Module performance retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Batch Comparison
    // ==========================================
    async getBatchComparison(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            await this.verifyAccess(id, instituteId);
            const comparison = await analytics_service_1.analyticsService.getBatchComparison(id);
            (0, response_1.sendSuccess)(res, comparison, 'Batch comparison retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Time Analysis
    // ==========================================
    async getTimeAnalysis(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            await this.verifyAccess(id, instituteId);
            const analysis = await analytics_service_1.analyticsService.getTimeAnalysis(id);
            (0, response_1.sendSuccess)(res, analysis, 'Time analysis retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Helper Methods
    // ==========================================
    async verifyAccess(mockDriveId, instituteId) {
        const mockDrive = await db_1.prisma.mockDrive.findUnique({
            where: { id: mockDriveId },
            select: { instituteId: true },
        });
        if (!mockDrive) {
            throw new mockdrive_types_2.MockDriveNotFoundError(mockDriveId);
        }
        if (mockDrive.instituteId !== instituteId) {
            throw new mockdrive_types_2.MockDriveAccessDeniedError();
        }
    }
    // ==========================================
    // Error Handler
    // ==========================================
    handleError(error, res, next) {
        if (error instanceof zod_1.z.ZodError) {
            const formattedErrors = error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Validation failed', 400, formattedErrors);
            return;
        }
        if (error instanceof mockdrive_types_1.MockDriveError) {
            (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
            return;
        }
        logger_1.logger.error('Analytics controller error', error);
        next(error);
    }
}
exports.AnalyticsController = AnalyticsController;
// Need imports
const db_1 = require("../../../../lib/db");
const mockdrive_types_2 = require("../mockdrive.types");
// Export singleton instance
exports.analyticsController = new AnalyticsController();
//# sourceMappingURL=analytics.controller.js.map
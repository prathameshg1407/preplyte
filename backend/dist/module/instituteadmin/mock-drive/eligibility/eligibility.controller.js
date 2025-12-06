"use strict";
// src/modules/instituteadmin/mock-drive/eligibility/eligibility.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.eligibilityController = exports.EligibilityController = void 0;
const eligibility_service_1 = require("./eligibility.service");
const eligibility_validation_1 = require("./eligibility.validation");
const response_1 = require("../../../../utils/response");
const logger_1 = require("../../../../utils/logger");
const eligibility_types_1 = require("./eligibility.types");
const mockdrive_types_1 = require("../mockdrive.types");
const zod_1 = require("zod");
// ============================================
// Param Schema
// ============================================
const mockDriveIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid mock drive ID'),
});
const userIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid mock drive ID'),
    userId: zod_1.z.string().cuid('Invalid user ID'),
});
// ============================================
// Controller Class
// ============================================
class EligibilityController {
    // ==========================================
    // Set Eligibility Criteria
    // ==========================================
    async setEligibility(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const data = eligibility_validation_1.setEligibilitySchema.parse(req.body);
            const eligibility = await eligibility_service_1.eligibilityService.setEligibility(id, instituteId, data);
            (0, response_1.sendSuccess)(res, eligibility, 'Eligibility criteria set successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Eligibility Criteria
    // ==========================================
    async getEligibility(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const eligibility = await eligibility_service_1.eligibilityService.getEligibility(id, instituteId);
            (0, response_1.sendSuccess)(res, eligibility, 'Eligibility criteria retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Update Eligibility Criteria
    // ==========================================
    async updateEligibility(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const data = eligibility_validation_1.updateEligibilitySchema.parse(req.body);
            const eligibility = await eligibility_service_1.eligibilityService.updateEligibility(id, instituteId, data);
            (0, response_1.sendSuccess)(res, eligibility, 'Eligibility criteria updated successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Delete Eligibility Criteria
    // ==========================================
    async deleteEligibility(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            await eligibility_service_1.eligibilityService.deleteEligibility(id, instituteId);
            (0, response_1.sendSuccess)(res, null, 'Eligibility criteria deleted successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Check Student Eligibility
    // ==========================================
    async checkStudentEligibility(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id, userId } = userIdParamSchema.parse(req.params);
            const result = await eligibility_service_1.eligibilityService.checkStudentEligibility(id, instituteId, userId);
            (0, response_1.sendSuccess)(res, result, 'Eligibility check completed');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Eligible Students
    // ==========================================
    async getEligibleStudents(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const query = eligibility_validation_1.eligibleStudentsQuerySchema.parse(req.query);
            const result = await eligibility_service_1.eligibilityService.getEligibleStudents(id, instituteId, query);
            (0, response_1.sendSuccess)(res, result, 'Eligible students retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Eligibility Summary
    // ==========================================
    async getEligibilitySummary(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const summary = await eligibility_service_1.eligibilityService.getEligibilitySummary(id, instituteId);
            (0, response_1.sendSuccess)(res, summary, 'Eligibility summary retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
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
        if (error instanceof eligibility_types_1.EligibilityError) {
            (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
            return;
        }
        if (error instanceof mockdrive_types_1.MockDriveError) {
            (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
            return;
        }
        logger_1.logger.error('Eligibility controller error', error);
        next(error);
    }
}
exports.EligibilityController = EligibilityController;
// Export singleton instance
exports.eligibilityController = new EligibilityController();
//# sourceMappingURL=eligibility.controller.js.map
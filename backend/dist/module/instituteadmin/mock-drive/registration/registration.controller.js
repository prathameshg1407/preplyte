"use strict";
// src/modules/instituteadmin/mock-drive/registration/registration.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationController = exports.RegistrationController = void 0;
const registration_service_1 = require("./registration.service");
const registration_validation_1 = require("./registration.validation");
const response_1 = require("../../../../utils/response");
const logger_1 = require("../../../../utils/logger");
const registration_types_1 = require("./registration.types");
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
class RegistrationController {
    // ==========================================
    // Get Registration by ID
    // ==========================================
    async getRegistrationById(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id, regId } = registration_validation_1.registrationIdParamSchema.parse(req.params);
            const registration = await registration_service_1.registrationService.getRegistrationById(id, regId, instituteId);
            (0, response_1.sendSuccess)(res, registration, 'Registration retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // List Registrations
    // ==========================================
    async listRegistrations(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const query = registration_validation_1.listRegistrationsQuerySchema.parse(req.query);
            const result = await registration_service_1.registrationService.listRegistrations(id, instituteId, query);
            (0, response_1.sendSuccess)(res, result, 'Registrations retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Update Registration
    // ==========================================
    async updateRegistration(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            const reviewerId = req.user?.id;
            if (!instituteId || !reviewerId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id, regId } = registration_validation_1.registrationIdParamSchema.parse(req.params);
            const data = registration_validation_1.updateRegistrationSchema.parse(req.body);
            const registration = await registration_service_1.registrationService.updateRegistration(id, regId, instituteId, reviewerId, data);
            (0, response_1.sendSuccess)(res, registration, 'Registration updated successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Bulk Update Registrations
    // ==========================================
    async bulkUpdateRegistrations(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            const reviewerId = req.user?.id;
            if (!instituteId || !reviewerId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const data = registration_validation_1.bulkUpdateRegistrationSchema.parse(req.body);
            const result = await registration_service_1.registrationService.bulkUpdateRegistrations(id, instituteId, reviewerId, data);
            (0, response_1.sendSuccess)(res, result, `${result.success} registrations updated successfully`);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Approve All Pending
    // ==========================================
    async approveAllPending(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            const reviewerId = req.user?.id;
            if (!instituteId || !reviewerId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const result = await registration_service_1.registrationService.approveAllPending(id, instituteId, reviewerId);
            (0, response_1.sendSuccess)(res, result, `${result.approved} registrations approved successfully`);
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Get Registration Summary
    // ==========================================
    async getRegistrationSummary(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            // Verify access first
            const mockDrive = await db_1.prisma.mockDrive.findUnique({
                where: { id },
                select: { instituteId: true },
            });
            if (!mockDrive || mockDrive.instituteId !== instituteId) {
                (0, response_1.sendError)(res, 'NOT_FOUND', 'Mock drive not found', 404);
                return;
            }
            const summary = await registration_service_1.registrationService.getRegistrationSummary(id);
            (0, response_1.sendSuccess)(res, summary, 'Registration summary retrieved successfully');
        }
        catch (error) {
            this.handleError(error, res, next);
        }
    }
    // ==========================================
    // Export Registrations
    // ==========================================
    async exportRegistrations(req, res, next) {
        try {
            const instituteId = req.user?.instituteId;
            if (!instituteId) {
                (0, response_1.sendError)(res, 'FORBIDDEN', 'Institute membership required', 403);
                return;
            }
            const { id } = mockDriveIdParamSchema.parse(req.params);
            const { status } = req.query;
            const registrations = await registration_service_1.registrationService.exportRegistrations(id, instituteId, status);
            (0, response_1.sendSuccess)(res, registrations, 'Registrations exported successfully');
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
        if (error instanceof registration_types_1.RegistrationError) {
            (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
            return;
        }
        if (error instanceof mockdrive_types_1.MockDriveError) {
            (0, response_1.sendError)(res, error.code, error.message, error.statusCode);
            return;
        }
        logger_1.logger.error('Registration controller error', error);
        next(error);
    }
}
exports.RegistrationController = RegistrationController;
// Need to import prisma for the summary endpoint
const db_1 = require("../../../../lib/db");
// Export singleton instance
exports.registrationController = new RegistrationController();
//# sourceMappingURL=registration.controller.js.map